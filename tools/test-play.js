// 자동 플레이 테스트: python3 -m http.server 8765 를 띄운 뒤  node tools/test-play.js [스크린샷폴더]
// 모바일 뷰포트(390x844)에서 타이틀 -> 새 게임 -> 끝까지 진행. 콘솔 에러/세이브/로드 확인.
const { chromium } = require('playwright');
const fs = require('fs');
const URL = process.env.URL || 'http://localhost:8765/index.html';
const SHOTS = process.argv[2] || '/home/user/inn-vn-shots';
fs.mkdirSync(SHOTS, { recursive: true });

function makeRng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }

async function playOnce(browser, strategy, seed, shots) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`console.${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(URL);
  await page.waitForSelector('#btn-new');
  const rng = makeRng(seed);
  const shot = async (name) => { if (shots) await page.screenshot({ path: `${SHOTS}/${name}.png` }); };
  const mode = () => page.evaluate(() => VN.mode);
  const scene = () => page.evaluate(() => VN.state && VN.state.scene);
  const done = {};

  await shot('01_title');
  await page.tap('#btn-new');
  const visited = [];
  let steps = 0, choicesMade = [];
  for (; steps < 800; steps++) {
    const m = await mode();
    const sc = await scene();
    if (sc && visited[visited.length - 1] !== sc) visited.push(sc);
    if (m === 'summary') break;
    if (m === 'title') { problems.push('예상치 못하게 타이틀로 돌아감 (씬 ' + sc + ')'); break; }
    if (m === 'choice') {
      const n = await page.locator('.choice-btn').count();
      if (shots && !done.choice && sc === 'd1_kael_enter') { await page.waitForTimeout(400); await shot('03_choice'); done.choice = 1; }
      if (shots && sc === 'd1_evening') { await page.waitForTimeout(400); await shot('04_choice_evening'); }
      const idx = strategy === 'first' ? 0 : strategy === 'last' ? n - 1 : Math.floor(rng() * n);
      choicesMade.push(`${idx + 1}/${n}`);
      await page.locator('.choice-btn').nth(idx).tap();
      continue;
    }
    // 대사: 첫 탭은 타이핑 완성, 두 번째 탭은 다음으로
    if (shots && !done.kael && sc === 'd1_kael_enter') {
      await page.tap('#game', { position: { x: 195, y: 300 } });
      await page.waitForTimeout(150);
      await shot('02_kael_dialog'); done.kael = 1;
    }
    if (shots && !done.evening && sc === 'd1_evening' && (await page.evaluate(() => VN.state.sprites.right))) {
      await page.tap('#game', { position: { x: 195, y: 300 } });
      await page.waitForTimeout(150);
      await shot('05_evening_two_chars'); done.evening = 1;
    }
    if (shots && !done.erion && sc === 'd1_night_erion') {
      await page.tap('#game', { position: { x: 195, y: 300 } });
      await page.waitForTimeout(150);
      await shot('06_erion_night'); done.erion = 1;
    }
    await page.tap('#game', { position: { x: 195, y: 300 } });
    await page.waitForTimeout(8);
  }
  if ((await mode()) !== 'summary') problems.push('결과 화면에 도달하지 못함');
  await page.waitForTimeout(300);
  if (shots) await shot('07_summary');
  const vars = await page.evaluate(() => JSON.parse(JSON.stringify(VN.state.vars)));
  const summaryText = await page.locator('#summary-body').innerText();

  let extra = {};
  if (shots) {
    // ----- 세이브/로드 검증 -----
    await page.tap('#summary-btn'); // 타이틀로
    await page.waitForTimeout(100);
    if (await page.locator('#btn-continue').isDisabled()) problems.push('자동 저장이 없어서 이어하기 불가');
    await page.tap('#btn-new');
    // 몇 줄 진행 후 슬롯 1에 저장
    for (let i = 0; i < 8; i++) { await page.tap('#game', { position: { x: 195, y: 300 } }); await page.waitForTimeout(20); }
    const before = await page.evaluate(() => ({ scene: VN.state.scene, pc: VN.state.pc, vars: VN.state.vars }));
    await page.tap('#menu-btn'); await page.waitForTimeout(100); await shot('08_menu');
    await page.tap('#menu-save'); await page.waitForTimeout(100);
    await page.locator('.slot-btn').nth(0).tap(); await page.waitForTimeout(100);
    await shot('09_save_slots');
    await page.tap('#slots-close');
    const raw = await page.evaluate(() => localStorage.getItem('inn_vn_v1_s1'));
    if (!raw) problems.push('슬롯1 세이브가 localStorage 에 없음');
    // 더 진행해서 상태를 바꾼 뒤 로드
    for (let i = 0; i < 12; i++) { await page.tap('#game', { position: { x: 195, y: 300 } }); await page.waitForTimeout(20); }
    const mid = await page.evaluate(() => ({ scene: VN.state.scene, pc: VN.state.pc }));
    // 백로그
    await page.tap('#menu-btn'); await page.tap('#menu-log'); await page.waitForTimeout(100);
    const logN = await page.locator('.log-item').count();
    await shot('10_backlog');
    await page.tap('#backlog-close');
    // 로드
    await page.tap('#menu-btn'); await page.tap('#menu-load'); await page.waitForTimeout(100);
    await page.locator('.slot-btn').nth(1).tap(); // 목록: 자동저장, 슬롯1, ...
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => ({ scene: VN.state.scene, pc: VN.state.pc, vars: VN.state.vars }));
    if (before.scene !== after.scene || before.pc !== after.pc || JSON.stringify(before.vars) !== JSON.stringify(after.vars)) {
      problems.push('로드 후 상태 불일치 ' + JSON.stringify({ before, after }));
    }
    extra = { saveLoadOk: before.scene === after.scene && before.pc === after.pc, movedBeforeLoad: mid.scene + '@' + mid.pc, backlogEntries: logN };
    // 이어하기 (새로고침 후)
    await page.reload(); await page.waitForSelector('#btn-continue');
    await page.tap('#btn-continue'); await page.waitForTimeout(150);
    extra.continueScene = await scene();
    // 서비스 워커 / 매니페스트
    extra.sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!r; });
    const mf = await page.evaluate(() => fetch('manifest.webmanifest').then((r) => r.json()).then((j) => j.name));
    extra.manifest = mf;
  }
  await ctx.close();
  return { strategy, seed, steps, scenes: visited.length, choicesMade: choicesMade.join(' '), vars, summaryText: shots ? summaryText.replace(/\s+/g, ' ') : undefined, problems, extra };
}

(async () => {
  const browser = await chromium.launch();
  const runs = [];
  runs.push(await playOnce(browser, 'first', 1, true));
  runs.push(await playOnce(browser, 'last', 2, false));
  for (let i = 0; i < 12; i++) runs.push(await playOnce(browser, 'random', 100 + i, false));
  await browser.close();
  let bad = 0;
  for (const r of runs) {
    console.log(`[${r.strategy}#${r.seed}] 씬 ${r.scenes}개 / 선택 ${r.choicesMade} / vars ${JSON.stringify(r.vars)}`);
    if (r.extra && Object.keys(r.extra).length) console.log('  추가 검증:', JSON.stringify(r.extra));
    if (r.summaryText) console.log('  결과 화면:', r.summaryText);
    r.problems.forEach((p) => { bad++; console.log('  문제:', p); });
  }
  console.log(bad ? `실패: 문제 ${bad}건` : `통과: ${runs.length}회 플레이, 콘솔 에러/경고 0건`);
  process.exit(bad ? 1 : 0);
})();
