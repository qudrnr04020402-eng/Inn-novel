// 여관 운영 확장 시나리오 테스트 (숙박 / 여관 등급 / 밤 사건 / 선물 / 깊은 이벤트 / 히로인 신경전 / 저장 형식 v4)
//  - tools/test-play.js 가 마지막에 이 모듈을 불러 실행합니다. 따로 돌릴 수도 있습니다:
//      python3 -m http.server 8765 &   그리고   node tools/test-play-inn.js [스크린샷 폴더]
//  - 각 시나리오는 "자동 저장 슬롯에 원하는 장면 + 변수를 심고 이어하기"로 시작합니다 (모바일 390x844, 터치).
//  - 스크린샷: lodge_* nev_* rank_* gift_* deep_* riv_*
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://localhost:8765/index.html';

async function newPage(browser, problems, label, o) {
  o = Object.assign({ tut: true }, o);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    try { localStorage.setItem('inn_vn_v5_tut', '1'); } catch (e) { /* 무시 */ }
    // 아침 랜덤 사건은 끈다 (이 테스트에서는 밤 사건/신경전만 본다)
    Object.defineProperty(window, 'RANDOM_EVENTS', { configurable: true, set(v) { v.chance = 0; Object.defineProperty(window, 'RANDOM_EVENTS', { value: v, writable: true, configurable: true }); } });
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`[${label}] console.${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`[${label}] pageerror: ${e.message}`));
  return { ctx, page };
}

async function run(browser, problems, report, SHOTS) {
  const T = { ok: 0 };
  const mk = (label) => (cond, msg) => { T.ok++; if (!cond) problems.push(`[${label}] ${msg}`); };
  const shot = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png` });
  const vars = (page) => page.evaluate(() => JSON.parse(JSON.stringify(VN.state.vars)));
  const vis = (page, id) => page.evaluate((i) => { const e = document.getElementById(i); return !!e && !e.classList.contains('hidden'); }, id);
  const shift = (page) => page.evaluate(() => document.getElementById('app').scrollLeft + document.getElementById('game').scrollLeft + window.scrollX);
  const mode = (page) => page.evaluate(() => VN.mode);
  const scene = (page) => page.evaluate(() => VN.state.scene);

  // 자동 저장 슬롯에 장면 + 변수를 심고 이어하기
  const seedAt = async (page, sceneId, patchSrc, pc) => {
    await page.evaluate(([sc, src, p]) => {
      const v = JSON.parse(JSON.stringify(STORY.init));
      (new Function('v', src))(v);
      const snap = { scene: sc, pc: p || 0, vars: v, bg: 'inn_evening', sprites: { left: null, center: null, right: null }, bgm: null, log: [], label: 'test' };
      localStorage.setItem('inn_vn_v5_auto', JSON.stringify({ v: 5, t: Date.now(), snap }));
    }, [sceneId, patchSrc, pc || 0]);
    await page.reload(); await page.waitForSelector('#btn-continue:not([disabled])');
    await page.tap('#btn-continue'); await page.waitForTimeout(300);
  };
  const open = async () => {
    const { ctx, page } = await newPage(browser, problems, 'inn');
    await page.goto(URL); await page.waitForSelector('#btn-new');
    return { ctx, page };
  };
  // 사건 id 가 정확히 그 id 인 시드 (null = 사건 없는 시드)
  const findSeed = (page, ev, day, aff) => page.evaluate(([ev, day, aff]) => {
    for (let s = 1; s < 8000; s++) {
      const v = { day, gold: 0, rep: 0, aff: aff || { erion: 0, kaela: 0, miho: 0, lia: 0 }, rev: { seed: s, used: [] }, lodge: null, inn: null, nev: null };
      InnCore.ensure(v);
      const id = InnCore.nightEvent(v, day, VN.evalCond);
      if ((ev === null && !id) || id === ev) return s;
    }
    return -1;
  }, [ev, day, aff || null]);
  const SEEDV = (sd) => `v.rev = { seed: ${sd}, used: [], today: '', ret: '' };`;
  const tapText = async (page, n) => { for (let i = 0; i < n; i++) { await page.touchscreen.tap(195, 300); await page.waitForTimeout(50); } };
  // 선택지/영업 화면/등급 팝업/엔딩이 나올 때까지 탭
  const until = (page, stopFn) => page.evaluate((src) => {
    const stop = new Function('return (' + src + ')')();
    const g = document.getElementById('game');
    for (let i = 0; i < 4000; i++) {
      if (stop()) return true;
      const m = VN.mode;
      if (m === 'rankup') { document.getElementById('rankup-btn').click(); continue; }
      if (m === 'tavern' || m === 'choice' || m === 'ending') return stop();
      g.click();
    }
    return false;
  }, stopFn.toString());

  // ================= 숙박 =================
  {
    const chk = mk('숙박');
    const { ctx, page } = await open();
    const sdNone = await findSeed(page, null, 1);
    chk(sdNone > 0, '밤 사건이 없는 시드를 못 찾음');
    // --- 접수 화면 / 맞춤 배정 ---
    await seedAt(page, 'd1_upgrade', `v.day = 1; v.time = '밤'; v.gold = 100; v.rep = 0; ${SEEDV(sdNone)}`);
    chk(await vis(page, 'tv-lodge') && (await mode(page)) === 'tavern', '1일차 밤에 숙박 접수 화면이 열리지 않음');
    chk((await page.locator('.lodge-room').count()) === 3 && (await page.locator('.lodge-room:not(.closed)').count()) === 2 && (await page.locator('.lodge-room.closed').isDisabled()), '객실 3개(2개만 열림, 다락은 잠김) 이상');
    const L0 = await page.evaluate(() => VN.lodging);
    chk(L0.guests.length >= 2 && L0.guests.length <= 3 && (await page.locator('.lodge-guest').count()) === L0.guests.length, `손님 ${L0.guests.length}팀`);
    chk((await page.locator('.hud-item.rank').innerText()).includes('★'), 'HUD 에 여관 등급 배지가 없음');
    chk((await shift(page)) === 0, '숙박 접수 화면 가로 스크롤');
    await page.waitForTimeout(250);
    await shot(page, 'lodge_01_reception');
    // 최적 배정 계산 (페이지 안의 InnCore 사용)
    const best = await page.evaluate(() => {
      const v = VN.state.vars, L = VN.lodging, open = InnCore.roomList(v).filter((r) => r.open).map((r) => r.id), gs = L.guests.map(InnCore.guestDef);
      let bestT = -1, plan = {};
      const rec = (i, cur, used) => {
        if (i === gs.length) { let t = 0; gs.forEach((g) => { const q = InnCore.quote(v, g, cur[g.id] || null); t += q.pay + q.sat * 8; }); if (t > bestT) { bestT = t; plan = Object.assign({}, cur); } return; }
        rec(i + 1, cur, used);
        open.forEach((r) => { if (!used.has(r)) { cur[gs[i].id] = r; used.add(r); rec(i + 1, cur, used); used.delete(r); delete cur[gs[i].id]; } });
      };
      rec(0, {}, new Set());
      let pay = 0, sat = 0; gs.forEach((g) => { const q = InnCore.quote(v, g, plan[g.id] || null); pay += q.pay; sat += q.sat; });
      return { plan, pay, sat };
    });
    chk(Object.keys(best.plan).length >= 1 && best.sat >= 1, `최적 배정에 맞는 방이 없음 ${JSON.stringify(best)}`);
    // 1) 손님을 누르면 선택, 2) 방을 누르면 배정
    const gids = Object.keys(best.plan);
    await page.locator(`.lodge-guest[data-guest="${gids[0]}"]`).tap();
    chk((await page.evaluate(() => VN.lodging.sel)) === gids[0] && (await page.locator('.lodge-guest.sel').count()) === 1, '손님을 눌러도 선택되지 않음');
    await page.locator(`.lodge-room[data-room="${best.plan[gids[0]]}"]`).tap();
    let L = await page.evaluate(() => VN.lodging);
    chk(L.assign[gids[0]] === best.plan[gids[0]] && L.sel === '' && (await page.locator('.lodge-guest.set').count()) === 1, `방 배정이 반영되지 않음 ${JSON.stringify(L)}`);
    chk((await page.locator(`.lodge-guest[data-guest="${gids[0]}"] .lodge-state`).innerText()).includes('맞음'), '요청에 맞는 방인데 "맞음" 표시가 없음');
    // 같은 방에 다른 손님을 넣으면 기존 손님이 빠진다 / 방을 눌러 비운다
    const other = L0.guests.find((g) => g !== gids[0]);
    await page.locator(`.lodge-guest[data-guest="${other}"]`).tap();
    await page.locator(`.lodge-room[data-room="${best.plan[gids[0]]}"]`).tap();
    L = await page.evaluate(() => VN.lodging);
    chk(L.assign[other] === best.plan[gids[0]] && !L.assign[gids[0]], `같은 방 재배정 이상 ${JSON.stringify(L.assign)}`);
    await page.locator(`.lodge-room[data-room="${best.plan[gids[0]]}"]`).tap();
    L = await page.evaluate(() => VN.lodging);
    chk(Object.keys(L.assign).length === 0, '손님 선택 없이 찬 방을 눌러도 비워지지 않음');
    // 거절 / 되돌리기
    await page.locator(`.lodge-guest[data-guest="${other}"] .lodge-reject`).tap();
    chk((await page.evaluate(() => VN.lodging.rej))[other] && (await page.locator(`.lodge-guest[data-guest="${other}"] .lodge-state`).innerText()).includes('거절'), '거절 표시 이상');
    await page.locator(`.lodge-guest[data-guest="${other}"] .lodge-reject`).tap();
    chk(!(await page.evaluate(() => VN.lodging.rej))[other], '거절 되돌리기 이상');
    // 닫힌 방은 배정되지 않는다
    await page.locator(`.lodge-guest[data-guest="${other}"]`).tap();
    await page.locator('.lodge-room.closed').tap({ force: true, timeout: 800 }).catch(() => {});
    chk(!(await page.evaluate(() => VN.lodging.assign))[other], '잠긴 다락방에 배정됨');
    await page.locator(`.lodge-guest[data-guest="${other}"]`).tap();   // 선택 해제
    // 최적 배정 입력
    for (const gid of gids) {
      await page.locator(`.lodge-guest[data-guest="${gid}"]`).tap();
      await page.locator(`.lodge-room[data-room="${best.plan[gid]}"]`).tap();
    }
    chk((await page.locator('#lodge-done').innerText()).includes(`+${best.pay}G`), `접수 마감 버튼의 예상 수입이 다름: ${await page.locator('#lodge-done').innerText()} (기대 +${best.pay}G)`);
    await shot(page, 'lodge_02_assigned');
    await page.locator('#lodge-done').tap(); await page.waitForTimeout(300);
    await shot(page, 'lodge_03_result');   // 접수 마감 한 번으로 정산 + 곧바로 다음 (수입은 알림으로)
    chk((await page.locator('.toast').allInnerTexts()).join('|').includes('숙박 수입'), '정산 알림(숙박 수입)이 없음');
    const v1 = await vars(page);
    chk(v1.gold === 100 + best.pay && v1.inn.sat === best.sat, `맞춤 배정 정산: 골드 ${v1.gold} (기대 ${100 + best.pay}), 만족 ${v1.inn.sat} (기대 ${best.sat})`);
    chk(v1.lodge.log.length === 1 && v1.lodge.nights === 1 && gids.every((g) => v1.lodge.hosted[g] === 1), `숙박 기록 이상 ${JSON.stringify(v1.lodge)}`);
    chk(await vis(page, 'tv-upg') && !(await vis(page, 'tv-lodge')), '접수 마감 한 번으로 여관 손보기까지 가지 않음 (추가 결과 화면이 남아 있음)');
    chk((await shift(page)) === 0, '숙박 결과 가로 스크롤');
    // --- 정산 직후 저장: 이어하기가 다시 정산하지 않는다 ---
    await page.reload(); await page.waitForSelector('#btn-continue:not([disabled])');
    await page.tap('#btn-continue'); await page.waitForTimeout(300);
    const vS = await vars(page);
    chk(vS.gold === v1.gold && vS.lodge.log.length === 1, `정산 직후 이어하기에서 다시 정산됨 (골드 ${vS.gold})`);
    chk(await vis(page, 'tv-upg'), '정산 직후 이어하기가 여관 손보기 화면으로 가지 않음');
    // --- 객실 개조 ---
    chk((await page.locator('.tv-upg-card.room').count()) === 4, '객실 개조 카드가 4개가 아님');
    const atticBtn = page.locator('.tv-upg-card.room[data-id="attic"] .tv-upg-buy');
    chk((await atticBtn.isDisabled()) && (await atticBtn.innerText()).includes('★4'), `다락 개조가 ★4 전에 잠겨 있지 않음 (${await atticBtn.innerText()})`);
    await page.waitForTimeout(200);
    await shot(page, 'lodge_04_room_upgrades');
    const gB = (await vars(page)).gold;
    await page.locator('.tv-upg-card.room[data-id="bedding"] .tv-upg-buy').tap();
    await page.locator('.tv-upg-card.room[data-id="windowbox"] .tv-upg-buy').tap();
    const vU = await vars(page);
    chk(vU.gold === gB - 55 && vU.lodge.upg.bedding && vU.lodge.upg.windowbox, `객실 개조 구입 이상 (골드 ${gB}->${vU.gold})`);
    chk(await page.locator('.tv-upg-card.room[data-id="bedding"] .tv-upg-buy').isDisabled(), '산 객실 개조가 잠기지 않음');
    // 다음 날 아침 카드에 간밤 숙박 정산
    await page.locator('#tv-upg-next').tap(); await page.waitForTimeout(300);
    const tip = await page.locator('#card-tip').innerText();
    chk((await mode(page)) === 'card' && tip.includes(`간밤 숙박 수입 +${best.pay}G`), `다음 날 아침 카드에 숙박 정산이 없음: "${tip}"`);
    await page.waitForTimeout(900);
    await shot(page, 'lodge_05_morning_report');
    await ctx.close();
  }
  // --- 어긋난 배정 / 거절 ---
  {
    const chk = mk('숙박 어긋남');
    const { ctx, page } = await open();
    const sdNone = await findSeed(page, null, 2);
    const getPlan = () => page.evaluate(() => {
      const v = VN.state.vars, L = VN.lodging, open = InnCore.roomList(v).filter((r) => r.open).map((r) => r.id), gs = L.guests.map(InnCore.guestDef), free = open.slice(), plan = {};
      // 요청과 안 맞는 방을 일부러 고른다 (맞는 방뿐인 손님은 건너뜀)
      gs.forEach((g) => { const r = free.find((x) => !InnCore.matches(v, g, x)); if (r) { plan[g.id] = r; free.splice(free.indexOf(r), 1); } });
      let pay = 0; gs.forEach((g) => { pay += InnCore.quote(v, g, plan[g.id] || null).pay; });
      return { plan, pay };
    });
    await seedAt(page, 'd2_upgrade', `v.day = 2; v.time = '밤'; v.gold = 50; ${SEEDV(sdNone)}`);
    const mm = await getPlan();
    chk(Object.keys(mm.plan).length >= 1, `어긋난 방을 고를 수 없음 ${JSON.stringify(mm)}`);
    for (const gid of Object.keys(mm.plan)) { await page.locator(`.lodge-guest[data-guest="${gid}"]`).tap(); await page.locator(`.lodge-room[data-room="${mm.plan[gid]}"]`).tap(); }
    chk((await page.locator('.lodge-state i.no').count()) === Object.keys(mm.plan).length, '어긋난 배정에 "안 맞음" 표시가 없음');
    await page.locator('#lodge-done').tap(); await page.waitForTimeout(250);
    const v1 = await vars(page);
    chk(v1.gold === 50 + mm.pay && v1.inn.sat === 0, `어긋난 배정은 기본 숙박비만 (골드 ${v1.gold}, 기대 ${50 + mm.pay}, 만족 ${v1.inn.sat})`);
    const missMsg = await page.evaluate(() => { const L = VN.state.vars.lodge.report; return L.join('|'); });
    chk(missMsg.includes('간밤 숙박 수입'), `정산 문구 이상: ${missMsg}`);
    await ctx.close();
    // 전부 거절: 수입 0
    const r2 = await open(); const c2 = mk('숙박 거절');
    const sd2 = await findSeed(r2.page, null, 3);
    await seedAt(r2.page, 'd3_upgrade', `v.day = 3; v.time = '밤'; v.gold = 70; ${SEEDV(sd2)}`);
    const n = await r2.page.locator('.lodge-guest').count();
    for (let i = 0; i < n; i++) await r2.page.locator('.lodge-reject').nth(i).tap();
    c2((await r2.page.locator('.lodge-state', { hasText: '거절' }).count()) === n, '전부 거절했는데 표시가 다름');
    c2((await r2.page.locator('#lodge-done').innerText()).includes('+0G'), '전부 거절했는데 예상 수입이 0 이 아님');
    await r2.page.locator('#lodge-done').tap(); await r2.page.waitForTimeout(200);
    const vv = await vars(r2.page);
    c2(vv.gold === 70 && vv.inn.sat === 0 && Object.keys(vv.lodge.hosted).length === 0 && vv.lodge.nights === 1, `거절 정산 이상 ${JSON.stringify({ g: vv.gold, s: vv.inn.sat, h: vv.lodge.hosted })}`);
    await r2.ctx.close();
  }
  // --- 개조 효과: 침구 숙박비 +3, 방음/창가 태그, 다락(4성) ---
  {
    const chk = mk('객실 개조');
    const { ctx, page } = await open();
    const sdNone = await findSeed(page, null, 2);
    await seedAt(page, 'd2_upgrade', `v.day = 2; v.time = '밤'; v.gold = 300; v.lodge.upg.bedding = true; v.lodge.upg.soundproof = true; v.lodge.upg.windowbox = true; v.lodge.upg.attic = true; v.inn.rank = 4; ${SEEDV(sdNone)}`);
    const info = await page.evaluate(() => InnCore.roomList(VN.state.vars).map((r) => ({ id: r.id, open: r.open, price: r.price, tags: r.tags })));
    const by = Object.fromEntries(info.map((r) => [r.id, r]));
    chk(by.floor1.price === 9 && by.floor2.price === 14 && by.attic.price === 25 && info.every((r) => r.open), `침구 +3G / 다락 열림 이상 ${JSON.stringify(info)}`);
    chk(by.floor1.tags.includes('soft') && by.floor1.tags.includes('quiet') && by.floor2.tags.includes('window') && !by.floor1.tags.includes('window'), `태그 이상 ${JSON.stringify(by)}`);
    chk((await page.locator('.lodge-room.closed').count()) === 0 && (await page.locator('.lodge-room[data-room="attic"]').isEnabled()), '다락방이 열려 있지 않음');
    chk((await page.locator('.lodge-room[data-room="floor1"] .lodge-price').innerText()) === '9G', '1층 숙박비 표시가 9G 가 아님');
    // 다락은 4성 이상일 때만 살 수 있다
    await page.locator('#lodge-done').tap(); await page.waitForTimeout(250);
    chk(await vis(page, 'tv-upg'), '개조 화면이 안 열림');
    // 4성에서 다락 구입 가능 (다른 세이브: 미구입)
    await ctx.close();
    const r2 = await open(); const c2 = mk('다락 개조');
    const sd = await findSeed(r2.page, null, 2);
    await seedAt(r2.page, 'd2_upgrade', `v.day = 2; v.time = '밤'; v.gold = 120; v.inn.rank = 4; ${SEEDV(sd)}`);
    await r2.page.locator('#lodge-done').tap(); await r2.page.waitForTimeout(250);
    const ab = r2.page.locator('.tv-upg-card.room[data-id="attic"] .tv-upg-buy');
    c2(await ab.isEnabled(), '4성인데 다락 개조를 살 수 없음');
    await ab.tap();
    const va = await vars(r2.page);
    c2(va.lodge.upg.attic && va.gold === 70, `다락 개조 구입 이상 (골드 ${va.gold})`);
    await r2.ctx.close();
  }

  // ================= 밤 사건 =================
  {
    const chk = mk('밤 사건');
    const { ctx, page } = await open();
    const sdCat = await findSeed(page, 'cat', 1);
    chk(sdCat > 0, '고양이 사건 시드를 못 찾음');
    // 접수에서 전부 거절 -> 밤 사건 장면 -> 선택 -> 여관 손보기
    await seedAt(page, 'd1_upgrade', `v.day = 1; v.time = '밤'; v.gold = 60; ${SEEDV(sdCat)}`);
    await page.locator('#lodge-done').tap(); await page.waitForTimeout(350);
    chk((await scene(page)) === 'nev_cat', `밤 사건 장면으로 가지 않음: ${await scene(page)}`);
    chk((await vars(page)).nev.used.includes('cat') && (await vars(page)).nev.ret === 'd1_upgrade#3', `밤 사건 기록 이상 ${JSON.stringify((await vars(page)).nev)}`);
    await until(page, () => VN.mode === 'choice');
    chk((await mode(page)) === 'choice', '밤 사건 선택지가 안 뜸');
    await page.waitForTimeout(300);
    await shot(page, 'nev_01_choice');
    chk((await shift(page)) === 0, '밤 사건 가로 스크롤');
    const g0 = (await vars(page)).gold;
    await page.locator('.choice-btn').first().tap(); await page.waitForTimeout(150);
    await until(page, () => VN.mode === 'tavern');
    chk(await vis(page, 'tv-upg'), '밤 사건 뒤에 여관 손보기 화면으로 돌아오지 않음');
    const v1 = await vars(page);
    chk(typeof v1.lodge.note === 'string' && v1.lodge.note.length > 8, '밤 사건이 아침 정산 문구(lodge.note)를 남기지 않음');
    chk(Math.abs(v1.gold - g0) <= 15, `밤 사건 골드 변화가 큼 ${g0}->${v1.gold}`);
    await page.locator('#tv-upg-next').tap(); await page.waitForTimeout(300);
    chk((await page.locator('#card-tip').innerText()).includes(v1.lodge.note.slice(0, 10)), '아침 카드에 밤 사건 문구가 없음');
    await ctx.close();
  }
  // 모든 밤 사건 경로: 장면을 직접 열어 선택지마다 끝까지 (복귀 + 효과 범위)
  {
    const chk = mk('밤 사건 전체');
    const { ctx, page } = await open();
    const events = await page.evaluate(() => Object.keys(LODGING.nightEvents.events));
    let paths = 0;
    for (const ev of events) {
      for (const variant of ev === 'thief' ? ['low', 'miho'] : ['all']) {
        for (let k = 0; k < 4; k++) {
          const aff = variant === 'miho' ? 'v.aff.miho = HEART(4);' : (ev === 'stars' || ev === 'nightmare' ? 'v.aff.lia = HEART(2); v.aff.erion = HEART(1);' : '');
          await seedAt(page, `nev_${ev}`, `v.day = 2; v.time = '밤'; v.gold = 50; v.rep = 3; ${aff} v.lodge.hosted.cloak = 1; v.nev.ret = 'd2_upgrade#3';`);
          await until(page, () => VN.mode === 'choice');
          const n = await page.evaluate(() => VN.options.length);
          if (k >= n) break;
          const before = await vars(page);
          if (variant === 'miho') chk((await scene(page)) === 'nev_thief_miho' || (await scene(page)).startsWith('nev_thief'), '미호 분기 이상');
          await page.locator('.choice-btn').nth(k).evaluate((b) => b.click());
          await until(page, () => VN.mode === 'tavern');
          paths++;
          const after = await vars(page);
          chk(await vis(page, 'tv-upg') || (await mode(page)) === 'tavern', `${ev}[${variant}/${k}] 끝난 뒤 밤 화면으로 돌아오지 않음 (${await scene(page)})`);
          chk(Math.abs(after.gold - before.gold) <= 15 && Math.abs(after.rep - before.rep) <= 2, `${ev}[${variant}/${k}] 효과가 큼 ${before.gold}->${after.gold} rep ${before.rep}->${after.rep}`);
          chk(HEROINES_OK(before, after), `${ev}[${variant}/${k}] 호감도가 줄었거나 2 초과`);
          chk(after.lodge.note.length > 8, `${ev}[${variant}/${k}] lodge.note 없음`);
        }
      }
    }
    chk(paths >= 12, `밤 사건 경로 ${paths}개 (12 이상이어야 함)`);
    // 도둑: 미호 호감도가 높으면 미호 분기
    await seedAt(page, 'nev_thief', `v.day = 2; v.time = '밤'; v.aff.miho = HEART(4); v.nev.ret = 'd2_upgrade#3';`);
    await tapText(page, 4);
    chk((await scene(page)).startsWith('nev_thief_miho'), `미호 호감도가 높은데 미호가 도둑을 해결하지 않음 (${await scene(page)})`);
    await seedAt(page, 'nev_thief', `v.day = 2; v.time = '밤'; v.aff.miho = 0; v.nev.ret = 'd2_upgrade#3';`);
    await until(page, () => VN.mode === 'choice');
    chk((await scene(page)) === 'nev_thief' && (await page.evaluate(() => VN.options.length)) === 3, '일반 도둑 장면 이상');
    report.push(`밤 사건: 6종 모두 장면 -> 선택 -> 밤 화면 복귀 (${paths}개 경로), 골드 ±15 / 평판 ±2 / 호감도 0~+2 범위, 미호 호감도 높으면 미호가 도둑 해결, 아침 카드에 정산 문구`);
    await ctx.close();
  }

  // ================= 여관 등급 =================
  {
    const chk = mk('여관 등급');
    const { ctx, page } = await open();
    const sdNone = await findSeed(page, null, 1);
    await seedAt(page, 'd1_upgrade', `v.day = 1; v.time = '밤'; v.gold = 50; v.rep = 14; ${SEEDV(sdNone)}`);
    chk((await page.locator('.hud-item.rank b').innerText()) === '★', 'HUD 등급이 처음에 ★ 가 아님');
    await page.locator('#lodge-done').tap(); await page.waitForTimeout(500);
    chk(await page.evaluate(() => VN.rankPopup), '평판 14 이면 3성이라 등급 상승 연출이 떠야 함');
    const rk = await page.evaluate(() => ({ stars: document.querySelectorAll('#rankup-stars i').length, name: document.getElementById('rankup-name').textContent, un: [...document.querySelectorAll('#rankup-unlocks li')].map((x) => x.textContent), who: document.getElementById('rankup-who').textContent, say: document.getElementById('rankup-text').textContent }));
    chk(rk.stars === 3 && rk.name === '입소문 난 여관' && rk.un.length === 2 && rk.un[1].includes('레시피') && rk.say.length > 5, `등급 팝업 내용 이상 ${JSON.stringify(rk)}`);
    chk((await page.locator('.hud-item.rank b').innerText()) === '★★★', 'HUD 등급 배지가 갱신되지 않음');
    chk((await shift(page)) === 0, '등급 팝업 가로 스크롤');
    await page.waitForTimeout(900);
    await shot(page, 'rank_01_rankup');
    const vr = await vars(page);
    chk(vr.inn.rank === 3 && vr.tavern.known.herb_honey && vr.tavern.known.meat_sand, `3성 해금(새 레시피 2개) 이상 ${JSON.stringify(vr.inn)}`);
    await page.locator('#rankup-btn').tap(); await page.waitForTimeout(300);
    chk(!(await page.evaluate(() => VN.rankPopup)) && await vis(page, 'tv-upg'), '팝업을 닫은 뒤 여관 손보기로 진행하지 않음');
    // 등급은 내려가지 않고 같은 등급에서는 다시 안 뜬다
    const lower = await page.evaluate(() => { VN.state.vars.rep = -4; return InnCore.checkRank(VN.state.vars); });
    chk(lower === null && (await vars(page)).inn.rank === 3, '평판이 떨어졌는데 등급이 내려가거나 다시 올라감');
    // 2성: 새 단골 로사 / 5성: 귀족 (영업 손님 목록)
    const q = await page.evaluate(() => ['day2', 'day3', 'day4', 'day5', 'day6', 'day7'].map((d) => {
      const mkv = (rank) => { const v = JSON.parse(JSON.stringify(STORY.init)); v.inn.rank = rank; v.day = 2; return TavernCore.queue(TAVERN, d, v, VN.evalCond).map((c) => c.who); };
      return { d, r1: mkv(1), r2: mkv(2), r4: mkv(4), r5: mkv(5) };
    }));
    chk(q.every((x) => !x.r1.includes('rosa') && x.r2.includes('rosa')) && q.every((x) => !x.r1.includes('noble') && !x.r4.includes('noble')), `2성 로사 해금 이상 ${JSON.stringify(q[0])}`);
    chk(q[5].r5.includes('noble') && q.slice(0, 5).every((x) => !x.r5.includes('noble')), '5성 귀족 손님이 7일차에만 와야 함');
    await ctx.close();
    // 한 번에 여러 등급: 평판 40 이면 5성, 모든 해금 문구
    const r2 = await open(); const c2 = mk('여관 등급 5성');
    const sd = await findSeed(r2.page, null, 1);
    await seedAt(r2.page, 'd1_upgrade', `v.day = 1; v.time = '밤'; v.rep = 40; ${SEEDV(sd)}`);
    await r2.page.locator('#lodge-done').tap(); await r2.page.waitForTimeout(500);
    const rk2 = await r2.page.evaluate(() => ({ stars: document.querySelectorAll('#rankup-stars i').length, un: document.querySelectorAll('#rankup-unlocks li').length }));
    c2(rk2.stars === 5 && rk2.un === 4, `5성 한 번에 도달 이상 ${JSON.stringify(rk2)}`);
    await r2.page.locator('#rankup-btn').tap(); await r2.page.waitForTimeout(200);
    // 7일차 영업 직전 등급 검사 + 귀족 사례 (보상)
    await r2.page.evaluate(() => { const o = document.getElementById('toasts'); o.innerHTML = ''; });
    await r2.ctx.close();
    const r3 = await open(); const c3 = mk('귀족 손님');
    await seedAt(r3.page, 'd7_tavern', `v.day = 7; v.time = '저녁'; v.rep = 40; v.gold = 300; v.inn.rank = 4; Object.keys(TAVERN.ingredients).forEach((i) => { TavernCore.ensure(TAVERN, v); v.tavern.stock[i] = 9; }); TavernCore.ensure(TAVERN, v); Object.keys(TAVERN.recipes).forEach((r) => { v.tavern.known[r] = true; });`);
    await until(r3.page, () => VN.mode === 'rankup' || VN.mode === 'tavern');
    c3(await r3.page.evaluate(() => VN.rankPopup) || (await vars(r3.page)).inn.rank === 5, '7일차 영업 직전 등급 검사로 5성이 되어야 함');
    if (await r3.page.evaluate(() => VN.rankPopup)) { await r3.page.locator('#rankup-btn').tap(); await r3.page.waitForTimeout(300); }
    c3(await r3.page.evaluate(() => TavernCore.queue(TAVERN, 'day7', VN.state.vars, VN.evalCond).some((c) => c.who === 'noble')), '5성인데 귀족이 영업 손님에 없음');
    // 귀족 차례까지 진행: 모든 손님을 거절하는 대신 정답 요리로 진행
    for (let i = 0; i < 30 && !(await r3.page.evaluate(() => { const e = document.getElementById('tv-shop-start'); return e && e.offsetParent !== null; })); i++) { await r3.page.touchscreen.tap(195, 300); await r3.page.waitForTimeout(60); }
    await r3.page.locator('#tv-shop-start').tap();
    let found = false;
    for (let i = 0; i < 400; i++) {
      const st = await r3.page.evaluate(() => ({ m: VN.mode, T: VN.tavern }));
      if (st.m === 'text') { await r3.page.touchscreen.tap(195, 300); await r3.page.waitForTimeout(12); continue; }
      if (st.T && st.T.phase === 'brew' && st.T.cur === 'noble') { found = true; break; }
      if (st.T && st.T.phase === 'brew') {
        await r3.page.evaluate(() => { const T = VN.tavern, v = VN.state.vars; const ids = TavernCore.bestKnown(TAVERN, v, T.cur, T.order, true, true) || TAVERN.recipes.bread_soup && TAVERN.recipes.bread_soup.ing; window.__ids = ids; });
        const ids = await r3.page.evaluate(() => window.__ids);
        for (const id of ids || []) await r3.page.locator(`.tv-ing[data-id="${id}"]`).tap();
        await r3.page.locator('#tv-serve').tap(); await r3.page.waitForTimeout(40); continue;
      }
      if (await vis(r3.page, 'tv-found')) { await r3.page.locator('#tv-found-btn').tap(); continue; }
      await r3.page.waitForTimeout(30);
    }
    c3(found, '귀족 손님 차례에 도달하지 못함');
    if (found) {
      const pre = await vars(r3.page);
      const recipe = await r3.page.evaluate(() => TAVERN.recipes.magic_stew.ing);
      for (const id of recipe) await r3.page.locator(`.tv-ing[data-id="${id}"]`).tap();
      await r3.page.locator('#tv-serve').tap(); await r3.page.waitForTimeout(300);
      const last = await r3.page.evaluate(() => VN.tavern.results[VN.tavern.results.length - 1]);
      for (let i = 0; i < 60 && (await r3.page.evaluate(() => VN.tavern.phase)) !== 'brew' && !(await vis(r3.page, 'tv-sum')); i++) { await r3.page.touchscreen.tap(195, 300); await r3.page.waitForTimeout(25); }
      const post = await vars(r3.page);
      c3(last.who === 'noble' && last.result === 'perfect', `귀족에게 마법 스튜가 대성공이 아님 ${JSON.stringify(last)}`);
      c3(post.gold - pre.gold === last.gold + 30 && post.rep - pre.rep === last.rep + 2, `귀족 사례(골드 +30, 평판 +2) 이상: 골드 ${pre.gold}->${post.gold} (요리 ${last.gold}), 평판 ${pre.rep}->${post.rep}`);
    }
    await r3.ctx.close();
    report.push('숙박: 접수 화면(손님 2~3팀, 객실 3개 중 2개 열림) 터치 배정/재배정/비우기/거절/되돌리기, 요청 맞춤=숙박비+보너스+만족, 어긋남=기본 숙박비만, 거절=0, 정산 직후 이어하기에서 이중 정산 없음, 아침 카드 정산 문구');
    report.push('객실 개조 4종: 구입/잠금/침구 숙박비 +3/방음·창가 태그/다락은 ★4 이상에서만 구입, 열린 다락 배정');
    report.push('여관 등급: 3성 연출(별 3개 + 해금 2줄 + 히로인 한마디 + HUD 배지) / 5성 한 번에 도달(별 5개, 해금 4줄), 내려가지 않음, 3성 새 레시피 2개 해금, 2성 로사 / 5성 귀족(마법 스튜 대성공 시 골드 +30 평판 +2)');
  }

  // ================= 선물 =================
  {
    const chk = mk('선물');
    const { ctx, page } = await open();
    await seedAt(page, 'pick', `v.day = 2; v.time = '낮'; v.gold = 100;`);
    chk((await mode(page)) === 'choice' && (await page.locator('.pick-tool').count()) === 2, '낮 선택 화면에 선물 도구 버튼이 없음');
    chk((await page.locator('.choice-btn').count()) >= 5, '낮 선택 화면 선택지 수 이상');
    chk((await shift(page)) === 0, '낮 선택 화면 가로 스크롤');
    await page.waitForTimeout(300);
    await shot(page, 'gift_00_pick_screen');
    await page.locator('#pick-shop').tap(); await page.waitForTimeout(350);
    chk(await vis(page, 'gift') && (await page.locator('.gift-row').count()) === 8, '장터에 선물 8종이 안 보임');
    chk((await page.locator('#gift-tab-shop.on').count()) === 1, '장터 탭이 선택되어 있지 않음');
    chk((await shift(page)) === 0, '장터 가로 스크롤');
    await shot(page, 'gift_01_shop');
    // 구입: 골드 차감, 보관함 증가 / 골드 부족이면 버튼 잠김
    const g0 = (await vars(page)).gold;
    await page.locator('.gift-row[data-id="flower"] .gift-btn').tap();
    await page.locator('.gift-row[data-id="whetstone"] .gift-btn').tap();
    await page.locator('.gift-row[data-id="trinket"] .gift-btn').tap();
    const v1 = await vars(page);
    chk(v1.gold === g0 - 10 - 14 - 20 && v1.gift.inv.flower === 1 && v1.gift.inv.whetstone === 1 && v1.gift.inv.trinket === 1 && v1.gift.bought === 3, `선물 구입 이상 (골드 ${g0}->${v1.gold}, ${JSON.stringify(v1.gift.inv)})`);
    await page.evaluate(() => { VN.state.vars.gold = 9; });
    await page.locator('#gift-tab-give').tap(); await page.locator('#gift-tab-shop').tap();
    chk((await page.locator('.gift-row[data-id="flower"] .gift-btn').isDisabled()) && (await page.locator('.gift-row[data-id="ink"] .gift-btn').isDisabled()) && (await page.locator('.gift-row[data-id="sweets"] .gift-btn').isDisabled()) === false, '골드 9G 일 때 비싼 선물 버튼이 잠기지 않거나 싼 과자(8G)가 열림 판정 이상');
    // 주기 탭: 보관함 3개
    await page.locator('#gift-tab-give').tap(); await page.waitForTimeout(250);
    chk((await page.locator('.gift-row').count()) === 3 && (await page.locator('.gift-who').count()) === 4, '선물 주기 탭 이상');
    chk(!(await page.locator('#gift-info').innerText()).includes('undefined'), '선물 주기 안내에 undefined 가 보임');
    await shot(page, 'gift_03_give_list');
    // 리아에게 꽃다발 (최애 +3)
    await page.locator('.gift-who[data-who="lia"]').tap();
    const a0 = (await vars(page)).aff;
    await page.locator('.gift-row[data-id="flower"] .gift-btn').tap(); await page.waitForTimeout(300);
    chk(await vis(page, 'gift-react'), '선물 반응 화면이 안 뜸');
    const reactTx = await page.locator('#gift-react-text').innerText();
    const expect = await page.evaluate(() => GIFTS.react.lia.flower.text);
    chk(reactTx === expect, `반응 대사가 데이터와 다름: ${reactTx}`);
    const v2 = await vars(page);
    chk(v2.aff.lia === a0.lia + 3 && v2.gift.known.lia.flower === 'fav' && v2.gift.given.lia === 2 && !v2.gift.inv.flower, `최애 선물 처리 이상 (호감도 ${a0.lia}->${v2.aff.lia}, ${JSON.stringify(v2.gift)})`);
    chk((await page.locator('#gift-react-aff').innerText()).includes('+3') && (await page.locator('#gift-react-tier').innerText()).includes('최애'), '반응 화면의 호감도/등급 표시 이상');
    chk((await shift(page)) === 0, '선물 반응 가로 스크롤');
    await page.waitForTimeout(300);
    await shot(page, 'gift_02_reaction');
    await page.locator('#gift-react-ok').tap(); await page.waitForTimeout(250);
    // 하루 1번: 같은 날 리아에게 또 줄 수 없다
    await page.evaluate(() => { VN.state.vars.gold = 100; InnCore.buyGift(VN.state.vars, 'flower'); });
    await page.locator('#gift-tab-give').tap(); await page.locator('.gift-who[data-who="lia"]').tap(); await page.waitForTimeout(150);
    chk((await page.locator('.gift-row[data-id="flower"] .gift-btn').isDisabled()) && (await page.locator('#gift-info').innerText()).includes('이미'), '하루 한도가 지켜지지 않음 (같은 날 2번째 선물)');
    // 다른 히로인: 카엘라에게 숫돌(최애), 에리온에게 숫돌 싫어함 -1 (하루 1개씩)
    await page.locator('.gift-who[data-who="kaela"]').tap();
    await page.locator('.gift-row[data-id="whetstone"] .gift-btn').tap(); await page.waitForTimeout(200);
    chk((await vars(page)).aff.kaela === a0.kaela + 3 && (await page.locator('#gift-react-tier').innerText()).includes('최애'), '카엘라 숫돌(최애) 이상');
    await page.locator('#gift-react-ok').tap();
    await page.evaluate(() => { InnCore.buyGift(VN.state.vars, 'whetstone'); });
    await page.locator('.gift-who[data-who="erion"]').tap();
    await page.locator('.gift-row[data-id="whetstone"] .gift-btn').tap(); await page.waitForTimeout(200);
    const ve = await vars(page);
    chk(ve.aff.erion === a0.erion - 1 && ve.gift.known.erion.whetstone === 'hate' && (await page.locator('#gift-react-tier').innerText()).includes('싫어함'), `싫어하는 선물 -1 이상 (${a0.erion}->${ve.aff.erion})`);
    await page.locator('#gift-react-ok').tap();
    // 보통(+1): 미호에게 털목도리 / 좋아함(+2): 미호에게 과자
    await page.evaluate(() => { InnCore.buyGift(VN.state.vars, 'sweets'); });
    await page.locator('.gift-who[data-who="miho"]').tap();
    await page.locator('.gift-row[data-id="sweets"] .gift-btn').tap(); await page.waitForTimeout(150);
    chk((await vars(page)).aff.miho === a0.miho + 2, '좋아함 선물 +2 이상');
    await page.locator('#gift-react-ok').tap();
    await page.locator('#gift-close').tap(); await page.waitForTimeout(250);
    chk(!(await vis(page, 'gift')) && (await mode(page)) === 'choice' && (await page.locator('.choice-btn').count()) >= 5, '닫은 뒤 낮 선택지로 돌아오지 않음');
    chk((await page.locator('#pick-gift').innerText()).includes('보관함'), '낮 선택 화면 도구 버튼 갱신 이상');
    // 다음 날에는 다시 줄 수 있다
    const nextDay = await page.evaluate(() => { VN.state.vars.day = 3; return InnCore.canGive(VN.state.vars, 'lia'); });
    chk(nextDay, '다음 날에도 선물을 줄 수 없음');
    // 낮 이벤트 뒤 "선물을 건넨다" 제안
    await ctx.close();
    const r2 = await open(); const c2 = mk('선물 제안');
    await seedAt(r2.page, 'pick', `v.day = 1; v.time = '낮'; v.gift.inv.flower = 2; v.gold = 50;`);
    await r2.page.locator('.choice-btn[data-who="lia"]').tap();
    let offer = false;
    for (let i = 0; i < 60; i++) {
      await until(r2.page, () => VN.mode === 'choice' || VN.mode === 'tavern');
      const m = await mode(r2.page);
      if (m === 'tavern') break;
      const txt = await r2.page.evaluate(() => VN.options.map((o) => o.text));
      if (txt.some((t) => t.includes('선물'))) { offer = true; break; }
      await r2.page.locator('.choice-btn').first().evaluate((b) => b.click());
    }
    c2(offer, '낮 이벤트 뒤에 선물 제안이 안 나옴');
    if (offer) {
      await r2.page.waitForTimeout(300);
      await shot(r2.page, 'gift_04_offer');
      await r2.page.locator('.choice-btn[data-who="lia"]').tap(); await r2.page.waitForTimeout(350);
      c2(await vis(r2.page, 'gift') && (await r2.page.locator('.gift-who').count()) === 1 && (await r2.page.locator('#gift-tabs.hidden').count()) === 1, '제안 뒤 선물 화면(리아 고정)이 아님');
      await r2.page.locator('.gift-row[data-id="flower"] .gift-btn').tap(); await r2.page.waitForTimeout(250);
      await r2.page.locator('#gift-react-ok').tap(); await r2.page.waitForTimeout(400);
      const vo = await vars(r2.page);
      c2(!(await vis(r2.page, 'gift')) && vo.gift.given.lia === 1 && vo.gift.inv.flower === 1, `선물 제안 뒤 상태 이상 ${JSON.stringify(vo.gift)}`);
      c2((await scene(r2.page)).startsWith('d1_') || (await mode(r2.page)) === 'text', `선물 뒤 저녁으로 이어지지 않음 (${await scene(r2.page)})`);
    }
    await r2.ctx.close();
    // 이미 줬거나 선물이 없으면 제안이 안 나온다
    const r3 = await open(); const c3 = mk('선물 제안 없음');
    await seedAt(r3.page, 'after_pick', `v.day = 1; v.time = '낮'; v.gift.inv.flower = 1; v.gift.given.lia = 1; v.gift.last = 'lia';`);
    await until(r3.page, () => VN.mode === 'choice' || VN.mode === 'tavern');
    c3((await mode(r3.page)) !== 'choice' || !(await r3.page.evaluate(() => VN.options.map((o) => o.text))).some((t) => t.includes('선물')), '이미 선물한 날에 제안이 또 나옴');
    await r3.ctx.close();
    // 메뉴의 "선물" 버튼: 주기 탭만 (장터는 낮 선택 화면에서만)
    const r4 = await open(); const c4 = mk('선물 메뉴');
    await seedAt(r4.page, 'd1_open', `v.gift.inv.sweets = 1;`);
    await tapText(r4.page, 3);
    await r4.page.tap('#menu-btn'); await r4.page.tap('#menu-gift'); await r4.page.waitForTimeout(300);
    c4(await vis(r4.page, 'gift') && (await r4.page.locator('#gift-tab-shop').isDisabled()) && (await r4.page.locator('.gift-row').count()) === 1, '메뉴 선물: 주기 탭만 열려야 함');
    await r4.page.locator('#gift-close').tap(); await r4.page.waitForTimeout(200);
    c4(!(await vis(r4.page, 'gift')), '메뉴 선물 닫기 이상');
    await r4.ctx.close();
    // 6일차 전야의 선물과 하루 한도 공유
    const r5 = await open(); const c5 = mk('6일차 전야 선물');
    await seedAt(r5.page, 'd6_ev_gift', `v.day = 6; v.time = '저녁'; v.gold = 100; v.gift.given.erion = 6;`, 3);
    const txt = await r5.page.evaluate(() => VN.options.map((o) => ({ who: o.who, cost: o.cost })));
    c5(!txt.some((o) => o.who === 'erion') && txt.some((o) => o.who === 'lia') && txt.length === 4, `낮에 선물한 에리온이 전야 선물에서 빠져야 함 ${JSON.stringify(txt)}`);
    const aff0 = (await vars(r5.page)).aff.lia;
    await r5.page.locator('.choice-btn[data-who="lia"]').tap(); await r5.page.waitForTimeout(200);
    const vv = await vars(r5.page);
    c5(vv.gold === 85 && vv.aff.lia === aff0 + 2 && vv.gift.given.lia === 6, `전야 선물 처리 이상 (골드 ${vv.gold}, ${JSON.stringify(vv.gift.given)})`);
    await r5.ctx.close();
    // 손님 메모: 알아낸 선물 취향이 기록된다
    const r6 = await open(); const c6 = mk('선물 메모');
    await seedAt(r6.page, 'd1_evening', `v.day = 1; v.time = '저녁'; TavernCore.ensure(TAVERN, v); TavernCore.note(v, 'lia').met = true; TavernCore.note(v, 'erion').met = true; v.gift.known.lia = { flower: 'fav', whetstone: 'hate' };`);
    for (let i = 0; i < 40 && !(await vis(r6.page, 'tv-shop')); i++) { await r6.page.touchscreen.tap(195, 300); await r6.page.waitForTimeout(40); }
    await r6.page.locator('#tv-shop-notes').tap(); await r6.page.waitForTimeout(300);
    const nl = await r6.page.locator('.tv-note-row[data-who="lia"] .tv-note-line.gift').innerText();
    c6(nl.includes('꽃다발') && nl.includes('숫돌') && nl.includes('2/8') && (await r6.page.locator('.tv-note-row[data-who="erion"] .tv-note-line.gift').innerText()).includes('???'), `메모의 선물 취향 줄 이상: ${nl}`);
    await shot(r6.page, 'gift_05_memo');
    c6((await shift(r6.page)) === 0, '메모 가로 스크롤');
    await r6.ctx.close();
    report.push('선물: 낮 선택 화면에서 구입(골드 차감/부족 시 잠금)·주기·반응(최애 +3/좋아함 +2/싫어함 -1, 대사=데이터)·하루 1명 1개 한도·다음 날 해금·낮 이벤트 뒤 제안·메뉴 "선물"·4일차 전야 선물과 한도 공유·메모에 취향 기록');
  }

  // ================= 깊은 이벤트 =================
  {
    const chk = mk('깊은 이벤트');
    const { ctx, page } = await open();
    const H4 = await page.evaluate(() => HEART(4));
    const deepOpts = () => page.evaluate(() => VN.options.filter((o) => o.tag === '깊은 이야기').map((o) => o.who));
    // 조건: 5~6일차 + 하트 4칸 이상 + 한 번만
    await seedAt(page, 'pick', `v.day = 5; v.aff.erion = HEART(4) - 1; v.aff.kaela = HEART(4); v.ev.erion = 3; v.ev.kaela = 3;`);
    let d = await deepOpts();
    chk(d.length === 1 && d[0] === 'kaela', `하트 4칸 미만 에리온은 안 나오고 카엘라만 나와야 함 ${JSON.stringify(d)}`);
    await page.waitForTimeout(350);
    await shot(page, 'deep_00_pick_option');
    await seedAt(page, 'pick', `v.day = 3; v.aff.erion = 30; v.aff.kaela = 30; v.ev.erion = 3;`);
    chk((await deepOpts()).length === 0, '3일차에 깊은 이벤트 선택지가 나옴');
    await seedAt(page, 'pick', `v.day = 4; v.aff.erion = 30; v.aff.kaela = 30; v.ev.erion = 3;`);
    chk((await deepOpts()).length === 0, '4일차에 깊은 이벤트 선택지가 나옴 (5~6일차에만)');
    await seedAt(page, 'pick', `v.day = 5; v.aff.erion = 30; v.flag.deep_erion = true;`);
    chk((await deepOpts()).length === 0, '이미 본 깊은 이벤트가 또 나옴');
    // 에리온 깊은 이벤트: CG + 선택지 2개 + 호감도 + 4일차는 저녁으로
    await seedAt(page, 'pick', `v.day = 5; v.time = '낮'; v.aff.erion = HEART(4); v.ev.erion = 3;`);
    await page.locator('.choice-btn', { hasText: '맨 뒷장' }).tap();
    await until(page, () => VN.mode === 'choice' || !!VN.cgNow);
    for (let i = 0; i < 12 && (await page.evaluate(() => VN.cgNow)) !== 'erion_deep'; i++) { await tapText(page, 1); }
    chk((await page.evaluate(() => VN.cgNow)) === 'erion_deep' && await vis(page, 'cg'), '깊은 이벤트 CG 가 안 뜸');
    chk((await page.evaluate(() => VN.cgSeen)).erion_deep > 0, 'CG 기록이 남지 않음');
    for (let i = 0; i < 12 && !(await page.evaluate(() => document.getElementById('next-mark').classList.contains('on'))); i++) await page.waitForTimeout(150);
    await page.waitForTimeout(900);
    await shot(page, 'deep_01_event_cg');
    chk((await shift(page)) === 0, '깊은 이벤트 가로 스크롤');
    await until(page, () => VN.mode === 'choice');
    chk((await page.evaluate(() => VN.options.length)) === 2 && (await page.evaluate(() => VN.cgNow)) === null, '깊은 이벤트 선택지가 2개가 아니거나 CG 가 안 걷힘');
    await page.waitForTimeout(250);
    await shot(page, 'deep_02_choice');
    const a0 = (await vars(page)).aff.erion;
    await page.locator('.choice-btn').first().tap(); await page.waitForTimeout(150);
    await until(page, () => VN.mode === 'choice' || VN.mode === 'tavern' || VN.mode === 'text' && VN.state.scene.startsWith('d5_'));
    const vd = await vars(page);
    chk(vd.aff.erion === a0 + 3 && vd.flag.deep_erion === true, `깊은 이벤트 호감도/플래그 이상 (${a0}->${vd.aff.erion})`);
    for (let i = 0; i < 40 && !(await scene(page)).startsWith('d5_'); i++) { await tapText(page, 1); if ((await mode(page)) === 'choice') break; }
    chk((await scene(page)).startsWith('d5_'), `깊은 이벤트 뒤 5일차 저녁으로 이어지지 않음 (${await scene(page)})`);
    // 다른 3명도 (조건/CG/호감도) — 일부러 두 번째 선택지
    for (const h of ['kaela', 'miho', 'lia']) {
      await seedAt(page, 'pick', `v.day = 6; v.time = '낮'; v.aff.${h} = HEART(4); v.ev.${h} = 3; v.gold = 50;`);
      await page.locator(`.choice-btn[data-who="${h}"]`, { hasText: /./ }).evaluateAll((els) => { const el = els.find((e) => /깊은 이야기/.test(e.textContent)); el && el.click(); });
      let cg = false;
      for (let i = 0; i < 20; i++) { await tapText(page, 1); if ((await page.evaluate(() => VN.cgNow)) === `${h}_deep`) cg = true; if ((await mode(page)) === 'choice') break; }
      chk(cg, `${h} 깊은 이벤트 CG ${h}_deep 가 안 뜸`);
      chk((await mode(page)) === 'choice' && (await page.evaluate(() => VN.options.length)) === 2, `${h} 깊은 이벤트 선택지 수 이상`);
      const b = (await vars(page)).aff[h];
      await page.locator('.choice-btn').nth(1).evaluate((x) => x.click()); await page.waitForTimeout(100);
      const af = (await vars(page)).aff[h];
      chk(af >= b + 2 && af <= b + 3 && (await vars(page)).flag['deep_' + h] === true, `${h} 두 번째 선택 호감도 이상 (${b}->${af})`);
    }
    // 6일차에도 나오고(끝나면 6일차 저녁으로), 7일차 동행 선택에는 안 나온다
    await seedAt(page, 'pick', `v.day = 6; v.time = '낮'; v.aff.lia = HEART(4);`);
    chk((await deepOpts()).join() === 'lia', '6일차 선택에 깊은 이야기가 없음');
    await page.locator('.choice-btn[data-who="lia"]').evaluateAll((els) => { const el = els.find((e) => /깊은 이야기/.test(e.textContent)); el && el.click(); });
    for (let i = 0; i < 30 && (await mode(page)) !== 'choice'; i++) await tapText(page, 1);
    await page.locator('.choice-btn').first().evaluate((x) => x.click());
    for (let i = 0; i < 40 && !(await scene(page)).startsWith('d6_'); i++) { await tapText(page, 1); if ((await mode(page)) === 'choice') break; }
    chk((await vars(page)).flag.deep_lia === true && (await scene(page)).startsWith('d6_'), `6일차 깊은 이벤트 뒤 6일차 저녁으로 이어지지 않음 (${await scene(page)})`);
    await seedAt(page, 'd7_pick_day', `v.day = 7; v.time = '낮'; v.aff.lia = HEART(4);`, 5);
    chk((await deepOpts()).length === 0, '7일차 동행 선택에 깊은 이야기가 나옴');
    // CG 분모 22
    await page.evaluate(() => VN.state && 0);
    await ctx.close();
    const r2 = await open(); const c2 = mk('깊은 이벤트 수집');
    await r2.page.evaluate(() => { const n = Date.now(); localStorage.setItem('inn_vn_v5_cg', JSON.stringify({ erion_deep: n, kaela_deep: n })); });
    await r2.page.reload(); await r2.page.waitForSelector('#btn-gallery');
    c2((await r2.page.locator('#btn-gallery').innerText()).includes('2/22'), `갤러리 버튼이 2/22 이 아님 (${await r2.page.locator('#btn-gallery').innerText()})`);
    await r2.page.tap('#btn-gallery'); await r2.page.waitForTimeout(300);
    c2((await r2.page.locator('.gal-item').count()) === 22 && (await r2.page.locator('.gal-item.got').count()) === 2, '갤러리 22칸(2장 획득) 이상');
    c2((await shift(r2.page)) === 0, '갤러리 가로 스크롤');
    await shot(r2.page, 'deep_03_gallery');
    await r2.ctx.close();
    report.push('깊은 이벤트: 5~6일차 + 하트 4칸 + 1번만(미만/3·4일차/7일차/이미 봄은 안 나옴), 4명 모두 CG(22장 중 4장)·선택지 2개·호감도 +2~3, 저녁으로 이어짐, 갤러리 22칸');
  }

  // ================= 히로인 신경전 =================
  {
    const chk = mk('신경전');
    const { ctx, page } = await open();
    const need = await page.evaluate(() => RIVALRY.need);
    // 일 선택 -> after_pick -> 신경전 (리아+미호 둘 다 높음)
    await seedAt(page, 'pick', `v.day = 3; v.time = '낮'; v.aff.lia = ${'RIVALRY.need'}; v.aff.miho = RIVALRY.need;`.replace(/\$\{[^}]*\}/g, ''));
    await page.locator('.choice-btn', { hasText: '여관 일에 집중' }).tap();
    await until(page, () => VN.mode === 'choice');
    chk((await scene(page)) === 'riv_lia_miho' && (await page.evaluate(() => VN.options.length)) === 3, `신경전 장면이 안 열림 (${await scene(page)})`);
    chk((await vars(page)).riv.n === 1 && (await vars(page)).riv.done[0] === 'lia_miho', '신경전 기록 이상');
    await page.waitForTimeout(350);
    await shot(page, 'riv_01_choice');
    chk((await shift(page)) === 0, '신경전 가로 스크롤');
    const b0 = await vars(page);
    await page.locator('.choice-btn').first().tap(); await page.waitForTimeout(150);
    await until(page, () => VN.mode === 'choice' || VN.mode === 'tavern' || VN.state.scene.startsWith('d3_'));
    const a1 = await vars(page);
    chk(a1.aff.lia === b0.aff.lia + 2 && a1.aff.miho === b0.aff.miho - 1 && a1.rep === b0.rep, `편들기(리아 +2 / 미호 -1 / 평판 그대로) 이상 ${b0.aff.lia}->${a1.aff.lia}, ${b0.aff.miho}->${a1.aff.miho}`);
    for (let i = 0; i < 60 && !(await scene(page)).startsWith('d3_'); i++) { await tapText(page, 1); if ((await mode(page)) === 'choice') break; }
    chk((await scene(page)).startsWith('d3_evening') || (await scene(page)).startsWith('d3_'), `신경전 뒤 저녁으로 이어지지 않음 (${await scene(page)})`);
    // 달래기: 둘 다 +1, 평판 0
    await seedAt(page, 'pick', `v.day = 2; v.time = '낮'; v.aff.kaela = RIVALRY.need; v.aff.erion = RIVALRY.need; v.rep = 5;`);
    await page.locator('.choice-btn', { hasText: '여관 일에 집중' }).tap();
    await until(page, () => VN.mode === 'choice');
    chk((await scene(page)) === 'riv_kaela_erion', `카엘라/에리온 신경전 아님 (${await scene(page)})`);
    const c0 = await vars(page);
    await page.locator('.choice-btn').nth(2).tap(); await page.waitForTimeout(150);
    await tapText(page, 8);
    const c1 = await vars(page);
    chk(c1.aff.kaela === c0.aff.kaela + 1 && c1.aff.erion === c0.aff.erion + 1 && c1.rep === c0.rep, '달래기(둘 다 +1, 평판 +0) 이상');
    // 조건: 둘 중 하나만 높으면 안 일어남 / 1일차·5일차 안 일어남 / 최대 2번 / 같은 쌍 한 번만
    const cases = [
      ['한쪽만 높음', 'v.day = 3; v.aff.lia = RIVALRY.need; v.aff.miho = RIVALRY.need - 1;', null],
      ['7일차', 'v.day = 7; v.aff.lia = RIVALRY.need; v.aff.miho = RIVALRY.need;', null],
      ['1일차', 'v.day = 1; v.aff.lia = RIVALRY.need; v.aff.miho = RIVALRY.need;', null],
      ['이미 2번', 'v.day = 3; v.aff.lia = RIVALRY.need; v.aff.miho = RIVALRY.need; v.riv.n = 2; v.riv.done = ["kaela_erion", "miho_erion"];', null],
      ['같은 쌍은 한 번', 'v.day = 3; v.aff.lia = RIVALRY.need; v.aff.miho = RIVALRY.need; v.riv.n = 1; v.riv.done = ["lia_miho"];', null],
      ['여러 쌍이면 합이 높은 쌍', 'v.day = 3; v.aff.lia = RIVALRY.need + 6; v.aff.miho = RIVALRY.need + 6; v.aff.erion = RIVALRY.need; v.aff.kaela = RIVALRY.need;', 'riv_lia_miho']
    ];
    for (const [name, patch, want] of cases) {
      await seedAt(page, 'after_pick', patch);
      await until(page, () => VN.mode === 'choice' || VN.mode === 'tavern' || VN.state.scene.startsWith('d'));
      for (let i = 0; i < 6 && (await mode(page)) === 'text' && !(await scene(page)).startsWith('riv_'); i++) await tapText(page, 1);
      const sc = await scene(page);
      chk(want ? sc === want : !sc.startsWith('riv_'), `신경전 조건 [${name}] 이상: ${sc}`);
    }
    // 네 쌍 모두 장면이 끝까지 간다
    const pairs = await page.evaluate(() => RIVALRY.pairs.map((p) => ({ id: p.id, a: p.a, b: p.b, scene: p.scene })));
    for (const p of pairs) {
      for (let k = 0; k < 3; k++) {
        await seedAt(page, p.scene, `v.day = 3; v.time = '낮'; v.aff.${p.a} = 20; v.aff.${p.b} = 20; v.riv.n = 1; v.riv.ret = 'after_pick2#0';`);
        await until(page, () => VN.mode === 'choice');
        await page.locator('.choice-btn').nth(k).evaluate((x) => x.click());
        await until(page, () => VN.mode === 'choice' || VN.mode === 'tavern' || VN.state.scene.startsWith('d3_'));
        for (let i = 0; i < 40 && !(await scene(page)).startsWith('d3_'); i++) { await tapText(page, 1); if ((await mode(page)) === 'choice') break; }
        chk((await scene(page)).startsWith('d3_'), `${p.id}[${k}] 끝난 뒤 3일차 저녁으로 이어지지 않음 (${await scene(page)})`);
      }
    }
    await ctx.close();
    report.push('히로인 신경전: 4쌍(편들기 +2/-1, 달래기 +1/+1, 평판 +0) 전 경로 완주, 조건(둘 다 높을 때 / 2~6일차 / 최대 2회 / 같은 쌍 1번 / 합 높은 쌍 우선) 확인');
  }

  // ================= 7일 구성: 5일차 사절단 / 6일차 폭풍 / 평범한 하루 =================
  {
    const chk = mk('7일 구성');
    const { ctx, page } = await open();
    // 5일차 아침: 사절단장 + 시험관이 나오고, 인사 선택(3개) -> 카엘라 선택(3개) -> 에리온 선택(2개) -> 낮 선택
    await seedAt(page, 'd5_open', `v.day = 4; v.time = '밤'; v.gold = 100; v.rep = 3;`);
    chk((await mode(page)) === 'card' && (await page.locator('#card-tip').innerText()).includes('사절단'), `5일차 카드 이상: ${await page.locator('#card-tip').innerText()}`);
    let sawExaminer = false;
    for (let i = 0; i < 40 && (await mode(page)) !== 'choice'; i++) {
      await page.touchscreen.tap(195, 300); await page.waitForTimeout(60);
      const sp = await page.evaluate(() => Object.values(VN.state.sprites).filter(Boolean).map((x) => x.id));
      if (!sawExaminer && sp.includes('examiner') && await page.evaluate(() => document.getElementById('next-mark').classList.contains('on'))) { sawExaminer = true; await page.waitForTimeout(500); await shot(page, 'envoy_01_arrival'); }
    }
    chk(sawExaminer, '5일차 아침에 시험관 하이덴 경이 등장하지 않음');
    chk((await scene(page)) === 'd5_greet' && (await page.evaluate(() => VN.options.length)) === 3, `사절단 인사 선택지 이상 (${await scene(page)})`);
    await page.waitForTimeout(300); await shot(page, 'envoy_02_greet_choice');
    const g0 = (await vars(page)).gold;
    await page.locator('.choice-btn').first().tap();
    await until(page, () => VN.mode === 'choice');
    const vg = await vars(page);
    chk(vg.gold === g0 - 15 && vg.flag.envoy_vip === true && vg.rep === 5 && (await scene(page)) === 'd5_kaela', `특실 대접 효과 이상 (골드 ${g0}->${vg.gold}, 평판 ${vg.rep}, ${await scene(page)})`);
    chk((await page.evaluate(() => VN.options.length)) === 3, '카엘라 편들기 선택지가 3개가 아님');
    await page.waitForTimeout(250); await shot(page, 'envoy_03_kaela_choice');
    await page.locator('.choice-btn').first().tap();
    await until(page, () => VN.mode === 'choice');
    chk((await vars(page)).flag.kaela_defended === true && (await scene(page)) === 'd5_erion', '카엘라 편들기 플래그/다음 장면 이상');
    await page.locator('.choice-btn').first().tap();
    await until(page, () => VN.mode === 'choice');
    chk((await scene(page)) === 'pick' && (await vars(page)).day === 5, `사절단 아침 뒤 낮 선택으로 이어지지 않음 (${await scene(page)})`);
    // 5일차 저녁 손님: 사절단장(특별 주문) + 시험관(사례)
    const q5 = await page.evaluate(() => { const v = JSON.parse(JSON.stringify(STORY.init)); v.day = 5; return TavernCore.queue(TAVERN, 'day5', v, VN.evalCond).map((c) => c.who + (c.sp ? '*' : '') + (c.reward ? '+' : '')); });
    chk(q5.includes('envoy*') && q5.includes('examiner+'), `5일차 영업 손님에 사절단이 없음 ${JSON.stringify(q5)}`);
    // 5일차 숙박: 사절단 일행 3팀 고정
    await seedAt(page, 'd5_upgrade', `v.day = 5; v.time = '밤'; v.gold = 100; v.rev = { seed: 5, used: [], today: '', ret: '' };`);
    const lg5 = await page.evaluate(() => VN.lodging.guests);
    chk(lg5.join() === 'env_chief,env_scribe,env_guard', `5일차 숙박 손님이 사절단 일행이 아님 ${lg5}`);
    await page.waitForTimeout(300); await shot(page, 'envoy_04_lodging');
    await ctx.close();

    // 6일차 저녁: 무료 배식 vs 정상 영업
    const r2 = await open(); const c2 = mk('폭풍의 밤');
    const ALL = `Object.keys(TAVERN.ingredients).forEach((i) => { TavernCore.ensure(TAVERN, v); v.tavern.stock[i] = 9; }); Object.keys(TAVERN.recipes).forEach((r) => { v.tavern.known[r] = true; });`;
    await seedAt(r2.page, 'd6_evening', `v.day = 6; v.time = '저녁'; v.gold = 100; v.rep = 5; ${ALL}`);
    await until(r2.page, () => VN.mode === 'choice');
    c2((await scene(r2.page)) === 'd6_evening' && (await r2.page.evaluate(() => VN.options.length)) === 2, `폭풍 저녁 선택지 이상 (${await scene(r2.page)})`);
    await r2.page.waitForTimeout(450); await shot(r2.page, 'storm_01_business_choice');
    c2((await shift(r2.page)) === 0, '폭풍 선택 가로 스크롤');
    const b0 = await vars(r2.page);
    await r2.page.locator('.choice-btn').first().tap();
    await until(r2.page, () => VN.mode === 'tavern');
    const vf = await vars(r2.page);
    c2(vf.flag.storm_free === true && vf.rep === b0.rep + 2 && vf.aff.lia === b0.aff.lia + 1 && vf.aff.miho === b0.aff.miho + 1, `무료 배식 선택 효과 이상 (평판 ${b0.rep}->${vf.rep})`);
    c2((await r2.page.evaluate(() => VN.tavern.free)) === true && (await r2.page.locator('#tv-shop-info').innerText()).includes('무료 배식'), '무료 배식인데 영업 상태/장보기 안내가 이상함');
    await shot(r2.page, 'storm_02_free_shop');
    await r2.page.locator('#tv-shop-start').tap();
    await until(r2.page, () => VN.tavern && VN.tavern.phase === 'brew');
    const pre = await vars(r2.page);
    const ids = await r2.page.evaluate(() => { const T = VN.tavern; return TavernCore.bestKnown(TAVERN, VN.state.vars, T.cur, T.order, true, true); });
    for (const id of ids) await r2.page.locator(`.tv-ing[data-id="${id}"]`).tap();
    await r2.page.locator('#tv-serve').tap(); await r2.page.waitForTimeout(300);
    const res = await r2.page.evaluate(() => VN.tavern.results[0]);
    const post = await vars(r2.page);
    c2(res.gold === 0 && post.gold === pre.gold, `무료 배식은 매출/팁이 없어야 함 (결과 골드 ${res.gold}, ${pre.gold}->${post.gold})`);
    c2(!(await r2.page.locator('#tv-stamp').innerText()).includes('+'), '무료 배식 도장에 수입 표시가 있음');
    await r2.ctx.close();
    // 정상 영업: 같은 상황에서 수입이 생긴다
    const r3 = await open(); const c3 = mk('폭풍의 밤(정상)');
    await seedAt(r3.page, 'd6_evening', `v.day = 6; v.time = '저녁'; v.gold = 100; v.rep = 5; ${ALL}`);
    await until(r3.page, () => VN.mode === 'choice');
    await r3.page.locator('.choice-btn').nth(1).tap();
    await until(r3.page, () => VN.mode === 'tavern');
    c3((await r3.page.evaluate(() => VN.tavern.free)) === false && (await r3.page.evaluate(() => VN.tavern.id)) === 'day6', '정상 영업이 day6 가 아님');
    await r3.page.locator('#tv-shop-start').tap();
    await until(r3.page, () => VN.tavern && VN.tavern.phase === 'brew');
    const pre3 = await vars(r3.page);
    const ids3 = await r3.page.evaluate(() => { const T = VN.tavern; return TavernCore.bestKnown(TAVERN, VN.state.vars, T.cur, T.order, true, true); });
    for (const id of ids3) await r3.page.locator(`.tv-ing[data-id="${id}"]`).tap();
    await r3.page.locator('#tv-serve').tap(); await r3.page.waitForTimeout(300);
    const post3 = await vars(r3.page);
    c3(post3.gold > pre3.gold, `정상 영업은 수입이 있어야 함 (${pre3.gold}->${post3.gold})`);
    await r3.ctx.close();

    // 정전: 호감도가 가장 높은 히로인과 짧은 장면 (+1), CG 기록
    const r4 = await open(); const c4 = mk('정전 장면');
    for (const [h, sc] of [['erion', 'd6_dark_erion'], ['kaela', 'd6_dark_kaela'], ['miho', 'd6_dark_miho'], ['lia', 'd6_dark_lia']]) {
      await seedAt(r4.page, 'd6_dark', `v.day = 6; v.time = '밤'; v.aff.${h} = 12;`);
      let got = false;
      for (let i = 0; i < 40 && !got; i++) { await tapText(r4.page, 1); if ((await scene(r4.page)) === sc) got = true; if ((await mode(r4.page)) === 'choice') break; }
      c4(got, `정전 장면이 ${h} 로 가지 않음 (${await scene(r4.page)})`);
    }
    c4((await r4.page.evaluate(() => VN.cgSeen)).storm_inn > 0, '폭풍 속 여관 CG 기록이 없음');
    await r4.ctx.close();

    // 평범한 하루: 이벤트 4개를 다 본 뒤 같은 히로인을 고르면 짧은 장면 (ev 4 -> plain1, 5 이상 -> plain2), 호감도 +1
    const r5 = await open(); const c5 = mk('평범한 하루');
    for (const h of ['erion', 'kaela', 'miho', 'lia']) {
      await seedAt(r5.page, 'pick', `v.day = 3; v.time = '낮'; v.ev.${h} = 4;`);
      const plain = await r5.page.evaluate((hh) => VN.options.filter((o) => o.tag === '평범한 하루' && o.who === hh).length, h);
      c5(plain === 1, `${h} 이벤트 4개 뒤 평범한 하루 선택지가 1개가 아님 (${plain})`);
      c5((await r5.page.evaluate((hh) => VN.options.filter((o) => o.who === hh).length, h)) === 1, `${h} 선택지가 1개가 아님`);
      const a0 = (await vars(r5.page)).aff[h];
      await r5.page.locator(`.choice-btn[data-who="${h}"]`).tap();
      await until(r5.page, () => VN.mode === 'choice' || VN.mode === 'tavern');
      const v1 = await vars(r5.page);
      c5(v1.aff[h] === a0 + 1 && v1.ev[h] === 5, `${h} 평범한 하루 1: 호감도 +1 / ev 5 이어야 함 (${a0}->${v1.aff[h]}, ev ${v1.ev[h]})`);
      await seedAt(r5.page, 'pick', `v.day = 3; v.time = '낮'; v.ev.${h} = 5;`);
      await r5.page.waitForTimeout(250);
      if (h === 'lia') await shot(r5.page, 'plain_01_pick');
      await r5.page.locator(`.choice-btn[data-who="${h}"]`).tap();
      for (let i = 0; i < 30 && (await scene(r5.page)) !== `${h}_plain2`; i++) { await tapText(r5.page, 1); }
      c5((await scene(r5.page)).startsWith(`${h}_plain2`) || (await vars(r5.page)).ev[h] === 6, `${h} 평범한 하루 2로 가지 않음 (${await scene(r5.page)})`);
    }
    await r5.ctx.close();
    report.push('7일 구성: 5일차 사절단(인사 3택/카엘라 3택/에리온 2택, 특실 15G·평판·플래그, 특별 손님 envoy*/examiner+, 숙박 사절단 3팀 고정) / 6일차 폭풍(무료 배식=매출·팁 0·평판 +2·호감도 +1, 정상 영업=수입, 정전 4갈래, CG) / 평범한 하루 8장면(ev 4=1번, 5+=2번, 호감도 +1)');
  }

  // ================= 영업 편의 기능: 추천 배정 / 지난번처럼 사기 / 추천 구매 / 손보기 자동 건너뛰기 / 빠른 모드 =================
  {
    const chk = mk('편의 기능');
    const { ctx, page } = await open();
    // 1) 추천 배정: 버튼 한 번 -> 수입 최대 배정, 접수 마감 한 번 -> 손보기
    const sdNone = await findSeed(page, null, 2);
    await seedAt(page, 'd2_upgrade', `v.day = 2; v.time = '밤'; v.gold = 100; ${SEEDV(sdNone)}`);
    const best = await page.evaluate(() => {
      const v = VN.state.vars, gs = VN.lodging.guests.map(InnCore.guestDef), open = InnCore.roomList(v).filter((r) => r.open).map((r) => r.id);
      let top = -1, sat = 0;
      (function rec(i, cur, used) { if (i === gs.length) { let t = 0, st = 0; gs.forEach((g) => { const q = InnCore.quote(v, g, cur[g.id] || null); t += q.pay; st += q.sat; }); if (t + st * 100 > top) { top = t + st * 100; sat = st; } return; } rec(i + 1, cur, used); open.forEach((r) => { if (!used.has(r)) { cur[gs[i].id] = r; used.add(r); rec(i + 1, cur, used); used.delete(r); delete cur[gs[i].id]; } }); })(0, {}, new Set());
      return { top, sat };
    });
    chk(await page.locator('#lodge-recommend').isVisible(), '추천 배정 버튼이 안 보임');
    await page.locator('#lodge-recommend').tap(); await page.waitForTimeout(250);
    const asg = await page.evaluate(() => { const L = VN.lodging, v = VN.state.vars; let pay = 0, sat = 0; L.guests.map(InnCore.guestDef).forEach((g) => { const q = InnCore.quote(v, g, L.assign[g.id] || null); pay += q.pay; sat += q.sat; }); return { n: Object.keys(L.assign).length, pay, sat }; });
    chk(asg.n >= 1 && asg.pay + asg.sat * 100 === best.top && asg.sat === best.sat, `추천 배정이 최적이 아님 ${JSON.stringify(asg)} (최적 ${JSON.stringify(best)})`);
    chk((await page.locator('#lodge-done').innerText()).includes(`+${asg.pay}G`), '추천 배정 뒤 접수 마감 버튼의 수입이 다름');
    // 직접 고칠 수 있다: 방을 눌러 한 칸 비운다
    const firstRoom = await page.evaluate(() => Object.values(VN.lodging.assign)[0]);
    await page.locator(`.lodge-room[data-room="${firstRoom}"]`).tap();
    chk((await page.evaluate(() => Object.keys(VN.lodging.assign).length)) === asg.n - 1, '추천 배정 뒤 직접 고치지 못함');
    await page.locator('#lodge-recommend').tap(); await page.waitForTimeout(250);
    await shot(page, 'qol_01_recommend');
    chk((await shift(page)) === 0, '추천 배정 가로 스크롤');
    await page.locator('#lodge-done').tap(); await page.waitForTimeout(300);
    chk(await vis(page, 'tv-upg') && (await vars(page)).gold === 100 + asg.pay, `접수 마감 한 번으로 정산 + 손보기 이동이 안 됨 (골드 ${(await vars(page)).gold})`);
    await ctx.close();

    // 2) 지난번처럼 사기 / 추천 구매
    const r2 = await open(); const c2 = mk('장보기 편의');
    const BASE = `TavernCore.ensure(TAVERN, v); Object.keys(TAVERN.ingredients).forEach((i) => { v.tavern.stock[i] = 0; });`;
    await seedAt(r2.page, 'd2_evening', `v.day = 2; v.time = '저녁'; v.gold = 100; ${BASE}`);
    await until(r2.page, () => VN.mode === 'tavern');
    c2(await r2.page.locator('#tv-shop-last').isDisabled(), '지난 장보기 기록이 없는데 "지난번처럼 사기"가 켜져 있음');
    // 직접 사고 영업 시작 -> lastBuy 기록
    await r2.page.locator('.tv-row[data-id="ale"] .tv-buy[data-n="3"]').tap();
    await r2.page.locator('.tv-row[data-id="herb"] .tv-buy[data-n="1"]').tap();
    await r2.page.locator('#tv-shop-start').tap(); await r2.page.waitForTimeout(250);
    const lb = (await vars(r2.page)).tavern.lastBuy;
    c2(lb && lb.ale === 3 && lb.herb === 1 && Object.keys(lb).length === 2, `lastBuy 기록 이상 ${JSON.stringify(lb)}`);
    await r2.ctx.close();
    const r3 = await open(); const c3 = mk('지난번처럼');
    await seedAt(r3.page, 'd3_evening', `v.day = 3; v.time = '저녁'; v.gold = 100; ${BASE} v.tavern.lastBuy = { ale: 3, herb: 1, meat: 2 };`);
    await until(r3.page, () => VN.mode === 'tavern');
    c3(!(await r3.page.locator('#tv-shop-last').isDisabled()), '기록이 있는데 "지난번처럼 사기"가 꺼져 있음');
    const cost = await r3.page.evaluate(() => { const v = VN.state.vars; return 3 * TavernCore.price(TAVERN, v, 'ale') + 1 * TavernCore.price(TAVERN, v, 'herb') + 2 * TavernCore.price(TAVERN, v, 'meat'); });
    await shot(r3.page, 'qol_02_shop_buttons');
    await r3.page.locator('#tv-shop-last').tap(); await r3.page.waitForTimeout(250);
    const v3 = await vars(r3.page);
    c3(v3.gold === 100 - cost && v3.tavern.stock.ale === 3 && v3.tavern.stock.herb === 1 && v3.tavern.stock.meat === 2, `지난번처럼 사기 결과 이상 (골드 ${v3.gold}, 기대 ${100 - cost}, ${JSON.stringify(v3.tavern.stock)})`);
    await shot(r3.page, 'qol_03_repeat_buy');
    // 골드가 모자라면 되는 만큼만
    await r3.page.evaluate(() => { const v = VN.state.vars; v.gold = 9; Object.keys(v.tavern.stock).forEach((i) => { v.tavern.stock[i] = 0; }); VN.state.vars.tavern.lastBuy = { ale: 3, herb: 1, meat: 2 }; });
    await r3.page.locator('.tv-row[data-id="herb"] .tv-buy[data-n="1"]').tap();   // 화면 갱신(고정 골드 반영)
    const g9 = (await vars(r3.page)).gold;
    await r3.page.locator('#tv-shop-last').tap(); await r3.page.waitForTimeout(250);
    const v9 = await vars(r3.page);
    c3(v9.gold >= 0 && v9.gold < g9 && Object.values(v9.tavern.stock).reduce((a, b) => a + b, 0) >= 2, `골드 부족 시 일부만 사야 함 (${g9}->${v9.gold}, ${JSON.stringify(v9.tavern.stock)})`);
    await r3.ctx.close();
    // 추천 구매: 오늘 손님 주문을 아는 레시피로 맞추는 데 모자라는 재료만
    const r4 = await open(); const c4 = mk('추천 구매');
    await seedAt(r4.page, 'd2_evening', `v.day = 2; v.time = '저녁'; v.gold = 200; ${BASE}`);
    await until(r4.page, () => VN.mode === 'tavern');
    const plan = await r4.page.evaluate(() => { const v = VN.state.vars; const q = TavernCore.queue(TAVERN, 'day2', v, VN.evalCond); return TavernCore.suggestBuy(TAVERN, v, q, v.gold, (id) => TavernCore.price(TAVERN, v, id)); });
    c4(plan.cost > 0 && Object.keys(plan.buy).length >= 2, `추천 구매 계산이 비어 있음 ${JSON.stringify(plan)}`);
    await r4.page.locator('#tv-shop-suggest').tap(); await r4.page.waitForTimeout(250);
    const v4 = await vars(r4.page);
    c4(v4.gold === 200 - plan.cost && Object.keys(plan.buy).every((i) => v4.tavern.stock[i] === plan.buy[i]), `추천 구매 결과 이상 (골드 ${v4.gold}, 기대 ${200 - plan.cost}, ${JSON.stringify(v4.tavern.stock)} / ${JSON.stringify(plan.buy)})`);
    // 이미 충분하면 더 사지 않는다
    await r4.page.locator('#tv-shop-suggest').tap(); await r4.page.waitForTimeout(250);
    c4((await vars(r4.page)).gold === v4.gold, '추천 구매를 두 번 누르면 더 사면 안 됨');
    // 추천대로 산 재료로 모든 손님 주문을 보통 이상으로 맞출 수 있다 (알려진 레시피 기준)
    const okAll = await r4.page.evaluate(() => { const v = VN.state.vars; const q = TavernCore.queue(TAVERN, 'day2', v, VN.evalCond); const st = Object.assign({}, v.tavern.stock); let ok = 0; q.forEach((c) => { const ids = TavernCore.bestKnown(TAVERN, { tavern: { known: v.tavern.known, stock: st } }, c.who, c.order, false); if (ids) { ok++; ids.forEach((i) => { st[i]--; }); } }); return { ok, n: q.length }; });
    c4(okAll.ok === okAll.n, `추천 구매 뒤에도 만들 수 없는 주문이 있음 ${JSON.stringify(okAll)}`);
    await shot(r4.page, 'qol_04_suggest_buy');
    c4((await shift(r4.page)) === 0, '장보기 가로 스크롤');
    await r4.ctx.close();

    // 3) 설정: 살 게 없으면 손보기 건너뛰기
    for (const on of [false, true]) {
      const r5 = await open(); const c5 = mk('손보기 자동 건너뛰기');
      await r5.page.evaluate((o) => localStorage.setItem('inn_vn_v5_opt', JSON.stringify({ autoSkipUpg: o })), on);
      await r5.page.reload(); await r5.page.waitForSelector('#btn-new');
      const sd = await findSeed(r5.page, null, 2);
      await seedAt(r5.page, 'd2_upgrade', `v.day = 2; v.time = '밤'; v.gold = 0; ${SEEDV(sd)}`);
      await r5.page.locator('#lodge-recommend').tap();
      await r5.page.locator('#lodge-done').tap(); await r5.page.waitForTimeout(500);
      const m = await mode(r5.page);
      if (on) c5(!(await vis(r5.page, 'tv-upg')) && (await vars(r5.page)).day === 3 && (m === 'card' || m === 'text'), `자동 건너뛰기: 손보기 없이 다음 날로 가야 함 (day ${(await vars(r5.page)).day}, 모드 ${m})`);
      else c5(await vis(r5.page, 'tv-upg'), '설정이 꺼져 있으면 손보기 화면이 나와야 함');
      // 살 수 있는 게 있으면 켜져 있어도 손보기가 열린다
      if (on) {
        await seedAt(r5.page, 'd2_upgrade', `v.day = 2; v.time = '밤'; v.gold = 300; ${SEEDV(sd)}`);
        await r5.page.locator('#lodge-done').tap(); await r5.page.waitForTimeout(500);
        c5(await vis(r5.page, 'tv-upg'), '살 수 있는 게 있으면 자동 건너뛰기가 켜져 있어도 손보기가 열려야 함');
      }
      await r5.ctx.close();
    }

    // 4) 설정 화면의 새 토글 2개 저장/복원
    const r6 = await open(); const c6 = mk('새 설정');
    await r6.page.tap('#btn-options'); await r6.page.waitForTimeout(300);
    c6((await r6.page.locator('#opt-fasttv').count()) === 1 && (await r6.page.locator('#opt-autoupg').count()) === 1, '새 설정 토글이 없음');
    await r6.page.locator('#opt-fasttv').scrollIntoViewIfNeeded();
    await r6.page.locator('#opt-fasttv').tap(); await r6.page.locator('#opt-autoupg').tap();
    const o1 = await r6.page.evaluate(() => JSON.parse(localStorage.getItem('inn_vn_v5_opt')));
    c6(o1.fastTv === true && o1.autoSkipUpg === true, `새 설정 저장 이상 ${JSON.stringify(o1)}`);
    await shot(r6.page, 'qol_05_options');
    await r6.page.reload(); await r6.page.waitForSelector('#btn-options'); await r6.page.tap('#btn-options'); await r6.page.waitForTimeout(250);
    c6((await r6.page.locator('#opt-fasttv.on').count()) === 1 && (await r6.page.locator('#opt-autoupg.on').count()) === 1, '새 설정이 새로고침 뒤 복원되지 않음');
    c6((await shift(r6.page)) === 0, '설정 가로 스크롤');
    await r6.ctx.close();

    // 5) 영업 빠른 모드: 등장 대사 한 줄, 반응 뒤 덧붙는 대사 생략, 도장 시간 단축
    const lens = {};
    for (const fast of [false, true]) {
      const r7 = await open(); const c7 = mk('빠른 모드');
      await r7.page.evaluate((f) => localStorage.setItem('inn_vn_v5_opt', JSON.stringify({ fastTv: f })), fast);
      await r7.page.reload(); await r7.page.waitForSelector('#btn-new');
      await seedAt(r7.page, 'd1_evening', `v.day = 1; v.time = '저녁'; v.gold = 100; Object.keys(TAVERN.ingredients).forEach((i) => { TavernCore.ensure(TAVERN, v); v.tavern.stock[i] = 5; });`);
      await until(r7.page, () => VN.mode === 'tavern');
      await r7.page.locator('#tv-shop-start').tap(); await r7.page.waitForTimeout(200);
      lens[fast] = await r7.page.evaluate(() => ({ n: STORY.scenes.__tv.length, who: VN.tavern.cur }));
      await until(r7.page, () => VN.tavern && VN.tavern.phase === 'brew');
      const ids = await r7.page.evaluate(() => { const T = VN.tavern; return TavernCore.bestKnown(TAVERN, VN.state.vars, T.cur, T.order, true, true); });
      for (const id of ids) await r7.page.locator(`.tv-ing[data-id="${id}"]`).tap();
      await r7.page.locator('#tv-serve').tap(); await r7.page.waitForTimeout(250);
      lens[fast].react = await r7.page.evaluate(() => STORY.scenes.__tv.length);
      const hid = await r7.page.evaluate(() => new Promise((res) => setTimeout(() => res(document.getElementById('tv-stamp').classList.contains('hidden')), 1300)));
      lens[fast].stampHiddenAt1300 = hid;
      await r7.ctx.close();
    }
    chk(lens[true].n < lens[false].n && lens[true].n === lens[false].n - 1, `빠른 모드 첫 손님 등장 대사가 한 줄 줄어야 함 (${JSON.stringify(lens)})`);
    chk(lens[true].react < lens[false].react, `빠른 모드 반응 뒤 덧붙는 대사가 줄어야 함 (${JSON.stringify(lens)})`);
    chk(lens[true].stampHiddenAt1300 === true && lens[false].stampHiddenAt1300 === false, `빠른 모드 도장 시간이 짧아야 함 (${JSON.stringify(lens)})`);
    report.push('영업 편의: 추천 배정(최적 수입·만족, 직접 수정 가능) + 접수 마감 한 번에 정산·이동 / 지난번처럼 사기(기록, 골드 한도) / 추천 구매(부족분만, 두 번째는 0, 모든 주문 가능) / 손보기 자동 건너뛰기(살 게 없을 때만) / 새 설정 토글 저장·복원 / 빠른 모드(대사 -1줄, 덧붙임 생략, 도장 단축)');
  }

  // ================= 저장 형식 v5 / 옛 세이브 =================
  {
    const chk = mk('저장 v5');
    const { ctx, page } = await open();
    // v3 세이브는 읽지 않는다 (이어하기 꺼짐), 회차 공통 기록은 v4 로 한 번 옮겨 온다
    await ctx.close();
    const { ctx: c2, page: p2 } = await (async () => {
      const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await ctx2.addInitScript(() => {
        if (!sessionStorage.getItem('planted')) {
          sessionStorage.setItem('planted', '1');
          const snap = { scene: 'd1_open', pc: 0, vars: { gold: 80 }, bg: null, sprites: {}, log: [] };
          localStorage.setItem('inn_vn_v4_auto', JSON.stringify({ v: 4, t: 1, snap }));
          localStorage.setItem('inn_vn_v4_s1', JSON.stringify({ v: 4, t: 1, snap }));
          localStorage.setItem('inn_vn_v4_endings', JSON.stringify({ erion: 111 }));
          localStorage.setItem('inn_vn_v4_cg', JSON.stringify({ erion_cave: 111 }));
          localStorage.setItem('inn_vn_v4_read', JSON.stringify({ d1_open: [0, 1] }));
          localStorage.setItem('inn_vn_v4_tut', '1');
        }
      });
      const pg = await ctx2.newPage(); pg.setDefaultTimeout(8000);
      pg.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`[저장 v5] console.${m.type()}: ${m.text()}`); });
      pg.on('pageerror', (e) => problems.push(`[저장 v5] pageerror: ${e.message}`));
      return { ctx: ctx2, page: pg };
    })();
    await p2.goto(URL); await p2.waitForSelector('#btn-new');
    chk(await p2.locator('#btn-continue').isDisabled() && await p2.locator('#btn-title-load').isDisabled(), 'v4 세이브가 있는데 이어하기/불러오기가 켜져 있음 (옛 세이브는 무시해야 함)');
    const mig = await p2.evaluate(() => ({ e: Object.keys(VN.endings), c: Object.keys(VN.cgSeen), tut: VN.tut.done, m: localStorage.getItem('inn_vn_v5_migrated'), read: localStorage.getItem('inn_vn_v5_read') }));
    chk(mig.e.join() === 'erion' && mig.c.join() === 'erion_cave' && mig.tut && mig.m === '1' && mig.read === null, `v4 -> v5 기록 이전 이상(읽은 대사 기록은 옮기지 않음) ${JSON.stringify(mig)}`);
    chk((await p2.locator('#btn-endings').innerText()).includes('1/8'), '이전된 엔딩이 타이틀에 안 보임');
    // 새 게임에 새 변수들이 들어 있다
    await p2.tap('#btn-new'); await p2.waitForTimeout(300);
    const nv = await p2.evaluate(() => { const v = VN.state.vars; return { lodge: !!v.lodge, inn: v.inn, nev: !!v.nev, gift: !!v.gift, riv: !!v.riv, key: Object.keys(localStorage).filter((k) => k.startsWith('inn_vn_v5_')).length > 0 }; });
    chk(nv.lodge && nv.inn.rank === 1 && nv.nev && nv.gift && nv.riv && nv.key, `새 게임 변수 이상 ${JSON.stringify(nv)}`);
    await c2.close();
    report.push('저장 v5: v4 세이브/자동 저장은 무시(이어하기·불러오기 꺼짐), 엔딩/CG/튜토리얼 기록은 v5 로 1회 이전(읽은 대사 기록은 제외), 새 게임 변수(lodge/inn/nev/gift/riv) 초기화');
  }
  return T.ok;
}

// 호감도는 줄지 않고 2 초과로 늘지 않는다 (밤 사건 규칙)
function HEROINES_OK(before, after) {
  return ['erion', 'kaela', 'miho', 'lia'].every((h) => after.aff[h] - before.aff[h] >= 0 && after.aff[h] - before.aff[h] <= 2);
}

module.exports = { run };

if (require.main === module) {
  (async () => {
    const SHOTS = process.argv[2] || '/home/user/inn-vn-shots8';
    require('fs').mkdirSync(SHOTS, { recursive: true });
    const browser = await chromium.launch();
    const problems = [], report = [];
    const n = await run(browser, problems, report, SHOTS);
    await browser.close();
    report.forEach((r) => console.log(r));
    problems.forEach((p) => console.log('문제:', p));
    console.log(problems.length ? `실패: 문제 ${problems.length}건 (검사 ${n}개)` : `통과: 여관 운영 확장 검사 ${n}개, 콘솔 error/warning 0건`);
    process.exit(problems.length ? 1 : 0);
  })().catch((e) => { console.error(e); process.exit(2); });
}
