# -*- coding: utf-8 -*-
"""inn_server.py 단위/통합 테스트 (가짜 LLM 사용). 실행: python3 pc-server/test_inn_server.py"""
import json
import os
import sys
import threading
import unittest
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fake_llm  # noqa: E402
import inn_server  # noqa: E402


def serve(srv):
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return t


def req(url, data=None, method=None):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None, method=method,
                               headers={"Content-Type": "application/json"} if data is not None else {})
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return resp.status, resp.read(), resp.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read(), e.headers


class Base(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fake = fake_llm.make_server(0)
        serve(cls.fake)
        cls.fport = cls.fake.server_address[1]
        cfg = dict(inn_server.DEFAULTS, host="127.0.0.1", port=0, base_url=f"http://127.0.0.1:{cls.fport}", model="")
        cls.cfg = cfg
        cls.srv = inn_server.make_server(cfg)
        serve(cls.srv)
        cls.base = f"http://127.0.0.1:{cls.srv.server_address[1]}"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown(); cls.fake.shutdown()
        cls.srv.server_close(); cls.fake.server_close()

    def setUp(self):
        req(f"http://127.0.0.1:{self.fport}/_control", {"reset": True})


class TestStatic(Base):
    def test_index_has_marker(self):
        st, body, h = req(self.base + "/")
        self.assertEqual(st, 200)
        self.assertIn(b'<meta name="inn-server"', body)
        self.assertIn("text/html", h["Content-Type"])
        self.assertEqual(h["Cache-Control"], "no-cache")

    def test_js_mime_and_css(self):
        st, _, h = req(self.base + "/js/engine.js")
        self.assertEqual(st, 200)
        self.assertIn("javascript", h["Content-Type"])
        st, _, h = req(self.base + "/css/style.css")
        self.assertIn("text/css", h["Content-Type"])
        st, _, h = req(self.base + "/assets/char/erion/smile.webp")
        self.assertEqual(h["Content-Type"], "image/webp")

    def test_hidden_and_missing(self):
        self.assertEqual(req(self.base + "/pc-server/config.json")[0], 404)
        self.assertEqual(req(self.base + "/.git/config")[0], 404)
        self.assertEqual(req(self.base + "/nope.txt")[0], 404)

    def test_no_path_traversal(self):
        st, body, _ = req(self.base + "/..%2f..%2fetc/passwd")
        self.assertIn(st, (400, 404))


class TestStatus(Base):
    def test_status_ok(self):
        st, body, h = req(self.base + "/llm/status")
        j = json.loads(body)
        self.assertEqual(st, 200)
        self.assertEqual(j["server"], "inn-vn")
        self.assertTrue(j["llm"]["reachable"])
        self.assertEqual(j["llm"]["models"], ["fake-qwen:7b", "fake-embed"])
        self.assertEqual(j["llm"]["model"], "fake-qwen:7b")  # 임베딩 모델은 건너뜀
        self.assertEqual(h["Cache-Control"], "no-store")

    def test_status_llm_down(self):
        cfg = dict(self.cfg, base_url="http://127.0.0.1:1", port=0)
        srv = inn_server.make_server(cfg); serve(srv)
        try:
            st, body, _ = req(f"http://127.0.0.1:{srv.server_address[1]}/llm/status")
            j = json.loads(body)
            self.assertEqual(st, 200)
            self.assertFalse(j["llm"]["reachable"])
            self.assertIn("연결", j["llm"]["error"])
        finally:
            srv.shutdown(); srv.server_close()


class TestChat(Base):
    MSG = {"messages": [{"role": "system", "content": "s"}, {"role": "user", "content": "안녕"}], "temperature": 0.8, "max_tokens": 200}

    def test_relay(self):
        st, body, _ = req(self.base + "/llm/chat", self.MSG)
        self.assertEqual(st, 200)
        j = json.loads(body)
        content = j["choices"][0]["message"]["content"]
        self.assertEqual(json.loads(content)["face"], "normal")
        last = json.loads(req(f"http://127.0.0.1:{self.fport}/_last")[1])
        self.assertEqual(last["model"], "fake-qwen:7b")
        self.assertIs(last["stream"], False)
        self.assertEqual(last["max_tokens"], 200)

    def test_only_allowed_fields_and_model_fixed(self):
        d = dict(self.MSG, model="evil", stream=True, tools=[{"x": 1}], response_format={"type": "json_object"})
        req(self.base + "/llm/chat", d)
        last = json.loads(req(f"http://127.0.0.1:{self.fport}/_last")[1])
        self.assertEqual(last["model"], "fake-qwen:7b")
        self.assertIs(last["stream"], False)
        self.assertNotIn("tools", last)
        self.assertEqual(last["response_format"], {"type": "json_object"})

    def test_bad_requests(self):
        self.assertEqual(req(self.base + "/llm/chat", {"messages": []})[0], 400)
        self.assertEqual(req(self.base + "/llm/chat", {"x": 1})[0], 400)
        r = urllib.request.Request(self.base + "/llm/chat", data=b"not json", method="POST")
        try:
            urllib.request.urlopen(r, timeout=5)
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)
            self.assertEqual(json.loads(e.read())["error"], "bad_request")
        self.assertEqual(req(self.base + "/llm/other", {"a": 1})[0], 404)

    def test_upstream_500_wrapped(self):
        d = {"messages": [{"role": "user", "content": "#err500"}]}
        st, body, _ = req(self.base + "/llm/chat", d)
        j = json.loads(body)
        self.assertEqual(st, 502)
        self.assertEqual(j["error"], "llm_http_error")
        self.assertEqual(j["status"], 500)

    def test_response_format_rejected_by_upstream(self):
        req(f"http://127.0.0.1:{self.fport}/_control", {"reject_format": True})
        st, body, _ = req(self.base + "/llm/chat", dict(self.MSG, response_format={"type": "json_object"}))
        self.assertEqual(st, 502)
        self.assertEqual(json.loads(body)["status"], 400)
        st, _, _ = req(self.base + "/llm/chat", self.MSG)  # 없이 보내면 성공
        self.assertEqual(st, 200)

    def test_llm_down_returns_error_json(self):
        cfg = dict(self.cfg, base_url="http://127.0.0.1:1", port=0, model="x")
        srv = inn_server.make_server(cfg); serve(srv)
        try:
            st, body, h = req(f"http://127.0.0.1:{srv.server_address[1]}/llm/chat", self.MSG)
            j = json.loads(body)
            self.assertEqual(st, 502)
            self.assertEqual(j["error"], "llm_unreachable")
            self.assertIn("application/json", h["Content-Type"])
        finally:
            srv.shutdown(); srv.server_close()

    def test_timeout(self):
        cfg = dict(self.cfg, port=0, timeout=0.5)
        srv = inn_server.make_server(cfg); serve(srv)
        try:
            req(f"http://127.0.0.1:{self.fport}/_control", {"delay": 2})
            st, body, _ = req(f"http://127.0.0.1:{srv.server_address[1]}/llm/chat", self.MSG)
            self.assertEqual(st, 504)
            self.assertEqual(json.loads(body)["error"], "llm_timeout")
        finally:
            srv.shutdown(); srv.server_close()


class TestConfig(unittest.TestCase):
    def test_resolve_base_url(self):
        self.assertEqual(inn_server.resolve_base_url({"preset": "ollama", "base_url": ""}), "http://127.0.0.1:11434")
        self.assertEqual(inn_server.resolve_base_url({"preset": "lmstudio", "base_url": ""}), "http://127.0.0.1:1234")
        self.assertEqual(inn_server.resolve_base_url({"base_url": "http://1.2.3.4:5/v1/"}), "http://1.2.3.4:5")

    def test_cli_overrides_config(self):
        args = inn_server.parse_args(["--port", "9999", "--model", "m", "--preset", "lmstudio"])
        cfg = inn_server.build_config(args)
        self.assertEqual(cfg["port"], 9999)
        self.assertEqual(cfg["model"], "m")
        self.assertEqual(inn_server.resolve_base_url(cfg), "http://127.0.0.1:1234")

    def test_bad_config_file_falls_back(self):
        import tempfile
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
            f.write("{ broken")
        try:
            cfg = inn_server.load_config(f.name)
            self.assertEqual(cfg["port"], 8080)
        finally:
            os.unlink(f.name)

    def test_lan_ips_are_private_or_empty(self):
        for ip in inn_server.lan_ips():
            self.assertFalse(ip.startswith("127."))


if __name__ == "__main__":
    unittest.main(verbosity=2)
