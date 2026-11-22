#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""가짜 로컬 LLM (테스트용). OpenAI 호환 /v1/models, /v1/chat/completions 를 흉내 낸다.

실제 LLM 없이 inn_server.py 와 게임의 자유 대화를 시험하기 위한 도구다. 표준 라이브러리만 사용.
  python fake_llm.py [--port 11434] [--scenario json]

시나리오 (--scenario 로 기본값, 플레이어 메시지 안의 #태그로 한 번만 덮어쓰기, POST /_control 로 전역 변경)
  json       정상 JSON 한 줄 (기본)
  codeblock  ```json ... ``` 코드블록으로 감싼 JSON
  noise      앞뒤에 잡문이 섞인 JSON
  broken     깨지고 잘린 JSON (정규식으로 reply 만 건져야 함)
  plain      JSON 이 아닌 일반 문장
  think      <think>...</think> 뒤에 JSON
  english    영어로만 답함 (재요청 문구가 오면 한국어로 답함)
  empty      빈 문자열
  slow       3초 지연 후 정상 JSON
  err500     HTTP 500
  badjson    HTTP 200 이지만 본문이 JSON 이 아님
태그 예: "안녕 #codeblock", "#up2 고마워"(호감도 +2), "#down2"(호감도 -2), "#face=shy"
기타: POST /_control {"scenario":"..","reject_format":true,"delay":2.0}, GET /_last (마지막 요청 본문), GET /_count
키워드: '고마'/'예쁘'/'최고' -> smile +1, '바보'/'싫어' -> angry -1, '비밀' -> surprised 0, 그 외 normal 0
"""
import argparse
import json
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

STATE = {"scenario": "json", "reject_format": False, "delay": 0.0, "last": None, "count": 0, "models": ["fake-qwen:7b", "fake-embed"]}
LOCK = threading.Lock()


def decide(user_text):
    """플레이어 말에서 (대사, 표정, 호감도) 를 정한다."""
    face, aff = "normal", 0
    if any(k in user_text for k in ("고마", "예쁘", "최고", "좋아해")):
        face, aff = "smile", 1
    if any(k in user_text for k in ("바보", "싫어", "꺼져")):
        face, aff = "angry", -1
    if "비밀" in user_text:
        face = "surprised"
    for tag, val in (("#up2", 2), ("#down2", -2), ("#up1", 1)):
        if tag in user_text:
            aff = val
            face = "smile" if val > 0 else "angry"
    if "#up3" in user_text:  # 모델이 범위를 어긴 값을 줄 때 (클램프 시험)
        aff, face = 5, "shy"
    for f in ("normal", "smile", "angry", "shy", "surprised", "sad"):
        if "#face=" + f in user_text:
            face = f
    reply = {
        "smile": "후훗, 그렇게 말해 주니 기분이 나쁘지 않네.",
        "angry": "…말이 지나치잖아. 다시 생각해 봐.",
        "surprised": "뭐, 뭐야 갑자기! 그건 말할 수 없어.",
        "shy": "그, 그런 말 갑자기 하면 곤란하잖아…",
        "sad": "…조금 쓸쓸한 기분이 드네.",
    }.get(face, "응, 듣고 있어. 계속 말해 봐.")
    return reply, face, aff


def make_content(scenario, user_text, msgs):
    reply, face, aff = decide(user_text)
    obj = json.dumps({"reply": reply, "face": face, "affection": aff}, ensure_ascii=False)
    if scenario == "codeblock":
        return "```json\n" + obj + "\n```"
    if scenario == "noise":
        return "알겠습니다! 아래가 답변입니다.\n" + obj + "\n도움이 되었길 바랍니다."
    if scenario == "broken":
        return '{"reply":"' + reply[:12] + '… 그러니까 말이지, 이건 끊어진 응'  # 닫는 따옴표/중괄호 없음
    if scenario == "plain":
        return reply
    if scenario == "think":
        return "<think>플레이어가 뭐라고 했지… 캐릭터답게 답해야지.</think>\n" + obj
    if scenario == "english":
        if any("한국어로 다시" in (m.get("content") or "") for m in msgs if m.get("role") == "user"):
            return obj
        return '{"reply":"I am listening, please continue.","face":"smile","affection":1}'
    if scenario == "empty":
        return ""
    return obj


class H(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.0"

    def log_message(self, fmt, *a):
        sys.stderr.write("[fake_llm] " + fmt % a + "\n")

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        raw = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        try:
            self.wfile.write(raw)
        except (BrokenPipeError, ConnectionResetError):
            pass  # 클라이언트가 먼저 끊음(타임아웃 시험 등)

    def do_GET(self):
        p = self.path.split("?")[0]
        if p in ("/v1/models", "/models"):
            return self._send(200, {"object": "list", "data": [{"id": m, "object": "model"} for m in STATE["models"]]})
        if p == "/_last":
            return self._send(200, STATE["last"] or {})
        if p == "/_count":
            return self._send(200, {"count": STATE["count"]})
        self._send(404, {"error": "not found"})

    def do_POST(self):
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b"{}"
        try:
            body = json.loads(raw.decode("utf-8"))
        except ValueError:
            return self._send(400, {"error": {"message": "invalid json"}})
        p = self.path.split("?")[0]
        if p == "/_control":
            with LOCK:
                for k in ("scenario", "reject_format", "delay"):
                    if k in body:
                        STATE[k] = body[k]
                if body.get("reset"):
                    STATE.update(scenario="json", reject_format=False, delay=0.0, count=0, last=None)
            return self._send(200, {"ok": True, "state": {k: STATE[k] for k in ("scenario", "reject_format", "delay")}})
        if p not in ("/v1/chat/completions", "/chat/completions"):
            return self._send(404, {"error": "not found"})
        msgs = body.get("messages") or []
        with LOCK:
            STATE["count"] += 1
            STATE["last"] = body
            scenario, reject, delay = STATE["scenario"], STATE["reject_format"], STATE["delay"]
        user_text = ""
        for m in reversed(msgs):
            if m.get("role") == "user":
                user_text = m.get("content") or ""
                break
        for sc in ("codeblock", "noise", "broken", "plain", "think", "english", "empty", "slow", "err500", "badjson"):
            if "#" + sc in user_text:
                scenario = sc
        if delay:
            time.sleep(delay)
        if reject and "response_format" in body:
            return self._send(400, {"error": {"message": "response_format is not supported by this model"}})
        if scenario == "slow":
            time.sleep(3)
            scenario = "json"
        if scenario == "err500":
            return self._send(500, {"error": {"message": "internal error (fake)"}})
        if scenario == "badjson":
            return self._send(200, b"this is not json", "text/plain")
        content = make_content(scenario, user_text, msgs)
        return self._send(200, {
            "id": "chatcmpl-fake", "object": "chat.completion", "created": int(time.time()), "model": body.get("model", "fake"),
            "choices": [{"index": 0, "message": {"role": "assistant", "content": content}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2},
        })


def make_server(port=11434, scenario="json", host="127.0.0.1"):
    STATE["scenario"] = scenario
    return ThreadingHTTPServer((host, port), H)


def main():
    ap = argparse.ArgumentParser(description="가짜 OpenAI 호환 LLM 서버 (테스트용)")
    ap.add_argument("--port", type=int, default=11434)
    ap.add_argument("--scenario", default="json")
    a = ap.parse_args()
    srv = make_server(a.port, a.scenario)
    print(f"[fake_llm] http://127.0.0.1:{a.port}  시나리오={a.scenario}", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
