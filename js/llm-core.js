// ============================================================
//  자유 대화(로컬 LLM) 핵심 로직 — DOM 과 무관 (브라우저 / node 테스트 공용)
//  - 프롬프트 만들기, 모델 응답 파싱(형식이 깨져도 최대한 살림), PC 서버(/llm/*) 호출,
//    하루 대화 턴 / 호감도 상한 계산이 들어 있습니다.
//  - 화면(입력창, 말풍선)은 js/engine.js 가 담당합니다. 말투/수치는 story/llm-persona.js 에서 고칩니다.
// ============================================================
(function (root) {
  'use strict';

  var FACES = ['normal', 'smile', 'angry', 'shy', 'surprised', 'sad'];
  var HANGUL = /[가-힣]/;

  function mkErr(code, msg, extra) {
    var e = new Error(msg || code);
    e.code = code;
    if (extra) Object.keys(extra).forEach(function (k) { e[k] = extra[k]; });
    return e;
  }

  // ---------- 하루 대화 상태 (S.vars.llm) ----------
  // { day, used:{id:턴}, gain:{id:올린 호감도}, loss:{id:깎인 호감도}, last:'직전 낮 파트너', met:['오늘 만난 히로인'] }
  function ensureState(vars) {
    var l = vars.llm;
    if (!l || typeof l !== 'object') l = vars.llm = {};
    if (l.day !== vars.day) { l.day = vars.day; l.used = {}; l.gain = {}; l.loss = {}; l.met = []; l.last = ''; }
    ['used', 'gain', 'loss'].forEach(function (k) { if (!l[k] || typeof l[k] !== 'object') l[k] = {}; });
    if (!Array.isArray(l.met)) l.met = [];
    if (typeof l.last !== 'string') l.last = '';
    return l;
  }
  function remaining(vars, id, st) {
    var l = ensureState(vars);
    return Math.max(0, st.turnsPerDay - (l.used[id] || 0));
  }
  // 호감도 변화량 delta 중 오늘 상한 안에서 실제로 반영할 값을 계산하고 사용량을 기록
  function capAffection(vars, id, delta, st) {
    var l = ensureState(vars);
    delta = clampAff(delta);
    if (delta > 0) {
      var sum = Object.keys(l.gain).reduce(function (a, k) { return a + (l.gain[k] || 0); }, 0);
      var ok = Math.min(delta, st.maxGainPerHeroinePerDay - (l.gain[id] || 0), st.maxGainPerDay - sum);
      ok = Math.max(0, ok);
      l.gain[id] = (l.gain[id] || 0) + ok;
      return ok;
    }
    if (delta < 0) {
      var room = Math.max(0, st.maxLossPerHeroinePerDay - (l.loss[id] || 0));
      var d = -Math.min(-delta, room) || 0;
      l.loss[id] = (l.loss[id] || 0) - d;
      return d;
    }
    return 0;
  }
  function clampAff(x) {
    var n = typeof x === 'string' ? parseFloat(x.replace(/[^\d.+-]/g, '')) : Number(x);
    if (!isFinite(n)) return 0;
    return Math.max(-2, Math.min(2, Math.round(n)));
  }
  function tierIndex(aff, st) {
    var t = st.tierLines || [4, 12];
    return aff >= t[1] ? 2 : (aff >= t[0] ? 1 : 0);
  }

  // ---------- 프롬프트 ----------
  function recipeInfo(T, id) {
    var r = T && T.recipes && T.recipes[id];
    if (!r) return '';
    var ing = (r.ing || []).map(function (i) { return (T.ingredients[i] || {}).name || i; }).join('+');
    return r.name + '(' + ing + ')';
  }
  function revealFor(h, day) {
    var best = 0;
    Object.keys(h.reveal || {}).forEach(function (k) { if (+k <= day && +k > best) best = +k; });
    return best ? h.reveal[best] : '';
  }
  // c: { id, day, time, aff, ev, flags, hist:[{user, assistant}], text, where, tavern }
  function buildMessages(P, c) {
    var st = P.settings, cm = P.common, h = P.heroines[c.id], T = c.tavern || root.TAVERN;
    var name = h.name, L = [];
    L.push('너는 비주얼 노벨 "은빛 여우관"의 등장인물 ' + name + '이다. 지금부터 ' + name + '로서만 대답한다.');
    L.push('');
    L.push('[세계관] ' + cm.world);
    L.push('[대화 상대] ' + cm.player);
    L.push('');
    L.push('[' + name + ' 설정] ' + h.who);
    L.push('호칭: 상대를 ' + h.call + '라고 부른다.');
    L.push('말투 예시(그대로 베끼지 말고 어조만 따라 한다):');
    h.speech.forEach(function (s) { L.push('- ' + s); });
    var favId = T && T.customers && T.customers[c.id] && T.customers[c.id].fav;
    var disIds = (T && T.customers && T.customers[c.id] && T.customers[c.id].dislike) || [];
    L.push('좋아하는 것: ' + h.likesExtra + (favId ? ' 여관 저녁 영업에서 가장 좋아하는 메뉴는 ' + recipeInfo(T, favId) + '.' : ''));
    L.push('싫어하는 것: ' + h.dislikesExtra + (disIds.length ? ' 싫어하는 메뉴는 ' + disIds.map(function (d) { return recipeInfo(T, d); }).join(', ') + '.' : ''));
    L.push('');
    var CC = root.CalCore, stage = CC ? CC.stageOf(c.day) : c.day;   // 이야기 단계: 30일 중 어디까지 진행됐는지 (옛 7일 구성의 n일차 정보를 그대로 쓴다)
    var cinf = CC ? CC.info(c.day) : null;
    L.push('[현재 상황] ' + (cinf ? c.day + '일차(' + cinf.week + '주차 ' + cinf.dowName + '요일)' : c.day + '일차') + ' ' + (c.time || '') + '. ' + (c.where === 'offer' ? '방금 낮에 둘이서 시간을 보낸 뒤 조금 더 이야기하는 중이다.' : '여관에서 잠깐 이야기를 나누는 중이다.'));
    var ti = tierIndex(c.aff || 0, st);
    L.push('호감도 단계: ' + (P.tierNames || ['경계', '호의', '설렘'])[ti] + ' — ' + h.tiers[ti]);
    var seen = Math.max(0, Math.min(c.ev || 0, (h.events || []).length));
    if (seen) {
      L.push('함께한 일(낮 이벤트):');
      for (var i = 0; i < seen; i++) L.push('- ' + h.events[i]);
    } else {
      L.push('함께한 일: 아직 낮에 둘이서 따로 시간을 보낸 적은 없다.');
    }
    var dayNotes = [];
    var evening = /^(저녁|밤|황혼|새벽)$/.test(c.time || '');
    var stDays = (root.CALENDAR && root.CALENDAR.stages) || [];
    for (var d = 1; d <= stage; d++) {
      var realDay = stDays[d - 1] || d;
      if (P.days[d] && (realDay < c.day || (realDay === c.day && evening))) dayNotes.push(realDay + '일차: ' + P.days[d]);
    }
    if (dayNotes.length) { L.push('알고 있는 마을 사건:'); dayNotes.forEach(function (n) { L.push('- ' + n); }); }
    var fl = Object.keys(c.flags || {}).filter(function (k) { return c.flags[k] && P.flagNotes[k]; });
    if (fl.length) { L.push('플레이어의 선택:'); fl.forEach(function (k) { L.push('- ' + P.flagNotes[k]); }); }
    L.push('비밀 공개 범위(' + c.day + '일차): ' + revealFor(h, stage));
    L.push('');
    L.push('[규칙]');
    cm.rules.forEach(function (r, i) { L.push((i + 1) + '. ' + r); });
    L.push('');
    L.push('[출력 형식] ' + cm.format);

    var msgs = [{ role: 'system', content: L.join('\n') }];
    var n = st.historyTurns || 8, hist = (c.hist || []).slice(-n);
    hist.forEach(function (t) {
      msgs.push({ role: 'user', content: t.user });
      msgs.push({ role: 'assistant', content: t.assistant });
    });
    msgs.push({ role: 'user', content: c.text + '\n\n(JSON 한 줄로만 답하세요. 예: {"reply":"대사","face":"normal","affection":0})' });
    return msgs;
  }

  // ---------- 응답 파싱 (로컬 모델은 형식을 자주 틀린다) ----------
  function stripNoise(t) {
    t = String(t == null ? '' : t);
    t = t.replace(/<think>[\s\S]*?<\/think>/gi, '');   // 추론 모델의 생각 블록
    t = t.replace(/<think>[\s\S]*$/i, '');             // 닫히지 않은 생각 블록은 전부 버림
    return t.replace(/^﻿/, '').trim();
  }
  // 문자열 안의 따옴표/중괄호를 고려해 첫 번째로 균형 잡힌 {...} 후보들을 차례로 만든다
  function objectCandidates(s) {
    var out = [];
    for (var i = 0; i < s.length; i++) {
      if (s[i] !== '{') continue;
      var depth = 0, inStr = false, esc = false;
      for (var j = i; j < s.length; j++) {
        var ch = s[j];
        if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
        if (ch === '"') inStr = true;
        else if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { out.push(s.slice(i, j + 1)); break; } }
      }
    }
    return out;
  }
  function tryParse(s) {
    try { return JSON.parse(s); } catch (e) { /* 다음 보정 시도 */ }
    try { return JSON.parse(s.replace(/,\s*([}\]])/g, '$1').replace(/[“”]/g, '"')); } catch (e) { return null; }
  }
  function cleanReply(s, P) {
    s = String(s == null ? '' : s).replace(/\s*\n+\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
    var names = Object.keys(P.heroines).map(function (k) { return P.heroines[k].name; });
    names.forEach(function (n) { s = s.replace(new RegExp('^' + n + '\\s*[:：]\\s*'), ''); });
    var qm = s.match(/^(["'“‘「])([\s\S]*)(["'”’」])$/); // 앞뒤가 따옴표로 감싸인 경우에만 벗김
    if (qm && !/["'“”‘’「」]/.test(qm[2])) s = qm[2].trim();
    var max = P.settings.maxReplyChars || 200;
    if (s.length > max) {
      var cut = s.slice(0, max), p = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'), cut.lastIndexOf('…'), cut.lastIndexOf('다.'));
      s = p > max * 0.4 ? cut.slice(0, p + 1) : cut + '…';
    }
    return s;
  }
  // 반환: { reply, face, affection, mode:'json'|'regex'|'text' }  (reply 가 비어 있으면 실패)
  function parseReply(raw, P) {
    var t = stripNoise(raw);
    t = t.replace(/```[a-zA-Z]*\s*/g, '').replace(/```/g, '').trim();
    var obj = null, cands = objectCandidates(t);
    for (var i = 0; i < cands.length && !obj; i++) {
      var o = tryParse(cands[i]);
      if (o && typeof o === 'object' && !Array.isArray(o) && 'reply' in o) obj = o;
    }
    if (obj) {
      var rep = obj.reply;
      if (rep && typeof rep === 'object') rep = rep.text || rep.content || JSON.stringify(rep);
      return { reply: cleanReply(rep, P), face: FACES.indexOf(obj.face) >= 0 ? obj.face : 'normal', affection: clampAff(obj.affection), mode: 'json' };
    }
    // JSON 이 깨졌거나 잘렸을 때(토큰 제한): "reply" 값만이라도 건진다
    var m = t.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/);
    if (m) {
      var rv = m[1];
      try { rv = JSON.parse('"' + rv + '"'); } catch (e) { rv = rv.replace(/\\n/g, ' ').replace(/\\"/g, '"'); }
      var fm = t.match(/"face"\s*:\s*"([a-z]+)"/), am = t.match(/"affection"\s*:\s*"?([+-]?\d+(?:\.\d+)?)/);
      return { reply: cleanReply(rv, P), face: fm && FACES.indexOf(fm[1]) >= 0 ? fm[1] : 'normal', affection: am ? clampAff(am[1]) : 0, mode: 'regex' };
    }
    // 완전히 일반 텍스트: 전체를 대사로 (JSON 흔적은 지움)
    var plain = t.replace(/^\s*(reply|대사|답변)\s*[:：]\s*/i, '');
    return { reply: cleanReply(plain, P), face: 'normal', affection: 0, mode: 'text' };
  }

  // ---------- PC 서버 통신 ----------
  var LLMCore = {
    FACES: FACES, ensureState: ensureState, remaining: remaining, capAffection: capAffection, clampAff: clampAff, tierIndex: tierIndex,
    buildMessages: buildMessages, parseReply: parseReply, stripNoise: stripNoise,
    noJsonFormat: false   // 서버가 response_format 을 거부한 적이 있으면 true (이후 생략)
  };

  function withTimeout(ms, outer) {
    var ctl = new AbortController(), timedOut = false;
    var timer = setTimeout(function () { timedOut = true; ctl.abort(); }, ms);
    if (outer) outer.addEventListener('abort', function () { ctl.abort(); });
    return { signal: ctl.signal, done: function () { clearTimeout(timer); }, timedOut: function () { return timedOut; } };
  }
  async function http(url, init, ms, outer) {
    var w = withTimeout(ms, outer), res;
    try {
      init = init || {}; init.signal = w.signal;
      res = await fetch(url, init);
    } catch (e) {
      w.done();
      if (w.timedOut()) throw mkErr('timeout', '응답이 너무 오래 걸려요');
      if (outer && outer.aborted) throw mkErr('aborted', '취소됨');
      throw mkErr('network', '서버에 연결할 수 없어요');
    }
    var text = '';
    try { text = await res.text(); } catch (e) { w.done(); if (w.timedOut()) throw mkErr('timeout', '응답이 너무 오래 걸려요'); throw mkErr('network', '응답을 읽는 중 끊겼어요'); }
    w.done();
    return { res: res, text: text };
  }

  // PC 서버/LLM 상태: { state:'none'|'nollm'|'ready', models:[], model, error }
  LLMCore.status = async function (ms) {
    try {
      var r = await http('llm/status', { cache: 'no-store' }, ms || 4000);
      if (!r.res.ok) return { state: 'none', models: [] };
      var j = JSON.parse(r.text);
      if (!j || j.server !== 'inn-vn') return { state: 'none', models: [] };
      var l = j.llm || {};
      return { state: l.reachable ? 'ready' : 'nollm', models: l.models || [], model: l.model || '', base: l.base_url || '', error: l.error || '' };
    } catch (e) { return { state: 'none', models: [] }; }
  };

  async function post(body, ms, outer) {
    var r = await http('llm/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, ms, outer);
    var j = null;
    try { j = JSON.parse(r.text); } catch (e) { /* 아래에서 처리 */ }
    if (!r.res.ok) {
      if (r.res.status === 404 || r.res.status === 405) throw mkErr('no_server', 'PC 서버가 아니에요');
      throw mkErr((j && j.error) || 'http_' + r.res.status, (j && j.message) || '서버 오류', { detail: j && j.detail, status: j && j.status });
    }
    var content = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    if (Array.isArray(content)) content = content.map(function (p) { return p && p.text ? p.text : ''; }).join('');
    if (typeof content !== 'string') throw mkErr('bad_response', '모델 응답 형식이 이상해요');
    return content;
  }
  async function chatOnce(msgs, st, outer) {
    var body = { messages: msgs, temperature: st.temperature, max_tokens: st.maxTokens };
    var ms = st.timeoutMs || 100000;
    if (LLMCore.noJsonFormat) return post(body, ms, outer);
    body.response_format = { type: 'json_object' };
    try {
      return await post(body, ms, outer);
    } catch (e) {
      // JSON 모드를 지원하지 않는 서버일 수 있으니 한 번만 없이 재시도 (성공하면 앞으로도 생략)
      if (e.code !== 'llm_http_error') throw e;
      delete body.response_format;
      var out = await post(body, ms, outer);
      LLMCore.noJsonFormat = true;
      return out;
    }
  }

  // 한 번의 대화: 프롬프트 -> 호출 -> 파싱. 한국어가 아니면 한 번 다시 시킴. 실패하면 Error(code) throw
  LLMCore.ask = async function (P, c, outer) {
    var msgs = buildMessages(P, c), st = P.settings;
    var raw = await chatOnce(msgs, st, outer);
    var out = parseReply(raw, P);
    if (out.reply && !HANGUL.test(out.reply)) {
      var again = msgs.concat([{ role: 'assistant', content: raw }, { role: 'user', content: '한국어로 다시, JSON 한 줄로만 답하세요.' }]);
      var out2 = parseReply(await chatOnce(again, st, outer), P);
      if (out2.reply && HANGUL.test(out2.reply)) out = out2; else out = { reply: '', face: 'normal', affection: 0, mode: 'text', notKorean: true };
    }
    if (!out.reply) throw mkErr(out.notKorean ? 'not_korean' : 'empty', '빈 응답');
    out.raw = raw;
    return out;
  };

  // 친절한 오류 문구
  LLMCore.errorText = function (e) {
    switch (e && e.code) {
      case 'no_server': return 'PC 서버를 찾을 수 없어요. inn_server.py 로 연 주소인지 확인해 주세요.';
      case 'llm_unreachable': return 'PC에서 LLM(Ollama / LM Studio)에 연결하지 못했어요. 켜져 있는지 확인해 주세요.';
      case 'network': return '서버에 연결하지 못했어요. PC가 켜져 있고 같은 와이파이인지 확인해 주세요.';
      case 'timeout': return '응답이 너무 오래 걸려요. 모델이 로딩 중이거나 PC가 바쁠 수 있어요.';
      case 'llm_timeout': return 'LLM 이 제때 답하지 못했어요. 모델이 로딩 중이거나 PC가 바쁠 수 있어요.';
      case 'llm_http_error': return 'LLM 이 오류를 돌려줬어요' + (e.status >= 400 ? ' (' + e.status + ')' : '') + '. 모델 이름과 설정을 확인해 주세요.';
      case 'empty': return '대답이 비어 있었어요. 다시 보내 볼까요?';
      case 'not_korean': return '한국어로 대답하지 못했어요. 다시 보내 볼까요?';
      case 'bad_response': return 'LLM 의 응답 형식이 이상해요. 다시 시도해 주세요.';
      default: return '대화 중 문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.';
    }
  };

  root.LLMCore = LLMCore;
  if (typeof module !== 'undefined' && module.exports) module.exports = LLMCore;
})(typeof globalThis !== 'undefined' ? globalThis : this);
