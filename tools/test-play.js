// 자동 플레이 테스트 (Playwright, 모바일 390x844)
//   python3 -m http.server 8765 &   # 먼저 서버를 띄운 뒤
//   node tools/test-play.js [스크린샷 폴더]      (기본 /home/user/inn-vn-shots2)
// 검증 항목
//  (a) 히로인 4명 각각의 엔딩을 노리는 전략 플레이 (실제 터치 탭, 표정 shy 스크린샷 수집)
//  (b) 노멀 / 배드 엔딩 전략 플레이
//  (c) 무작위 플레이 여러 회 (서로 다른 시드)
//  (d) 엔딩 6종을 한 브라우저에서 연속 달성 -> 타이틀 "엔딩 목록" 6/6 확인
//  (e) 저장/불러오기/이어하기, 옛 세이브·깨진 세이브가 있어도 타이틀이 정상인지
// 모든 플레이에서 콘솔 error/warning 0 이어야 통과.
const { chromium } = require('playwright');
const fs = require('fs');
const URL = process.env.URL || 'http://localhost:8765/index.html';
const SHOTS = process.argv[2] || '/home/user/inn-vn-shots2';
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

async function newPage(browser, problems, label) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`[${label}] console.${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`[${label}] pageerror: ${e.message}`));
  return { ctx, page };
}

const stateOf = (page) => page.evaluate(() => {
  const s = VN.state;
  return {
    shift: document.getElementById('app').scrollLeft + document.getElementById('game').scrollLeft + window.scrollX, // 화면이 가로로 밀리면 안 됨
    mode: VN.mode, scene: s && s.scene, day: s && s.vars.day, vars: s && JSON.parse(JSON.stringify(s.vars)),
    sprites: s && JSON.parse(JSON.stringify(s.sprites)), done: document.getElementById('next-mark').classList.contains('on'),
    opts: VN.options.map((o, i) => ({ idx: i, text: o.text, set: o.set, who: o.who, cost: o.cost }))
  };
});
// 페이지 안에서 선택지/엔딩/타이틀이 나올 때까지 탭(클릭) 반복 — 빠른 모드
const fastForward = (page) => page.evaluate(() => {
  const g = document.getElementById('game');
  for (let i = 0; i < 6000; i++) {
    const m = VN.mode;
    if (m === 'choice' || m === 'ending' || m === 'title' || m === 'summary') return m;
    g.click();
  }
  return 'stuck';
});

// 한 회차를 끝까지 플레이한다. opts: {label, choose, real, shots:{prefix, heroine}}
async function playRun(page, opts, problems) {
  const o = Object.assign({ real: false, shots: null }, opts);
  const shot = async (name) => { if (o.shots) await page.screenshot({ path: `${SHOTS}/${name}.png` }); };
  const got = {};
  const picks = [];
  let ending = null, guard = 0;
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
  HEROINES.forEach((h) => jobs.push({ label: `집중-${h}`, choose: S.focus(h), real: true, shots: { prefix: `run_${h}`, heroine: h }, expect: h }));
  jobs.push({ label: '노멀(균등)', choose: S.even(), real: false, expect: 'normal' });
  jobs.push({ label: '배드(평판 최저)', choose: S.bad(), real: false, expect: 'bad' });
  for (let i = 0; i < 16; i++) jobs.push({ label: `무작위#${100 + i}`, choose: S.random(100 + i), real: false, expect: null });
  HEROINES.forEach((h, i) => { for (let k = 0; k < 3; k++) jobs.push({ label: `팬-${h}#${k}`, choose: S.fan(h, 500 + i * 10 + k), real: false, expect: null }); });
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
      const r = await playRun(page, { label: `컬렉션-${order[i][0]}`, choose: order[i][1], real: false }, problems);
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
    // 옛 세이브(v1 키)와 깨진 v2 세이브를 미리 심어 둔다 -> 타이틀이 깨지면 안 됨
    await page.evaluate(() => {
      localStorage.setItem('inn_vn_v1_auto', JSON.stringify({ t: 1, snap: { scene: 'd1_kael_enter', pc: 0, vars: {} } }));
      localStorage.setItem('inn_vn_v2_s1', '{깨진 json');
      localStorage.setItem('inn_vn_v2_s2', JSON.stringify({ t: 1, snap: { scene: 'd1_kael_enter', pc: 0, vars: {} } })); // v 필드 없음
      localStorage.setItem('inn_vn_v2_s3', JSON.stringify({ v: 2, t: 1, snap: { scene: '없는씬', pc: 0, vars: {} } }));
    });
    await page.reload(); await page.waitForSelector('#btn-new');
    if (!(await page.locator('#btn-continue').isDisabled())) problems.push('[세이브] 옛/깨진 세이브인데 이어하기가 켜져 있음');
    if (!(await page.locator('#btn-title-load').isDisabled())) problems.push('[세이브] 옛/깨진 세이브인데 불러오기가 켜져 있음');
    report.push('옛 세이브(v1)/깨진 세이브/없는 씬 세이브: 모두 무시되고 타이틀 정상');
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
    const raw = await page.evaluate(() => localStorage.getItem('inn_vn_v2_s1'));
    if (!raw || JSON.parse(raw).v !== 2) problems.push('[세이브] 슬롯1 저장 형식 이상');
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

  await browser.close();
  console.log('\n--- 요약 ---');
  report.forEach((r) => console.log(r));
  console.log(`소요 ${((Date.now() - t0) / 1000).toFixed(0)}초, 스크린샷 폴더 ${SHOTS}`);
  problems.forEach((p) => console.log('문제:', p));
  console.log(problems.length ? `실패: 문제 ${problems.length}건` : `통과: 총 ${results.length + 8}회 플레이/시나리오, 콘솔 error/warning 0건`);
  process.exit(problems.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
