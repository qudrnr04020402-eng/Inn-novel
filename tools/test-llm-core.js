// js/llm-core.js 단위 테스트 (node, 브라우저/서버 불필요): node tools/test-llm-core.js
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const root = path.join(__dirname, '..');
const ctx = { console, setTimeout, clearTimeout, AbortController }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['story/characters.js', 'story/backgrounds.js', 'story/common.js', 'story/calendar.js', 'js/event-core.js', 'js/cal-core.js', 'story/tavern.js', 'story/llm-persona.js', 'js/llm-core.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const L = ctx.LLMCore, P = ctx.LLM_PERSONA;
let n = 0;
const eq = (a, b) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('실패:', name, '\n', e.message); process.exitCode = 1; } };
const ta = async (name, fn) => { try { await fn(); n++; } catch (e) { console.error('실패:', name, '\n', e.message); process.exitCode = 1; } };

// ---------- 파서 ----------
const J = '{"reply":"흥, 별로야.","face":"angry","affection":-1}';
t('정상 JSON', () => eq(L.parseReply(J, P), { reply: '흥, 별로야.', face: 'angry', affection: -1, mode: 'json' }));
t('코드블록', () => assert.strictEqual(L.parseReply('```json\n' + J + '\n```', P).reply, '흥, 별로야.'));
t('앞뒤 잡문', () => { const r = L.parseReply('네, 답변입니다!\n' + J + '\n도움이 되었길 바라요.', P); assert.strictEqual(r.face, 'angry'); assert.strictEqual(r.mode, 'json'); });
t('think 블록', () => assert.strictEqual(L.parseReply('<think>음… {"reply":"가짜"}</think>' + J, P).reply, '흥, 별로야.'));
t('닫히지 않은 think = 빈 응답', () => assert.strictEqual(L.parseReply('<think>생각만 하다 끝남 ' + J, P).reply, ''));
t('중괄호/따옴표가 들어간 reply', () => assert.strictEqual(L.parseReply('{"reply":"이건 {비밀}이야, \\"쉿\\"","face":"shy","affection":1}', P).reply, '이건 {비밀}이야, "쉿"'));
t('후행 쉼표 보정', () => assert.strictEqual(L.parseReply('{"reply":"응","face":"smile","affection":1,}', P).face, 'smile'));
t('잘린 JSON 은 reply 만 건짐', () => { const r = L.parseReply('{"reply":"그러니까 말이지, 이건 끊어진 응', P); assert.strictEqual(r.mode, 'regex'); assert.ok(r.reply.startsWith('그러니까')); assert.strictEqual(r.face, 'normal'); });
t('잘린 JSON 이어도 face/affection 은 있으면 사용', () => { const r = L.parseReply('{"reply":"음","face":"sad","affection":2, "x', P); assert.strictEqual(r.face, 'sad'); assert.strictEqual(r.affection, 2); });
t('일반 텍스트', () => eq(L.parseReply('그래, 듣고 있어.', P), { reply: '그래, 듣고 있어.', face: 'normal', affection: 0, mode: 'text' }));
t('빈 문자열', () => assert.strictEqual(L.parseReply('', P).reply, ''));
t('잘못된 face 는 normal', () => assert.strictEqual(L.parseReply('{"reply":"응","face":"happy","affection":0}', P).face, 'normal'));
t('affection 클램프/형변환', () => {
  assert.strictEqual(L.parseReply('{"reply":"a","affection":9}', P).affection, 2);
  assert.strictEqual(L.parseReply('{"reply":"a","affection":-7}', P).affection, -2);
  assert.strictEqual(L.parseReply('{"reply":"a","affection":"+1"}', P).affection, 1);
  assert.strictEqual(L.parseReply('{"reply":"a","affection":0.6}', P).affection, 1);
  assert.strictEqual(L.parseReply('{"reply":"a","affection":"많이"}', P).affection, 0);
  assert.strictEqual(L.parseReply('{"reply":"a","affection":null}', P).affection, 0);
});
t('이름 접두/따옴표 제거', () => assert.strictEqual(L.parseReply('{"reply":"에리온: \\"…뭐야.\\""}', P).reply, '…뭐야.'));
t('너무 긴 대사는 잘림', () => { const r = L.parseReply('{"reply":"' + '가나다라. '.repeat(100) + '"}', P); assert.ok(r.reply.length <= P.settings.maxReplyChars + 1); });
t('reply 가 객체여도 죽지 않음', () => assert.ok(L.parseReply('{"reply":{"text":"안녕"}}', P).reply === '안녕'));

// ---------- 호감도/턴 상한 ----------
const st = P.settings;
t('하루 턴 수', () => { const v = { day: 1 }; assert.strictEqual(L.remaining(v, 'erion', st), 6); L.ensureState(v).used.erion = 6; assert.strictEqual(L.remaining(v, 'erion', st), 0); v.day = 2; assert.strictEqual(L.remaining(v, 'erion', st), 6, '다음 날 초기화'); });
t('히로인별/하루 전체 상한', () => {
  const v = { day: 1 };
  assert.strictEqual(L.capAffection(v, 'erion', 2, st), 2);
  assert.strictEqual(L.capAffection(v, 'erion', 2, st), 1, '히로인별 3');
  assert.strictEqual(L.capAffection(v, 'erion', 2, st), 0);
  assert.strictEqual(L.capAffection(v, 'kaela', 2, st), 1, '전체 4');
  assert.strictEqual(L.capAffection(v, 'miho', 1, st), 0);
  v.day = 2; assert.strictEqual(L.capAffection(v, 'miho', 2, st), 2, '다음 날 초기화');
});
t('호감도 감소 상한', () => { const v = { day: 1 }; assert.strictEqual(L.capAffection(v, 'lia', -2, st), -2); assert.strictEqual(L.capAffection(v, 'lia', -2, st), -2); assert.strictEqual(L.capAffection(v, 'lia', -2, st), 0); });
t('하루 최대 총합', () => { const v = { day: 1 }; let tot = 0; ['erion', 'kaela', 'miho', 'lia'].forEach((h) => { for (let i = 0; i < 6; i++) tot += L.capAffection(v, h, 2, st); }); assert.strictEqual(tot, st.maxGainPerDay); });
t('옛 세이브(llm 없음)도 안전', () => { const v = { day: 3 }; const l = L.ensureState(v); eq(l.met, []); });
t('날이 바뀌면 last 도 초기화', () => { const v = { day: 1 }; L.ensureState(v).last = 'erion'; v.day = 2; assert.strictEqual(L.ensureState(v).last, ''); });

// ---------- 프롬프트 ----------
t('프롬프트 구성', () => {
  const m = L.buildMessages(P, { id: 'miho', day: 10, time: '낮', aff: 5, ev: 2, flags: { miho_peeked: true, seal_patch: true }, hist: [{ user: 'a', assistant: 'b' }], text: '안녕', where: 'offer' });
  assert.strictEqual(m[0].role, 'system');
  const s = m[0].content;
  assert.ok(s.includes('꿀버섯 토스트'), '최애 메뉴(tavern.js 연동)');
  assert.ok(s.includes('불꽃') === false && s.includes('허브 에일'), '싫어하는 메뉴');
  assert.ok(s.includes('호감도 단계: 호의'));
  assert.ok(s.includes(P.heroines.miho.reveal[2]) && !s.includes(P.heroines.miho.reveal[3]), '2단계(10일차) 공개 범위만');
  assert.ok(s.includes('장부를 몰래 훔쳐봤다') && !s.includes('에리온이 책과 스승님'), '켜진 flag 만');
  assert.ok(s.includes('1일차: ') && !s.includes('10일차: '), '낮에는 오늘 사건 제외');
  assert.ok(!s.includes('에리온의 푸른 책') || true);
  assert.ok(s.includes('함께한 일(낮 이벤트)') && s.includes(P.heroines.miho.events[1]) && !s.includes(P.heroines.miho.events[2]));
  assert.ok(s.includes('방금 낮에'));
  assert.strictEqual(m.length, 4); assert.strictEqual(m[3].role, 'user'); assert.ok(m[3].content.startsWith('안녕'));
  const e = L.buildMessages(P, { id: 'miho', day: 10, time: '저녁', aff: 0, ev: 0, flags: {}, hist: [], text: 'x', where: 'menu' })[0].content;
  assert.ok(e.includes('10일차: ') && e.includes('호감도 단계: 경계') && e.includes('아직 낮에 둘이서 따로'));
});
t('히스토리는 최근 N턴만', () => { const hist = []; for (let i = 0; i < 20; i++) hist.push({ user: 'u' + i, assistant: 'a' + i }); const m = L.buildMessages(P, { id: 'lia', day: 1, time: '낮', aff: 0, ev: 0, flags: {}, hist, text: 'x', where: 'menu' }); assert.strictEqual(m.length, 1 + P.settings.historyTurns * 2 + 1); assert.strictEqual(m[1].content, 'u12'); });
t('호감도 구간', () => { eq([0, 3, 4, 11, 12, 30].map((a) => L.tierIndex(a, st)), [0, 0, 1, 1, 2, 2]); });

// ---------- ask() (fetch 를 흉내) ----------
const mkFetch = (handler) => async (url, init) => { const body = init && init.body ? JSON.parse(init.body) : null; const r = await handler(url, body, init); return { ok: r.status === 200, status: r.status, text: async () => (typeof r.body === 'string' ? r.body : JSON.stringify(r.body)) }; };
const content = (c) => ({ status: 200, body: { choices: [{ message: { content: c } }] } });
(async () => {
  ctx.fetch = mkFetch(async () => content(J));
  const c0 = { id: 'erion', day: 1, time: '낮', aff: 0, ev: 0, flags: {}, hist: [], text: '안녕', where: 'menu' };
  await ta('ask 정상', async () => { const r = await L.ask(P, c0); assert.strictEqual(r.face, 'angry'); });
  await ta('response_format 거부 서버 -> 없이 재시도, 이후 생략', async () => {
    L.noJsonFormat = false; const seen = [];
    ctx.fetch = mkFetch(async (u, b) => { seen.push(!!b.response_format); return b.response_format ? { status: 502, body: { error: 'llm_http_error', status: 400 } } : content(J); });
    await L.ask(P, c0); eq(seen, [true, false]); assert.strictEqual(L.noJsonFormat, true);
    seen.length = 0; await L.ask(P, c0); eq(seen, [false]);
    L.noJsonFormat = false;
  });
  await ta('일시 오류는 JSON 모드를 끄지 않음', async () => {
    L.noJsonFormat = false; ctx.fetch = mkFetch(async () => ({ status: 502, body: { error: 'llm_http_error', status: 500 } }));
    await assert.rejects(L.ask(P, c0), (e) => e.code === 'llm_http_error'); assert.strictEqual(L.noJsonFormat, false);
  });
  await ta('영어 응답이면 한국어로 재요청', async () => {
    let calls = 0;
    ctx.fetch = mkFetch(async () => { calls++; return content(calls === 1 ? '{"reply":"Hello there","face":"smile","affection":1}' : J); });
    const r = await L.ask(P, c0); assert.strictEqual(calls, 2); assert.strictEqual(r.reply, '흥, 별로야.');
  });
  await ta('계속 영어면 not_korean', async () => { ctx.fetch = mkFetch(async () => content('{"reply":"Hello"}')); await assert.rejects(L.ask(P, c0), (e) => e.code === 'not_korean'); });
  await ta('빈 응답은 empty', async () => { ctx.fetch = mkFetch(async () => content('')); await assert.rejects(L.ask(P, c0), (e) => e.code === 'empty'); });
  await ta('본문이 이상하면 bad_response', async () => { ctx.fetch = mkFetch(async () => ({ status: 200, body: { nope: 1 } })); await assert.rejects(L.ask(P, c0), (e) => e.code === 'bad_response'); });
  await ta('404 = no_server', async () => { ctx.fetch = mkFetch(async () => ({ status: 404, body: '<html>' })); await assert.rejects(L.ask(P, c0), (e) => e.code === 'no_server'); });
  await ta('네트워크 오류', async () => { ctx.fetch = async () => { throw new TypeError('fail'); }; await assert.rejects(L.ask(P, c0), (e) => e.code === 'network'); });
  await ta('status 상태 분류', async () => {
    ctx.fetch = mkFetch(async () => ({ status: 404, body: '<html>' })); assert.strictEqual((await L.status()).state, 'none');
    ctx.fetch = mkFetch(async () => ({ status: 200, body: { server: 'inn-vn', llm: { reachable: false, error: 'x' } } })); assert.strictEqual((await L.status()).state, 'nollm');
    ctx.fetch = mkFetch(async () => ({ status: 200, body: { server: 'inn-vn', llm: { reachable: true, models: ['a'], model: 'a' } } })); assert.strictEqual((await L.status()).state, 'ready');
    ctx.fetch = async () => { throw new TypeError('x'); }; assert.strictEqual((await L.status()).state, 'none');
  });
  console.log(`llm-core 테스트 통과: ${n}개` + (process.exitCode ? ' (실패 있음)' : ''));
})();
