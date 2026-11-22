// 자동 플레이 테스트 (Playwright, 모바일 390x844)
//   python3 -m http.server 8765 &   # 먼저 서버를 띄운 뒤
//   node tools/test-play.js [스크린샷 폴더]      (기본 /home/user/inn-vn-shots3)
// 검증 항목
//  (a) 히로인 4명 각각의 엔딩을 노리는 전략 플레이 (실제 터치 탭, 표정 shy 스크린샷 수집)
//  (b) 노멀 / 배드 엔딩 전략 플레이
//  (c) 무작위 플레이 여러 회 (서로 다른 시드)
//  (d) 엔딩 6종을 한 브라우저에서 연속 달성 -> 타이틀 "엔딩 목록" 6/6 확인
//  (e) 저장/불러오기/이어하기, 옛 세이브·깨진 세이브가 있어도 타이틀이 정상인지
//  (f) 저녁 영업 UI: 장보기 / 재료 선택·비우기·4번째 재료 막힘 / 메뉴판 / 내기 / 정중히 거절 / 결산 / 업그레이드를 실제 탭으로
//  (g) 영업 중 저장 -> 영업 시작 시점으로 되돌아가는지, 세이브 키 v3
// 모든 플레이에서 콘솔 error/warning 0, 가로 스크롤 0 이어야 통과.
// 영업은 페이지 안의 __tvPlan() 이 "다음에 누를 버튼"을 알려 주고 (정답 찾기/무작위 모델), 빠른 모드는 click(), 실제 모드는 tap 으로 누른다.
const { chromium } = require('playwright');
const fs = require('fs');
const URL = process.env.URL || 'http://localhost:8765/index.html';
const SHOTS = process.argv[2] || '/home/user/inn-vn-shots3';
fs.mkdirSync(SHOTS, { recursive: true });
const HEROINES = ['erion', 'kaela', 'miho', 'lia'];
const NAMES = { erion: '에리온', kaela: '카엘라', miho: '미호', lia: '리아' };

function makeRng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }

// ---------- 전략: (options, vars) -> options 안의 index ----------
// options: [{idx, text, set, who, cost}] (골드가 모자란 유료 선택지는 이미 제외됨)
const sc = (o, who) => ((o.set && o.set['aff.' + who]) || 0) * 10 + (o.who === who ? 5 : 0) + ((o.set && o.set.rep) || 0) * 2 - (o.cost || 0) * 0.05;
const argmax = (opts, f) => { let b = 0, bs = -1e9; opts.forEach((o, i) => { const s = f(o); if (s > bs) { bs = s; b = i; } }); return b; };
const S = {
  focus: (h) => (opts) => argmax(opts, (o) => sc(o, h)),
  bad: () => (opts) => argmax(opts, (o) => -((o.set && o.set.rep) || 0) * 10 - (o.cost || 0) * 0.01),
  even: () => (opts, v) => {
    const min = Math.min(...Object.values(v.aff));
    return argmax(opts, (o) => { let s = ((o.set && o.set.rep) || 0) * 3 - (o.cost || 0) * 0.02; HEROINES.forEach((h) => { if (v.aff[h] === min && o.who === h) s += 6; if (v.aff[h] > 4 && o.set && o.set['aff.' + h] > 0) s -= 8; }); return s; });
  },
  random: (seed) => { const r = makeRng(seed); return (opts) => Math.floor(r() * opts.length); },
  // 좋아하는 히로인이 있는 보통 플레이어: 절반은 그 사람, 나머지는 무작위
  fan: (h, seed) => { const r = makeRng(seed); return (opts) => (r() < 0.55 ? argmax(opts, (o) => sc(o, h)) : Math.floor(r() * opts.length)); }
};


// ---------- 영업 드라이버: 페이지 안에서 "다음에 누를 버튼 선택자"를 계산 ----------
//  pol: { stock(재료별 목표 재고), reserve(남겨 둘 골드), keep(업그레이드 후 남길 골드), buy(살 업그레이드 순서), right(주문을 맞히려 할 확률), fav(최애 레시피를 알고 있을 확률), seed }
const POL = {
  expert: { stock: 3, reserve: 5, keep: 12, buy: ['sign', 'barrel', 'stove', 'shelf'], right: 1, fav: 1 },
  decent: { stock: 3, reserve: 10, keep: 15, buy: ['sign', 'barrel', 'shelf', 'stove'], right: 0.7, fav: 0.5 },
  novice: { stock: 2, reserve: 10, keep: 15, buy: ['barrel', 'sign'], right: 0.35, fav: 0 },
  lazy: { stock: 2, reserve: 20, keep: 20, buy: [], right: 0, fav: 0 }
};
const DRIVER = () => {
  window.__tvInit = (pol) => {
    let s = pol.seed || 1;
    window.__tvRnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
    window.__tvPol = pol; window.__tvPlanned = {};
  };
  window.__tvPlan = () => {
    const P = window.__tvPol, R = window.__tvRnd;
    const vis = (id) => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); };
    if (vis('confirm')) return '#confirm-yes';
    if (vis('tv-menu')) return '#tv-board-close';
    if (vis('tv-found')) return '#tv-found-btn';
    const v = VN.state.vars, t = v.tavern, T = VN.tavern;
    if (vis('tv-upg')) {
      for (const id of P.buy) {
        const u = TAVERN.upgrades.find((x) => x.id === id);
        if (u && !t.upg[id] && v.gold - u.price >= P.keep) return `.tv-upg-card[data-id="${id}"] .tv-upg-buy`;
      }
      return '#tv-upg-next';
    }
    if (vis('tv-shop')) {
      const ids = Object.keys(TAVERN.ingredients).sort((a, b) => TAVERN.ingredients[a].price - TAVERN.ingredients[b].price);
      for (const id of ids) if ((t.stock[id] || 0) < P.stock && v.gold - TAVERN.ingredients[id].price >= P.reserve) return `.tv-row[data-id="${id}"] .tv-buy[data-n="1"]`;
      return '#tv-shop-start';
    }
    if (vis('tv-sum')) return '#tv-sum-btn';
    if (T && T.phase === 'brew' && vis('tv-brew')) {
      const key = v.day + ':' + T.idx;
      if (!window.__tvPlanned[key]) {
        const have = Object.keys(TAVERN.ingredients).filter((i) => (t.stock[i] || 0) > 0);
        const rk = () => { const ok = Object.keys(TAVERN.recipes).filter((id) => t.known[id] && TAVERN.recipes[id].ing.every((i) => (t.stock[i] || 0) > 0)); return ok.length ? TAVERN.recipes[ok[Math.floor(R() * ok.length)]].ing.slice() : null; };
        const ri = (n) => { if (have.length < 2) return null; const p = []; while (p.length < Math.min(n, have.length)) { const i = have[Math.floor(R() * have.length)]; if (!p.includes(i)) p.push(i); } return p; };
        let ids = null;
        if (R() < P.right) ids = TavernCore.bestKnown(TAVERN, v, T.cur, T.order, R() < P.fav);
        if (!ids) ids = R() < 0.6 ? rk() : ri(2 + Math.floor(R() * 2));
        window.__tvPlanned[key] = ids || 'skip';
      }
      const plan = window.__tvPlanned[key];
      if (plan === 'skip') return '#tv-skip';
      for (const id of plan) if (!T.sel.includes(id)) return `.tv-ing[data-id="${id}"]`;
      return '#tv-serve';
    }
    return null;
  };
};
const initDriver = async (page, pol) => { await page.evaluate(`(${DRIVER.toString()})()`); await page.evaluate((p) => window.__tvInit(p), pol); };

async function newPage(browser, problems, label) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`[${label}] console.${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`[${label}] pageerror: ${e.message}`));
  return { ctx, page };
}

const stateOf = (page) => page.evaluate(() => {
  const s = VN.state;
  return {
    shift: document.getElementById('app').scrollLeft + document.getElementById('game').scrollLeft + window.scrollX, // 화면이 가로로 밀리면 안 됨
    mode: VN.mode, scene: s && s.scene, day: s && s.vars.day, vars: s && JSON.parse(JSON.stringify(s.vars)),
    tv: VN.tavern, sprites: s && JSON.parse(JSON.stringify(s.sprites)), done: document.getElementById('next-mark').classList.contains('on'),
    opts: VN.options.map((o, i) => ({ idx: i, text: o.text, set: o.set, who: o.who, cost: o.cost }))
  };
});
// 페이지 안에서 선택지/엔딩/타이틀이 나올 때까지 탭(클릭) 반복 — 빠른 모드
const fastForward = (page, stopAtTavern) => page.evaluate((stop) => {
  const g = document.getElementById('game');
  for (let i = 0; i < 9000; i++) {
    const m = VN.mode;
    if (m === 'choice' || m === 'ending' || m === 'title' || m === 'summary') return m;
    if (m === 'tavern') {
      if (stop) return 'tavern';
      const sel = window.__tvPlan();
      const el = sel && document.querySelector(sel);
      if (!el || el.disabled) return 'stuck';
      el.click(); continue;
    }
    g.click();
  }
  return 'stuck';
}, !!stopAtTavern);


// 영업 스크린샷 훅: 화면이 막 바뀐 순간에 한 번씩
async function tavernShots(page, st, sel, got, shot, prefix) {
  const vis = (id) => page.evaluate((i) => !document.getElementById(i).classList.contains('hidden'), id);
  const once = async (key, name, wait) => { if (got[key]) return; got[key] = 1; await page.waitForTimeout(wait || 350); await shot(name); };
  if (await vis('tv-shop')) { if (st.day === 1) await once('shop1', 'tv_04_shop'); }
  else if (await vis('tv-found')) await once('found', 'tv_07_found', 600);
  else if (await vis('tv-brew')) {
    const sels = st.tv.sel.length;
    if (st.day === 1 && sels === 0) await once('order1', 'tv_01_order');
    if (st.day === 1 && sel === '#tv-serve') await once('picking1', 'tv_02_picking');
    if (st.day === 3 && sels === 0 && !got.board) { // 메뉴판 열어서 스크린샷
      got.board = 1;
      await page.locator('#tv-board').tap(); await page.waitForTimeout(400); await shot('tv_05_menu');
      await page.locator('#tv-board-close').tap(); await page.waitForTimeout(150);
    }
  } else if (await vis('tv-sum')) { if (st.day === 3) await once('sum3', 'tv_06_summary'); }
  else if (await vis('tv-upg')) { if (st.day === 2) await once('upg2', 'tv_08_upgrade'); }
}
async function reactShots(page, st, o, got, shot) {
  const last = st.tv.results[st.tv.results.length - 1];
  if (!last) return;
  const stamp = await page.evaluate(() => { const e = document.getElementById('tv-stamp'); return e && !e.classList.contains('hidden') ? e.className : ''; });
  if (o.shots.tavern && last.result === 'perfect' && !last.fav && !got.perfect && stamp.includes('r-perfect')) { got.perfect = 1; await page.waitForTimeout(650); await shot('tv_03_perfect'); }
  if (last.fav) {
    const key = 'fav_' + last.who + '_' + st.day;
    if (st.done) { got[key] = (got[key] || 0) + 1; }
    if (got[key] === 2 && !got['shotfav_' + last.who]) { got['shotfav_' + last.who] = 1; await page.waitForTimeout(300); await shot(`tv_09_fav_${last.who}`); }
  }
}


// 첫 영업(장보기 화면)이 열릴 때까지 낮 선택은 첫 선택지로 진행 (이미 열려 있으면 바로 반환)
async function toTavern(page) {
  for (let i = 0; i < 60; i++) {
    const m = await fastForward(page, true);
    if (m === 'tavern') return;
    if (m === 'choice') { await page.locator('.choice-btn').first().evaluate((b) => b.click()); continue; }
    throw new Error('영업까지 가지 못함: ' + m);
  }
}

// 한 회차를 끝까지 플레이한다. opts: {label, choose, real, shots:{prefix, heroine}}
async function playRun(page, opts, problems) {
  const o = Object.assign({ real: false, shots: null }, opts);
  const shot = async (name) => { if (o.shots) await page.screenshot({ path: `${SHOTS}/${name}.png` }); };
  const got = {};
  const picks = [];
  let ending = null, guard = 0;
  await initDriver(page, o.pol || Object.assign({ seed: 7 }, POL.decent));
  while (guard++ < 5000) {
    let st;
    if (!o.real) {
      const m = await fastForward(page);
      if (m === 'stuck') { problems.push(`[${o.label}] 진행이 멈춤`); break; }
      st = await stateOf(page);
    } else {
      st = await stateOf(page);
    }
    if (st.shift && !got.shiftWarn) { problems.push(`[${o.label}] 화면이 가로로 ${st.shift}px 밀림 (${st.scene})`); got.shiftWarn = 1; }
    if (st.mode === 'ending') break;
    if (st.mode === 'title' || st.mode === 'summary') { problems.push(`[${o.label}] 예상치 못한 화면 ${st.mode} (씬 ${st.scene})`); break; }
    if (st.mode === 'tavern') {
      // 실제 탭으로 영업 진행 (+ 스크린샷)
      const sel = await page.evaluate(() => window.__tvPlan());
      if (!sel) { problems.push(`[${o.label}] 영업 중 누를 버튼이 없음 (${st.tv && st.tv.phase})`); break; }
      if (o.shots && o.shots.tavern) await tavernShots(page, st, sel, got, shot, o.shots.prefix);
      await page.locator(sel).first().tap();
      await page.waitForTimeout(25);
      continue;
    }
    if (st.mode === 'choice') {
      const afford = st.opts.filter((x) => !x.cost || x.cost <= st.vars.gold);
      if (!afford.length) { problems.push(`[${o.label}] 고를 수 있는 선택지가 없음 (${st.scene})`); break; }
      const k = afford[o.choose(afford, st.vars)];
      if (o.shots && st.scene === 'pick' && st.day === 2 && !got.pick) { await page.waitForTimeout(450); await shot(o.shots.prefix + '_pick_day2'); got.pick = 1; }
      if (o.shots && st.scene === 'pick' && st.day === 1 && !got.pick1) { await page.waitForTimeout(450); await shot(o.shots.prefix + '_pick_day1'); got.pick1 = 1; }
      picks.push(`${st.scene}:${k.idx + 1}/${st.opts.length}`);
      const btn = page.locator('.choice-btn').nth(k.idx);
      if (o.real) await btn.tap(); else await btn.evaluate((b) => b.click());
      if (o.shots && !got.heart && k.set && Object.keys(k.set).some((x) => /^aff\./.test(x) && k.set[x] > 0) && st.day === 1) {
        await page.waitForTimeout(350); await shot(o.shots.prefix + '_heart_fx'); got.heart = 1;
      }
      continue;
    }
    // 대사/카드: 실제 탭
    if (o.real) {
      if (st.mode === 'card') {
        if (o.shots && !got['card' + st.day] && (st.day === 1 || st.day === 3 || st.day === 5)) { await page.waitForTimeout(1000); await shot(o.shots.prefix + '_daycard_' + st.day); got['card' + st.day] = 1; }
      } else if (st.mode === 'text') {
        if (o.shots && st.tv && st.tv.phase === 'react') await reactShots(page, st, o, got, shot);
        if (!st.done) { await page.touchscreen.tap(195, 300); await page.waitForTimeout(40); continue; } // 첫 탭: 타이핑 완성
        // 이 줄이 완성된 상태: 해당 히로인의 shy 표정을 스크린샷
        if (o.shots && o.shots.heroine && !got.shy) {
          const sp = Object.values(st.sprites).find((s) => s && s.id === o.shots.heroine && s.face === 'shy');
          if (sp) { await page.waitForTimeout(350); await shot(`heroine_${o.shots.heroine}_shy`); got.shy = 1; }
        }
        if (o.shots && o.shots.heroine && !got.dlg) {
          const sp = Object.values(st.sprites).find((s) => s && s.id === o.shots.heroine);
          if (sp && sp.face === 'smile') { await page.waitForTimeout(250); await shot(`heroine_${o.shots.heroine}_smile`); got.dlg = 1; }
        }
      }
      await page.touchscreen.tap(195, 300);
      await page.waitForTimeout(6);
    }
  }
  const fin = await stateOf(page);
  if (fin.mode !== 'ending') problems.push(`[${o.label}] 엔딩에 도달하지 못함 (모드 ${fin.mode}, 씬 ${fin.scene})`);
  await page.waitForTimeout(150);
  const endingId = await page.evaluate(() => { const e = VN.endings; return Object.keys(e); });
  return { label: o.label, fin, picks: picks.length, endings: endingId, got };
}

// 방금 달성한 엔딩 id (씬 이름에서 유추: end_<id>)
const lastEnding = (fin) => (fin.scene || '').replace(/^end_/, '');

async function main() {
  const browser = await chromium.launch();
  const problems = [];
  const report = [];
  const t0 = Date.now();

  // ---------- 타이틀 / 엔딩 목록(빈 상태) / 첫 화면 스크린샷 ----------
  {
    const { ctx, page } = await newPage(browser, problems, 'title');
    await page.goto(URL); await page.waitForSelector('#btn-new');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOTS}/01_title.png` });
    if (!(await page.locator('#btn-continue').isDisabled())) problems.push('[title] 새 브라우저인데 이어하기가 켜져 있음');
    const castN = await page.locator('#title-cast img').count();
    if (castN !== 4) problems.push(`[title] 히로인 소개 이미지 ${castN}개 (4개여야 함)`);
    await page.tap('#btn-endings'); await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}/02_ending_list_empty.png` });
    const q = await page.locator('.end-row').count(), got = await page.locator('.end-row.got').count();
    if (q !== 6 || got !== 0) problems.push(`[title] 엔딩 목록 행 ${q}, 획득 ${got} (6/0 이어야 함)`);
    report.push(`타이틀: 히로인 이미지 ${castN}개, 엔딩 목록 ${q}행 (획득 ${got})`);
    await ctx.close();
  }

  // ---------- (a)(b)(c) 병렬 플레이 ----------
  const jobs = [];
  HEROINES.forEach((h) => jobs.push({ label: `집중-${h}`, choose: S.focus(h), real: true, pol: Object.assign({ seed: 11 }, POL.expert), shots: { prefix: `run_${h}`, heroine: h, tavern: h === 'lia' }, expect: h }));
  jobs.push({ label: '노멀(균등)', choose: S.even(), real: false, pol: Object.assign({ seed: 3 }, POL.decent), expect: 'normal' });
  jobs.push({ label: '배드(평판 최저)', choose: S.bad(), real: false, pol: Object.assign({ seed: 4 }, POL.novice), expect: 'bad' });
  const PN = Object.keys(POL);
  for (let i = 0; i < 16; i++) jobs.push({ label: `무작위#${100 + i}`, choose: S.random(100 + i), real: false, pol: Object.assign({ seed: 100 + i }, POL[PN[i % 4]]), expect: null });
  HEROINES.forEach((h, i) => { for (let k = 0; k < 3; k++) jobs.push({ label: `팬-${h}#${k}`, choose: S.fan(h, 500 + i * 10 + k), real: false, pol: Object.assign({ seed: 600 + k }, POL[PN[(i + k) % 4]]), expect: null }); });
  const results = [];
  const BATCH = 6;
  for (let i = 0; i < jobs.length; i += BATCH) {
    await Promise.all(jobs.slice(i, i + BATCH).map(async (j) => {
      const { ctx, page } = await newPage(browser, problems, j.label);
      await page.goto(URL); await page.waitForSelector('#btn-new');
      await page.tap('#btn-new');
      const r = await playRun(page, j, problems);
      r.ending = lastEnding(r.fin);
      r.expect = j.expect;
      // 엔딩 기록이 localStorage 에 남았는지
      if (!r.endings.includes(r.ending)) problems.push(`[${j.label}] 엔딩 기록(localStorage)에 ${r.ending} 없음: ${JSON.stringify(r.endings)}`);
      if (j.expect && r.ending !== j.expect) problems.push(`[${j.label}] 기대한 엔딩 ${j.expect} 인데 ${r.ending}`);
      if (j.shots && j.shots.heroine === undefined) {}
      r.vars = r.fin.vars;
      // 엔딩 화면 스크린샷
      if (j.shots) { await page.waitForTimeout(300); await page.screenshot({ path: `${SHOTS}/ending_${r.ending}_from_${j.shots.prefix}.png` }); }
      results.push(r);
      await ctx.close();
    }));
  }
  const dist = {};
  results.forEach((r) => { dist[r.ending] = (dist[r.ending] || 0) + 1; });
  results.forEach((r) => console.log(`[${r.label}] 선택 ${r.picks}회 -> 엔딩 ${r.ending} / 골드 ${r.vars.gold} 평판 ${r.vars.rep} 호감도 ${JSON.stringify(r.vars.aff)}`));
  report.push(`플레이 ${results.length}회 엔딩 분포 ${JSON.stringify(dist)}`);

  // ---------- (d) 엔딩 6종 연속 달성 -> 엔딩 목록 ----------
  {
    const { ctx, page } = await newPage(browser, problems, '컬렉션');
    await page.goto(URL); await page.waitForSelector('#btn-new');
    const order = [['erion', S.focus('erion')], ['kaela', S.focus('kaela')], ['miho', S.focus('miho')], ['lia', S.focus('lia')], ['normal', S.even()], ['bad', S.bad()]];
    for (let i = 0; i < order.length; i++) {
      await page.tap('#btn-new');
      const r = await playRun(page, { label: `컬렉션-${order[i][0]}`, choose: order[i][1], real: false, pol: Object.assign({ seed: 20 + i }, i < 4 ? POL.expert : i === 4 ? POL.decent : POL.novice) }, problems);
      const e = lastEnding(r.fin);
      if (e !== order[i][0]) problems.push(`[컬렉션] ${order[i][0]} 기대, 실제 ${e}`);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${SHOTS}/ending_${e}.png` });
      const label = await page.locator('#ending-label').innerText();
      const isNew = await page.locator('#ending-new').isVisible();
      if (!isNew) problems.push(`[컬렉션] ${e} 첫 달성인데 NEW 표시가 없음`);
      const cnt = await page.locator('#ending-count').innerText();
      if (!cnt.includes(`${i + 1} / 6`)) problems.push(`[컬렉션] 엔딩 카운트 표시 이상: ${cnt}`);
      await page.tap('#ending-btn'); await page.waitForTimeout(150);
      if (i === 1) { await page.tap('#btn-endings'); await page.waitForTimeout(300); await page.screenshot({ path: `${SHOTS}/ending_list_partial.png` }); await page.tap('#endings-close'); }
      report.push(`컬렉션 ${i + 1}/6: ${e} (${label.trim()}, ${cnt.trim()})`);
    }
    await page.tap('#btn-endings'); await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}/ending_list_full.png` });
    const got = await page.locator('.end-row.got').count();
    const unk = await page.locator('.end-row:not(.got)').count();
    if (got !== 6 || unk !== 0) problems.push(`[컬렉션] 최종 목록 획득 ${got}/미획득 ${unk}`);
    const btnText = await (async () => { await page.tap('#endings-close'); return page.locator('#btn-endings').innerText(); })();
    if (!btnText.includes('6/6')) problems.push(`[컬렉션] 타이틀 버튼 문구: ${btnText}`);
    // 새로고침해도 엔딩 기록 유지
    await page.reload(); await page.waitForSelector('#btn-endings');
    const after = await page.locator('#btn-endings').innerText();
    if (!after.includes('6/6')) problems.push(`[컬렉션] 새로고침 후 엔딩 기록 유실: ${after}`);
    report.push(`엔딩 목록: 획득 ${got}/6, 미획득 ${unk}, 새로고침 후 "${after.trim()}"`);
    await ctx.close();
  }

  // ---------- (e) 저장 / 불러오기 / 이어하기 / 옛 세이브 ----------
  {
    const { ctx, page } = await newPage(browser, problems, '세이브');
    await page.goto(URL); await page.waitForSelector('#btn-new');
    // 옛 세이브(v1/v2 키)와 깨진 v3 세이브를 미리 심어 둔다 -> 타이틀이 깨지면 안 됨
    await page.evaluate(() => {
      localStorage.setItem('inn_vn_v1_auto', JSON.stringify({ t: 1, snap: { scene: 'd1_kael_enter', pc: 0, vars: {} } }));
      localStorage.setItem('inn_vn_v2_auto', JSON.stringify({ v: 2, t: 1, snap: { scene: 'd1_open', pc: 0, vars: {} } })); // v2 세이브는 키가 달라 무시됨
      localStorage.setItem('inn_vn_v3_s1', '{깨진 json');
      localStorage.setItem('inn_vn_v3_s2', JSON.stringify({ t: 1, snap: { scene: 'd1_open', pc: 0, vars: {} } })); // v 필드 없음
      localStorage.setItem('inn_vn_v3_s3', JSON.stringify({ v: 3, t: 1, snap: { scene: '없는씬', pc: 0, vars: {} } }));
    });
    await page.reload(); await page.waitForSelector('#btn-new');
    if (!(await page.locator('#btn-continue').isDisabled())) problems.push('[세이브] 옛/깨진 세이브인데 이어하기가 켜져 있음');
    if (!(await page.locator('#btn-title-load').isDisabled())) problems.push('[세이브] 옛/깨진 세이브인데 불러오기가 켜져 있음');
    report.push('옛 세이브(v1/v2 키)/깨진 세이브/없는 씬 세이브: 모두 무시되고 타이틀 정상');
    await page.tap('#btn-new');
    const hud = await page.locator('#hud-day').innerText();
    if (!hud.includes('1일차')) problems.push('[세이브] HUD 일차 표시 이상: ' + hud);
    // 카드 -> 몇 줄 진행
    for (let i = 0; i < 9; i++) { await page.touchscreen.tap(195, 300); await page.waitForTimeout(30); }
    const before = await page.evaluate(() => ({ scene: VN.state.scene, pc: VN.state.pc, vars: VN.state.vars }));
    await page.tap('#menu-btn'); await page.waitForTimeout(100);
    await page.screenshot({ path: `${SHOTS}/menu.png` });
    await page.tap('#menu-save'); await page.waitForTimeout(100);
    await page.locator('.slot-btn').nth(0).tap(); await page.waitForTimeout(100);
    await page.screenshot({ path: `${SHOTS}/save_slots.png` });
    await page.tap('#slots-close');
    const raw = await page.evaluate(() => localStorage.getItem('inn_vn_v3_s1'));
    if (!raw || JSON.parse(raw).v !== 3) problems.push('[세이브] 슬롯1 저장 형식 이상');
    for (let i = 0; i < 14; i++) { await page.touchscreen.tap(195, 300); await page.waitForTimeout(30); }
    const mid = await page.evaluate(() => ({ scene: VN.state.scene, pc: VN.state.pc }));
    await page.tap('#menu-btn'); await page.tap('#menu-log'); await page.waitForTimeout(100);
    const logN = await page.locator('.log-item').count();
    await page.tap('#backlog-close');
    await page.tap('#menu-btn'); await page.tap('#menu-load'); await page.waitForTimeout(100);
    await page.locator('.slot-btn').nth(1).tap(); await page.waitForTimeout(200);
    const after = await page.evaluate(() => ({ scene: VN.state.scene, pc: VN.state.pc, vars: VN.state.vars }));
    if (before.scene !== after.scene || before.pc !== after.pc || JSON.stringify(before.vars) !== JSON.stringify(after.vars)) problems.push('[세이브] 로드 후 상태 불일치 ' + JSON.stringify({ before, after }));
    await page.reload(); await page.waitForSelector('#btn-continue');
    if (await page.locator('#btn-continue').isDisabled()) problems.push('[세이브] 새로고침 후 이어하기 불가');
    await page.tap('#btn-continue'); await page.waitForTimeout(200);
    const cont = await page.evaluate(() => VN.state.scene);
    // 서비스 워커 / 매니페스트
    const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!r; });
    const keys = await page.evaluate(async () => (await caches.keys()));
    report.push(`저장/불러오기: ${before.scene}@${before.pc} 저장 -> ${mid.scene}@${mid.pc} 진행 후 로드 -> ${after.scene}@${after.pc} 일치, 백로그 ${logN}줄, 이어하기 씬 ${cont}, 서비스워커 ${sw}, 캐시 ${JSON.stringify(keys)}`);
    await ctx.close();
  }


  // ---------- (f) 저녁 영업 UI: 실제 탭으로 ----------
  {
    const { ctx, page } = await newPage(browser, problems, '영업UI');
    const chk = (cond, msg) => { if (!cond) problems.push('[영업UI] ' + msg); };
    const vars = () => page.evaluate(() => JSON.parse(JSON.stringify(VN.state.vars)));
    const vis = (id) => page.evaluate((i) => !document.getElementById(i).classList.contains('hidden'), id);
    const tv = () => page.evaluate(() => VN.tavern);
    await page.goto(URL); await page.waitForSelector('#btn-new');
    await initDriver(page, Object.assign({ seed: 5 }, POL.expert));
    await page.tap('#btn-new');
    await toTavern(page);
    chk(await vis('tv-shop'), '장보기 화면이 먼저 떠야 함');
    // 장보기
    let v0 = await vars();
    await page.locator('.tv-row[data-id="ale"] .tv-buy[data-n="3"]').tap();
    let v1 = await vars();
    chk(v1.gold === v0.gold - 12 && v1.tavern.stock.ale === v0.tavern.stock.ale + 3, `장보기 +3 에일: 골드 ${v0.gold}->${v1.gold}, 재고 ${v0.tavern.stock.ale}->${v1.tavern.stock.ale}`);
    chk((await page.locator('#hud-gold').innerText()).includes(String(v1.gold)), 'HUD 골드가 장보기를 반영하지 않음');
    // 메뉴판 (장보기 화면에서)
    await page.locator('#tv-shop-board').tap(); await page.waitForTimeout(200);
    chk(await vis('tv-menu'), '메뉴판이 열리지 않음');
    const rows = await page.locator('#tv-board-list .tv-recipe').count(), unk = await page.locator('#tv-board-list .tv-recipe.unk').count();
    chk(rows === 15 && unk === 10, `메뉴판 행 ${rows}, 미발견 ${unk} (15/10 이어야 함)`);
    await page.locator('#tv-board-close').tap(); await page.waitForTimeout(100);
    await page.locator('#tv-shop-start').tap();
    // 첫 손님 대사 -> 재료 고르기
    for (let i = 0; i < 40 && (await tv()).phase !== 'brew'; i++) { await page.touchscreen.tap(195, 300); await page.waitForTimeout(40); }
    chk((await tv()).phase === 'brew' && await vis('tv-brew'), '재료 고르기 화면에 도달하지 못함');
    chk((await page.locator('.tv-ing').count()) === 8, '재료 버튼이 8개가 아님');
    const bigBtn = await page.locator('.tv-ing').first().boundingBox();
    chk(bigBtn && bigBtn.width >= 44 && bigBtn.height >= 44, `재료 버튼이 터치하기에 작음 ${JSON.stringify(bigBtn)}`);
    // 선택/해제/최대 3개/비우기
    const tap = (id) => page.locator(`.tv-ing[data-id="${id}"]`).tap();
    await tap('ale'); await tap('bread'); await tap('herb');
    chk((await tv()).sel.length === 3, '재료 3개 선택 실패');
    await tap('meat'); chk((await tv()).sel.length === 3, '4번째 재료가 선택됨');
    await tap('ale'); chk((await tv()).sel.join() === 'bread,herb', '재료 다시 눌러 해제 실패');
    await page.locator('.tv-slot.on').first().tap(); chk((await tv()).sel.join() === 'herb', '슬롯을 눌러 빼기 실패');
    await page.locator('#tv-clear').tap(); chk((await tv()).sel.length === 0, '비우기 실패');
    chk(await page.locator('#tv-serve').isDisabled(), '재료가 없는데 내기 버튼이 켜져 있음');
    // 메뉴판에서 레시피를 눌러 채우기
    await page.locator('#tv-board').tap(); await page.waitForTimeout(150);
    await page.locator('#tv-board-list .tv-recipe.use').first().tap(); await page.waitForTimeout(150);
    const filled = (await tv()).sel.length;
    chk(filled >= 2 && !(await vis('tv-menu')), `메뉴판 레시피로 채우기 실패 (sel ${filled})`);
    // 내기 (아는 레시피) -> 판정
    const stockBefore = (await vars()).tavern.stock, selIds = (await tv()).sel;
    await page.locator('#tv-serve').tap(); await page.waitForTimeout(150);
    let t1 = await tv();
    chk(t1.results.length === 1 && ['perfect', 'good', 'fail'].includes(t1.results[0].result), `내기 결과 이상 ${JSON.stringify(t1.results)}`);
    const stockAfter = (await vars()).tavern.stock;
    chk(selIds.every((i) => stockAfter[i] === stockBefore[i] - 1), '재료 재고가 줄지 않음');
    chk((await page.evaluate(() => VN.mode)) === 'text', '반응 대사 모드로 가지 않음');
    // 다음 손님 -> 아직 모르는 레시피 조합(발견 연출)
    const toBrew = async () => { for (let i = 0; i < 50 && (await tv()).phase !== 'brew'; i++) { await page.touchscreen.tap(195, 300); await page.waitForTimeout(40); } };
    await toBrew();
    await tap('moonberry'); await tap('ale');
    chk((await page.locator('#tv-note').innerText()).includes('처음 보는'), '모르는 조합의 안내 문구가 없음');
    await page.locator('#tv-serve').tap(); await page.waitForTimeout(300);
    chk(await vis('tv-found'), '레시피 발견 연출이 뜨지 않음');
    await page.screenshot({ path: `${SHOTS}/tv_07_found_ui.png` });
    await page.locator('#tv-found-btn').tap(); await page.waitForTimeout(150);
    chk((await vars()).tavern.known.moon_ale === true, '발견한 레시피가 메뉴판(known)에 추가되지 않음');
    // 다음 손님 -> 레시피에 없는 조합 = 정체불명 요리
    await toBrew();
    await tap('bread'); await tap('moonberry');
    await page.locator('#tv-serve').tap(); await page.waitForTimeout(300);
    t1 = await tv();
    chk(t1.results[t1.results.length - 1].result === 'mystery' && t1.results[t1.results.length - 1].dish === '정체불명 요리', `정체불명 요리 판정 이상 ${JSON.stringify(t1.results[t1.results.length - 1])}`);
    chk(!(await vis('tv-found')), '정체불명 요리인데 발견 연출이 뜸');
    await page.screenshot({ path: `${SHOTS}/tv_10_mystery.png` });
    // 다음 손님 -> 정중히 거절 (확인창)
    await toBrew();
    const rep0 = (await vars()).rep;
    await page.locator('#tv-skip').tap(); await page.waitForTimeout(150);
    chk(await vis('confirm'), '거절 확인창이 뜨지 않음');
    await page.locator('#confirm-yes').tap(); await page.waitForTimeout(150);
    t1 = await tv();
    chk(t1.results[t1.results.length - 1].result === 'skip' && (await vars()).rep === rep0 - 1, `거절 처리 이상 (평판 ${rep0}->${(await vars()).rep})`);
    // 나머지 손님은 자동 진행 -> 결산 화면
    for (let i = 0; i < 800 && !(await vis('tv-sum')); i++) {
      const m = await page.evaluate(() => VN.mode);
      if (m === 'text') { await page.touchscreen.tap(195, 300); await page.waitForTimeout(8); continue; }
      const sel = await page.evaluate(() => window.__tvPlan());
      if (!sel) break;
      await page.locator(sel).first().tap(); await page.waitForTimeout(20);
    }
    chk(await vis('tv-sum'), '하루 결산 화면에 도달하지 못함');
    const resN = await page.locator('#tv-sum-icons .tv-res').count(), sumRows = await page.locator('#tv-sum-body .sum-row').count();
    const qlen = (await tv()).total;
    chk(resN === qlen && sumRows >= 5, `결산: 손님 아이콘 ${resN}/${qlen}, 줄 ${sumRows}`);
    await page.screenshot({ path: `${SHOTS}/tv_06_summary_ui.png` });
    await page.locator('#tv-sum-btn').tap(); await page.waitForTimeout(200);
    chk((await vars()).tavern.days.day1, '영업 기록(tavern.days.day1)이 남지 않음');
    await page.evaluate(() => { VN.state.vars.gold = 200; }); // 업그레이드를 살 수 있게 골드 지급
    // 밤: 업그레이드 화면까지
    for (let i = 0; i < 3000 && !(await vis('tv-upg')); i++) {
      const m = await page.evaluate(() => VN.mode);
      if (m === 'choice') { await page.locator('.choice-btn').first().evaluate((b) => b.click()); continue; }
      if (m === 'tavern') break;
      await page.evaluate(() => document.getElementById('game').click());
    }
    chk(await vis('tv-upg'), '밤에 업그레이드 화면이 뜨지 않음');
    chk((await page.locator('.tv-upg-card').count()) === 4, '업그레이드 카드가 4개가 아님');
    await page.screenshot({ path: `${SHOTS}/tv_08_upgrade_ui.png` });
    const g0 = (await vars()).gold;
    for (const id of ['stove', 'shelf', 'barrel', 'sign']) await page.locator(`.tv-upg-card[data-id="${id}"] .tv-upg-buy`).tap();
    const v2 = await vars();
    chk(Object.keys(v2.tavern.upg).length === 4 && v2.gold === g0 - 140, `업그레이드 구매 이상: 골드 ${g0}->${v2.gold}, ${JSON.stringify(v2.tavern.upg)}`);
    chk(v2.tavern.known.magic_stew && v2.tavern.known.moon_ale && v2.tavern.known.berry_milk, '향신료 선반으로 레시피 3개가 해금되지 않음');
    chk(await page.locator('.tv-upg-card[data-id="sign"] .tv-upg-buy').isDisabled(), '구입한 업그레이드 버튼이 잠기지 않음');
    await page.locator('#tv-upg-next').tap(); await page.waitForTimeout(250);
    chk((await page.evaluate(() => VN.state.vars.day)) === 2 || (await page.evaluate(() => VN.mode)) === 'card', '업그레이드 후 다음 날로 넘어가지 않음');
    // 간판을 샀으니 2일차 영업 손님이 1명 늘어난다
    await toTavern(page);
    chk((await tv()).total === 6, `간판 업그레이드 후 2일차 손님 수 ${(await tv()).total} (6이어야 함)`);
    report.push(`영업UI: 장보기/메뉴판(15칸 중 미발견 10)/재료 선택·해제·최대3개/비우기/메뉴판으로 채우기/판정/발견 연출/정체불명/거절/결산(${resN}명)/업그레이드 4종 구매/해금/간판 손님+1`);
    await ctx.close();
  }

  // ---------- (g) 영업 중 저장 -> 영업 시작 시점으로 되돌아감 ----------
  {
    const { ctx, page } = await newPage(browser, problems, '영업세이브');
    const chk = (cond, msg) => { if (!cond) problems.push('[영업세이브] ' + msg); };
    const vars = () => page.evaluate(() => JSON.parse(JSON.stringify(VN.state.vars)));
    await page.goto(URL); await page.waitForSelector('#btn-new');
    await initDriver(page, Object.assign({ seed: 9 }, POL.decent));
    await page.tap('#btn-new');
    await toTavern(page);
    const v0 = await vars();
    await page.locator('.tv-row[data-id="meat"] .tv-buy[data-n="3"]').tap();
    await page.locator('#tv-shop-start').tap();
    for (let i = 0; i < 40 && (await page.evaluate(() => VN.tavern.phase)) !== 'brew'; i++) { await page.touchscreen.tap(195, 300); await page.waitForTimeout(40); }
    const vMid = await vars();
    chk(vMid.gold < v0.gold && vMid.tavern.stock.meat === v0.tavern.stock.meat + 3, '영업 중 상태가 바뀌지 않음(테스트 전제)');
    await page.tap('#menu-btn'); await page.waitForTimeout(100);
    await page.tap('#menu-save'); await page.waitForTimeout(100);
    const toast = await page.locator('#toasts').innerText();
    chk(toast.includes('영업 시작'), `영업 중 저장 안내 토스트가 없음: "${toast}"`);
    await page.locator('.slot-btn').nth(0).tap(); await page.waitForTimeout(100);
    await page.tap('#slots-close');
    const raw = JSON.parse(await page.evaluate(() => localStorage.getItem('inn_vn_v3_s1')));
    chk(raw.v === 3 && raw.snap.vars.gold === v0.gold && raw.snap.vars.tavern.stock.meat === v0.tavern.stock.meat, `저장된 스냅샷이 영업 시작 시점이 아님 (골드 ${raw.snap.vars.gold}, 기대 ${v0.gold})`);
    chk(!Object.keys(await page.evaluate(() => Object.assign({}, localStorage))).some((k) => /^inn_vn_v[12]_/.test(k)), '옛 버전 키가 생김');
    // 불러오기 -> 영업 시작(장보기)으로 되돌아감
    await page.tap('#menu-btn'); await page.tap('#menu-load'); await page.waitForTimeout(100);
    await page.locator('.slot-btn').nth(1).tap(); await page.waitForTimeout(250);
    const v1 = await vars();
    const phase = await page.evaluate(() => VN.tavern && VN.tavern.phase);
    chk(v1.gold === v0.gold && v1.tavern.stock.meat === v0.tavern.stock.meat, `불러온 뒤 골드/재고가 영업 시작 시점과 다름 (${v1.gold} vs ${v0.gold})`);
    chk(phase === 'shop', `불러온 뒤 장보기 화면이 아님 (${phase})`);
    // 이어하기(자동 저장)도 같은 시점
    await page.reload(); await page.waitForSelector('#btn-continue');
    await page.tap('#btn-continue'); await page.waitForTimeout(250);
    const v2 = await vars();
    chk(v2.gold === v0.gold && (await page.evaluate(() => VN.tavern && VN.tavern.phase)) === 'shop', '이어하기가 영업 시작 시점이 아님');
    report.push(`영업 중 저장: 영업 시작 골드 ${v0.gold} 로 저장/불러오기/이어하기 모두 장보기부터 재개 (영업 중 골드 ${vMid.gold}), 세이브 키 v3`);
    await ctx.close();
  }

  await browser.close();
  console.log('\n--- 요약 ---');
  report.forEach((r) => console.log(r));
  console.log(`소요 ${((Date.now() - t0) / 1000).toFixed(0)}초, 스크린샷 폴더 ${SHOTS}`);
  problems.forEach((p) => console.log('문제:', p));
  console.log(problems.length ? `실패: 문제 ${problems.length}건` : `통과: 총 ${results.length + 9}회 플레이/시나리오, 콘솔 error/warning 0건`);
  process.exit(problems.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
