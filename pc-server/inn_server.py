#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""은빛 여우관 PC 서버 (표준 라이브러리만 사용, Python 3.10+)

하는 일
  1. 저장소 루트의 게임 파일을 서빙한다 (기본 0.0.0.0:8080). 폰에서 같은 와이파이로 접속.
  2. POST /llm/chat  -> 로컬 LLM(Ollama / LM Studio 등)의 OpenAI 호환 /v1/chat/completions 로 중계.
  3. GET  /llm/status -> LLM 연결 여부와 모델 목록(/v1/models).
  4. 시작할 때 폰에서 접속할 주소(LAN IP)와 방화벽 안내를 출력한다.

게임 페이지와 같은 출처(같은 주소/포트)에서 LLM 요청을 중계하므로 CORS / mixed content 문제가 없다.
index.html 을 보낼 때 <meta name="inn-server"> 표식을 끼워 넣어서, 게임이 "PC 서버에서 열렸는지"를
(404 오류 없이) 알 수 있게 한다. GitHub Pages 같은 정적 호스팅에서는 이 표식이 없으므로 자유 대화가 꺼진다.

사용: python inn_server.py [--port 8080] [--base-url http://127.0.0.1:11434] [--model 이름] [--preset ollama|lmstudio]
설정 파일: pc-server/config.json (실행 인자가 설정 파일보다 우선)
"""
import argparse
import functools
import json
import mimetypes
import os
import socket
import sys
import time
import urllib.error
import urllib.request
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # 저장소 루트 (index.html 이 있는 곳)

PRESETS = {
    "ollama": "http://127.0.0.1:11434",
    "lmstudio": "http://127.0.0.1:1234",
}
DEFAULTS = {
    "preset": "ollama",   # base_url 이 비어 있을 때 쓰는 기본 주소 묶음
    "base_url": "",       # 예: http://127.0.0.1:11434 (끝에 /v1 이 붙어 있어도 됨)
    "model": "",          # 비워 두면 /v1/models 의 첫 번째(임베딩 모델 제외)를 자동 선택
    "host": "0.0.0.0",
    "port": 8080,
    "timeout": 120,       # LLM 응답을 기다리는 최대 초
    "api_key": "",        # OpenAI 호환 서버가 키를 요구할 때만
}
MAX_BODY = 256 * 1024
# 클라이언트가 바꿀 수 있는 LLM 요청 필드 (모델/스트리밍 등은 서버가 정한다)
ALLOWED_FIELDS = ("messages", "temperature", "max_tokens", "response_format", "top_p")

# Windows 레지스트리의 잘못된 MIME 설정(.js 가 text/plain 등)에 대비해 직접 지정
for _ext, _type in (
    (".js", "text/javascript"), (".mjs", "text/javascript"), (".css", "text/css"),
    (".svg", "image/svg+xml"), (".webp", "image/webp"), (".png", "image/png"),
    (".webmanifest", "application/manifest+json"), (".json", "application/json"),
    (".html", "text/html"),
):
    mimetypes.add_type(_type, _ext)

MARKER = '<meta name="inn-server" content="1">'


# ---------------------------------------------------------------- 설정
def load_config(path):
    cfg = dict(DEFAULTS)
    if path and os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
            for k, v in data.items():
                if k in DEFAULTS and not k.startswith("_"):
                    cfg[k] = v
        except (OSError, ValueError) as e:
            print(f"[경고] 설정 파일을 읽지 못했어요 ({path}): {e}. 기본값을 사용합니다.")
    return cfg


def resolve_base_url(cfg):
    url = (cfg.get("base_url") or "").strip()
    if not url:
        url = PRESETS.get(str(cfg.get("preset", "ollama")).lower(), PRESETS["ollama"])
    url = url.rstrip("/")
    if url.endswith("/v1"):
        url = url[:-3]
    return url


def parse_args(argv=None):
    p = argparse.ArgumentParser(description="은빛 여우관 PC 서버 (게임 서빙 + 로컬 LLM 중계)")
    p.add_argument("--config", default=os.path.join(HERE, "config.json"), help="설정 파일 경로")
    p.add_argument("--port", type=int, help="포트 (기본 8080)")
    p.add_argument("--host", help="바인드 주소 (기본 0.0.0.0)")
    p.add_argument("--preset", choices=sorted(PRESETS), help="ollama 또는 lmstudio 의 기본 주소 사용")
    p.add_argument("--base-url", dest="base_url", help="LLM 서버 주소 (예: http://127.0.0.1:11434)")
    p.add_argument("--model", help="모델 이름 (비우면 자동 선택)")
    p.add_argument("--timeout", type=float, help="LLM 응답 대기 시간(초)")
    return p.parse_args(argv)


def build_config(args):
    cfg = load_config(args.config)
    for k in ("port", "host", "preset", "base_url", "model", "timeout"):
        v = getattr(args, k, None)
        if v is not None:
            cfg[k] = v
    cfg["port"] = int(cfg["port"])
    cfg["timeout"] = float(cfg["timeout"])
    return cfg


# ---------------------------------------------------------------- LLM 호출
class LLMError(Exception):
    def __init__(self, code, message, status=None, detail=None, http=502):
        super().__init__(message)
        self.code, self.message, self.status, self.detail, self.http = code, message, status, detail, http

    def payload(self):
        d = {"error": self.code, "message": self.message}
        if self.status is not None:
            d["status"] = self.status
        if self.detail:
            d["detail"] = self.detail
        return d


def llm_request(cfg, path, body=None, timeout=None):
    """LLM 서버로 요청. (HTTP상태, 바이트) 반환. 연결 불가/시간 초과는 LLMError."""
    url = resolve_base_url(cfg) + path
    headers = {"Accept": "application/json"}
    data = None
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if cfg.get("api_key"):
        headers["Authorization"] = "Bearer " + cfg["api_key"]
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if data is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout or cfg["timeout"]) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        try:
            return e.code, e.read()
        finally:
            e.close()
    except (socket.timeout, TimeoutError):
        raise LLMError("llm_timeout", "LLM 이 시간 안에 응답하지 않았어요", http=504)
    except urllib.error.URLError as e:
        if isinstance(e.reason, (socket.timeout, TimeoutError)):
            raise LLMError("llm_timeout", "LLM 이 시간 안에 응답하지 않았어요", http=504)
        raise LLMError("llm_unreachable", f"LLM 서버({resolve_base_url(cfg)})에 연결할 수 없어요", detail=str(e.reason))
    except OSError as e:
        raise LLMError("llm_unreachable", f"LLM 서버({resolve_base_url(cfg)})에 연결할 수 없어요", detail=str(e))


def list_models(cfg, timeout=4):
    status, raw = llm_request(cfg, "/v1/models", timeout=timeout)
    if status != 200:
        raise LLMError("llm_http_error", f"/v1/models 가 {status} 를 돌려줬어요", status=status)
    try:
        j = json.loads(raw.decode("utf-8", "replace"))
        return [m.get("id") for m in j.get("data", []) if isinstance(m, dict) and m.get("id")]
    except (ValueError, AttributeError):
        raise LLMError("llm_http_error", "/v1/models 응답을 해석하지 못했어요")


def pick_model(cfg, models):
    if cfg.get("model"):
        return cfg["model"]
    for m in models:
        if "embed" not in m.lower():
            return m
    return models[0] if models else ""


def llm_status(cfg):
    out = {"server": "inn-vn", "ok": True, "llm": {"reachable": False, "base_url": resolve_base_url(cfg),
                                                    "model": cfg.get("model") or "", "models": []}}
    try:
        models = list_models(cfg)
        out["llm"].update(reachable=True, models=models, model=pick_model(cfg, models))
        if not models:
            out["llm"]["error"] = "모델이 하나도 없어요 (ollama pull 로 모델을 받거나 LM Studio 에서 모델을 불러오세요)"
        elif cfg.get("model") and cfg["model"] not in models:
            out["llm"]["warning"] = f"설정한 모델 '{cfg['model']}' 이 목록에 없어요"
    except LLMError as e:
        out["llm"]["error"] = e.message
    return out


def llm_chat(cfg, payload):
    """게임 -> LLM 중계. 성공하면 LLM 의 JSON(OpenAI 형식) 그대로 반환."""
    if not isinstance(payload, dict) or not isinstance(payload.get("messages"), list) or not payload["messages"]:
        raise LLMError("bad_request", "messages 가 필요해요", http=400)
    body = {k: payload[k] for k in ALLOWED_FIELDS if k in payload}
    body["stream"] = False
    model = cfg.get("model")
    if not model:  # 모델을 비워 뒀다면 목록에서 고른다
        model = pick_model(cfg, list_models(cfg))
        if not model:
            raise LLMError("llm_http_error", "사용할 수 있는 모델이 없어요", http=502)
    body["model"] = model
    status, raw = llm_request(cfg, "/v1/chat/completions", body)
    text = raw.decode("utf-8", "replace")
    if status != 200:
        raise LLMError("llm_http_error", f"LLM 이 {status} 오류를 돌려줬어요", status=status, detail=text[:300])
    try:
        j = json.loads(text)
    except ValueError:
        raise LLMError("llm_http_error", "LLM 응답이 JSON 이 아니에요", status=status, detail=text[:300])
    return j


# ---------------------------------------------------------------- HTTP 핸들러
class InnHandler(SimpleHTTPRequestHandler):
    server_version = "InnServer/1.0"
    cfg = DEFAULTS  # make_server 가 덮어씀

    # 저장소 안에서 서빙하지 않을 경로
    HIDDEN = (".git", "pc-server", "node_modules", "__pycache__")

    def log_message(self, fmt, *args):
        if self.path.startswith("/llm/"):  # 정적 파일 로그는 소음이라 LLM 요청만 출력
            sys.stderr.write("[%s] %s\n" % (time.strftime("%H:%M:%S"), fmt % args))

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _route(self):
        return self.path.split("?", 1)[0].split("#", 1)[0]

    _cc = False  # 이번 응답에 Cache-Control 을 이미 넣었는지

    def send_response(self, code, message=None):
        self._cc = False
        super().send_response(code, message)

    def send_header(self, keyword, value):
        if keyword.lower() == "cache-control":
            self._cc = True
        super().send_header(keyword, value)

    def end_headers(self):
        # 폰에서 코드를 고치고 새로고침하면 바로 반영되도록 정적 파일도 재검증
        if not self._cc:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        route = self._route()
        if route == "/llm/status":
            return self._json(200, llm_status(self.cfg))
        if route.startswith("/llm/"):
            return self._json(404, {"error": "not_found", "message": "알 수 없는 /llm 경로"})
        parts = [p for p in route.split("/") if p]
        if parts and parts[0] in self.HIDDEN:
            return self.send_error(HTTPStatus.NOT_FOUND, "File not found")
        if route in ("/", "/index.html"):
            return self._serve_index()
        return super().do_GET()

    def do_HEAD(self):
        route = self._route()
        if route.startswith("/llm/"):
            return self._json(200, {})
        parts = [p for p in route.split("/") if p]
        if parts and parts[0] in self.HIDDEN:
            return self.send_error(HTTPStatus.NOT_FOUND, "File not found")
        return super().do_HEAD()

    def _serve_index(self):
        path = os.path.join(ROOT, "index.html")
        try:
            with open(path, "rb") as f:
                html = f.read().decode("utf-8")
        except OSError:
            return self.send_error(HTTPStatus.NOT_FOUND, "index.html not found")
        html = html.replace("</head>", "  " + MARKER + "\n</head>", 1)
        body = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self._route() != "/llm/chat":
            return self._json(404, {"error": "not_found", "message": "알 수 없는 경로"})
        try:
            n = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            n = -1
        if n <= 0 or n > MAX_BODY:
            return self._json(400 if n <= 0 else 413, {"error": "bad_request", "message": "요청 본문 크기가 올바르지 않아요"})
        raw = self.rfile.read(n)
        t0 = time.time()
        try:
            try:
                payload = json.loads(raw.decode("utf-8"))
            except (ValueError, UnicodeDecodeError):
                raise LLMError("bad_request", "JSON 이 아니에요", http=400)
            result = llm_chat(self.cfg, payload)
            sys.stderr.write("[%s] LLM 응답 %.1fs\n" % (time.strftime("%H:%M:%S"), time.time() - t0))
            self._json(200, result)
        except LLMError as e:
            sys.stderr.write("[%s] LLM 오류 %s: %s\n" % (time.strftime("%H:%M:%S"), e.code, e.message))
            self._json(e.http, e.payload())
        except Exception as e:  # 예기치 못한 오류도 JSON 으로
            sys.stderr.write("[%s] 서버 내부 오류: %r\n" % (time.strftime("%H:%M:%S"), e))
            self._json(500, {"error": "server_error", "message": "서버 내부 오류"})


def make_server(cfg, root=ROOT):
    cls = type("BoundHandler", (InnHandler,), {"cfg": cfg})
    handler = functools.partial(cls, directory=root)
    return ThreadingHTTPServer((cfg["host"], cfg["port"]), handler)


# ---------------------------------------------------------------- LAN IP 안내
def lan_ips():
    """폰이 접속할 수 있는 이 PC 의 사설 IPv4 주소 목록 (가장 유력한 것이 앞)."""
    found = []
    try:  # 실제로 패킷을 보내지 않고 기본 경로의 출발 주소만 확인
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("10.255.255.255", 1))
        found.append(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            found.append(info[4][0])
    except OSError:
        pass
    out = []
    for ip in found:
        if ip.startswith("127.") or ip.startswith("169.254.") or ip == "0.0.0.0" or ip in out:
            continue
        out.append(ip)
    return out


def banner(cfg):
    port = cfg["port"]
    lines = ["", "=" * 60, "  은빛 여우관 PC 서버", "=" * 60]
    ips = lan_ips()
    if ips:
        lines.append("  폰에서 접속하세요 (같은 와이파이):")
        for ip in ips:
            lines.append(f"      http://{ip}:{port}")
    else:
        lines.append("  LAN IP 를 찾지 못했어요. 명령 프롬프트에서 ipconfig 로 IPv4 주소를 확인해 http://<주소>:%d 로 접속하세요." % port)
    lines += [f"  이 PC 에서:  http://localhost:{port}", "",
              f"  LLM 서버: {resolve_base_url(cfg)}   모델: {cfg['model'] or '(자동 선택)'}"]
    st = llm_status(cfg)["llm"]
    if st["reachable"]:
        lines.append("  LLM 연결 확인: OK  (모델 %d개%s)" % (len(st["models"]), (", 사용: " + st["model"]) if st["model"] else ""))
        if st.get("error"):
            lines.append("  [주의] " + st["error"])
        if st.get("warning"):
            lines.append("  [주의] " + st["warning"])
    else:
        lines.append("  LLM 연결 확인: 실패 — Ollama 또는 LM Studio 서버를 켜 주세요. (게임은 LLM 없이도 실행됩니다)")
    if os.name == "nt":
        lines += ["", "  [Windows 방화벽] 처음 실행하면 'Python 이 네트워크에 액세스하려 합니다' 창이 떠요.",
                  "  '개인 네트워크(집/사설)' 를 체크하고 [액세스 허용] 을 눌러야 폰에서 접속할 수 있어요."]
    else:
        lines += ["", f"  (방화벽이 켜져 있다면 TCP {port} 포트를 허용해야 폰에서 접속할 수 있어요)"]
    lines += ["  종료: 이 창에서 Ctrl+C 또는 창 닫기", "=" * 60, ""]
    print("\n".join(lines), flush=True)


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):  # Windows 콘솔에서 한글이 깨지지 않도록
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    cfg = build_config(parse_args(argv))
    try:
        srv = make_server(cfg)
    except OSError as e:
        print(f"[오류] 포트 {cfg['port']} 을 열 수 없어요: {e}\n다른 프로그램이 쓰고 있다면 --port 8081 처럼 바꿔 보세요.")
        return 1
    banner(cfg)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n서버를 종료합니다.")
    finally:
        srv.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
