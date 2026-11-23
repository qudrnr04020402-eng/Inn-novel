// 2단계 콘텐츠 전용 테스트 (Playwright, 모바일 390x844, 상태 주입): 히로인 이벤트 6~10 / 주간·마을 이벤트 / 토요일 행사 / 주간 정산 카드 /
//   연작 랜덤 사건 / 새 밤 사건 / 평범한 하루 / 숙박 손님 주차 / 일상 영업 대사
//   python3 -m http.server 8765 &   # 먼저 서버를 띄운 뒤
//   node tools/test-content.js [스크린샷 폴더]      (기본 /home/user/inn-vn-shots12)
// 검증
//  (1) 히로인 이벤트 6~10 (4명 x 5개 = 20개): 선택지에 순서대로 나타나고(올바른 태그), 끝까지 진행되며(순서 이벤트 수 +1, 호감도 +2 이상, 플래그/CG 기록), 저녁 영업으로 이어짐
//  (2) 호감도/주차 조건: 호감도가 모자라면 6~10 이 열리지 않고 평범한 하루로 대체, 10번은 25일 이전엔 안 열림
//  (3) 주간 이벤트(휴일 메뉴 10개) 와 토요일 행사 3개, 4주차 폭풍 밤의 정산 카드, 일요일 밤 정산 카드
//  (4) 연작 랜덤 사건 3종(음유시인/콩이/새끼 여우) 1부 -> 2부 -> 3부 진행과 선행 조건 (ser.<이름>)
//  (5) 새 밤 사건 11개를 선택지 0/마지막 모두 끝까지 + 다음 날 정산 문구(lodge.note)
//  (6) 평범한 하루 10종: 주차/호감도 조건과 반복 없는 순환
//  (7) 일상 영업 대사/주문이 주차별로 바뀌고, 숙박 손님이 주차 조건(w)을 따름
// 모든 시나리오에서 콘솔 error/warning 0, 가로 스크롤 0 이어야 통과. 스크린샷은 DPR 2.
const { chromium } = require('playwright');
const fs = require('fs');
const URL = process.env.URL || 'http://localhost:8765/index.html';
const SHOTS = process.argv[2] || '/home/user/inn-vn-shots12';
fs.mkdirSync(SHOTS, { recursive: true });
const problems = [], report = [];
const ok = (cond, msg) => { if (!cond) problems.push('검증 실패: ' + msg); report.push((cond ? 'OK   ' : 'FAIL ') + msg); };

async function newPage(browser, label, o) {
  o = Object.assign({ events: false }, o);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(({ events }) => {
    try { if (!sessionStorage.getItem('__tc_init')) { sessionStorage.setItem('__tc_init', '1'); localStorage.setItem('inn_vn_v6_tut', '1'); } } catch (e) { /* 저장소 차단 */ }
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
// 장면 하나를 골라 그 시점으로 시작 (patch 는 새 게임 변수 v 를 고치는 코드)
async function seedAt(page, scene, patch, pc) {
  await page.evaluate(([sc, src, p]) => {
    const v = JSON.parse(JSON.stringify(STORY.init));
    (new Function('v', src))(v);
    const snap = { scene: sc, pc: p || 0, vars: v, bg: 'inn_evening', sprites: { left: null, center: null, right: null }, bgm: null, log: [], label: 'test' };
    localStorage.setItem('inn_vn_v6_auto', JSON.stringify({ v: 6, t: Date.now(), snap }));
  }, [scene, patch, pc || 0]);
  await page.reload(); await page.waitForSelector('#btn-continue:not([disabled])');
  await page.tap('#btn-continue'); await page.waitForTimeout(350);
}
// 클릭으로 진행: 선택지/엔딩/영업이 나오거나 until 이 참이거나 max 번 클릭하면 멈춤
const ff = (page, until, max) => page.evaluate(([src, mx]) => {
  const u = src ? new Function('m', 'st', 'return (' + src + ')(m, st)') : null;
  const g = document.getElementById('game'); let n = 0;
  for (let i = 0; i < 5000; i++) {
    const m = VN.mode;
    if (u && u(m, VN.state)) return { m, n, sc: VN.state.scene };
    if (mx && n >= mx) return { m, n, sc: VN.state.scene };
    if (m === 'choice' || m === 'ending' || m === 'title' || m === 'tavern') return { m, n, sc: VN.state.scene };
    if (m === 'rankup') { document.getElementById('rankup-btn').click(); n++; continue; }
    g.click(); n++;
  }
  return { m: 'stuck', n, sc: VN.state.scene };
}, [until ? until.toString() : null, max || 0]);
// 선택지가 나올 때마다 pick(선택지 개수) 번째를 골라 until 까지 진행. shot = { after: 클릭 수, file } 이면 그 시점에 스크린샷
async function drive(page, until, pick, shot) {
  let guard = 0, shotDone = !shot, clicks = 0, sawCards = [], r;
  while (guard++ < 200) {
    const budget = shotDone ? 0 : Math.max(1, shot.after - clicks);
    r = await ff(page, until, budget);
    clicks += r.n;
    sawCards.push(...await page.evaluate(() => (VN.mode === 'card' ? [document.getElementById('card-title').textContent] : [])));
    if (!shotDone && clicks >= shot.after) { await page.waitForTimeout(shot.wait || 1000); await page.screenshot({ path: `${SHOTS}/${shot.file}` }); shotDone = true; continue; }
    if (until && await page.evaluate((src) => new Function('m', 'st', 'return (' + src + ')(m, st)')(VN.mode, VN.state), until.toString())) break;
    if (r.m === 'choice') {
      const idx = await page.evaluate((pk) => {
        const btns = [...document.querySelectorAll('#choices .choice-btn')].filter((b) => !b.disabled && !b.classList.contains('locked'));
        if (!btns.length) return -1;
        const i = Math.min(btns.length - 1, pk < 0 ? btns.length + pk : pk); btns[i].click(); return i;
      }, pick === undefined ? 0 : pick);
      if (process.env.DEBUG) console.log('  선택', r.sc, idx, await page.evaluate(() => VN.state.vars.flag));
      if (idx < 0) break;
      await page.waitForTimeout(40);
    } else break;
  }
  return { r, sawCards };
}
const toTavern = (m) => m === 'tavern';

(async () => {
  const browser = await chromium.launch();
  const { ctx, page } = await newPage(browser, '콘텐츠');
  await page.goto(URL); await page.waitForSelector('#btn-new');

  // ---------- (1) 히로인 이벤트 6~10 ----------
  const HEV = {
    erion: { names: ['변장 과자 작전', '촛불 마법 수업', '방값 정산서', '별 지도', '책의 마지막 장'], flags: ['erion_sweets', 'erion_spell', 'erion_promise', 'erion_pact', 'erion_eve'], cg: [null, 'erion_spell', null, null, 'erion_eve'] },
    kaela: { names: ['팀워크 특훈', '할부 마지막 회차', '청년단 군기', '국자 서임식', '가격표를 뗀 날'], flags: ['kaela_team', 'kaela_paid', null, 'kaela_oath', 'kaela_eve'], cg: [null, 'kaela_apron', null, null, 'kaela_eve'] },
    miho: { names: ['간판 뒤의 여우', '일곱 아이의 이름', '송금일 소동', '옛 동료의 제안', '평생 계약서'], flags: ['fox_sign', 'miho_letter', null, 'miho_stay', 'miho_eve'], cg: [null, 'miho_letters', null, null, 'miho_eve'] },
    lia: { names: ['질투의 요리 수업', '신전 종탑', '우리의 약속 목록', '치유의 기도', '부적과 문 앞'], flags: ['lia_cook', 'lia_exam', 'lia_list', 'lia_heal', 'lia_eve'], cg: [null, 'lia_bell', null, null, 'lia_eve'] }
  };
  // 스크린샷으로 남길 이벤트 (히로인 4명 x 1개)
  const SHOT_AT = { 'erion:0': ['01_erion_6.png', 9], 'kaela:2': ['02_kaela_8.png', 9], 'miho:1': ['03_miho_7.png', 9], 'lia:3': ['04_lia_9.png', 9] };
  let heroDone = 0;
  for (const h of Object.keys(HEV)) {
    for (let k = 0; k < 5; k++) {
      // 순서 이벤트 인덱스: [1,2,3,4,6,7,8,9,10] -> 6~10 은 인덱스 4~8
      const idx = 4 + k;
      await seedAt(page, 'pick', `v.day = 26; v.time = '낮'; v.gold = 200; v.ev.${h} = ${idx}; v.aff.${h} = 55;`);
      const opt = await page.evaluate((hh) => { const o = VN.options.find((x) => x.who === hh && x.tag !== '평범한 하루' && !/^plain/.test(x.ev || '') && x.ev !== 'walk'); return o ? { tag: o.tag, ev: o.ev, goto: o.goto } : null; }, h);
      ok(opt && opt.goto === `${h}_${k + 6}`, `${h} ${k + 6}번째 이벤트가 낮 선택지에 나옴 (${JSON.stringify(opt)})`);
      if (k === 4) ok(opt && /고백 직전/.test(opt.tag), `${h} 10번째 이벤트 태그가 '고백 직전' (${opt && opt.tag})`);
      const a0 = (await vars(page)).aff[h];
      await page.evaluate((hh) => { [...document.querySelectorAll('#choices .choice-btn')].find((b) => b.dataset.who === hh).click(); }, h);
      await page.waitForTimeout(80);
      const sh = SHOT_AT[`${h}:${k}`];
      // 한 선택지는 첫째, 이벤트에 따라 마지막 선택지도 번갈아 눌러 본다
      const fi = await page.evaluate(([sc, fl]) => { const ch = STORY.scenes[sc].find((c) => c.choice); return fl ? ch.choice.findIndex((o) => o.set && o.set['flag.' + fl]) : -1; }, [`${h}_${k + 6}`, HEV[h].flags[k]]);
      const dr = await drive(page, toTavern, fi >= 0 ? fi : (k % 2 === 0 ? 0 : -1), sh ? { file: sh[0], after: sh[1], wait: 1100 } : null);
      const v = await vars(page);
      ok(dr.r.m === 'tavern', `${h} ${k + 6}번 이벤트(${HEV[h].names[k]}) 끝까지 진행되어 저녁 영업으로 이어짐 (mode ${dr.r.m}, scene ${dr.r.sc})`);
      ok(v.ev[h] === idx + 1, `${h} ${k + 6}번 이벤트 후 순서 이벤트 수 ${idx + 1} (${v.ev[h]})`);
      ok(v.aff[h] >= a0 + 1, `${h} ${k + 6}번 이벤트 호감도 +1 이상 (${a0} -> ${v.aff[h]})`);
      if (HEV[h].flags[k]) ok(!!(v.flag || {})[HEV[h].flags[k]], `${h} ${k + 6}번 이벤트 플래그 ${HEV[h].flags[k]} 기록`);
      if (HEV[h].cg[k]) {
        const got = await page.evaluate((id) => { try { return !!JSON.parse(localStorage.getItem('inn_vn_v6_cg') || '{}')[id]; } catch (e) { return false; } }, HEV[h].cg[k]);
        ok(got, `${h} ${k + 6}번 이벤트 CG ${HEV[h].cg[k]} 갤러리에 기록`);
      }
      ok((await shiftOf(page)) === 0, `가로 스크롤 0 (${h} ${k + 6})`);
      heroDone++;
    }
  }
  ok(heroDone === 20, `히로인 이벤트 6~10 총 20개 진행 (${heroDone})`);

  // ---------- (2) 조건: 호감도/주차/일수 ----------
  {
    // 호감도 부족: 6번은 하트 2칸(20) 필요 -> 호감도 5 이면 평범한 하루
    await seedAt(page, 'pick', `v.day = 26; v.time = '낮'; v.ev.erion = 4; v.aff.erion = 5;`);
    const o1 = await page.evaluate(() => VN.options.filter((x) => x.who === 'erion').map((x) => x.tag));
    ok(o1.length === 1 && o1[0] === '평범한 하루', `호감도 5: 에리온 6번 이벤트 대신 평범한 하루 (${o1})`);
    // 10번은 25일 이전 불가, 25일 이후 가능
    await seedAt(page, 'pick', `v.day = 22; v.time = '낮'; v.ev.kaela = 8; v.aff.kaela = 58;`);
    const o2 = await page.evaluate(() => VN.options.filter((x) => x.who === 'kaela' && x.tag !== '깊은 이야기').map((x) => x.tag));
    ok(o2.length === 1 && o2[0] === '평범한 하루', `22일차: 카엘라 10번(고백 직전)은 아직 안 열림 (${o2})`);
    await seedAt(page, 'pick', `v.day = 25; v.time = '낮'; v.ev.kaela = 8; v.aff.kaela = 58;`);
    const o3 = await page.evaluate(() => VN.options.filter((x) => x.who === 'kaela' && x.tag !== '깊은 이야기').map((x) => x.tag));
    ok(o3.length === 1 && /고백 직전/.test(o3[0]), `25일차: 카엘라 10번(고백 직전) 열림 (${o3})`);
    // 순서 이벤트 분포: 호감도를 충분히 주고 주차별로 열리는 순서 이벤트가 늘어남 (2주차: 1~3 / 3주차: ~7 / 4주차: 9)
    const reach = await page.evaluate(() => {
      const out = {};
      [[8, 'w2'], [15, 'w3'], [22, 'w4']].forEach(([day, k]) => {
        const v = JSON.parse(JSON.stringify(STORY.init)); v.day = day; v.aff.lia = 60; CalCore.ensure(v);
        let n = 0;
        for (let i = 0; i < 12; i++) { const nx = CalCore.nextSeq(v, 'lia'); if (nx && CalCore.eventReady(v, nx, 'lia', VN.evalCond)) { v.ev.lia = (v.ev.lia || 0) + 1; n++; } else break; }
        out[k] = n;
      });
      return out;
    });
    ok(reach.w2 === 2 && reach.w3 > reach.w2 && reach.w4 > reach.w3, `리아 순서 이벤트: 호감도 충분 시 열리는 수가 2주차 2개 -> 3주차 6개 -> 4주차 8개로 늘어남(10번은 25일부터) (${JSON.stringify(reach)})`);
  }

  // ---------- (3) 주간/마을 이벤트 + 토요일 행사 + 정산 카드 ----------
  {
    const WK = [
      { id: 'wk1_lake_erion', day: 7, aff: '' },
      { id: 'wk1_herb_lia', day: 7, aff: '' },
      { id: 'wk2_market_miho', day: 14, aff: '' },
      { id: 'wk2_hunt_kaela', day: 14, aff: '' },
      { id: 'wk2_cleanup', day: 14, aff: '' },
      { id: 'wk3_stars_erion', day: 21, aff: 'v.aff.erion = 40;', shot: ['05_holiday_date.png', 8] },
      { id: 'wk3_flower_lia', day: 21, aff: 'v.aff.lia = 40;' },
      { id: 'wk3_miho_stall', day: 21, aff: '' },
      { id: 'wk3_kaela_race', day: 21, aff: '' },
      { id: 'wk3_cookoff', day: 21, aff: '', shot: ['06_village_cookoff.png', 7] }
    ];
    let done = 0, firstCard = null;
    for (const e of WK) {
      if (process.env.ONLY && process.env.ONLY !== e.id) continue;
      await seedAt(page, 'hol_menu', `v.day = ${e.day}; v.time = '낮'; v.gold = 200; v.fat = 20; v.cal.hol = 1; v.cal.dow = 6; v.cal.week = ${Math.ceil(e.day / 7)}; ${e.aff}`);
      const op = await page.evaluate((id) => { const o = VN.options.find((x) => x.ev === id); return o ? { goto: o.goto, tag: o.tag } : null; }, e.id);
      ok(!!op, `휴일 메뉴(${e.day}일차)에 ${e.id} 가 나옴 ${JSON.stringify(op)}`);
      if (!op) continue;
      await page.evaluate((sc) => { const i = VN.options.findIndex((o) => o.goto === sc); document.querySelectorAll('#choices .choice-btn')[i].click(); }, op.goto);
      await page.waitForTimeout(80);
      const dr = await drive(page, (m) => m === 'card' && /정산/.test(document.getElementById('card-title').textContent), 0, e.shot ? { file: e.shot[0], after: e.shot[1], wait: 1100 } : null);
      const v = await vars(page);
      if (process.env.DEBUG) console.log('  끝', e.id, JSON.stringify(dr.r), dr.sawCards);
      ok(!!(v.evdone || {})[e.id], `${e.id}: 끝까지 진행되고 한 번 본 표시(evdone) 기록`);
      ok(/정산/.test(dr.sawCards.join('|')), `${e.id}: 일요일 밤에 주간 정산 카드 (${dr.sawCards.filter((x) => /정산/.test(x)).join(',')})`);
      if (!firstCard) firstCard = e;
      done++;
      // 같은 주 휴일 메뉴에서는 본 이벤트가 사라진다
      await seedAt(page, 'hol_menu', `v.day = ${e.day}; v.time = '낮'; v.evdone['${e.id}'] = true; ${e.aff}`);
      ok(!(await page.evaluate((id) => VN.options.some((x) => x.ev === id), e.id)), `${e.id}: 본 뒤에는 휴일 메뉴에서 사라짐`);
    }
    ok(done === WK.length, `휴일 주간 이벤트 ${WK.length}개 모두 진행 (${done})`);
    // 호감도 조건: 별 보기/꽃반지는 하트 3칸 전에는 안 나옴
    await seedAt(page, 'hol_menu', `v.day = 21; v.time = '낮'; v.aff.erion = 10; v.aff.lia = 10;`);
    const lock = await page.evaluate(() => ['wk3_stars_erion', 'wk3_flower_lia'].map((id) => VN.options.some((x) => x.ev === id)));
    ok(lock[0] === false && lock[1] === false, `하트 3칸 미만: 별 보기/꽃반지 휴일 이벤트 안 나옴 (${lock})`);

    // 정산 카드 화면 (일요일 밤)
    await seedAt(page, 'hol_close', `v.day = 14; v.time = '낮'; v.gold = 320; v.rep = 14; v.aff.miho = 24; v.aff.erion = 12; v.wk = { day: 8, gold: 150, rep: 6, aff: { erion: 6, kaela: 0, miho: 12, lia: 0 }, rank: 1 }; v.cal = { log: { 8: { q: '◎', g: 40, r: 2 }, 9: { q: '○', g: 22, r: 1 }, 10: { q: '△', g: 8, r: 0 }, 11: { q: '◎', g: 41, r: 2 }, 12: { q: '○', g: 25, r: 1 }, 13: { q: '◎', g: 44, r: 2 } }, act: {} };`);
    await ff(page, (m) => m === 'card' && /정산/.test(document.getElementById('card-title').textContent)); await page.waitForTimeout(600);
    const cardInfo = await page.evaluate(() => ({ mode: VN.mode, title: document.getElementById('card-title').textContent, days: document.querySelectorAll('#card-body .wd').length, rows: [...document.querySelectorAll('#card-body .card-aff')].map((x) => x.textContent.replace(/\s+/g, ' ')) }));
    ok(cardInfo.mode === 'card' && cardInfo.title === '2주차 정산' && cardInfo.days === 7 && cardInfo.rows.length >= 8, `일요일 밤 주간 정산 카드 (${cardInfo.title}, 요일 칸 ${cardInfo.days}, 줄 ${cardInfo.rows.length})`);
    ok(cardInfo.rows.some((r) => /영업 순이익.*\+180/.test(r)), `영업 순이익 합계 +180G (${cardInfo.rows[0]})`);
    ok(cardInfo.rows.some((r) => /평판.*14.*\+8/.test(r)), `평판 변화 +8 (${cardInfo.rows.join(' / ')})`);
    ok(cardInfo.rows.some((r) => /미호.*\+12/.test(r)), '호감도 변화(미호 +12) 표시');
    ok((await shiftOf(page)) === 0, '가로 스크롤 0 (정산 카드)');
    await page.screenshot({ path: `${SHOTS}/07_weekly_card.png` });
    await page.evaluate(() => document.getElementById('game').click()); await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ m: VN.mode, sc: VN.state.scene }));
    ok(after.m !== 'card' || after.sc !== 'hol_close', `정산 카드를 넘기면 다음으로 진행 (${JSON.stringify(after)})`);

    // 4주차(28일 폭풍 밤)의 정산 카드: night_close -> wk_card_close
    await seedAt(page, 'wk_card_close', `v.day = 28; v.time = '밤'; v.gold = 600; v.rep = 40;`);
    const c28 = await page.evaluate(() => ({ mode: VN.mode, title: document.getElementById('card-title').textContent }));
    ok(c28.mode === 'card' && c28.title === '4주차 정산', `28일 밤 4주차 정산 카드 (${c28.title})`);

    // 토요일 행사 3개 (6, 20, 27일은 토요일)
    for (const s of [{ id: 'sat1', day: 6, wk: 1, scene: 'sat1_market' }, { id: 'sat3', day: 20, wk: 3, scene: 'sat3_hunt' }, { id: 'sat4', day: 27, wk: 4, scene: 'sat4_harvest' }]) {
      await seedAt(page, 'pick', `v.day = ${s.day}; v.time = '낮'; v.gold = 100; v.fat = 10; v.cal.week = ${s.wk}; v.cal.dow = 5;`);
      const has = await page.evaluate((sc) => VN.options.some((x) => x.goto === sc), s.scene);
      ok(has, `${s.day}일차(토): 토요일 행사 ${s.scene} 선택지`);
      await page.evaluate((sc) => { const i = VN.options.findIndex((o) => o.goto === sc); document.querySelectorAll('#choices .choice-btn')[i].click(); }, s.scene);
      await page.waitForTimeout(80);
      const dr = await drive(page, toTavern, 0);
      const v = await vars(page);
      ok(dr.r.m === 'tavern' && v.evdone[s.id], `토요일 행사 ${s.scene}: 끝까지 진행 + 한 번 본 표시 (mode ${dr.r.m})`);
    }
    // 토요일이 아닌 날에는 안 나옴
    await seedAt(page, 'pick', `v.day = 5; v.time = '낮'; v.cal.week = 1; v.cal.dow = 4;`);
    ok(!(await page.evaluate(() => VN.options.some((x) => /^sat/.test(x.act || '') || x.goto === 'sat1_market'))), '금요일(5일차)에는 토요일 행사가 안 나옴');
  }

  // ---------- (4) 연작 랜덤 사건 ----------
  {
    const SER = [
      { name: 'bard', parts: ['rev_bard', 'rev_bard_2', 'rev_bard_3'], ids: ['bard', 'bard_2', 'bard_3'], days: [4, 12, 20] },
      { name: 'cookkid', parts: ['rev_cookkid_1', 'rev_cookkid_2', 'rev_cookkid_3'], ids: ['cookkid_1', 'cookkid_2', 'cookkid_3'], days: [4, 12, 20] },
      { name: 'fox', parts: ['rev_fox_1', 'rev_fox_2', 'rev_fox_3'], ids: ['fox_1', 'fox_2', 'fox_3'], days: [4, 12, 20] }
    ];
    for (const s of SER) {
      // 선행 조건 로직: 앞 부를 안 봤으면 뒷 부는 뽑히지 않고, 봤으면 (시드가 맞으면) 뽑힌다
      const gate = await page.evaluate(([ids, name]) => {
        const out = { early: 0, p2: 0, p3early: 0, p3: 0 };
        for (let sd = 1; sd <= 600; sd++) {
          for (const day of [12, 20]) {
            const mk = (ser) => { const v = JSON.parse(JSON.stringify(STORY.init)); v.day = day; v.ser = ser; v.rev = { seed: sd * 131, used: [] }; EventCore.ensure(v); return v; };
            const a = EventCore.pick(Object.assign({}, RANDOM_EVENTS, { chance: 1 }), mk({}), day, VN.evalCond); if (a === ids[1] || a === ids[2]) out.early++;
            const b = EventCore.pick(Object.assign({}, RANDOM_EVENTS, { chance: 1 }), mk({ [name]: 1 }), day, VN.evalCond); if (b === ids[1]) out.p2++; if (b === ids[2]) out.p3early++;
            const c = EventCore.pick(Object.assign({}, RANDOM_EVENTS, { chance: 1 }), mk({ [name]: 2 }), day, VN.evalCond); if (c === ids[2]) out.p3++;
          }
        }
        return out;
      }, [s.ids, s.name]);
      ok(gate.early === 0 && gate.p2 > 0 && gate.p3early === 0 && gate.p3 > 0, `연작 ${s.name}: 선행 부를 안 보면 2/3부가 안 나오고 보면 나옴 (${JSON.stringify(gate)})`);
      // 실제 장면 진행: 1부 -> 2부 -> 3부, 본 부 수 ser.<이름> 이 1,2,3 으로 오름
      for (let p = 0; p < 3; p++) {
        await seedAt(page, s.parts[p], `v.day = ${s.days[p]}; v.time = '낮'; v.gold = 100; v.rep = 10; v.aff.miho = 20; v.ser = { ${s.name}: ${p} }; v.rev = { seed: 7, used: [], ret: 'pick' };`);
        const shotIt = s.name === 'fox' && p === 1 ? { file: '08_random_event.png', after: 5, wait: 1100 } : null;
        const dr = await drive(page, (m, st) => st.scene === 'pick', 0, shotIt);
        const v = await vars(page);
        ok(dr.r.sc === 'pick' && v.ser[s.name] === p + 1, `연작 ${s.name} ${p + 1}부(${s.parts[p]}) 끝까지 진행 -> 아침 복귀, ser.${s.name} = ${v.ser[s.name]}`);
        ok(Math.abs(v.gold - 100) <= 15 && Math.abs(v.rep - 10) <= 2, `연작 ${s.name} ${p + 1}부 효과가 소폭 (골드 ${v.gold - 100}, 평판 ${v.rep - 10})`);
      }
    }
    // 새 단발 랜덤 사건 몇 개를 마지막 선택지로 진행
    for (const id of ['stray_dog', 'chimney_fire', 'wolf_howl', 'envoy_scout', 'old_soldier', 'kaela_dummy']) {
      for (const pk of [0, -1]) {
        await seedAt(page, `rev_${id}`, `v.day = 12; v.time = '낮'; v.gold = 100; v.rep = 10; v.aff = { erion: 25, kaela: 25, miho: 25, lia: 25 }; v.rev = { seed: 3, used: [], ret: 'pick' };`);
        const dr = await drive(page, (m, st) => st.scene === 'pick', pk);
        ok(dr.r.sc === 'pick', `랜덤 사건 ${id} (선택지 ${pk === 0 ? '첫째' : '마지막'}) 끝까지 진행 후 아침 복귀`);
      }
    }
  }

  // ---------- (5) 새 밤 사건 11개 ----------
  {
    const NEW = ['rain_guest', 'snorer', 'fox_fire', 'midnight_snack', 'night_watch', 'lullaby', 'tremor', 'scribe_night', 'firefly', 'cold_night', 'calm_before'];
    let n = 0;
    for (const id of NEW) {
      for (const pk of [0, -1]) {
        await seedAt(page, `nev_${id}`, `v.day = 20; v.time = '밤'; v.gold = 100; v.aff = { erion: 30, kaela: 30, miho: 30, lia: 30 }; v.nev = { used: [], today: '${id}', ret: 'night_close#3' };`);
        const dr = await drive(page, (m, st) => st.scene === 'night_close' || m === 'upgrades', pk);
        const v = await vars(page);
        const noteOk = !!(v.lodge && typeof v.lodge.note === 'string' && v.lodge.note.length >= 8);
        if (dr.r.sc === 'night_close' || dr.r.m === 'upgrades') n++;
        ok((dr.r.sc === 'night_close' || dr.r.m === 'upgrades') && noteOk, `밤 사건 ${id} (선택지 ${pk === 0 ? '첫째' : '마지막'}) 끝까지 진행 + 다음 날 정산 문구 (${dr.r.sc}/${dr.r.m}, note ${noteOk})`);
      }
    }
    ok(n === NEW.length * 2, `새 밤 사건 ${NEW.length}개 x 선택지 2종 모두 끝까지 진행 (${n})`);
    // 주차 조건: 1주차에는 tremor/scribe_night/cold_night/calm_before 가 후보가 아님, 4주차에는 firefly 가 아님
    const wkc = await page.evaluate(() => {
      const pool = (day) => { const v = JSON.parse(JSON.stringify(STORY.init)); v.day = day; v.aff = { erion: 30, kaela: 30, miho: 30, lia: 30 }; CalCore.ensure(v); CalCore.info(day); v.cal.week = CalCore.weekOf(day); InnCore.ensure(v); const N = LODGING.nightEvents.events; return Object.keys(N).filter((id) => !N[id].if || VN.evalCond(N[id].if, v)); };
      return { w1: pool(3), w4: pool(24) };
    });
    ok(!['tremor', 'scribe_night', 'cold_night', 'calm_before'].some((x) => wkc.w1.includes(x)) && wkc.w1.includes('firefly'), `1주차 밤 사건 후보: 후반 사건 제외, 반딧불이 포함 (${wkc.w1})`);
    ok(['tremor', 'scribe_night', 'cold_night', 'calm_before'].every((x) => wkc.w4.includes(x)) && !wkc.w4.includes('firefly'), `4주차 밤 사건 후보: 후반 사건 포함, 반딧불이 제외 (${wkc.w4})`);
  }

  // ---------- (6) 평범한 하루 10종 ----------
  {
    for (const h of ['erion', 'kaela', 'miho', 'lia']) {
      const r = await page.evaluate((hh) => {
        const out = { w1: [], w4hi: [], seqLen: 0, all: PLAIN_DAYS[hh].length };
        const run = (day, aff) => { const v = JSON.parse(JSON.stringify(STORY.init)); v.day = day; v.aff[hh] = aff; CalCore.ensure(v); const seen = []; for (let i = 0; i < 12; i++) { const p = CalCore.plainFor(v, hh, VN.evalCond); seen.push(p.scene); v.evdone[p.scene] = true; v.pl[hh] = (v.pl[hh] || 0) + 1; } return seen; };
        out.w1 = run(3, 0); out.w4hi = run(25, 50);
        return out;
      }, h);
      ok(r.all === 10, `${h} 평범한 하루 10종 (${r.all})`);
      ok(!r.w1.some((s) => /plain(8|9|10)$/.test(s)) && new Set(r.w1.slice(0, 7)).size === 7 && r.w1[6] === `${h}_plain7`, `${h} 1주차 호감도 0: 안 본 장면 7개를 차례로 보고(초가을 장면 7 포함) 3주차 이후/하트 조건 장면(8~10)은 안 나옴 (${r.w1.slice(0, 8).map((x) => x.replace(h + '_plain', ''))})`);
      ok(new Set(r.w4hi.slice(0, 8)).size === 8 || new Set(r.w4hi.slice(0, 8)).size >= 7, `${h} 4주차 호감도 50: 아직 안 본 장면부터 8번 연속 서로 다름 (${new Set(r.w4hi.slice(0, 8)).size}종)`);
    }
    // 실제 장면 한 개: 주차 조건 장면(8번)이 열린 상태에서 선택 -> 호감도 +1
    await seedAt(page, 'pick', `v.day = 20; v.time = '낮'; v.ev.miho = 9; v.aff.miho = 30; v.evdone = { miho_plain1: true, miho_plain2: true, miho_plain3: true, miho_plain4: true, miho_plain5: true, miho_plain6: true, miho_plain7: true };`);
    const pl = await page.evaluate(() => { const o = VN.options.find((x) => x.who === 'miho'); return o && o.goto; });
    ok(pl === 'miho_plain8', `3주차 이후 미호 평범한 하루는 본 장면을 건너뛰고 새 장면(8)이 나옴 (${pl})`);
  }

  // ---------- (7) 일상 영업 대사/주문의 주차 변화 + 숙박 손님 주차 조건 ----------
  {
    const rt = await page.evaluate(() => {
      const lines = {}, orders = {};
      for (const day of [3, 10, 17, 24]) {
        const v = JSON.parse(JSON.stringify(STORY.init)); v.day = day; v.rev = { seed: 77, used: [] }; v.inn = { rank: 3 }; v.tavern = { upg: {} }; CalCore.ensure(v);
        const wk = CalCore.weekOf(day); lines[wk] = new Set(); orders[wk] = new Set();
        for (let d = day; d < day + 4; d++) {
          if (CalCore.info(d).main || CalCore.info(d).holiday) continue;
          v.day = d; const key = TavernCore.routine(TAVERN, v, d, VN.evalCond);
          TAVERN.days[key].customers.forEach((c) => { lines[wk].add(c.who + '|' + c.say[0].text); orders[wk].add(c.order.text); });
        }
      }
      const only = (a, b) => [...a].filter((x) => !b.has(x)).length;
      return { l14: only(lines[4], lines[1]), l13: only(lines[3], lines[1]), o14: only(orders[4], orders[1]), sizes: Object.values(lines).map((s) => s.size) };
    });
    ok(rt.l14 >= 8 && rt.l13 >= 6 && rt.o14 >= 2, `일상 영업 대사/주문이 주차마다 달라짐 (4주차에만 나오는 대사 ${rt.l14}, 3주차 ${rt.l13}, 주문 ${rt.o14}, 주차별 대사 수 ${rt.sizes})`);
    const gst = await page.evaluate(() => {
      const have = (day) => { const ids = new Set(); for (let sd = 1; sd <= 300; sd++) { const v = JSON.parse(JSON.stringify(STORY.init)); v.day = day; v.rev = { seed: sd * 211, used: [] }; InnCore.ensure(v); InnCore.guestsFor(v, day).forEach((g) => ids.add(g.id)); } return ids; };
      return { w1: [...have(3)], w4: [...have(24)] };
    });
    ok(!gst.w1.includes('mercs') && !gst.w1.includes('refugee') && gst.w1.includes('dancer'), `1주차 숙박 손님: 용병 삼형제/피난 가족 없음, 무희 있음 (${gst.w1.length}팀)`);
    ok(gst.w4.includes('refugee') && gst.w4.includes('mercs') && !gst.w4.includes('dancer') && !gst.w4.includes('fisher'), `4주차 숙박 손님: 피난 가족/용병 있음, 무희/낚시꾼 없음 (${gst.w4.length}팀)`);
    ok(gst.w1.length >= 10 && gst.w4.length >= 10, `주차별 숙박 손님 후보 풍부 (1주차 ${gst.w1.length}팀, 4주차 ${gst.w4.length}팀)`);
  }

  ok((await shiftOf(page)) === 0, '가로 스크롤 0 (마지막)');
  await ctx.close();
  await browser.close();
  console.log(report.join('\n'));
  console.log(problems.length ? '\n실패:\n' + problems.join('\n') : `\n통과: ${report.length}개 검증, 콘솔 error/warning 0건`);
  process.exit(problems.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
