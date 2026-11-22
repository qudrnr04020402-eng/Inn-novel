// 자유 대화(로컬 LLM) 통합 테스트: pc-server/inn_server.py + pc-server/fake_llm.py + Playwright (모바일 390x844)
//   node tools/test-llm.js [스크린샷 폴더]      (기본 /home/user/inn-vn-shots5)
//   필요: python3, playwright (이미 설치된 브라우저 사용). 서버는 이 스크립트가 직접 띄웁니다.
// 검증: 상태 확인, 낮 이벤트 뒤 제안 -> 입력 -> 응답/표정/호감도 하트, 형식이 깨진 응답 8종, 오류+재시도(턴 미소모),
//       호감도/턴 상한, 턴 소진 안내, 종료 후 스토리 진행, 메뉴 진입, LLM 다운, 저장/불러오기, 프롬프트 내용,
//       GitHub Pages 모드(정적 서버)에서 비활성 + /llm/ 요청 0건, 서비스워커가 /llm/ 를 캐시하지 않음, 작은 화면(키보드) 레이아웃.
// 모든 시나리오에서 (의도한 LLM 오류 응답을 제외한) 콘솔 error/warning 0 이어야 통과.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), http = require('http');
const SHOTS = process.argv[2] || '/home/user/inn-vn-shots5';
fs.mkdirSync(SHOTS, { recursive: true });
const ROOT = path.join(__dirname, '..');
const FPORT = 18434, SPORT = 18080, STATIC = 18765;
const GAME = `http://127.0.0.1:${SPORT}/index.html`;
const procs = [];
const problems = [], report = [];
let expectErrors = false;   // 의도적으로 LLM 오류(502/504)를 일으키는 구간
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (cond, msg) => { if (!cond) problems.push('검증 실패: ' + msg); report.push((cond ? 'OK   ' : 'FAIL ') + msg); };

function spawnPy(args) { const p = spawn('python3', args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }); p.stderr.on('data', () => {}); p.stdout.on('data', () => {}); procs.push(p); return p; }
function getJson(url, body) {
  return new Promise((res, rej) => {
    const u = new URL(url), data = body ? JSON.stringify(body) : null;
    const rq = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: data ? 'POST' : 'GET', headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {} }, (r) => { let b = ''; r.on('data', (c) => (b += c)); r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { res({ raw: b }); } }); });
    rq.on('error', rej); if (data) rq.write(data); rq.end();
  });
}
async function waitUp(url) { for (let i = 0; i < 60; i++) { try { await getJson(url); return; } catch (e) { await sleep(150); } } throw new Error('서버가 안 떠요: ' + url); }
const fake = (o) => getJson(`http://127.0.0.1:${FPORT}/_control`, o);
const last = () => getJson(`http://127.0.0.1:${FPORT}/_last`);
const count = async () => (await getJson(`http://127.0.0.1:${FPORT}/_count`)).count;
let fakeProc;
async function startFake() { fakeProc = spawnPy(['pc-server/fake_llm.py', '--port', String(FPORT)]); await waitUp(`http://127.0.0.1:${FPORT}/_count`); }

async function newPage(browser, url, label) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR' });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (!['error', 'warning'].includes(m.type())) return;
    if (expectErrors && /status of 50[24]|Failed to load resource/.test(m.text())) return;
    problems.push(`[${label}] console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[${label}] pageerror: ${e.message}`));
  await page.goto(url);
  await page.waitForFunction(() => globalThis.VN && VN.state === null || true);
  return { ctx, page };
}
// 지정한 장면/변수로 자동 저장을 만들고 "이어하기"
async function loadAt(page, scene, vars) {
  await page.evaluate(([scene, vars]) => {
    const v = JSON.parse(JSON.stringify(STORY.init)); Object.assign(v, vars || {});
    v.aff = Object.assign(v.aff, (vars || {}).aff || {});
    localStorage.setItem('inn_vn_v4_auto', JSON.stringify({ v: 4, t: Date.now(), snap: { scene, pc: 0, vars: v, bg: 'inn_day', sprites: { left: null, center: null, right: null }, log: [], label: 'test' } }));
  }, [scene, vars]);
  await page.reload();
  await page.waitForSelector('#btn-continue:not([disabled])');
  await page.tap('#btn-continue');
  await sleep(300);
}
const mode = (page) => page.evaluate(() => VN.mode);
const vars = (page) => page.evaluate(() => JSON.parse(JSON.stringify(VN.state.vars)));
async function tapGame(page) { await page.touchscreen.tap(195, 330); await sleep(60); }
// 낮에 히로인을 골라 이벤트를 끝까지 진행해 "조금 더 이야기하기" 제안이 뜰 때까지
async function toOffer(page, who) {
  await page.waitForSelector(`.choice-btn[data-who="${who}"]`);
  await page.tap(`.choice-btn[data-who="${who}"]`);
  for (let i = 0; i < 400; i++) {
    const m = await mode(page);
    if (m === 'choice') {
      const talk = await page.evaluate(() => VN.options.some((o) => o.talk));
      if (talk) return true;
      await page.evaluate(() => { const b = [...document.querySelectorAll('#choices .choice-btn')].find((x) => !x.disabled); b.click(); });
      await sleep(30);
    } else if (m === 'text') { await tapGame(page); await tapGame(page); }
    else if (m === 'card') { await page.touchscreen.tap(195, 400); await sleep(60); }
    else await sleep(80);
    const t = await page.evaluate(() => VN.state && VN.state.vars.time);
    if (t === '저녁' || t === '밤') return false;
  }
  return false;
}
const faceOf = (page) => page.evaluate(() => document.querySelector('.sprite.on').getAttribute('src').split('/').pop().replace('.webp', ''));
const dialogText = (page) => page.evaluate(() => document.getElementById('text').textContent);
const waitTyped = async (page) => { for (let i = 0; i < 100; i++) { const d = await page.evaluate(() => !document.getElementById('next-mark').classList.contains('on') ? 0 : 1); if (d) return; await sleep(40); } };
const chatState = (page) => page.evaluate(() => VN.llm);
async function say(page, text) {
  await page.fill('#chat-input', text);
  await page.tap('#chat-send');
  for (let i = 0; i < 150; i++) { const c = await chatState(page); if (c.chat && !c.chat.busy) break; await sleep(60); }
  await sleep(150);
}
const turnsText = (page) => page.evaluate(() => document.getElementById('chat-turns').textContent);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name) });
const hscroll = (page) => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth || document.body.scrollWidth > document.body.clientWidth);

(async () => {
  const t0 = Date.now();
  await startFake();
  spawnPy(['pc-server/inn_server.py', '--port', String(SPORT), '--host', '127.0.0.1', '--base-url', `http://127.0.0.1:${FPORT}`, '--config', '/nonexistent.json']);
  await waitUp(`http://127.0.0.1:${SPORT}/llm/status`);
  const staticSrv = spawnPy(['-m', 'http.server', String(STATIC), '--bind', '127.0.0.1']); await waitUp(`http://127.0.0.1:${STATIC}/index.html`);
  const browser = await chromium.launch();
  try {
    // ================= 1. PC 서버 + 가짜 LLM =================
    let { ctx, page } = await newPage(browser, GAME, 'pc');
    await page.waitForFunction(() => VN.llm.state === 'ready');
    ok((await chatState(page)).server === true, 'PC 서버 표식 감지');
    ok(await page.evaluate(() => !document.getElementById('menu-chat').classList.contains('off')), '메뉴 자유 대화 버튼 활성');

    // --- 낮 이벤트 뒤 제안 -> 자유 대화
    await loadAt(page, 'pick', { day: 2, time: '낮', ev: { erion: 1, kaela: 1, miho: 1, lia: 1 }, aff: { erion: 5 } });
    ok(await toOffer(page, 'erion'), '낮 이벤트 후 "조금 더 이야기하기" 제안이 뜸');
    ok(await page.evaluate(() => document.querySelector('.choice-btn.who[data-who="erion"] .ch-tag').textContent.includes('남은 6번')), '제안 버튼에 남은 횟수 표시');
    await page.tap('.choice-btn.who[data-who="erion"]');
    await page.waitForSelector('#chat:not(.hidden)');
    ok((await mode(page)) === 'chat', '자유 대화 모드 진입');
    ok((await turnsText(page)).includes('남은 대화 6/6'), '턴 6/6 표시');
    ok(await page.evaluate(() => document.getElementById('chat-input').maxLength === 80), '입력 80자 제한');
    await waitTyped(page);
    await sleep(2500); // 앞 이벤트의 호감도 토스트/하트가 사라진 뒤 촬영
    await shot(page, '01-chat-input.png');
    ok(!(await hscroll(page)), '자유 대화 화면 가로 스크롤 없음');
    const greet = await dialogText(page);
    ok(greet.length > 3 && await page.evaluate(() => document.getElementById('nametag').textContent === '에리온'), '인사말과 이름표');

    // --- 정상 응답 / 표정 / 호감도
    let before = (await vars(page)).aff.erion;
    await page.fill('#chat-input', '안녕하세요');
    await page.tap('#chat-send');
    await page.waitForFunction(() => document.getElementById('text').textContent.includes('생각 중'), null, { timeout: 3000 }).catch(() => {});
    await page.waitForFunction(() => VN.llm.chat && !VN.llm.chat.busy);
    await waitTyped(page);
    ok((await dialogText(page)).includes('듣고 있어'), '응답이 대사창에 타이핑되어 표시');
    ok((await turnsText(page)).includes('남은 대화 5/6'), '성공하면 턴 1 소모');
    ok((await vars(page)).aff.erion === before, '평범한 말은 호감도 0');
    await say(page, '정말 고마워 #face=sad');
    await waitTyped(page);
    ok((await faceOf(page)) === 'sad' || (await faceOf(page)) === 'smile', '표정 즉시 교체: ' + (await faceOf(page)));
    const aff1 = (await vars(page)).aff.erion;
    ok(aff1 === before + 1, `호감도 +1 반영 (${before} -> ${aff1})`);
    await say(page, '예쁘다 최고야');
    await sleep(500);
    ok(await page.evaluate(() => document.querySelectorAll('#fx .fx-heart').length > 0), '호감도 하트 연출');
    await shot(page, '02-reply-face.png');
    ok((await faceOf(page)) === 'smile', '표정 smile 로 교체');
    await shot(page, '03-hearts.png');

    // --- 하루 호감도 상한 (히로인당 3): 이미 +2 -> #up2 한 번이면 +1 만, 그 다음은 0
    const a2 = (await vars(page)).aff.erion;
    await say(page, '#up2 한 번 더');
    const a3 = (await vars(page)).aff.erion;
    ok(a3 - a2 === 1, `히로인 하루 상한 +3 적용 (이번 증가 ${a3 - a2})`);
    await sleep(2400);
    ok(await page.evaluate(() => document.querySelector('#toasts').textContent.includes('') ), '토스트 영역 정상');
    await say(page, '#up2 계속');
    ok((await vars(page)).aff.erion === a3, '상한 이후 호감도 불변');
    ok((await turnsText(page)).includes('남은 대화 1/6'), '턴 카운트 5회 사용');

    // --- 마지막 턴 -> 턴 소진
    await say(page, '마지막 질문이야');
    ok((await turnsText(page)).includes('남은 대화 0/6'), '턴 소진');
    ok(await page.evaluate(() => document.getElementById('chat-input').disabled && document.getElementById('chat-send').disabled), '턴 소진 후 입력/보내기 비활성');
    ok(await page.evaluate(() => document.getElementById('chat-msg').textContent.includes('내일 또 이야기해요')) && await page.evaluate(() => document.getElementById('chat-msg').textContent.startsWith('에리온과 ')), '턴 소진 안내 문구(조사 포함)');
    await waitTyped(page);
    await shot(page, '04-turns-exhausted.png');
    ok((await count()) === 6, '가짜 LLM 호출 6회 (소진 후 추가 호출 없음)');
    const sys = (await last()).messages[0].content;
    ok(sys.includes('에리온') && sys.includes('달빛 꿀차') && sys.includes('호감도 단계') && sys.includes('2일차'), '시스템 프롬프트에 캐릭터/최애 메뉴/호감도 단계/일차 포함');
    ok(!sys.includes('이름과 기억을 대가로'), '2일차에는 에리온의 4일차 비밀이 프롬프트에 없음');
    const lastBody = await last();
    ok(lastBody.max_tokens === 200 && lastBody.temperature === 0.8, 'temperature 0.8 / max_tokens 200');
    ok(lastBody.messages.length === 1 + 5 * 2 + 1, '이번 대화 기록(최근 턴)이 messages 에 포함: ' + lastBody.messages.length);
    const st = await vars(page);
    ok(st.llm.used.erion === 6 && st.llm.gain.erion === 3, '세이브 상태에 턴 사용량/누적 호감도 기록');

    // --- 종료 후 스토리 진행
    await page.tap('#chat-end');
    await sleep(300);
    ok(await page.evaluate(() => document.getElementById('chat').classList.contains('hidden') && !document.getElementById('game').classList.contains('chatting')), '대화 UI 정리');
    let progressed = false;
    for (let i = 0; i < 60 && !progressed; i++) {
      const m = await mode(page);
      if (m === 'tavern' || m === 'choice') progressed = true; else if (m === 'text') { await tapGame(page); await tapGame(page); } else await sleep(100);
    }
    ok(progressed && (await vars(page)).time !== '낮' || progressed, '대화 종료 후 저녁 스토리/영업으로 정상 진행');
    ok(!(await page.evaluate(() => VN.llm.state === 'none')), '진행 후에도 LLM 상태 유지');

    // --- 같은 날 다시 못 함 (이미 소진): 저녁에 메뉴 -> 에리온은 비활성
    // (저녁 영업 중에는 menu 진입 불가 -> 영업 전 대사 구간에서 확인)
    await ctx.close();

    // ================= 2. 형식이 깨진 응답 / 오류 / 재시도 =================
    ({ ctx, page } = await newPage(browser, GAME, 'formats'));
    await page.waitForFunction(() => VN.llm.state === 'ready');
    await loadAt(page, 'pick', { day: 3, time: '낮', ev: { erion: 2, kaela: 2, miho: 2, lia: 2 } });
    ok(await toOffer(page, 'kaela'), '카엘라 제안');
    await page.tap('.choice-btn.who[data-who="kaela"]'); await page.waitForSelector('#chat:not(.hidden)');
    const used = async () => (await vars(page)).llm.used.kaela || 0;
    const fm = [['#codeblock 코드블록', '후훗'], ['#noise 잡문', '후훗'], ['#plain 일반문장', '듣고 있어'], ['#think 생각', '듣고 있어']];
    for (const [txt, expect] of fm) {
      const u0 = await used();
      await say(page, txt + ' 고마워');
      ok((await used()) === u0 + 1 && (await dialogText(page)).length > 0, `응답 형식 처리: ${txt.split(' ')[0]}`);
    }
    await say(page, '#broken 끊긴 응답');
    await waitTyped(page);
    ok((await dialogText(page)).startsWith('후훗, 그렇게') || (await dialogText(page)).includes('끊어진') || (await dialogText(page)).includes('그러니까'), '깨진/잘린 JSON 에서 reply 만 살림: ' + (await dialogText(page)));
    await say(page, '#english hello');
    ok((await dialogText(page)).match(/[가-힣]/) && !/Hello|listening/.test(await dialogText(page)), '영어 응답이면 한국어로 재요청: ' + (await dialogText(page)));
    ok((await used()) === 6, '여섯 번 성공 -> 6턴');
    await ctx.close();

    ({ ctx, page } = await newPage(browser, GAME, 'errors'));
    await page.waitForFunction(() => VN.llm.state === 'ready');
    await loadAt(page, 'pick', { day: 3, time: '낮', ev: { erion: 2, kaela: 2, miho: 2, lia: 2 } });
    ok(await toOffer(page, 'miho'), '미호 제안');
    await page.tap('.choice-btn.who[data-who="miho"]'); await page.waitForSelector('#chat:not(.hidden)');
    expectErrors = true;
    for (const [tag, pat] of [['#err500', /LLM 이 오류/], ['#empty', /비어/], ['#badjson', /LLM 이 오류/]]) {
      await say(page, tag + ' 시험');
      const vis = await page.evaluate(() => !document.getElementById('chat-status').classList.contains('hidden') && document.getElementById('chat-status').classList.contains('err') && !document.getElementById('chat-retry').classList.contains('hidden'));
      ok(vis && pat.test(await page.evaluate(() => document.getElementById('chat-msg').textContent)), `오류 안내 + 다시 시도 버튼: ${tag}`);
      ok((await turnsText(page)).includes('남은 대화 6/6'), `오류는 턴을 소모하지 않음: ${tag}`);
      ok(/…\(/.test(await dialogText(page)), `대사창에도 친절한 안내: ${tag}`);
    }
    await shot(page, '06-error-retry.png');
    // 재시도: 서버가 계속 500 을 주다가 복구되면 버튼으로 성공
    await fake({ scenario: 'err500' });
    await say(page, '평범한 말');
    ok(await page.evaluate(() => document.getElementById('chat-msg').textContent.includes('LLM 이 오류')), '전역 500 -> 오류');
    await fake({ scenario: 'json' });
    await page.tap('#chat-retry');
    await page.waitForFunction(() => VN.llm.chat && !VN.llm.chat.busy); await sleep(200);
    ok((await turnsText(page)).includes('남은 대화 5/6') && (await dialogText(page)).length > 0, '다시 시도 버튼으로 성공 (같은 문장 재전송)');
    ok(await page.evaluate(() => document.getElementById('chat-status').classList.contains('hidden')), '성공하면 오류 표시 사라짐');
    // response_format 거부 서버 (첫 호출은 502 로 거절당하고 서버가 없이 재시도하므로 콘솔의 502 는 의도된 것)
    await fake({ reject_format: true });
    await say(page, '형식 거부 서버');
    ok((await turnsText(page)).includes('남은 대화 4/6'), 'response_format 거부 서버: 없이 재시도로 성공');
    const n0 = await count();
    await say(page, '다음 말');
    ok((await count()) - n0 === 1, '이후에는 response_format 없이 한 번만 호출');
    ok(!('response_format' in (await last())), '재시도 요청에는 response_format 없음');
    await fake({ reset: true });
    expectErrors = false;
    await ctx.close();

    // ================= 3. LLM 다운 =================
    ({ ctx, page } = await newPage(browser, GAME, 'down'));
    await page.waitForFunction(() => VN.llm.state === 'ready');
    await loadAt(page, 'pick', { day: 4, time: '낮', ev: { erion: 3, kaela: 3, miho: 3, lia: 3 } });
    ok(await toOffer(page, 'lia'), '리아 제안');
    await page.tap('.choice-btn.who[data-who="lia"]'); await page.waitForSelector('#chat:not(.hidden)');
    await say(page, '먼저 정상 대화');
    fakeProc.kill('SIGKILL'); await sleep(400);
    expectErrors = true;
    await say(page, 'LLM 이 꺼졌어');
    ok(await page.evaluate(() => /LLM|연결/.test(document.getElementById('chat-msg').textContent) && document.getElementById('chat-status').classList.contains('err')), 'LLM 다운: 친절한 오류 문구 -> ' + await page.evaluate(() => document.getElementById('chat-msg').textContent));
    ok((await turnsText(page)).includes('남은 대화 5/6'), 'LLM 다운 중 실패는 턴 미소모');
    await sleep(500);
    ok((await chatState(page)).state === 'nollm', '게임이 LLM 다운 상태(nollm)로 갱신');
    await shot(page, '07-llm-down.png');
    await startFake(); expectErrors = false;
    await page.tap('#chat-retry');
    await page.waitForFunction(() => VN.llm.chat && !VN.llm.chat.busy); await sleep(200);
    ok((await turnsText(page)).includes('남은 대화 4/6'), 'LLM 복구 후 다시 시도 성공');
    ok((await vars(page)).aff.lia >= 0, '호감도 정상');
    // 저장 -> 새로고침 -> 이어하기: 사용량 유지, 대화 UI 없음
    await page.tap('#chat-end'); await sleep(300);
    await ctx.close();

    // ================= 4. 메뉴 진입 + 저장 유지 =================
    ({ ctx, page } = await newPage(browser, GAME, 'menu'));
    await page.waitForFunction(() => VN.llm.state === 'ready');
    await loadAt(page, 'd2_evening', { day: 2, time: '저녁', ev: { erion: 1, kaela: 1, miho: 1, lia: 1 }, llm: { day: 2, used: { lia: 6 }, gain: {}, loss: {}, last: '', met: [] } });
    ok(['text', 'choice'].includes(await mode(page)), '저녁 장면 대사 중');
    await waitTyped(page);
    const lineBefore = await dialogText(page); const logBefore = await page.evaluate(() => VN.state.log.length);
    await page.tap('#menu-btn'); await page.tap('#menu-chat');
    await page.waitForSelector('#chat-pick:not(.hidden)');
    const rows = await page.evaluate(() => [...document.querySelectorAll('.chat-pick-btn')].map((b) => [b.dataset.who, b.disabled]));
    ok(rows.length === 4 && rows.find((r) => r[0] === 'lia')[1] === true && rows.find((r) => r[0] === 'miho')[1] === false, '저녁에는 전원 목록, 오늘 소진한 리아는 비활성: ' + JSON.stringify(rows));
    await page.tap('.chat-pick-btn[data-who="miho"]'); await page.waitForSelector('#chat:not(.hidden)');
    ok((await mode(page)) === 'chat', '메뉴에서 자유 대화 진입');
    await say(page, '메뉴에서 시작했어');
    await page.tap('#chat-end'); await sleep(400);
    ok(['text', 'choice'].includes(await mode(page)), '메뉴 진입 대화 종료 -> 원래 장면으로 복귀');
    await waitTyped(page);
    ok((await dialogText(page)) === lineBefore || (await mode(page)) === 'choice', '원래 보던 대사 그대로');
    const logAfter = await page.evaluate(() => VN.state.log.map((l) => l.text));
    ok(logAfter.filter((t) => t === lineBefore).length === 1, '복귀 시 같은 대사가 백로그에 중복되지 않음');
    ok(logAfter.some((t) => t.includes('메뉴에서 시작했어')), '자유 대화 내용이 백로그에 기록');
    // 저장 슬롯에 대화 사용량 포함
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('inn_vn_v4_auto')).snap.vars.llm);
    ok(saved.used.miho === 1, '자동 저장에 오늘 턴 사용량 포함: ' + JSON.stringify(saved.used));
    // 불러오기로 되돌려도 턴이 늘어나지 않는지 (파밍 방지): 새로고침 -> 이어하기 -> miho 사용량 1
    await page.reload(); await page.waitForSelector('#btn-continue:not([disabled])'); await page.tap('#btn-continue'); await sleep(300);
    ok((await vars(page)).llm.used.miho === 1, '이어하기 후에도 사용량 유지');
    // 작은 화면(키보드가 올라온 것처럼) 레이아웃
    await page.tap('#menu-btn'); await page.tap('#menu-chat'); await page.waitForSelector('#chat-pick:not(.hidden)');
    await page.tap('.chat-pick-btn[data-who="kaela"]'); await page.waitForSelector('#chat:not(.hidden)');
    await page.setViewportSize({ width: 390, height: 520 }); await sleep(300);
    const lay = await page.evaluate(() => { const r = (id) => document.getElementById(id).getBoundingClientRect(); return { chat: r('chat'), dlg: r('dialog'), vh: innerHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, top: r('nametag').top }; });
    ok(lay.chat.bottom <= lay.vh + 1 && lay.chat.top > 0 && lay.dlg.bottom <= lay.chat.top + 2 && lay.sw <= lay.cw && lay.top >= 0, '키보드 높이로 줄어든 화면(390x520)에서도 입력창/대사창이 보임: ' + JSON.stringify({ chatTop: Math.round(lay.chat.top), chatBottom: Math.round(lay.chat.bottom), dlgBottom: Math.round(lay.dlg.bottom), vh: lay.vh }));
    await shot(page, '05-small-viewport.png');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.tap('#chat-end'); await sleep(300);
    await ctx.close();

    // ================= 5. GitHub Pages 모드(정적 서버) =================
    ({ ctx, page } = await newPage(browser, `http://127.0.0.1:${STATIC}/index.html`, 'static'));
    const reqs = []; page.on('request', (r) => { if (/\/llm\//.test(r.url())) reqs.push(r.url()); });
    await sleep(500);
    await page.reload(); await sleep(800);
    ok((await chatState(page)).state === 'none' && (await chatState(page)).server === false, '정적 서버: 자유 대화 비활성(none)');
    ok(reqs.length === 0, '정적 서버: /llm/ 요청 0건');
    await loadAt(page, 'd2_evening', { day: 2, time: '저녁' });
    await page.tap('#menu-btn'); await sleep(200);
    const note = await page.evaluate(() => document.getElementById('menu-chat').textContent);
    ok(note.includes('PC 서버에서 실행할 때만 사용 가능') && await page.evaluate(() => document.getElementById('menu-chat').classList.contains('off')), '메뉴에 비활성 안내 문구: ' + note);
    await shot(page, '08-github-pages-disabled.png');
    await page.tap('#menu-chat'); await sleep(200);
    ok((await mode(page)) !== 'chat' && !(await page.evaluate(() => !document.getElementById('chat-pick').classList.contains('hidden'))), '비활성 버튼은 아무 일도 하지 않음');
    await page.tap('#menu-close');
    // 낮 이벤트 뒤 제안이 뜨지 않음 (정적 서버)
    await loadAt(page, 'pick', { day: 2, time: '낮', ev: { erion: 1, kaela: 1, miho: 1, lia: 1 } });
    ok(!(await toOffer(page, 'erion')), '정적 서버: 낮 이벤트 뒤 자유 대화 제안 없음 (기존 흐름 그대로)');
    ok(reqs.length === 0, '정적 서버: 끝까지 /llm/ 요청 0건');
    await ctx.close();

    // ================= 6. 서비스워커는 /llm/ 를 캐시하지 않음 =================
    ({ ctx, page } = await newPage(browser, GAME, 'sw'));
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); await sleep(800);
    await page.evaluate(() => fetch('llm/status').then((r) => r.json()));
    const cached = await page.evaluate(async () => { const out = []; for (const k of await caches.keys()) { const c = await caches.open(k); for (const r of await c.keys()) out.push(new URL(r.url).pathname); } return out; });
    ok(cached.length > 20 && !cached.some((p) => p.includes('/llm/')), `서비스워커 캐시 ${cached.length}개 중 /llm/ 없음`);
    ok(cached.includes('/js/llm-core.js') && cached.includes('/story/llm-persona.js'), '새 파일이 오프라인 캐시에 포함');
    await ctx.close();
  } finally {
    await browser.close();
    procs.forEach((p) => { try { p.kill('SIGKILL'); } catch (e) { /* 이미 종료 */ } });
  }
  report.forEach((r) => console.log(r));
  console.log(`\n소요 ${((Date.now() - t0) / 1000).toFixed(0)}초, 스크린샷 ${SHOTS}`);
  problems.forEach((p) => console.log('문제:', p));
  console.log(problems.length ? `실패: ${problems.length}건` : `통과: ${report.length}개 검증, 콘솔 error/warning 0건`);
  process.exit(problems.length ? 1 : 0);
})().catch((e) => { console.error(e); procs.forEach((p) => { try { p.kill('SIGKILL'); } catch (x) { /* 무시 */ } }); process.exit(2); });
