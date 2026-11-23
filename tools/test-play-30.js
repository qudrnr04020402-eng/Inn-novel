// 30일 구성 전용 테스트 (Playwright, 모바일 390x844): 달력 / 챕터 카드 / 주 시작 자동 저장 / 휴일 / 피로 / 일상일 흐름 / 세이브 v6
//   python3 -m http.server 8765 &   # 먼저 서버를 띄운 뒤
//   node tools/test-play-30.js [스크린샷 폴더]      (기본 /home/user/inn-vn-shots11/t30)
// 검증
//  (1) 세이브 v6: 키 inn_vn_v6_*, v5 의 엔딩/CG 기록은 옮겨 오고 v5 진행 세이브는 무시
//  (2) 새 게임 -> 챕터 카드(1장 새 주인) -> 일차 카드(1주차 월요일) -> HUD "1주차 · 1일 (월)"
//  (3) 일차 카드는 불러와도 일차가 두 번 넘어가지 않음 (변경 전 스냅샷)
//  (4) 주 시작(8일차)에서 챕터 카드 + "주차 시작 저장" 칸 자동 저장 -> 불러오기 목록에서 다시 불러옴
//  (5) 달력 화면: 30칸, 오늘 표시, 지난 날 영업 결과/낮 행동, 일요일 휴, 예정된 큰 사건
//  (6) 휴일(일요일): 영업/숙박 없이 낮 선택(산책 4 + 푹 쉬기 + 주간 이벤트) -> 피로 회복 -> 다음 날
//  (7) 피로: 피곤/과로 단계의 팁 감소와 대성공 미끄러짐, HUD 피로 막대/문구
//  (8) 일상일 한 날의 탭 수와 예상 소요 시간 (2~4분 이내)
//  (9) 낮 행동 4가지 각각의 효과 (피로/골드/평판/재료 할인)
// 모든 시나리오에서 콘솔 error/warning 0, 가로 스크롤 0 이어야 통과.
const { chromium } = require('playwright');
const fs = require('fs');
const URL = process.env.URL || 'http://localhost:8765/index.html';
const SHOTS = process.argv[2] || '/home/user/inn-vn-shots11/t30';
fs.mkdirSync(SHOTS, { recursive: true });
const problems = [], report = [];
const ok = (cond, msg) => { if (!cond) problems.push('검증 실패: ' + msg); report.push((cond ? 'OK   ' : 'FAIL ') + msg); };

async function newPage(browser, label, o) {
  o = Object.assign({ events: false, pre: null }, o);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(({ events, pre }) => {
    try { if (!sessionStorage.getItem('__t30_init')) { sessionStorage.setItem('__t30_init', '1'); localStorage.setItem('inn_vn_v6_tut', '1'); if (pre) Object.keys(pre).forEach((k) => localStorage.setItem(k, pre[k])); } } catch (e) { /* 무시 */ }
    if (!events) Object.defineProperty(window, 'RANDOM_EVENTS', { configurable: true, set(v) { v.chance = 0; Object.defineProperty(window, 'RANDOM_EVENTS', { value: v, writable: true, configurable: true }); } });
  }, o);
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`[${label}] console.${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`[${label}] pageerror: ${e.message}`));
  return { ctx, page };
}
const shiftOf = (page) => page.evaluate(() => document.getElementById('app').scrollLeft + document.getElementById('game').scrollLeft + window.scrollX);
const vars = (page) => page.evaluate(() => JSON.parse(JSON.stringify(VN.state.vars)));
const tap = (page) => page.touchscreen.tap(195, 300);
// 현재 상태를 고쳐서 '자동 저장'에 쓰고 이어하기 (일차를 건너뛰어 시작하기 위함)
async function inject(page, src) {
  await page.evaluate((s) => {
    const sn = JSON.parse(JSON.stringify(VN.state));
    new Function('sn', s)(sn);
    localStorage.setItem('inn_vn_v6_auto', JSON.stringify({ v: 6, t: Date.now(), snap: sn }));
  }, src);
  await page.reload(); await page.waitForSelector('#btn-continue');
  await page.locator('#btn-continue').click(); await page.waitForTimeout(350);
}
const JUMP = (day, extra) => `sn.scene = 'cal_next'; sn.pc = 0; sn.vars.day = ${day}; sn.vars.time = '밤'; ${extra || ''}`;
// 빠른 진행: 선택지/엔딩/영업이 나올 때까지 클릭. 반환: 멈춘 모드
const ff = (page, until) => page.evaluate((src) => {
  const u = src ? new Function('m', 'st', 'return (' + src + ')(m, st)') : null;
  const g = document.getElementById('game'); let n = 0;
  for (let i = 0; i < 4000; i++) {
    const m = VN.mode;
    if (u && u(m, VN.state)) return { m, n };
    if (m === 'choice' || m === 'ending' || m === 'title' || m === 'tavern') return { m, n };
    if (m === 'rankup') { document.getElementById('rankup-btn').click(); n++; continue; }
    g.click(); n++;
  }
  return { m: 'stuck', n };
}, until ? until.toString() : null);

(async () => {
  const browser = await chromium.launch();

  // ---------- (1) 세이브 v6 / v5 기록 이전 ----------
  {
    const pre = { inn_vn_v5_endings: JSON.stringify({ erion: 111 }), inn_vn_v5_cg: JSON.stringify({ lia_deep: 222 }), inn_vn_v5_auto: JSON.stringify({ v: 5, t: 1, snap: { scene: 'd2_open', pc: 0, vars: { day: 2 } } }) };
    const { ctx, page } = await newPage(browser, '세이브v6', { pre });
    await page.goto(URL); await page.waitForSelector('#btn-new');
    const st = await page.evaluate(() => ({ end: localStorage.getItem('inn_vn_v6_endings'), cg: localStorage.getItem('inn_vn_v6_cg'), cont: !document.getElementById('btn-continue').classList.contains('hidden') && !document.getElementById('btn-continue').disabled }));
    ok(st.end && JSON.parse(st.end).erion === 111 && JSON.parse(st.cg).lia_deep === 222, 'v5 엔딩/CG 기록이 v6 키로 옮겨짐');
    ok(!st.cont, 'v5 진행 세이브는 무시 (이어하기 비활성)');
    await ctx.close();
  }

  // ---------- (2)(3) 챕터 카드 / 일차 카드 / HUD / 불러오기 멱등 ----------
  const { ctx, page } = await newPage(browser, '30일');
  await page.goto(URL); await page.waitForSelector('#btn-new');
  await page.tap('#btn-new'); await page.waitForTimeout(500);
  const c1 = await page.evaluate(() => ({ cls: document.getElementById('daycard').className, t: document.getElementById('card-title').textContent, s: document.getElementById('card-sub').textContent, tip: document.getElementById('card-tip').textContent, mode: VN.mode }));
  ok(/chapter/.test(c1.cls) && c1.t === '1장' && c1.s === '새 주인' && c1.mode === 'card', `첫 화면은 챕터 카드 1장 새 주인 (${c1.t} ${c1.s})`);
  await page.screenshot({ path: `${SHOTS}/01_chapter1.png` });
  await tap(page); await page.waitForTimeout(300);
  const c2 = await page.evaluate(() => ({ cls: document.getElementById('daycard').className, t: document.getElementById('card-title').textContent, s: document.getElementById('card-sub').textContent, fat: !!document.querySelector('#card-body .card-fat') }));
  ok(!/chapter/.test(c2.cls) && c2.t === '1일차' && /1주차 · 월요일/.test(c2.s) && c2.fat, `다음은 일차 카드 (${c2.t} / ${c2.s}), 피로 줄 표시`);
  await tap(page); await page.waitForTimeout(300);
  const hud = await page.evaluate(() => document.getElementById('hud-day').textContent);
  ok(/1주차 · 1일 \(월\)/.test(hud), `HUD 주차/요일 표시: ${hud}`);
  ok((await shiftOf(page)) === 0, '가로 스크롤 0 (1일차)');

  // 일상일 도달: 8일차 직전(7일 일요일 밤)으로 주입 -> 8일차 챕터 카드
  await inject(page, JUMP(7, `sn.vars.fat = 20; sn.vars.gold = 150; sn.vars.cal.log = { 2: { q: '◎', g: 40, r: 2 }, 3: { q: '○', g: 22, r: 1 }, 4: { q: '△', g: 5, r: 0 }, 5: { q: '◎', g: 45, r: 2 }, 6: { q: '○', g: 20, r: 1 } }; sn.vars.cal.act = { 2: 'work', 3: 'h:kaela', 4: 'rest', 5: 'h:lia', 6: 'town', 7: 'walk:miho' };`));
  const c3 = await page.evaluate(() => ({ cls: document.getElementById('daycard').className, t: document.getElementById('card-title').textContent, s: document.getElementById('card-sub').textContent, tip: document.getElementById('card-tip').textContent, day: VN.state.vars.day }));
  ok(/chapter/.test(c3.cls) && c3.t === '2장' && c3.s === '달맞이' && c3.day === 8, `8일차 시작에 챕터 2장 달맞이 카드 (${c3.t} ${c3.s}, day ${c3.day})`);
  ok(/주차 시작/.test(c3.tip), '챕터 카드에 주차 시작 자동 저장 안내');
  await page.screenshot({ path: `${SHOTS}/02_chapter2.png` });
  // (4) 주 시작 저장 칸
  const wk = await page.evaluate(() => { const r = localStorage.getItem('inn_vn_v6_wk'); if (!r) return null; const d = JSON.parse(r); return { v: d.v, day: d.snap.vars.day, label: d.snap.label, scene: d.snap.scene }; });
  ok(wk && wk.v === 6 && wk.day === 7 && /2주차 시작/.test(wk.label), `주차 시작 저장 칸(inn_vn_v6_wk)에 직전 상태 저장: ${JSON.stringify(wk)}`);
  // (3) 일차 카드는 불러와도 두 번 넘어가지 않음: 자동 저장은 변경 전 스냅샷
  const au = await page.evaluate(() => JSON.parse(localStorage.getItem('inn_vn_v6_auto')).snap.vars.day);
  ok(au === 7, `자동 저장은 날짜가 바뀌기 전(7일차) 상태: ${au}`);
  await page.reload(); await page.waitForSelector('#btn-continue'); await page.locator('#btn-continue').click(); await page.waitForTimeout(300);
  ok((await page.evaluate(() => VN.state.vars.day)) === 8, '이어하기 후에도 8일차 (9일차로 두 번 넘어가지 않음)');
  await tap(page); await page.waitForTimeout(200); await tap(page); await page.waitForTimeout(300);
  const wkd = await page.evaluate(() => VN.state.vars.day);
  ok(wkd === 8, `카드 두 장을 넘겨도 8일차 유지 (${wkd})`);
  // 불러오기 화면에 주차 시작 칸
  await page.evaluate(() => { document.getElementById('menu-btn').click(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { document.getElementById('menu-load').click(); }); await page.waitForTimeout(300);
  const slots = await page.evaluate(() => [...document.querySelectorAll('.slot-btn')].map((b) => ({ t: b.querySelector('strong').textContent, off: b.disabled, i: b.querySelector('span').textContent })));
  ok(slots.length === 5 && slots[1].t === '주차 시작 저장' && !slots[1].off && /2주차 시작/.test(slots[1].i), `불러오기 목록 둘째 칸 = 주차 시작 저장 (${JSON.stringify(slots[1])})`);
  await page.screenshot({ path: `${SHOTS}/03_slots.png` });
  await page.locator('.slot-btn').nth(1).click(); await page.waitForTimeout(400);
  const back = await page.evaluate(() => ({ cls: document.getElementById('daycard').className, day: VN.state.vars.day }));
  ok(/chapter/.test(back.cls) && back.day === 8, '주차 시작 저장을 불러오면 다시 2장 카드부터');
  await tap(page); await page.waitForTimeout(200); await tap(page); await page.waitForTimeout(300);

  // ---------- (5) 달력 ----------
  await page.evaluate(() => { document.getElementById('menu-btn').click(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { document.getElementById('menu-cal').click(); }); await page.waitForTimeout(400);
  const cal = await page.evaluate(() => ({
    n: document.querySelectorAll('.cal-cell').length, today: [...document.querySelectorAll('.cal-cell.today')].map((x) => x.dataset.day),
    res2: document.querySelector('.cal-cell[data-day="2"] .rs').textContent, act3: document.querySelector('.cal-cell[data-day="3"] .ac').textContent,
    hol7: document.querySelector('.cal-cell[data-day="7"] .mk').textContent, ev6: document.querySelector('.cal-cell[data-day="6"] .mk').textContent,
    ev10: document.querySelector('.cal-cell[data-day="10"] .mk').textContent, ev13: document.querySelector('.cal-cell[data-day="13"] .mk').textContent, ev19: document.querySelector('.cal-cell[data-day="19"] .mk').textContent,
    list: document.getElementById('cal-list').textContent, dows: [...document.querySelectorAll('.cal-dow')].map((x) => x.textContent).join(''), shift: window.scrollX
  }));
  ok(cal.n === 30 && cal.today.join() === '8' && cal.dows === '월화수목금토일', `달력 30칸, 오늘 8일, 요일 머리글 (${cal.n} / ${cal.today} / ${cal.dows})`);
  ok(cal.res2 === '◎' && cal.act3 === '카엘', `지난 날 영업 결과/낮 행동 표시 (2일 ${cal.res2}, 3일 ${cal.act3})`);
  ok(cal.hol7 === '휴' && cal.ev6 === '!' && cal.ev10 === '' && cal.ev13 === '☾' && cal.ev19 === '', `일요일 휴, 6일 첫 지진 !, 아직 안 보이는 10일/19일 비어 있음, 미리 공개된 13일 ☾`);
  ok(!/10일/.test(cal.list) && /13일 달맞이 장터/.test(cal.list), `예정된 일 목록: ${cal.list}`);
  await page.screenshot({ path: `${SHOTS}/04_calendar.png` });
  await page.evaluate(() => { document.querySelector('.cal-cell[data-day="6"]').click(); });
  ok(/첫 지진/.test(await page.evaluate(() => document.getElementById('cal-info').textContent)), '칸을 누르면 그날 설명');
  await page.evaluate(() => { document.getElementById('cal-close').click(); }); await page.waitForTimeout(200);

  // ---------- (8)(9) 일상일 흐름: 8일차(월) -> 낮 행동 -> 영업 -> 밤 -> 9일차 ----------
  let r = await ff(page);   // 아침 문구 카드를 지나 낮 선택까지
  ok(r.m === 'choice' && (await page.evaluate(() => VN.state.scene)) === 'pick', `일상일 아침 -> 낮 선택 (${r.m}, 탭 ${r.n}회)`);
  const opts = await page.evaluate(() => VN.options.map((o) => ({ who: o.who || '', act: o.act || '', text: o.text, tag: o.tag || '' })));
  ok(opts.filter((o) => o.who).length === 4 && ['work', 'rest', 'town', 'fix'].every((a) => opts.some((o) => o.act === a)), `낮 선택지: 히로인 4 + 낮 행동 4 (${opts.length}개)`);
  await page.screenshot({ path: `${SHOTS}/05_routine_pick.png` });
  const before = await vars(page);
  // 낮 행동 '여관 일에 집중' (+30G, 평판+1, 피로+12)
  await page.locator('.choice-btn').filter({ hasText: '여관 일에 집중' }).click(); await page.waitForTimeout(100);
  let taps = r.n;
  r = await ff(page, (m) => m === 'tavern'); taps += r.n;
  const afterWork = await vars(page);
  ok(afterWork.gold - before.gold === 30 && afterWork.rep - before.rep === 1 && afterWork.fat - before.fat === 12, `여관 일 집중: 골드 +${afterWork.gold - before.gold}, 평판 +${afterWork.rep - before.rep}, 피로 +${afterWork.fat - before.fat}`);
  ok(r.m === 'tavern', `낮 행동 뒤 저녁 영업으로 (${r.m})`);
  // 영업: 장보기는 건너뛰고 손님은 모두 정중히 돌려보낸다 (재료 선택 없이 가장 빠르게 끝냄)
  const cnt = await page.evaluate(() => VN.tavern ? VN.tavern.total : -1);
  ok(cnt >= 3 && cnt <= 6, `8일차 일상 영업 손님 수 ${cnt}명 (3~6)`);
  await page.screenshot({ path: `${SHOTS}/06_routine_tavern_shop.png` });
  // 영업 전체를 빠르게 진행하는 드라이버 (정답 찾기)
  const tvEnd = await page.evaluate(() => {
    const click = (sel) => { const e = document.querySelector(sel); if (e && !e.disabled) { e.click(); return true; } return false; };
    let steps = 0;
    for (let i = 0; i < 4000 && VN.tavern; i++) {
      steps++;
      const vis = (id) => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); };
      if (vis('confirm')) { click('#confirm-yes'); continue; }
      if (vis('tv-found')) { click('#tv-found-btn'); continue; }
      if (vis('tv-lodge')) { click('#lodge-done'); continue; }
      if (vis('tv-upg')) { click('#tv-upg-next'); continue; }
      if (vis('tv-shop')) { if (!click('#tv-shop-start')) return { err: 'shop' }; continue; }
      if (vis('tv-sum')) { click('#tv-sum-btn'); continue; }
      if (vis('tv-brew')) { if (VN.tavern.phase === 'brew') { click('#tv-skip'); continue; } }
      document.getElementById('game').click();
    }
    return { steps, mode: VN.mode, tv: !!VN.tavern };
  });
  ok(!tvEnd.tv, `영업을 끝까지 진행 (${JSON.stringify(tvEnd)})`);
  r = await ff(page, (m, s) => m === 'tavern' && false); taps += r.n;
  // 숙박/업그레이드 화면 등 tavern 모드가 또 나오면 처리하면서 9일차까지
  for (let k = 0; k < 8 && (await page.evaluate(() => VN.mode)) !== 'card'; k++) {
    await page.evaluate(() => {
      const vis = (id) => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); };
      if (VN.mode === 'tavern') { if (vis('tv-lodge')) document.getElementById('lodge-done').click(); else if (vis('tv-upg')) document.getElementById('tv-upg-next').click(); }
      else if (VN.mode === 'choice') document.querySelector('.choice-btn').click();
      else document.getElementById('game').click();
    });
    await page.waitForTimeout(40);
    r = await ff(page, (m) => m === 'card'); taps += r.n;
  }
  const day9 = await vars(page);
  ok(day9.day === 9, `밤 정리 후 다음 날(9일차) 카드 (day ${day9.day})`);
  ok(day9.cal.log[8] && /[◎○△×]/.test(day9.cal.log[8].q) && day9.cal.act[8] === 'work', `달력 기록: 8일차 영업 결과 ${JSON.stringify(day9.cal.log[8])}, 낮 행동 ${day9.cal.act[8]}`);
  ok(day9.fat > afterWork.fat, `영업/숙박으로 피로가 쌓임 (${afterWork.fat} -> ${day9.fat}, 잠 -14 반영)`);
  report.push(`일상일 하루 탭 수(영업 제외 대사/카드 클릭) ${taps}회 + 영업(장보기/손님/숙박 선택). 줄당 3초 가정 시 대사 약 ${(taps * 3 / 60).toFixed(1)}분 + 영업 약 1~2분`);
  ok(taps <= 60, `일상일 한 날의 대사/카드 탭 수 ${taps}회 (60회 이하 = 2~4분 안)`);
  await tap(page); await page.waitForTimeout(300);

  // ---------- (6) 휴일 ----------
  await inject(page, JUMP(6, 'sn.vars.fat = 80; sn.vars.gold = 150; sn.vars.aff.lia = 12; sn.vars.aff.kaela = 12;'));
  const h1 = await page.evaluate(() => ({ t: document.getElementById('card-title').textContent, s: document.getElementById('card-sub').textContent, tip: document.getElementById('card-tip').textContent, fat: VN.state.vars.fat }));
  ok(h1.t === '7일차' && /일요일 · 휴일/.test(h1.s) && /휴일/.test(h1.tip), `7일차는 일요일 휴일 카드 (${h1.s})`);
  ok(h1.fat === 80 - 14 - 50, `휴일 아침 피로 회복: 80 -> ${h1.fat} (잠 -14, 휴일 -50)`);
  await page.screenshot({ path: `${SHOTS}/07_holiday_card.png` });
  await tap(page); await page.waitForTimeout(250);
  r = await ff(page);   // 휴일 낮 선택
  const hopts = await page.evaluate(() => ({ scene: VN.state.scene, o: VN.options.map((o) => ({ who: o.who || '', tag: o.tag || '', text: o.text })) }));
  ok(r.m === 'choice' && hopts.scene === 'hol_menu', `휴일 낮 선택지 (${hopts.scene})`);
  ok(hopts.o.filter((o) => o.tag === '산책').length === 4 && hopts.o.some((o) => /푹 쉰다/.test(o.text)) && hopts.o.some((o) => o.tag === '1주차 휴일'), `휴일 선택: 주간 이벤트 + 산책 4 + 푹 쉬기 (${hopts.o.length}개)`);
  await page.screenshot({ path: `${SHOTS}/08_holiday_menu.png` });
  const hv = await vars(page);
  await page.locator('.choice-btn').filter({ hasText: '리아와 신전 정원' }).click();
  let sawTavern = false, sawLodge = false, sawWeekCard = false;
  for (let i = 0; i < 200; i++) {
    const m = await page.evaluate(() => VN.mode);
    if (m === 'tavern') {
      const st = await page.evaluate(() => ({ tv: !!VN.tavern, lodge: !document.getElementById('tv-lodge').classList.contains('hidden') }));
      if (st.lodge) sawLodge = true; else if (st.tv) sawTavern = true;
      await page.evaluate(() => { const vis = (id) => !document.getElementById(id).classList.contains('hidden'); if (vis('tv-upg')) document.getElementById('tv-upg-next').click(); else document.getElementById('game').click(); });
    } else if (m === 'card') {
      if (/정산/.test(await page.evaluate(() => document.getElementById('card-title').textContent))) { sawWeekCard = true; await page.evaluate(() => { document.getElementById('game').click(); }); } else break;
    } else if (m === 'choice') await page.locator('.choice-btn').first().click();
    else await page.evaluate(() => { document.getElementById('game').click(); });
    await page.waitForTimeout(20);
  }
  const hd = await vars(page);
  ok(!sawTavern && !sawLodge, `휴일에는 영업/숙박이 없음 (영업 ${sawTavern}, 숙박 ${sawLodge})`);
  ok(sawWeekCard, '일요일 밤에 주간 정산 카드가 나옴');
  ok(hd.day === 8 && hd.aff.lia - hv.aff.lia >= 3, `산책으로 리아 호감도 +${hd.aff.lia - hv.aff.lia}, 다음 날 8일차 (day ${hd.day})`);
  ok(hd.evdone.wk1_picnic !== true, '주간 이벤트를 고르지 않았으니 기록 없음');

  // ---------- (7) 피로 ----------
  const fz = await page.evaluate(() => {
    const T = TAVERN, mk = (fat, day) => { const v = JSON.parse(JSON.stringify(STORY.init)); v.day = day; v.fat = fat; EventCore.ensure(v, () => 77); TavernCore.ensure(T, v); return v; };
    const order = { want: ['따뜻함', '든든함'] }, ids = ['meat', 'mushroom'];
    const tipOf = (fat) => { const v = mk(fat, 12); v.tavern.stock = { meat: 9, mushroom: 9 }; return TavernCore.serve(T, v, 'baron', order, ids, { repSum: 0 }, {}).tip; };
    const res = { fresh: tipOf(0), tired: tipOf(70), exhausted: tipOf(95) };
    // 과로 상태 미끄러짐 비율 (결정적 난수: 일차/손님 순번을 바꿔 가며)
    let slip = 0, n = 0;
    for (let d = 2; d <= 28; d++) for (let s = 0; s < 6; s++) { const v = mk(95, d); v.tavern.stock = { meat: 9, mushroom: 9 }; v.tavern.served = s; const o = TavernCore.serve(T, v, 'baron', order, ids, { repSum: 0 }, {}); n++; if (o.slip) slip++; }
    let slipFresh = 0; for (let d = 2; d <= 28; d++) { const v = mk(10, d); v.tavern.stock = { meat: 9, mushroom: 9 }; if (TavernCore.serve(T, v, 'baron', order, ids, { repSum: 0 }, {}).slip) slipFresh++; }
    return Object.assign(res, { slipRate: slip / n, slipFresh, n });
  });
  ok(fz.fresh > 0 && fz.tired < fz.fresh && fz.exhausted <= fz.tired && fz.exhausted < fz.fresh, `피로 단계별 대성공 팁 감소: 쌩쌩 ${fz.fresh}G > 피곤 ${fz.tired}G >= 과로 ${fz.exhausted}G`);
  ok(fz.slipRate > 0.1 && fz.slipRate < 0.45 && fz.slipFresh === 0, `과로에서만 대성공 미끄러짐 (과로 ${(fz.slipRate * 100).toFixed(0)}% / ${fz.n}회, 쌩쌩 ${fz.slipFresh}회)`);
  await inject(page, JUMP(15, 'sn.vars.fat = 84; sn.vars.gold = 150;'));
  await page.screenshot({ path: `${SHOTS}/09_fatigue_card.png` });
  const fh = await page.evaluate(() => ({ lvl: document.getElementById('hud-fat').dataset.level, txt: document.getElementById('hud-fat-txt').textContent, w: document.getElementById('hud-fat-bar').style.width, card: document.querySelector('#card-body .card-fat b').textContent, tip: document.getElementById('card-tip').textContent }));
  ok(fh.lvl === 'tired' && fh.txt === '피곤' && /피곤 상태/.test(fh.tip) && fh.card === '피곤', `피로 HUD/카드 표시 (${JSON.stringify(fh)})`);
  await tap(page); await page.waitForTimeout(250);
  await page.evaluate(() => { VN.state.vars.fat = 92; });
  await page.evaluate(() => document.getElementById('game').click()); await page.waitForTimeout(250);
  const fh2 = await page.evaluate(() => ({ lvl: document.getElementById('hud-fat').dataset.level, txt: document.getElementById('hud-fat-txt').textContent }));
  report.push(`과로 상태 HUD: ${JSON.stringify(fh2)}`);
  await page.screenshot({ path: `${SHOTS}/10_fatigue_hud.png` });

  // ---------- (9) 낮 행동 각각: 휴식 / 장보기 / 손보기 ----------
  for (const [name, text, check] of [
    ['휴식', '푹 쉬면서', (b, a) => a.fat - b.fat === -35],
    ['여관 손보기', '구석구석을 손본다', (b, a) => a.rep - b.rep === 1 && a.gold - b.gold === -6 && a.fat - b.fat === 8],
    ['가까운 장터 장보기', '이웃 마을까지', (b, a) => a.today.price === -20 && a.fat - b.fat === 6]
  ]) {
    await inject(page, JUMP(8, 'sn.vars.fat = 50; sn.vars.gold = 150;'));
    await tap(page); await page.waitForTimeout(250);
    await ff(page);
    const b = await vars(page);
    await page.locator('.choice-btn').filter({ hasText: text }).click(); await page.waitForTimeout(80);
    if (name.includes('장보기')) { await ff(page); await page.locator('.choice-btn').filter({ hasText: '가까운 장터' }).click(); await page.waitForTimeout(80); }
    await ff(page, (m, s) => m === 'tavern' || (m === 'choice' && s.scene !== 'pick'));
    const a = await vars(page);
    ok(check(b, a), `낮 행동 ${name}: 골드 ${a.gold - b.gold}, 평판 ${a.rep - b.rep}, 피로 ${a.fat - b.fat}${name.includes('장보기') ? ', 오늘 재료 ' + a.today.price + '%' : ''}`);
  }

  ok((await shiftOf(page)) === 0, '가로 스크롤 0');
  await ctx.close();
  await browser.close();
  console.log(report.join('\n'));
  console.log(problems.length ? '\n실패:\n' + problems.join('\n') : `\n통과: ${report.length}개 검증, 콘솔 error/warning 0건`);
  process.exit(problems.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
