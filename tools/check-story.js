// 스토리 데이터 정적 검사 + 시뮬레이션: node tools/check-story.js
// - index.html 이 읽는 story/*.js 를 순서대로 로드
// - goto 대상 씬 존재, 도달 불가 씬, 씬 끝 처리, 조건식 문법, 변수 이름
// - 배경/캐릭터/표정 id, 이미지 파일 존재, sw.js 캐시 목록과 비교, index.html 스크립트 목록 비교
// - 선택지 막힘(전부 유료/조건부) 검사, 히로인별 이벤트 4개 이상, 엔딩 6종 도달 가능
// - 저녁 영업 데이터(story/tavern.js) 무결성: 레시피 재료 존재/조합 중복, 태그 유효, 손님/주문 유효, 히로인 최애가 실제 레시피, 이미지 존재
// - 단골 숨은 취향 / 특별 주문 / BGM 정의(story/audio.js) / 스크립트의 bgm·sfx 명령 검사
// - 브라우저 없이 스토리를 수천 번 무작위/전략 플레이(저녁 영업 포함: "메뉴판을 기억하는" 숙련/보통/서툰/대충 플레이어 모델, 특별 주문/단골 취향 포함)해서 엔딩 분포와 호감도 범위를 알려 준다
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
scripts.forEach(load);
const { HEROINE_EVENTS, CALENDAR, CalCore, STORY, CHARACTERS, BACKGROUNDS, VN, ENDINGS, HEROINES, TAVERN, TavernCore, AUDIO, SFX, CG_DEFS, RANDOM_EVENTS, EventCore, LODGING, INN_RANK, GIFTS, RIVALRY, InnCore, HEART } = ctx;

const errors = [], warns = [];
const err = (m) => errors.push(m), wn = (m) => warns.push(m);
const scenes = STORY.scenes;
const edges = {};
const KNOWN = ['say', 'narr', 'choice', 'summary', 'end', 'ending', 'if', 'goto', 'show', 'hide', 'bg', 'day', 'time', 'fx', 'set', 'put', 'tavern', 'learn', 'upgrades', 'talkoffer', 'bgm', 'sfx', 'cg', 'rand', 'randret', 'lodging', 'nightev', 'nightret', 'rankcheck', 'giftoffer', 'rivalry', 'rivret', 'cal'];
const TERMINAL = ['goto', 'choice', 'summary', 'end', 'ending', 'rand', 'randret', 'nightret', 'rivret', 'cal'];
const files = new Set();
let lines = 0, choices = 0;

if (!scenes[STORY.start]) err(`시작 씬 없음: ${STORY.start}`);
if (!TAVERN || !TavernCore) err('story/tavern.js 또는 js/tavern-core.js 가 index.html 에서 로드되지 않음');
if (!STORY.init.tavern) err('STORY.init.tavern 없음 (story/tavern.js 맨 아래)');
const tavernDaysUsed = new Set(), upgradeCmds = [], bgmUsed = new Set(), cgUsed = new Set();
const cgScenes = {};   // 씬 id -> 그 씬 안의 cg 명령 순서 (보이기/걷기 짝 검사)
if (!CG_DEFS) err('story/cg.js (CG_DEFS) 가 index.html 에서 로드되지 않음');
if (!LODGING || !INN_RANK || !GIFTS || !RIVALRY || !InnCore) err('story/lodging.js, inn-rank.js, gifts.js, rivalry.js 또는 js/inn-core.js 가 index.html 에서 로드되지 않음');
if (!RANDOM_EVENTS || !EventCore) err('story/random-events.js 또는 js/event-core.js 가 index.html 에서 로드되지 않음');
if (!Array.isArray(ENDINGS) || !ENDINGS.length) err('ENDINGS 가 없음 (story/endings.js)');
(STORY.cast || []).forEach((c) => { if (!CHARACTERS[c]) err(`STORY.cast 에 없는 캐릭터: ${c}`); });

for (const [id, cmds] of Object.entries(scenes)) {
  edges[id] = [];
  const target = (t, where) => { if (!scenes[t]) err(`[${id}] ${where}: 없는 씬으로 goto -> ${t}`); else edges[id].push(t); };
  if (!Array.isArray(cmds) || !cmds.length) { err(`[${id}] 비어 있는 씬`); continue; }
  cmds.forEach((c, i) => {
    const w = `#${i}`;
    const key = KNOWN.find((k) => k in c);
    if (!key) return err(`[${id}] ${w}: 알 수 없는 명령 ${JSON.stringify(c)}`);
    if (key === 'say' || key === 'narr') lines++;
    if (key === 'say') {
      const ch = CHARACTERS[c.say];
      if (!ch) err(`[${id}] ${w}: 없는 캐릭터 ${c.say}`);
      else if (c.face && !ch.faces[c.face]) err(`[${id}] ${w}: ${c.say} 에 없는 표정 ${c.face}`);
      if (typeof c.text !== 'string' || !c.text) err(`[${id}] ${w}: say 에 text 없음`);
    }
    if (key === 'show') {
      const ch = CHARACTERS[c.show];
      if (!ch) err(`[${id}] ${w}: 없는 캐릭터 ${c.show}`);
      else if (c.face && !ch.faces[c.face]) err(`[${id}] ${w}: ${c.show} 에 없는 표정 ${c.face}`);
      if (c.pos && !['left', 'center', 'right'].includes(c.pos)) err(`[${id}] ${w}: 잘못된 pos ${c.pos}`);
      if ('text' in c) err(`[${id}] ${w}: show 에 text 가 있음 (say 로 써야 함)`);
    }
    if (key === 'hide' && c.hide !== 'all' && !CHARACTERS[c.hide]) err(`[${id}] ${w}: 없는 캐릭터 ${c.hide}`);
    if (key === 'bg' && !BACKGROUNDS[c.bg]) err(`[${id}] ${w}: 없는 배경 ${c.bg}`);
    if (key === 'day' && !(c.day === 'next' || (Number.isInteger(c.day) && c.day >= 1))) err(`[${id}] ${w}: day 는 1 이상의 정수`);
    if (key === 'fx' && !['shake', 'flash'].includes(c.fx)) err(`[${id}] ${w}: 알 수 없는 fx ${c.fx}`);
    if (key === 'bgm') { bgmUsed.add(c.bgm); if (c.bgm !== 'stop' && !(AUDIO && AUDIO.tracks && AUDIO.tracks[c.bgm])) err(`[${id}] ${w}: story/audio.js 에 없는 BGM 트랙 ${c.bgm}`); }
    if (key === 'sfx' && !(SFX && SFX.names.includes(c.sfx))) err(`[${id}] ${w}: js/sfx.js 에 없는 효과음 ${c.sfx}`);
    if (key === 'ending' && !(ENDINGS || []).some((e) => e.id === c.ending)) err(`[${id}] ${w}: ENDINGS 에 없는 엔딩 id ${c.ending}`);
    if (key === 'cal') {
      if (!['next', 'evening'].includes(c.cal)) err(`[${id}] ${w}: cal 은 'next' 또는 'evening'`);
      if (c.cal === 'next') Object.values(CALENDAR.main).forEach((m) => { if (m.scene) edges[id].push(m.scene); }), edges[id].push(CALENDAR.routineScene, CALENDAR.holidayScene);
      else Object.values(CALENDAR.main).forEach((m) => { if (m.evening) edges[id].push(m.evening); }), edges[id].push(CALENDAR.routineEvening);
    }
    if (key === 'tavern' && c.tavern === 'routine') tavernDaysUsed.add('routine');
    else if (key === 'tavern') { tavernDaysUsed.add(c.tavern); if (!TAVERN.days[c.tavern]) err(`[${id}] ${w}: TAVERN.days 에 없는 영업 id ${c.tavern}`); }
    if (key === 'learn') [].concat(c.learn).forEach((r) => { if (!TAVERN.recipes[r]) err(`[${id}] ${w}: 없는 레시피 ${r}`); });
    if (key === 'upgrades') upgradeCmds.push(id);
    if (key === 'cg') {
      (cgScenes[id] = cgScenes[id] || []).push(c.cg);
      if (c.cg !== 'hide') { cgUsed.add(c.cg); if (!(CG_DEFS || {})[c.cg]) err(`[${id}] ${w}: story/cg.js 에 없는 CG ${c.cg}`); }
    }
    if (key === 'rand') {
      if (c.rand !== 'morning') err(`[${id}] ${w}: rand 는 'morning' 만 지원`);
      if (!c.then) err(`[${id}] ${w}: rand 에 then 없음`); else target(c.then, w + ' then');
      Object.keys((RANDOM_EVENTS || { events: {} }).events).forEach((e) => { if (scenes['rev_' + e]) edges[id].push('rev_' + e); });
    }
    if (key === 'nightev') Object.keys((LODGING || { nightEvents: { events: {} } }).nightEvents.events).forEach((e) => { if (scenes['nev_' + e]) edges[id].push('nev_' + e); });
    if (key === 'rivalry') ((RIVALRY || { pairs: [] }).pairs).forEach((pr) => { if (scenes[pr.scene]) edges[id].push(pr.scene); });
    if (key === 'rankcheck' && !(c.rankcheck === true || c.rankcheck === 'quiet')) err(`[${id}] ${w}: rankcheck 는 true 또는 'quiet'`);
    if (key === 'goto') target(c.goto, w);
    if (key === 'if') {
      try { VN.checkCond(c.if); } catch (e) { err(`[${id}] ${w}: ${e.message}`); }
      if (!c.goto) err(`[${id}] ${w}: if 에 goto 없음`); else target(c.goto, w + ' if');
      if (c.else) target(c.else, w + ' else');
    }
    if (key === 'choice') {
      choices++;
      if (c.dynamic) CalCore.allPickScenes().forEach((t) => { if (scenes[t]) edges[id].push(t); });
      if (!Array.isArray(c.choice) || !c.choice.length) err(`[${id}] ${w}: 빈 선택지`);
      (c.choice || []).forEach((o, j) => {
        const ow = `${w} 선택지${j + 1}`;
        if (!o.text) err(`[${id}] ${ow}: text 없음`);
        if (o.if) { try { VN.checkCond(o.if); } catch (e) { err(`[${id}] ${ow}: ${e.message}`); } }
        if (o.who && !CHARACTERS[o.who]) err(`[${id}] ${ow}: who 에 없는 캐릭터 ${o.who}`);
        if ('cost' in o && !(typeof o.cost === 'number' && o.cost > 0)) err(`[${id}] ${ow}: cost 는 양수여야 함`);
        if (o.put) { if (typeof o.put !== 'object') err(`[${id}] ${ow}: put 은 객체`); }
        if (o.goto) target(o.goto, ow);
        else if (i === cmds.length - 1) err(`[${id}] ${ow}: 마지막 명령인데 goto 없음`);
      });
      // 어떤 상태에서도 고를 수 있는 선택지(조건 없음 + 무료)가 하나는 있어야 진행이 막히지 않는다
      if (!(c.choice || []).some((o) => !o.if && !o.cost)) err(`[${id}] ${w}: 조건/비용 없는 선택지가 하나도 없음 (골드 부족 시 막힐 수 있음)`);
    }
  });
  // 변수 경로 검사
  const sets = [];
  cmds.forEach((c) => { if (c.set) sets.push(c.set); if (c.put) sets.push(c.put); (c.choice || []).forEach((o) => { if (o.set) sets.push(o.set); if (o.put) sets.push(o.put); }); });
  sets.forEach((s) => Object.keys(s).forEach((k) => {
    const m = k.match(/^(gold|rep)$|^(?:aff|ev)\.(\w+)$|^flag\.\w+$|^tavern\.[\w.]+$|^llm\.\w+$|^fat$|^evdone\.\w+$|^pl\.\w+$|^cal\.\w+$|^today\.(cust|price|tip|note)$|^lodge\.(note)$|^gift\.given\.\w+$/);
    if (!m) wn(`[${id}] 변수 이름 확인: ${k}`);
    else if (m[2] && !CHARACTERS[m[2]]) err(`[${id}] 없는 캐릭터의 변수: ${k}`);
  }));
  const last = cmds[cmds.length - 1];
  if (!TERMINAL.some((k) => k in last)) err(`[${id}] 마지막 명령이 ${TERMINAL.join('/')} 가 아님 (끊긴 흐름)`);
}

// 도달 가능성 (BFS)
const seen = new Set([STORY.start]), q = [STORY.start];
while (q.length) { const s = q.shift(); (edges[s] || []).forEach((t) => { if (!seen.has(t)) { seen.add(t); q.push(t); } }); }
Object.keys(scenes).forEach((id) => { if (!seen.has(id)) wn(`도달 불가 씬: ${id}`); });
const reachedEndings = new Set();
seen.forEach((id) => scenes[id].forEach((c) => { if ('ending' in c) reachedEndings.add(c.ending); }));
(ENDINGS || []).forEach((e) => { if (!reachedEndings.has(e.id)) err(`엔딩에 도달할 수 없음: ${e.id}`); });
(HEROINES || []).forEach((h) => {
  for (let n = 1; n <= 5; n++) if (!scenes[`${h}_${n}`]) err(`히로인 이벤트 없음: ${h}_${n} (5번째는 깊은 이벤트)`);
  [1, 2].forEach((n) => { const sc = scenes[`${h}_plain${n}`]; if (!sc) err(`평범한 하루 씬 없음: ${h}_plain${n}`); else { if (!sc.some((c) => c.set && c.set[`aff.${h}`] === 1)) err(`${h}_plain${n}: 호감도 +1 이 없음`); if (!sc.some((c) => c.goto === 'after_pick')) err(`${h}_plain${n}: after_pick 으로 돌아가지 않음`); } });
  if (!CHARACTERS[h]) err(`HEROINES 의 캐릭터 정의 없음: ${h}`);
});
(ENDINGS || []).forEach((e) => { if (e.heroine && !CHARACTERS[e.heroine]) err(`ENDINGS ${e.id}: 없는 heroine ${e.heroine}`); });

// ---------- 자유 대화(로컬 LLM) 페르소나 검사 (story/llm-persona.js) ----------
const PERSONA = ctx.LLM_PERSONA, LLMCore = ctx.LLMCore;
if (!PERSONA || !LLMCore) err('story/llm-persona.js 또는 js/llm-core.js 가 index.html 에서 로드되지 않음');
else {
  const st = PERSONA.settings;
  ['turnsPerDay', 'maxGainPerHeroinePerDay', 'maxGainPerDay', 'maxLossPerHeroinePerDay', 'historyTurns', 'temperature', 'maxTokens', 'maxReplyChars', 'maxInputChars', 'timeoutMs'].forEach((k) => { if (!(typeof st[k] === 'number' && st[k] > 0)) err(`LLM_PERSONA.settings.${k} 는 양수여야 함`); });
  if (!Array.isArray(st.tierLines) || st.tierLines.length !== 2 || st.tierLines[0] >= st.tierLines[1]) err('LLM_PERSONA.settings.tierLines 는 [작은값, 큰값]');
  ['world', 'player', 'format'].forEach((k) => { if (!PERSONA.common[k]) err(`LLM_PERSONA.common.${k} 없음`); });
  if (!Array.isArray(PERSONA.common.rules) || PERSONA.common.rules.length < 5) err('LLM_PERSONA.common.rules 가 너무 적음');
  const flagsInStory = new Set();
  Object.values(scenes).forEach((cmds) => cmds.forEach((c) => { [c.set, c.put].forEach((x) => x && Object.keys(x).forEach((k) => { const m = k.match(/^flag\.(\w+)$/); if (m) flagsInStory.add(m[1]); })); (c.choice || []).forEach((o) => o.set && Object.keys(o.set).forEach((k) => { const m = k.match(/^flag\.(\w+)$/); if (m) flagsInStory.add(m[1]); })); }));
  Object.keys(PERSONA.flagNotes).forEach((f) => { if (!flagsInStory.has(f)) err(`LLM_PERSONA.flagNotes 의 flag 가 스토리에 없음: ${f}`); });
  flagsInStory.forEach((f) => { if (!PERSONA.flagNotes[f] && !/^partner_/.test(f)) wn(`LLM_PERSONA.flagNotes 에 설명이 없는 flag: ${f}`); });
  for (let d = 1; d <= 7; d++) if (!PERSONA.days[d]) err(`LLM_PERSONA.days.${d} 없음`);
  const lens = [];
  (HEROINES || []).forEach((h) => {
    const p = PERSONA.heroines[h];
    if (!p) return err(`LLM_PERSONA.heroines.${h} 없음`);
    if (p.name !== (CHARACTERS[h] || {}).name) err(`LLM_PERSONA ${h}: name 이 CHARACTERS 와 다름`);
    ['call', 'who', 'likesExtra', 'dislikesExtra'].forEach((k) => { if (!p[k]) err(`LLM_PERSONA ${h}: ${k} 없음`); });
    if (!(p.speech || []).length || p.speech.length < 3 || p.speech.length > 6) err(`LLM_PERSONA ${h}: speech 는 3~6개`);
    if ((p.tiers || []).length !== 3) err(`LLM_PERSONA ${h}: tiers 는 3개(경계/호의/설렘)`);
    if ((p.events || []).length !== 4) err(`LLM_PERSONA ${h}: events 는 4개 (낮 이벤트 1~4)`);
    for (let d = 1; d <= 7; d++) if (!(p.reveal || {})[d]) err(`LLM_PERSONA ${h}: reveal.${d} 없음`);
    (p.greet || []).forEach((g) => { if (!CHARACTERS[h].faces[g.face]) err(`LLM_PERSONA ${h}: greet 의 없는 표정 ${g.face}`); });
    if (!(p.greet || []).length) err(`LLM_PERSONA ${h}: greet 없음`);
    const cu = TAVERN.customers[h];
    if (!cu || !cu.fav || !TAVERN.recipes[cu.fav]) err(`LLM_PERSONA ${h}: story/tavern.js 에 히로인 최애 레시피가 없음`);
    for (let d = 1; d <= 7; d++) {
      const msgs = LLMCore.buildMessages(PERSONA, { id: h, day: CALENDAR.stages[d - 1] + (d === 7 ? 0 : 0), time: d % 2 ? '저녁' : '낮', aff: d * 3, ev: Math.min(4, d), flags: { seal_patch: true }, hist: [], text: '안녕', where: 'menu' });
      const sys = msgs[0].content;
      lens.push(sys.length);
      if (cu && cu.fav && !sys.includes(TAVERN.recipes[cu.fav].name)) err(`LLM_PERSONA ${h}: 프롬프트에 최애 메뉴가 안 들어감`);
      if (!sys.includes(p.reveal[d])) err(`LLM_PERSONA ${h}: ${d}일차 비밀 공개 범위가 프롬프트에 안 들어감`);
      if (/undefined|\[object/.test(sys)) err(`LLM_PERSONA ${h}: ${d}일차 프롬프트에 undefined`);
    }
  });
  if (lens.length) console.log(`자유 대화 시스템 프롬프트 길이: ${Math.min(...lens)}~${Math.max(...lens)}자 (히로인 4명 x 7일)`);
}

// 이미지 파일
Object.entries(CHARACTERS).forEach(([id, c]) => { if (c.icon) { files.add(c.icon); if (!fs.existsSync(path.join(root, c.icon))) err(`얼굴 썸네일 없음: ${id} -> ${c.icon}`); } });
Object.entries(CHARACTERS).forEach(([id, c]) => Object.entries(c.faces).forEach(([f, p]) => {
  files.add(p); if (!fs.existsSync(path.join(root, p))) err(`캐릭터 이미지 없음: ${id}.${f} -> ${p}`);
}));
['normal', 'smile', 'angry', 'shy', 'surprised'].forEach((f) => (HEROINES || []).forEach((h) => { if (!(CHARACTERS[h] && CHARACTERS[h].faces[f])) err(`히로인 ${h} 에 필수 표정 ${f} 없음`); }));
Object.entries(BACKGROUNDS).forEach(([id, p]) => { files.add(p); if (!fs.existsSync(path.join(root, p))) err(`배경 이미지 없음: ${id} -> ${p}`); });


// ---------- BGM 정의 검사 (story/audio.js) ----------
const BGM_NEED = ['title', 'inn_day', 'inn_night', 'tavern', 'festival', 'tension', 'cave', 'romance', 'ending_good', 'ending_bad'];
if (!AUDIO || !AUDIO.tracks) err('story/audio.js (AUDIO.tracks) 가 index.html 에서 로드되지 않음');
else {
  BGM_NEED.forEach((id) => { if (!AUDIO.tracks[id]) err(`AUDIO.tracks 에 ${id} 트랙 없음`); });
  Object.entries(AUDIO.tracks).forEach(([id, t]) => {
    if (!(t.file === null || typeof t.file === 'string')) err(`BGM ${id}: file 은 null(재생 안 함) 또는 경로 문자열`);
    if (typeof t.file === 'string') {
      if (!/^assets\/bgm\/[^/]+\.(mp3|ogg)$/i.test(t.file)) wn(`BGM ${id}: 경로는 assets/bgm/*.mp3|ogg 를 권장 (${t.file})`);
      if (!fs.existsSync(path.join(root, t.file))) wn(`BGM ${id}: 파일이 없음 (${t.file}) — 로드에 실패하면 조용히 무시됨`);
    }
    if (t.gain != null && !(t.gain > 0 && t.gain <= 1)) err(`BGM ${id}: gain 은 0 초과 1 이하`);
    if (id !== 'title' && !bgmUsed.has(id)) wn(`BGM 트랙 ${id} 를 스크립트에서 쓰지 않음`);
  });
  if (!(AUDIO.fadeMs > 0)) err('AUDIO.fadeMs 는 양수');
}

// ---------- 저녁 영업 데이터 검사 ----------
const tvStats = {};
if (TAVERN && TavernCore) {
  const T = TAVERN, R = T.recipes, G = T.ingredients, TG = T.tags;
  Object.entries(G).forEach(([id, g]) => {
    if (!g.name || !(g.price > 0)) err(`재료 ${id}: name/price 확인`);
    files.add(g.icon); if (!g.icon || !fs.existsSync(path.join(root, g.icon))) err(`재료 아이콘 없음: ${id} -> ${g.icon}`);
    if (!(T.start.stock[id] >= 0)) err(`TAVERN.start.stock 에 재료 ${id} 없음`);
  });
  const nIng = Object.keys(G).length;
  if (nIng < 6 || nIng > 8) wn(`재료는 6~8종이 목표 (현재 ${nIng})`);
  const combos = {};
  Object.entries(R).forEach(([id, r]) => {
    if (!r.name || !(r.price > 0)) err(`레시피 ${id}: name/price 확인`);
    if (!Array.isArray(r.ing) || r.ing.length < 2 || r.ing.length > 3) err(`레시피 ${id}: 재료는 2~3개여야 함`);
    (r.ing || []).forEach((i) => { if (!G[i]) err(`레시피 ${id}: 없는 재료 ${i}`); });
    if (new Set(r.ing).size !== r.ing.length) err(`레시피 ${id}: 같은 재료가 두 번 들어 있음 (조합은 서로 다른 재료만)`);
    if (!Array.isArray(r.tags) || !r.tags.length) err(`레시피 ${id}: tags 없음`);
    (r.tags || []).forEach((t) => { if (!TG[t]) err(`레시피 ${id}: 정의되지 않은 태그 ${t}`); });
    const k = TavernCore.key(r.ing || []);
    if (combos[k]) err(`레시피 ${id} 와 ${combos[k]} 의 재료 조합이 같음 (${k})`); combos[k] = id;
    // 재료 값이 너무 비싸서 적자가 나는 레시피 경고
    const cost = (r.ing || []).reduce((a, i) => a + ((G[i] || {}).price || 0), 0);
    if (r.price <= cost) wn(`레시피 ${id}: 요리 값(${r.price}G)이 재료비(${cost}G) 이하 — 대성공해도 적자`);
  });
  const nRec = Object.keys(R).length, nBasic = Object.values(R).filter((r) => r.basic).length;
  if (nBasic < 4 || nBasic > 6) wn(`기본 레시피는 4~6개가 목표 (현재 ${nBasic})`);
  if (nRec < 14) wn(`레시피 15개 안팎이 목표 (현재 ${nRec})`);
  // 레시피를 얻는 경로: 기본 / 스토리 {learn} / 손님 gain / 업그레이드 learn / 히로인 최애(직접 발견)
  const learnable = new Set(Object.keys(R).filter((x) => R[x].basic));
  Object.values(scenes).forEach((cmds) => cmds.forEach((c) => { if ('learn' in c) [].concat(c.learn).forEach((x) => learnable.add(x)); }));
  Object.values(T.days).forEach((d) => d.customers.forEach((c) => { if (c.gain && c.gain.learn) learnable.add(c.gain.learn); }));
  (T.upgrades || []).forEach((u) => (u.learn || []).forEach((x) => learnable.add(x)));
  Object.values((INN_RANK || { unlocks: {} }).unlocks).forEach((u) => (u.learn || []).forEach((x) => learnable.add(x)));   // 여관 등급 해금 레시피
  Object.values(T.customers).forEach((c) => { if (c.fav) learnable.add(c.fav); });
  Object.keys(R).forEach((x) => { if (!learnable.has(x)) wn(`레시피 ${x}: 기본/해금/최애 어디에도 없어 직접 조합해 발견하는 방법밖에 없음`); });
  (T.upgrades || []).forEach((u) => { if (!u.id || !u.name || !(u.price > 0)) err(`업그레이드 ${u.id}: id/name/price 확인`); (u.learn || []).forEach((x) => { if (!R[x]) err(`업그레이드 ${u.id}: 없는 레시피 ${x}`); }); });
  ['barrel', 'shelf', 'stove', 'sign'].forEach((id) => { if (!(T.upgrades || []).some((u) => u.id === id)) wn(`업그레이드 ${id} 없음 (엔진이 아는 효과 id: barrel/shelf/stove/sign)`); });
  // 손님 정의
  const faceOk = (who, f, where) => { const ch = CHARACTERS[who]; if (f && ch && !ch.faces[f]) err(`${where}: ${who} 에 없는 표정 ${f}`); };
  const lineList = (v) => [].concat(v == null ? [] : v);
  Object.entries(T.customers).forEach(([id, c]) => {
    if (!CHARACTERS[id]) err(`TAVERN.customers ${id}: story/characters.js 에 캐릭터 없음`);
    ['perfect', 'good', 'fail', 'mystery'].forEach((k) => { if (!lineList(c.react && c.react[k]).length) err(`손님 ${id}: react.${k} 대사 없음`); });
    if (lineList(c.react && c.react.mystery).length < 2) wn(`손님 ${id}: 정체불명 요리 반응이 2개 미만 (웃긴 리액션 3개 이상 권장)`);
    Object.entries(c.react || {}).forEach(([k, arr]) => lineList(arr).forEach((l) => { if (!(typeof l === 'string' || (l && l.text))) err(`손님 ${id}: react.${k} 대사 형식 오류`); else faceOk(id, l.face, `손님 ${id} react.${k}`); }));
    if (c.heroine) {
      if (!R[c.fav]) err(`히로인 ${id}: 최애 레시피 ${c.fav} 가 레시피에 없음`);
      else if (R[c.fav].basic) wn(`히로인 ${id}: 최애 ${c.fav} 가 기본 레시피라 '숨은 최애'가 아님`);
      if (!(c.dislike || []).length) err(`히로인 ${id}: 싫어하는 메뉴(dislike) 없음`);
      (c.dislike || []).forEach((d) => { if (!R[d]) err(`히로인 ${id}: 싫어하는 레시피 ${d} 가 없음`); if (d === c.fav) err(`히로인 ${id}: 최애와 싫어하는 메뉴가 같음`); });
      if (!lineList(c.react.fav).length) err(`히로인 ${id}: react.fav 특별 대사 없음`);
      if (!lineList(c.react.hate).length) err(`히로인 ${id}: react.hate 특별 대사 없음`);
      if (!(CHARACTERS[id] || {}).affinity) err(`히로인 ${id}: characters.js 에 affinity 없음`);
    }
  });
  (HEROINES || []).forEach((h) => { if (!(T.customers[h] && T.customers[h].heroine)) err(`히로인 ${h}: TAVERN.customers 에 heroine 정의 없음`); });
  // 일차별 손님/주문
  const known = new Set(Object.keys(R).filter((x) => R[x].basic)); // 낙관적 시뮬: 앞선 날의 gain 은 해금된 것으로 침
  const appear = {}; let orderTotal = 0, orderPerfectKnown = 0;
  Object.entries(T.days).forEach(([dayId, d]) => {
    if (!tavernDaysUsed.has(dayId)) wn(`영업 ${dayId}: 스토리에서 {tavern:'${dayId}'} 로 쓰이지 않음`);
    if (d.bg && !BACKGROUNDS[d.bg]) err(`영업 ${dayId}: 없는 배경 ${d.bg}`);
    const base = d.customers.filter((c) => !c.if).length, all = d.customers.length;
    if (base < 4 || base > 5) wn(`영업 ${dayId}: 기본 손님 ${base}명 (4~5명 권장, 조건부 손님 포함 ${all}명)`);
    d.customers.forEach((c, i) => {
      const w = `영업 ${dayId} 손님${i + 1}(${c.who})`;
      if (!CHARACTERS[c.who]) { err(`${w}: 없는 캐릭터`); return; }
      if (!T.customers[c.who]) err(`${w}: TAVERN.customers 에 정의 없음`);
      if (c.if) { try { VN.checkCond(c.if); } catch (e) { err(`${w}: if ${e.message}`); } }
      if (!c.order || !c.order.text || !Array.isArray(c.order.want) || !c.order.want.length) { err(`${w}: order.text/want 확인`); return; }
      const av = c.order.avoid || [];
      c.order.want.concat(av).forEach((t) => { if (!TG[t]) err(`${w}: 정의되지 않은 태그 ${t}`); });
      if (c.order.want.some((t) => av.includes(t))) err(`${w}: want 와 avoid 가 겹침`);
      faceOk(c.who, c.order.face, w);
      (c.say || []).forEach((l) => { if (l && l.text) faceOk(l.who || c.who, l.face, w); else if (l && typeof l === 'object' && !KNOWN.some((k) => k in l)) err(`${w}: say 항목 형식 오류 ${JSON.stringify(l)}`); });
      ['perfect', 'good', 'fail', 'mystery'].forEach((k) => lineList(c[k]).forEach((l) => { if (l && l.text) faceOk(c.who, l.face, w); }));
      lineList(c.after).forEach((l) => { if (l && l.text) faceOk(l.who || c.who, l.face, w); });
      if (c.gain) {
        if (!R[c.gain.learn]) err(`${w}: gain.learn 없는 레시피 ${c.gain.learn}`);
        (c.gain.on || []).forEach((k) => { if (!['perfect', 'good', 'fail', 'mystery'].includes(k)) err(`${w}: gain.on 값 오류 ${k}`); });
      }
      // 주문을 완벽하게 맞출 수 있는 레시피가 있는가 (전체 / 그날까지 아는 것)
      const perfectAll = Object.keys(R).filter((x) => TavernCore.judge(c.order, Object.assign({ id: x }, R[x])) === 'perfect');
      if (!perfectAll.length) err(`${w}: 이 주문을 대성공으로 맞출 레시피가 하나도 없음 (${c.order.want}/${av})`);
      orderTotal++;
      if (perfectAll.some((x) => known.has(x))) orderPerfectKnown++;
      else wn(`${w}: 그날까지 낙관적으로 아는 레시피로는 대성공 불가 (필요: ${perfectAll.join('/')}) — 힌트/업그레이드/발견이 필요한 주문`);
      appear[c.who] = (appear[c.who] || 0) + (c.if ? 0 : 1);
    });
    // 이 날의 gain 은 다음 날부터 아는 것으로 침
    d.customers.forEach((c) => { if (c.gain) known.add(c.gain.learn); });
  });
  (HEROINES || []).forEach((h) => { if ((appear[h] || 0) < 3) wn(`히로인 ${h}: 영업 기본 등장 ${appear[h] || 0}회 (3회 이상 권장)`); });
  tvStats.appear = appear; tvStats.orders = orderTotal; tvStats.perfectKnown = orderPerfectKnown;
  // ---- 단골 숨은 취향 ----
  ['tasteTip', 'tasteRep'].forEach((k) => { if (!(typeof T.rules[k] === 'number' && T.rules[k] >= 0)) err(`rules.${k} 는 0 이상의 숫자여야 함`); });
  const orderList = {}; // 손님 id -> 그 손님이 하는 주문들 (일반 + 조건부 + 특별 주문)
  Object.values(T.days).forEach((d) => d.customers.forEach((c) => { (orderList[c.who] = orderList[c.who] || []).push(c.order); }));
  Object.values(T.specials || {}).forEach((sp) => sp.units.forEach((u) => { (orderList[u.who] = orderList[u.who] || []).push(u.order); }));
  const recOf = (id) => Object.assign({ id }, R[id]);
  tvStats.taste = {};
  Object.entries(T.customers).forEach(([id, c]) => {
    if (c.heroine) { if (c.taste) err(`히로인 ${id}: 취향(taste)은 단골 전용 (히로인은 최애/싫어함)`); return; }
    if (c.special) { if (c.taste) err(`특별 손님 ${id}: 취향(taste)을 두지 않음`); return; }   // 5성 귀족처럼 한 번만 오는 손님
    const ts = c.taste;
    if (!ts) return err(`단골 ${id}: taste(숨은 취향) 없음`);
    if (['tag', 'ing'].filter((k) => ts[k]).length !== 1) err(`단골 ${id}: taste 는 tag 또는 ing 중 하나만`);
    if (ts.tag && !TG[ts.tag]) err(`단골 ${id}: taste.tag 정의되지 않은 태그 ${ts.tag}`);
    if (ts.ing && !G[ts.ing]) err(`단골 ${id}: taste.ing 없는 재료 ${ts.ing}`);
    if (!ts.label) err(`단골 ${id}: taste.label 없음`);
    ['first', 'miss', 'bonus'].forEach((k) => {
      if (!lineList(ts[k]).length) err(`단골 ${id}: taste.${k} 대사 없음`);
      lineList(ts[k]).forEach((l) => { if (!(l && typeof l.text === 'string' && l.text)) err(`단골 ${id}: taste.${k} 대사 형식 오류`); else faceOk(id, l.face, `단골 ${id} taste.${k}`); });
    });
    const ords = orderList[id] || [];
    if (!ords.length) { wn(`단골 ${id}: 영업에 한 번도 나오지 않아 취향을 알아낼 수 없음`); return; }
    const matches = Object.keys(R).filter((x) => TavernCore.tasteMatch(c, recOf(x)));
    if (!matches.length) err(`단골 ${id}: 취향에 맞는 레시피가 하나도 없음`);
    let good = 0, perfect = 0;
    ords.forEach((o) => matches.forEach((x) => { const r = TavernCore.judge(o, recOf(x)); if (r === 'perfect') perfect++; if (r === 'perfect' || r === 'good') good++; }));
    if (!good) err(`단골 ${id}: 어떤 주문에서도 취향을 맞히면서 주문을 맞힐 수 없음`);
    else if (!perfect) wn(`단골 ${id}: 대성공과 취향을 동시에 맞출 수 있는 주문이 없음 (보통 + 취향만 가능)`);
    tvStats.taste[id] = `${ts.tag ? '태그 ' + ts.tag : '재료 ' + G[ts.ing].name} (등장 ${ords.length}회)`;
  });
  // ---- 특별 주문 ----
  tvStats.specials = {};
  if (!T.specials) err('TAVERN.specials(특별 주문) 없음');
  else {
    ['day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day6free'].forEach((d) => { if (!T.specials[d]) err(`특별 주문 ${d} 없음 (2~7일차 하루 한 번)`); });
    Object.entries(T.specials).forEach(([dayId, sp]) => {
      if (!T.days[dayId]) { err(`특별 주문 ${dayId}: TAVERN.days 에 없는 날`); return; }
      const w = `특별 주문 ${dayId}`;
      if (!sp.title || !sp.brief) err(`${w}: title/brief 없음`);
      if (!sp.win || !(sp.win.gold > 0) || !Number.isInteger(sp.win.rep) || sp.win.rep < 0) err(`${w}: win.gold 는 양수, win.rep 은 0 이상의 정수`);
      if (!sp.lose || !Number.isInteger(sp.lose.rep) || sp.lose.rep > 0 || sp.lose.rep < -2) err(`${w}: lose.rep 는 -2~0 의 정수 (소폭 페널티)`);
      if (sp.lose && sp.lose.gold) err(`${w}: 실패에 골드 페널티를 두지 않음 (lose.gold 제거)`);
      ['win', 'lose'].forEach((k) => { if (!lineList(sp[k] && sp[k].lines).length) err(`${w}: ${k}.lines 없음`); lineList(sp[k] && sp[k].lines).forEach((l) => { if (l && l.text) faceOk(l.who || (sp.units[0] || {}).who, l.face, `${w} ${k}`); else err(`${w}: ${k}.lines 형식 오류`); }); });
      if (!Array.isArray(sp.units) || sp.units.length < 1 || sp.units.length > 3) { err(`${w}: units 는 1~3명`); return; }
      sp.units.forEach((u, i) => {
        const ww = `${w} 손님${i + 1}(${u.who})`;
        if (!CHARACTERS[u.who] || !T.customers[u.who]) { err(`${ww}: 없는 손님`); return; }
        if (T.customers[u.who].heroine) err(`${ww}: 특별 주문 손님은 히로인이 아님 (호감도 밸런스 보호)`);
        const o = u.order || {};
        if (!o.text || !Array.isArray(o.want) || !o.want.length) { err(`${ww}: order.text/want 확인`); return; }
        o.want.concat(o.avoid || []).forEach((t) => { if (!TG[t]) err(`${ww}: 정의되지 않은 태그 ${t}`); });
        (o.ing || []).concat(o.noIng || []).forEach((x) => { if (!G[x]) err(`${ww}: 없는 재료 ${x}`); });
        if ((o.ing || []).length + (o.noIng || []).length === 0 && sp.units.length === 1) wn(`${ww}: 한 명짜리 특별 주문인데 재료 조건(ing/noIng)이 없어 "조건 두 가지"가 아님`);
        if (!o.note) wn(`${ww}: order.note(조건 한 줄)가 없음`);
        lineList(u.say).forEach((l) => { if (l && l.text) faceOk(l.who || u.who, l.face, ww); });
        const perfect = Object.keys(R).filter((x) => TavernCore.judge(o, recOf(x)) === 'perfect');
        if (!perfect.length) err(`${ww}: 대성공으로 맞출 레시피가 하나도 없음`);
        else if (!perfect.some((x) => R[x].basic)) wn(`${ww}: 기본 레시피만으로는 대성공 불가 (필요: ${perfect.join('/')}) — 해금/발견이 필요한 특별 주문`);
      });
      const wl = sp.units.map((u) => u.who).join('/');
      tvStats.specials[dayId] = `${sp.title} (${sp.units.length}명: ${wl}, 성공 +${sp.win.gold}G 평판 +${sp.win.rep} / 실패 평판 ${sp.lose.rep})`;
    });
  }
  // 업그레이드 화면은 1~4일차 밤 뒤에 있어야 한다
  if (upgradeCmds.length < 1) wn(`{upgrades:true} 씬이 ${upgradeCmds.length}개뿐 (밤마다 구입 기회를 주는 것을 권장)`);
}

// ---------- 이벤트 CG 정의/사용 검사 (story/cg.js) ----------
const cgStats = { n: 0, temp: 0, file: 0 };
if (CG_DEFS) {
  const ids = Object.keys(CG_DEFS);
  cgStats.n = ids.length;
  if (ids.length !== 22) wn(`CG 는 22장이 목표 (현재 ${ids.length}장: 히로인별 4장 x 4 (깊은 이벤트 1장 포함) + 공용 4장 + 진/명가 엔딩 2장)`);
  ids.forEach((id) => {
    const d = CG_DEFS[id], w = `CG ${id}`;
    if (id === 'hide') err(`${w}: 'hide' 는 예약어`);
    if (!/^[a-z][a-z0-9_]*$/.test(id)) err(`${w}: id 는 영문 소문자/숫자/밑줄`);
    if (!d.title) err(`${w}: title 없음`);
    if (!d.hint) err(`${w}: hint 없음`);
    if (!(d.file === null || typeof d.file === 'string')) err(`${w}: file 은 null(임시 CG) 또는 경로 문자열`);
    if (typeof d.file === 'string') {
      cgStats.file++;
      files.add(d.file);
      if (d.file !== `assets/cg/${id}.webp`) wn(`${w}: 경로는 assets/cg/${id}.webp 를 권장 (${d.file})`);
      if (!fs.existsSync(path.join(root, d.file))) wn(`${w}: 파일이 없음 (${d.file}) — 로드 실패 시 임시 CG 로 표시됨`);
    } else cgStats.temp++;
    if (!BACKGROUNDS[d.bg]) err(`${w}: 임시 CG 배경 bg 가 없음/잘못됨 (${d.bg})`);
    if (!Array.isArray(d.who) || !d.who.length || d.who.length > 4) err(`${w}: who 는 1~4명의 캐릭터 id 배열`);
    (d.who || []).forEach((x) => { if (!CHARACTERS[x]) err(`${w}: who 에 없는 캐릭터 ${x}`); else if (!CHARACTERS[x].faces[d.face || 'smile']) err(`${w}: ${x} 에 없는 표정 ${d.face}`); });
    if (!cgUsed.has(id)) err(`${w}: 정의만 있고 스크립트에 {cg:'${id}'} 가 없음`);
    else if (![...seen].some((sc) => (cgScenes[sc] || []).includes(id))) err(`${w}: 도달 가능한 씬에서 쓰이지 않음`);
  });
  // 보이기/걷기 짝: CG 를 띄운 씬 안에서 그 뒤에 {cg:'hide'} 가 있어야 함 (낮 이벤트는 after_pick 에서도 걷지만 씬 안에서 걷는 것을 원칙으로)
  Object.entries(cgScenes).forEach(([sc, seq]) => {
    const last = seq.lastIndexOf('hide');
    seq.forEach((x, i) => { if (x !== 'hide' && !seq.slice(i + 1).includes('hide')) err(`[${sc}] CG ${x} 를 띄운 뒤 같은 씬에서 {cg:'hide'} 로 걷지 않음`); });
  });
}

// ---------- 아침 랜덤 사건 데이터 검사 (story/random-events.js) ----------
const evStats = { n: 0 };
if (RANDOM_EVENTS && EventCore) {
  const R = RANDOM_EVENTS, ids = Object.keys(R.events || {});
  evStats.n = ids.length;
  if (!(R.chance > 0 && R.chance <= 1)) err('RANDOM_EVENTS.chance 는 0 초과 1 이하');
  if (!Array.isArray(R.range) || R.range.length !== 2 || !(R.range[0] >= 2 && R.range[1] <= CALENDAR.total - 2 && R.range[0] <= R.range[1])) err('RANDOM_EVENTS.range 는 [처음, 끝] (2 이상, 종장 전까지)');
  if (ids.length < 10) wn(`랜덤 사건이 ${ids.length}개뿐 (30일 동안 반복을 줄이려면 20개 이상 권장)`);
  const evDays = (e) => { const out = []; for (let d = R.range[0]; d <= R.range[1]; d++) { const wk = CalCore.weekOf(d); if ((!e.weeks || e.weeks.includes(wk)) && (!e.days || e.days.includes(d)) && (!e.minDay || d >= e.minDay) && (!e.maxDay || d <= e.maxDay)) out.push(d); } return out; };
  const dayUse = {}, evScenes = new Set();
  ids.forEach((id) => {
    const e = R.events[id], w = `랜덤 사건 ${id}`, sc = scenes['rev_' + id];
    if (!e.title) err(`${w}: title 없음`);
    if (e.weeks && (!Array.isArray(e.weeks) || e.weeks.some((x) => !(x >= 1 && x <= CALENDAR.weeks)))) err(`${w}: weeks 는 1~${CALENDAR.weeks} 의 주차 배열`);
    if (!evDays(e).length) err(`${w}: 나올 수 있는 일차가 없음 (weeks/days/minDay/maxDay 확인)`);
    if (e.weight != null && !(e.weight > 0)) err(`${w}: weight 는 양수`);
    if (e.if) { try { VN.checkCond(e.if); } catch (x) { err(`${w}: if ${x.message}`); } }
    if (!sc) { err(`${w}: 씬 rev_${id} 가 없음`); return; }
    evDays(e).forEach((d) => { dayUse[d] = (dayUse[d] || 0) + 1; });
    // rev_<id> 에서 시작해 rev_end 에 도달해야 하고, 선택지 효과가 소폭이어야 함
    const stack = ['rev_' + id], vis = new Set(); let reachEnd = false, hasChoice = false;
    while (stack.length) {
      const sid = stack.pop(); if (vis.has(sid)) continue; vis.add(sid);
      if (sid === 'rev_end') { reachEnd = true; continue; }
      (edges[sid] || []).forEach((t) => stack.push(t));
      (scenes[sid] || []).forEach((c, i) => {
        if ('ending' in c || 'tavern' in c || 'day' in c) err(`${w} [${sid}] #${i}: 사건 장면에서 쓸 수 없는 명령`);
        const lim = (set, where) => Object.entries(set || {}).forEach(([k, v]) => {
          if (k === 'gold' && !(Math.abs(v) <= 15)) err(`${w} ${where}: 골드 변화는 ±15 이하 (${v})`);
          if (k === 'rep' && !(Math.abs(v) <= 2)) err(`${w} ${where}: 평판 변화는 ±2 이하 (${v})`);
          if (/^aff\./.test(k) && !(v >= 0 && v <= 2)) err(`${w} ${where}: 호감도는 0~2 증가만 (${k} ${v})`);
          if (k === 'today.cust' && !(Math.abs(v) <= 1)) err(`${w} ${where}: today.cust 는 ±1`);
          if (k === 'today.price' && !(Math.abs(v) <= 50)) err(`${w} ${where}: today.price 는 ±50%`);
          if (k === 'today.tip' && !(v >= 0 && v <= 100)) err(`${w} ${where}: today.tip 은 0~100%`);
          if (k === 'today.note' && !(typeof v === 'string' && v)) err(`${w} ${where}: today.note 는 문자열`);
          if (/^(flag|ev|tavern|llm)\./.test(k)) err(`${w} ${where}: 사건에서 ${k} 를 바꾸지 않음 (스토리/영업 진행 보호)`);
        });
        lim(c.set, `[${sid}] #${i}`);
        if (c.choice) {
          hasChoice = true;
          c.choice.forEach((o, j) => { lim(o.set, `[${sid}] 선택지${j + 1}`); if (o.cost && o.cost > 10) err(`${w}: 선택지 비용은 10G 이하`); });
          const reps = c.choice.filter((o) => !o.if).map((o) => (o.set && o.set.rep) || 0);
          if (reps.length && Math.min(...reps) > 0) err(`${w}: 평판이 오르기만 하는 선택지뿐임 (평판 최저 전략 보호: 0 이하 선택지 필요)`);
        }
      });
    }
    vis.forEach((x) => evScenes.add(x));
    if (!reachEnd) err(`${w}: rev_end(아침 복귀)에 도달하지 못함`);
    if (!hasChoice) err(`${w}: 선택지가 없음 (1~2개 이상의 선택지)`);
  });
  Object.keys(scenes).filter((x) => /^rev_/.test(x) && x !== 'rev_end').forEach((x) => { if (!evScenes.has(x)) wn(`씬 ${x}: 어느 랜덤 사건에서도 도달할 수 없음`); });
  if (!scenes.rev_end) err('공용 씬 rev_end 없음');
  for (let d = R.range[0]; d <= R.range[1]; d++) if (!dayUse[d]) err(`랜덤 사건: ${d}일차에 나올 수 있는 사건이 없음`);
  // rand 명령: 일상일 아침(rt_open)과 범위 안의 메인 고정일 아침 장면에 한 번씩
  const randDays = [];
  Object.entries(scenes).forEach(([sid, cmds]) => cmds.forEach((c) => { if ('rand' in c) randDays.push(sid); }));
  if (!randDays.includes(CALENDAR.routineScene)) err(`일상일 아침 장면 ${CALENDAR.routineScene} 에 rand 명령이 없음`);
  Object.entries(CALENDAR.main).forEach(([d, m]) => { if (m.scene && d >= R.range[0] && d <= R.range[1] && !(function f(sid, vis) { if (vis.has(sid)) return false; vis.add(sid); return (scenes[sid] || []).some((c) => 'rand' in c) || (edges[sid] || []).some((t) => !/^(rev_|pick|nev_)/.test(t) && f(t, vis)); })(m.scene, new Set())) wn(`메인 ${d}일차 아침(${m.scene}) 흐름에 rand 명령이 없음 (랜덤 사건이 나오지 않는 날)`); });
  // 영업 보정 사건이 실제로 작동하는가: 손님 -1 / +1, 재료 값
  const T = TAVERN;
  Object.entries(R.events).forEach(([id, e]) => {
    const allSets = []; (function walk(sid, vis) { if (vis.has(sid) || sid === 'rev_end') return; vis.add(sid); (scenes[sid] || []).forEach((c) => { [c.set].concat((c.choice || []).map((o) => o.set)).forEach((x) => x && allSets.push(x)); }); (edges[sid] || []).forEach((t) => walk(t, vis)); })('rev_' + id, new Set());
    const cust = allSets.map((x) => x['today.cust'] || 0).filter(Boolean);
    cust.forEach((cv) => [12].forEach((d) => {
      const rv = { rev: { seed: 99, used: [] }, aff: {} }, rk = TavernCore.routine(T, Object.assign({ day: 12, today: { cust: 0 }, tavern: { upg: {} }, inn: { rank: 1 } }, rv), 12, VN.evalCond);
      const base = TavernCore.queue(T, rk, { day: 12, today: { cust: 0 }, tavern: { upg: {} } }, VN.evalCond).length;
      const mod = TavernCore.queue(T, rk, { day: 12, today: { cust: cv }, tavern: { upg: {} } }, VN.evalCond).length;
      if (mod !== base + cv) err(`랜덤 사건 ${id}: ${d}일차에 손님 ${cv > 0 ? '+' : ''}${cv} 가 적용되지 않음 (줄일 수 있는 일반 손님이 없거나 추가 손님이 없음: ${base} -> ${mod})`);
    }));
  });
  // 결정성: 같은 시드/일차/사용 기록이면 항상 같은 결과, 시드가 다르면 분포가 비슷한 확률
  const mk = (seed) => { const v = { day: 3, aff: { erion: 3, kaela: 0, miho: 0, lia: 0 }, rev: { seed, used: [] } }; EventCore.ensure(v); return v; };
  let det = true, hit = 0, N = 4000;
  for (let i = 0; i < N; i++) {
    const a = EventCore.pick(R, mk(i * 7919), 3, VN.evalCond), b = EventCore.pick(R, mk(i * 7919), 3, VN.evalCond);
    if (a !== b) det = false;
    if (a) hit++;
  }
  if (!det) err('EventCore.pick 가 결정적이지 않음 (같은 입력에 다른 결과)');
  if (Math.abs(hit / N - R.chance) > 0.05) err(`랜덤 사건 발생률이 설정(${R.chance})과 다름: ${(hit / N).toFixed(3)}`);
  evStats.rate = (hit / N).toFixed(3);
  // 추가 손님 (TAVERN.extras)
  const ex = T.extras || [];
  if (ex.length < 3) err('TAVERN.extras(음유시인 등으로 늘어나는 단골) 가 3명 미만');
  ex.forEach((c, i) => {
    const w = `TAVERN.extras[${i}] (${c.who})`;
    if (!CHARACTERS[c.who] || !T.customers[c.who]) { err(`${w}: 없는 손님`); return; }
    if (T.customers[c.who].heroine) err(`${w}: 히로인이 아님 (호감도 밸런스 보호)`);
    if (!c.order || !c.order.text || !Array.isArray(c.order.want) || !c.order.want.length) { err(`${w}: order.text/want 확인`); return; }
    c.order.want.concat(c.order.avoid || []).forEach((t) => { if (!T.tags[t]) err(`${w}: 정의되지 않은 태그 ${t}`); });
    if (!Object.keys(T.recipes).some((x) => T.recipes[x].basic && TavernCore.judge(c.order, Object.assign({ id: x }, T.recipes[x])) === 'perfect')) wn(`${w}: 기본 레시피로는 대성공 불가`);
    (c.say || []).forEach((l) => { if (l && l.text && l.face && !CHARACTERS[c.who].faces[l.face]) err(`${w}: 없는 표정 ${l.face}`); });
  });
}

// ---------- 숙박 / 여관 등급 / 선물 / 밤 사건 / 신경전 / 깊은 이벤트 데이터 검사 ----------
const innStats = {};
if (LODGING && INN_RANK && GIFTS && RIVALRY && InnCore) {
  const R = TAVERN.recipes, faceOk2 = (who, f, where) => { const ch = CHARACTERS[who]; if (!ch) err(`${where}: 없는 캐릭터 ${who}`); else if (f && !ch.faces[f]) err(`${where}: ${who} 에 없는 표정 ${f}`); };
  // 장면 안에서 닿을 수 있는 씬들 (id 에서 시작해 stopAt 에 닿으면 멈춤)
  const walk = (start, stopAt) => { const vis = new Set(), st = [start]; let hit = false; while (st.length) { const x = st.pop(); if (vis.has(x)) continue; vis.add(x); if (stopAt.includes(x)) { hit = true; continue; } (edges[x] || []).forEach((t) => st.push(t)); } return { vis, hit }; };
  // ---- 선물 ----
  const items = Object.keys(GIFTS.items);
  if (items.length !== 8) err(`선물은 8종이어야 함 (현재 ${items.length})`);
  const tp = GIFTS.tiers;
  if (!(tp.fav.points === 3 && tp.like.points === 2 && tp.normal.points === 1 && tp.hate.points === -1)) err('GIFTS.tiers 는 최애 +3 / 좋아함 +2 / 보통 +1 / 싫어함 -1');
  items.forEach((id) => {
    const d = GIFTS.items[id], w = `선물 ${id}`;
    if (!d.name || !d.desc || !d.hint) err(`${w}: name/desc/hint 확인`);
    if (!(d.price >= 5 && d.price <= 40)) err(`${w}: price 는 5~40G`);
    files.add(d.icon); if (!d.icon || !fs.existsSync(path.join(root, d.icon))) err(`${w}: 아이콘 없음 ${d.icon}`);
  });
  innStats.gift = {};
  let reactN = 0;
  (HEROINES || []).forEach((h) => {
    const pr = GIFTS.prefs[h] || {}, cnt = { fav: 0, like: 0, normal: 0, hate: 0 };
    items.forEach((id) => { const t = pr[id]; if (!tp[t]) err(`선물 취향 ${h}.${id}: 알 수 없는 등급 ${t}`); else cnt[t]++; });
    if (cnt.fav !== 1) err(`선물 취향 ${h}: 최애는 정확히 1개 (현재 ${cnt.fav})`);
    if (cnt.like < 1) err(`선물 취향 ${h}: 좋아함이 1개 이상 필요`);
    if (cnt.hate < 1) err(`선물 취향 ${h}: 싫어함이 1개 이상 필요`);
    const rc = GIFTS.react[h] || {};
    items.forEach((id) => {
      const r = rc[id], w = `선물 반응 ${h}.${id}`;
      if (!r || typeof r.text !== 'string' || r.text.length < 12) { err(`${w}: text 없음/너무 짧음`); return; }
      faceOk2(h, r.face, w); reactN++;
    });
    innStats.gift[h] = Object.fromEntries(['fav', 'like', 'normal', 'hate'].map((t) => [tp[t].label, items.filter((id) => pr[id] === t).map((id) => GIFTS.items[id].name).join('/')]));
  });
  items.forEach((id) => { if (!HEROINES.some((h) => ['fav', 'like'].includes(GIFTS.prefs[h][id]))) wn(`선물 ${id}: 누구도 좋아하지 않는 선물 (쓸모 없음)`); });
  innStats.giftReact = reactN;
  // ---- 숙박 ----
  const rooms = Object.keys(LODGING.rooms), req = Object.keys(LODGING.requests);
  if (rooms.length !== 3) err(`객실은 3개여야 함 (현재 ${rooms.length})`);
  if (rooms.filter((r) => LODGING.rooms[r].open).length !== 2) err('처음부터 열려 있는 객실은 2개여야 함');
  rooms.forEach((r) => { const d = LODGING.rooms[r]; if (!d.name || !d.short || !(d.price > 0)) err(`객실 ${r}: name/short/price 확인`); (d.tags || []).forEach((t) => { if (!req.includes(t)) err(`객실 ${r}: 없는 요청 태그 ${t}`); }); if (!d.open && !LODGING.upgrades.some((u) => u.openRoom === r)) err(`객실 ${r}: 열어 줄 업그레이드(openRoom)가 없음`); });
  const ups = LODGING.upgrades;
  if (ups.length < 3 || ups.length > 4) err(`객실 업그레이드는 3~4개 (현재 ${ups.length})`);
  if (new Set(ups.map((u) => u.id)).size !== ups.length) err('객실 업그레이드 id 중복');
  ups.forEach((u) => {
    if (!u.name || !u.desc || !(u.price > 0)) err(`객실 업그레이드 ${u.id}: name/desc/price 확인`);
    if (u.openRoom && !LODGING.rooms[u.openRoom]) err(`객실 업그레이드 ${u.id}: 없는 객실 ${u.openRoom}`);
    if (u.needRank && !(u.needRank >= 2 && u.needRank <= 5)) err(`객실 업그레이드 ${u.id}: needRank 는 2~5`);
    Object.entries(u.tags || {}).forEach(([k, arr]) => { if (k !== 'all' && !LODGING.rooms[k]) err(`객실 업그레이드 ${u.id}: tags 의 없는 객실 ${k}`); arr.forEach((t) => { if (!req.includes(t)) err(`객실 업그레이드 ${u.id}: 없는 요청 ${t}`); }); });
    if (TAVERN.upgrades.some((x) => x.id === u.id)) err(`객실 업그레이드 ${u.id}: 영업 업그레이드 id 와 겹침`);
  });
  const gs = LODGING.guests;
  if (gs.length < 10) wn(`숙박 손님 10팀 이상 권장 (현재 ${gs.length})`);
  if (new Set(gs.map((g) => g.id)).size !== gs.length) err('숙박 손님 id 중복');
  const reqCount = {};
  gs.forEach((g) => {
    const w = `숙박 손님 ${g.id}`;
    if (!g.name || !g.kind || !g.glyph || !g.color || !g.say || !g.ok || !g.meh) err(`${w}: name/kind/glyph/color/say/ok/meh 확인`);
    if (!req.includes(g.req)) err(`${w}: 없는 요청 ${g.req}`);
    if (!(g.bonus > 0 && g.bonus <= 12)) err(`${w}: bonus 는 1~12G`);
    reqCount[g.req] = (reqCount[g.req] || 0) + 1;
  });
  req.forEach((k) => { if (!reqCount[k]) err(`요청 ${k}: 이 요청을 하는 손님이 없음`); });
  // 모든 객실 업그레이드를 샀을 때 모든 요청을 만족시킬 수 있어야 한다
  { const v = { day: 4, rev: { seed: 1, used: [] }, lodge: { upg: Object.fromEntries(ups.map((u) => [u.id, true])), hosted: {}, seen: [], report: [], log: [] }, inn: { rank: 5 }, gold: 0, rep: 0, aff: {} };
    req.forEach((k) => { if (k !== 'any' && !rooms.some((r) => InnCore.roomOpen(v, r) && InnCore.roomTags(v, r).includes(k))) err(`요청 ${k}: 모든 개조 후에도 만족시킬 방이 없음`); }); }
  // 시작 상태(열린 2개 방)에서도 손님 구성에 만족 가능한 팀이 항상 있다 + 결정성 + 3팀 확률
  { let three = 0, N = 600, det = true, noSat = 0;
    for (let i = 0; i < N; i++) {
      const mk = () => { const v = { day: 1 + (i % 4), gold: 0, rep: 0, aff: {}, rev: { seed: i * 104729, used: [] }, lodge: null, inn: null }; InnCore.ensure(v); return v; };
      const a = mk(), b = mk(); const ga = InnCore.guestsFor(a, a.day), gb = InnCore.guestsFor(b, b.day);
      if (ga.map((g) => g.id).join() !== gb.map((g) => g.id).join()) det = false;
      if (ga.length === 3) three++;
      if (new Set(ga.map((g) => g.id)).size !== ga.length) err('숙박 손님이 한 밤에 중복');
      const open = rooms.filter((r) => InnCore.roomOpen(a, r));
      if (!ga.some((g) => open.some((r) => InnCore.matches(a, g, r)))) noSat++;
    }
    if (!det) err('InnCore.guestsFor 가 결정적이지 않음');
    if (noSat) err(`시작 객실로 만족시킬 수 있는 손님이 한 팀도 없는 밤이 ${noSat}번 있음`);
    innStats.three = (three / N).toFixed(2);
    if (Math.abs(three / N - LODGING.settings.threeChance) > 0.07) err(`3팀 확률이 설정(${LODGING.settings.threeChance})과 다름: ${(three / N).toFixed(2)}`); }
  // ---- 밤 사건 ----
  const NE = LODGING.nightEvents, nIds = Object.keys(NE.events);
  innStats.nev = nIds.length;
  if (nIds.length < 5 || nIds.length > 6) wn(`밤 사건은 5~6개가 목표 (현재 ${nIds.length}개)`);
  if (!(NE.chance > 0 && NE.chance <= 0.5)) err('LODGING.nightEvents.chance 는 0 초과 0.5 이하 (약 25% 권장)');
  if (!Array.isArray(NE.range) || NE.range.length !== 2 || NE.range[0] < 1 || NE.range[1] > CALENDAR.total - 2) err('LODGING.nightEvents.range 는 [처음, 끝] (1일차 이후, 종장 전까지)');
  if (!scenes.nev_end) err('공용 씬 nev_end 없음');
  nIds.forEach((id) => {
    const e = NE.events[id], w = `밤 사건 ${id}`;
    if (!e.title) err(`${w}: title 없음`);
    if (e.weight != null && !(e.weight > 0)) err(`${w}: weight 는 양수`);
    if (e.if) { try { VN.checkCond(e.if); } catch (x) { err(`${w}: if ${x.message}`); } }
    if (!scenes['nev_' + id]) return err(`${w}: 씬 nev_${id} 가 없음`);
    const wk = walk('nev_' + id, ['nev_end']); let hasChoice = false;
    if (!wk.hit) err(`${w}: nev_end 에 도달하지 못함`);
    wk.vis.forEach((sid) => (scenes[sid] || []).forEach((c, i) => {
      if ('ending' in c || 'tavern' in c || 'day' in c || 'upgrades' in c || 'lodging' in c) err(`${w} [${sid}] #${i}: 밤 사건에서 쓸 수 없는 명령`);
      const lim = (set, where) => Object.entries(set || {}).forEach(([k, v]) => {
        if (k === 'gold' && !(Math.abs(v) <= 15)) err(`${w} ${where}: 골드 변화는 ±15 이하 (${v})`);
        else if (k === 'rep' && !(Math.abs(v) <= 2)) err(`${w} ${where}: 평판 변화는 ±2 이하 (${v})`);
        else if (/^aff\./.test(k) && !(v >= 0 && v <= 2)) err(`${w} ${where}: 호감도는 0~2 증가만 (${k} ${v})`);
        else if (k === 'lodge.note') { if (!(typeof v === 'string' && v.length >= 8)) err(`${w} ${where}: lodge.note 는 한 줄 문장`); }
        else if (!/^(gold|rep|aff\.\w+)$/.test(k)) err(`${w} ${where}: 밤 사건에서 ${k} 를 바꾸지 않음`);
      });
      lim(c.set, `[${sid}] #${i}`);
      if (c.choice) { hasChoice = true; c.choice.forEach((o, j) => lim(o.set, `[${sid}] 선택지${j + 1}`)); if (!c.choice.some((o) => !o.if)) err(`${w}: 조건 없는 선택지가 없음`); }
    }));
    if (!hasChoice) err(`${w}: 선택지가 없음`);
    if (!wk.vis.size || ![...wk.vis].some((sid) => (scenes[sid] || []).some((c) => c.set && 'lodge.note' in c.set) || (scenes[sid] || []).some((c) => (c.choice || []).some((o) => o.set && 'lodge.note' in o.set)))) wn(`${w}: 다음 날 아침 정산 문구(lodge.note)가 없음`);
  });
  Object.keys(scenes).filter((x) => /^nev_/.test(x) && x !== 'nev_end').forEach((x) => { if (!nIds.some((id) => walk('nev_' + id, ['nev_end']).vis.has(x))) wn(`씬 ${x}: 어느 밤 사건에서도 도달할 수 없음`); });
  // 밤 사건 발생률/결정성
  { let hit = 0, det = true, N = 4000; const mk = (seed) => { const v = { day: 2, rev: { seed, used: [] }, aff: { erion: 5, kaela: 5, miho: 5, lia: 5 }, lodge: { hosted: { cloak: 1 } } }; InnCore.ensure(v); return v; };
    for (let i = 0; i < N; i++) { const a = InnCore.nightEvent(mk(i * 7919), 2, VN.evalCond), b = InnCore.nightEvent(mk(i * 7919), 2, VN.evalCond); if (a !== b) det = false; if (a) hit++; }
    if (!det) err('InnCore.nightEvent 가 결정적이지 않음');
    if (Math.abs(hit / N - NE.chance) > 0.04) err(`밤 사건 발생률이 설정(${NE.chance})과 다름: ${(hit / N).toFixed(3)}`);
    innStats.nevRate = (hit / N).toFixed(3); }
  // 명령 배치: 밤마다(night_close) time -> lodging -> nightev -> rankcheck -> upgrades -> 다음 날 순서
  { const cm = scenes.night_close || [], keys = cm.map((c) => Object.keys(c)[0]).join('>');
    if (!/lodging>nightev>rankcheck>upgrades>goto$/.test(keys)) err(`night_close: lodging > nightev > rankcheck > upgrades 순서여야 함 (현재 ${keys})`); }
  // ---- 여관 등급 ----
  const st = INN_RANK.stars;
  if (st.length !== 5 || st.some((s2, i) => s2.n !== i + 1 || !s2.name)) err('INN_RANK.stars 는 1~5 등급 5개 (n/name)');
  for (let i = 1; i < st.length; i++) if (!(st[i].min > st[i - 1].min)) err('INN_RANK.stars 의 min 은 점점 커져야 함');
  [2, 3, 4, 5].forEach((n) => {
    const u = INN_RANK.unlocks[n];
    if (!u || !u.text) err(`INN_RANK.unlocks.${n} 없음`);
    (u && u.learn || []).forEach((r2) => { if (!R[r2]) err(`INN_RANK.unlocks.${n}: 없는 레시피 ${r2}`); });
    HEROINES.forEach((h) => { const c2 = (INN_RANK.cheer[n] || {})[h]; if (!c2 || !c2.text) err(`INN_RANK.cheer.${n}.${h} 없음`); else faceOk2(h, c2.face, `INN_RANK.cheer.${n}.${h}`); });
  });
  if ((INN_RANK.unlocks[3].learn || []).length !== 2) err('3성 해금은 새 레시피 2개');
  if (!/\{stars\}/.test(INN_RANK.endingLine)) err('INN_RANK.endingLine 에 {stars} 가 없음');
  if (!ups.some((u) => u.needRank === 4 && u.openRoom)) err('4성에 다락 특실(openRoom + needRank 4) 업그레이드가 필요');
  if (!TAVERN.days.day7.customers.some((c) => c.who === 'noble' && /inn\.rank>=5/.test(c.if || '') && c.reward)) err('7일차에 inn.rank>=5 조건의 귀족 손님(reward 포함)이 필요');
  if (!TAVERN.days.day2.customers.some((c) => /inn\.rank>=2/.test(c.if || ''))) err('2성 해금 단골이 영업 손님 목록에 없음');
  // 등급 규칙 단위 점검
  { const v = { day: 3, rep: 0, inn: { rank: 1, sat: 0, log: [] } }; InnCore.ensure(v);
    v.rep = st[2].min; const r1 = InnCore.checkRank(v); if (!r1 || r1.to !== 3 || r1.levels.join() !== '2,3') err('InnCore.checkRank: 점수 도달 시 등급이 올라야 함');
    v.rep = -20; if (InnCore.checkRank(v) || v.inn.rank !== 3) err('InnCore.checkRank: 등급은 내려가지 않아야 함'); }
  // ---- 신경전 ----
  const pairs = RIVALRY.pairs;
  if (pairs.length < 3 || pairs.length > 4) err(`신경전 쌍은 3~4개 (현재 ${pairs.length})`);
  if (!(RIVALRY.max >= 1 && RIVALRY.max <= 4)) err('RIVALRY.max 는 1~4');
  if (!(RIVALRY.need >= HEART(2) + 1)) err(`RIVALRY.need 는 하트 2칸 반(${HEART(2) + 1}) 이상`);
  if (!(RIVALRY.range && RIVALRY.range[0] >= 2 && RIVALRY.range[1] <= CALENDAR.total - 2)) err('RIVALRY.range 는 [처음, 끝] (2일차 이후, 종장 전까지)');
  if (!scenes.riv_end) err('공용 씬 riv_end 없음');
  pairs.forEach((p) => {
    const w = `신경전 ${p.id}`;
    if (!HEROINES.includes(p.a) || !HEROINES.includes(p.b) || p.a === p.b) err(`${w}: a/b 는 서로 다른 히로인`);
    if (!p.title || !scenes[p.scene]) return err(`${w}: title/scene 확인`);
    const wk = walk(p.scene, ['riv_end']);
    if (!wk.hit) err(`${w}: riv_end 에 도달하지 못함`);
    const top = scenes[p.scene].find((c) => c.choice);
    if (!top || top.choice.length !== 3) err(`${w}: 선택지는 3개 (a 편들기 / b 편들기 / 둘 다 달래기)`);
    else {
      const [a1, b1, c1] = top.choice;
      if (!(a1.set[`aff.${p.a}`] > 0 && a1.set[`aff.${p.b}`] < 0 && b1.set[`aff.${p.b}`] > 0 && b1.set[`aff.${p.a}`] < 0)) err(`${w}: 편들기는 편든 쪽 +, 상대 - 여야 함`);
      if (!(c1.set[`aff.${p.a}`] > 0 && c1.set[`aff.${p.b}`] > 0)) err(`${w}: 달래기는 둘 다 +`);
      top.choice.forEach((o) => { if ('rep' in o.set || 'gold' in o.set) err(`${w}: 신경전 선택지는 평판/골드를 바꾸지 않음 (평판 +0)`); });
    }
    wk.vis.forEach((sid) => (scenes[sid] || []).forEach((c, i) => { if ('ending' in c || 'tavern' in c || 'day' in c || 'upgrades' in c) err(`${w} [${sid}] #${i}: 신경전에서 쓸 수 없는 명령`); }));
    [p.a, p.b].forEach((h) => { if (![...wk.vis].some((sid) => (scenes[sid] || []).some((c) => c.say === h))) wn(`${w}: ${h} 의 대사가 없음`); });
  });
  Object.keys(scenes).filter((x) => /^riv_/.test(x) && x !== 'riv_end').forEach((x) => { if (!pairs.some((p) => walk(p.scene, ['riv_end']).vis.has(x))) wn(`씬 ${x}: 어느 신경전에서도 도달할 수 없음`); });
  // ---- 깊은 이벤트 ----
  HEROINES.forEach((h) => {
    const sc5 = scenes[`${h}_5`], w = `깊은 이벤트 ${h}_5`;
    if (!sc5) return;
    const top = sc5.find((c) => c.choice);
    if (!top || top.choice.length !== 2) err(`${w}: 선택지는 2개`);
    else top.choice.forEach((o) => { const a = (o.set || {})[`aff.${h}`] || 0; if (!(a >= 2 && a <= 3)) err(`${w}: 호감도 +2~3 (현재 ${a})`); });
    if (!sc5.some((c) => c.set && c.set[`flag.deep_${h}`])) err(`${w}: flag.deep_${h} 를 켜지 않음`);
    if (!sc5.some((c) => c.cg === `${h}_deep`)) err(`${w}: CG ${h}_deep 를 띄우지 않음`);
    if (!CG_DEFS[`${h}_deep`]) err(`${w}: CG_DEFS.${h}_deep 없음`);
    // 들어가는 곳: HEROINE_EVENTS 의 kind:'extra' (호감도 하트 4칸 조건, 한 번만)
    const ex = (HEROINE_EVENTS[h] || []).filter((e) => e.scene === `${h}_5`);
    if (ex.length !== 1) err(`${w}: HEROINE_EVENTS.${h} 에 scene:'${h}_5' 항목이 정확히 하나여야 함`);
    else {
      if (ex[0].kind !== 'extra') err(`${w}: kind:'extra' (호감도 조건 이벤트) 여야 함`);
      if (!(ex[0].minAff >= HEART(4))) err(`${w}: minAff 는 하트 4칸(${HEART(4)}) 이상`);
    }
    Object.entries(scenes).forEach(([sid, cm]) => cm.forEach((c) => (c.choice || []).forEach((o) => { if (o.goto === `${h}_5`) err(`${w}: 선택지로 직접 들어가면 안 됨 [${sid}] (HEROINE_EVENTS 로만)`); })));
  });
}


// ---------- 30일 구성 검사: 달력 / 일상 문구 / 일상 영업 / 히로인 이벤트 / 주간 이벤트 ----------
const calStats = { daily: {}, routine: {} };
{
  const T = TAVERN, RT = ctx.TAVERN_ROUTINE, C = CALENDAR;
  // 달력
  if (C.total !== 30 || C.weeks !== 4) wn(`달력이 30일/4주 구성이 아님 (total ${C.total}, weeks ${C.weeks})`);
  Object.entries(C.main).forEach(([d, m]) => {
    d = Number(d);
    if (!(d >= 1 && d <= C.total)) err(`CALENDAR.main.${d}: 일차 범위 밖`);
    if (m.scene) {
      if (!scenes[m.scene]) err(`CALENDAR.main.${d}: 없는 씬 ${m.scene}`);
      else if (!(scenes[m.scene].some((c) => 'day' in c && (d === 1 ? c.day === 1 : c.day === 'next')))) err(`CALENDAR.main.${d}: 씬 ${m.scene} 에 {day:${d === 1 ? 1 : "'next'"}} 가 없음`);
    }
    if (m.evening && !scenes[m.evening]) err(`CALENDAR.main.${d}: 없는 저녁 씬 ${m.evening}`);
    if (!m.title) err(`CALENDAR.main.${d}: title 없음`);
  });
  [C.routineScene, C.holidayScene, C.routineEvening].forEach((id) => { if (!scenes[id]) err(`CALENDAR: 없는 씬 ${id}`); });
  C.chapters.forEach((ch) => { if (!ch.title || !ch.blurb) err(`CALENDAR.chapters ${ch.id}: title/blurb`); });
  const cover = new Set(); C.chapters.forEach((ch) => { for (let d = ch.days[0]; d <= ch.days[1]; d++) cover.add(d); });
  for (let d = 1; d <= C.total; d++) if (!cover.has(d)) err(`CALENDAR.chapters: ${d}일차가 어느 챕터에도 없음`);
  // 주당 메인 고정일은 2~3일
  const perWeek = {}; Object.keys(C.main).forEach((d) => { const wk = CalCore.weekOf(Number(d)); perWeek[wk] = (perWeek[wk] || 0) + 1; });
  calStats.mainPerWeek = perWeek;
  for (let w = 1; w <= C.weeks; w++) if (!(perWeek[w] >= 1 && perWeek[w] <= 3)) wn(`${w}주차 메인 고정일 ${perWeek[w] || 0}일 (주 2~3일이 목표)`);
  // 일상 문구
  ['morning', 'eve', 'night'].forEach((k) => { const n = (ctx.DAILY[k] || []).length; calStats.daily[k] = n; if (n < 8) err(`DAILY.${k} 가 ${n}줄 (8줄 이상)`); });
  const dn = ['morning', 'eve', 'night'].reduce((a, k) => a + ctx.DAILY[k].length, 0);
  if (dn < 30) err(`일상 문구가 ${dn}줄 (30줄 이상 필요)`);
  for (let w = 1; w <= 5; w++) ['morning'].forEach((k) => { if (ctx.DAILY[k].filter((e) => !e.w || e.w.includes(w)).length < 6) wn(`DAILY.${k}: ${w}주차에 나올 수 있는 문구가 6줄 미만`); });
  // 낮 행동 3~5개
  const acts = ctx.DAY_ACTIONS; calStats.acts = acts.length;
  if (acts.length < 3 || acts.length > 5) err(`DAY_ACTIONS 는 3~5개 (현재 ${acts.length})`);
  acts.forEach((a) => { if (!scenes[a.scene]) err(`DAY_ACTIONS.${a.id}: 없는 씬 ${a.scene}`); if (a.if) { try { VN.checkCond(a.if); } catch (e) { err(`DAY_ACTIONS.${a.id}: ${e.message}`); } } });
  // 히로인 이벤트
  HEROINES.forEach((h) => {
    const list = HEROINE_EVENTS[h] || [];
    if (list.length < 5) err(`HEROINE_EVENTS.${h} 가 ${list.length}개 (5개 이상)`);
    const ids = new Set();
    list.forEach((e) => {
      if (ids.has(e.id)) err(`HEROINE_EVENTS.${h}: 중복 id ${e.id}`); ids.add(e.id);
      if (!scenes[e.scene]) err(`HEROINE_EVENTS.${h}.${e.id}: 없는 씬 ${e.scene}`);
      if (!e.text) err(`HEROINE_EVENTS.${h}.${e.id}: text 없음`);
      if (e.if) { try { VN.checkCond(e.if); } catch (x) { err(`HEROINE_EVENTS.${h}.${e.id}: ${x.message}`); } }
    });
    const plain = (ctx.PLAIN_DAYS || {})[h] || [];
    if (plain.length < 3) err(`PLAIN_DAYS.${h} 가 ${plain.length}개 (평범한 하루 3개 이상)`);
    plain.forEach((p) => { if (!scenes[p.scene]) err(`PLAIN_DAYS.${h}: 없는 씬 ${p.scene}`); });
  });
  // 주간 이벤트 / 산책
  const W = ctx.WEEKLY_EVENTS;
  (W.events || []).forEach((e) => { if (!scenes[e.scene]) err(`WEEKLY_EVENTS.${e.id}: 없는 씬 ${e.scene}`); });
  HEROINES.forEach((h) => { if (!W.walks || !W.walks[h] || !scenes[W.walks[h].scene]) err(`WEEKLY_EVENTS.walks.${h}: 휴일 산책 씬이 없음`); });
  // 일상 영업 데이터
  if (!RT) err('story/tavern-routine.js (TAVERN_ROUTINE) 가 로드되지 않음');
  else {
    const orders = RT.orders; calStats.routine.orders = orders.length; calStats.routine.specials = RT.specials.length;
    if (orders.length < 24) err(`TAVERN_ROUTINE.orders 가 ${orders.length}개 (24개 이상)`);
    let basicOk = 0;
    orders.forEach((o, i) => {
      o.want.concat(o.avoid || []).forEach((t) => { if (!T.tags[t]) err(`TAVERN_ROUTINE.orders[${i}]: 없는 태그 ${t}`); });
      const rs = Object.keys(T.recipes).filter((id) => TavernCore.judge(o, Object.assign({ id }, T.recipes[id])) === 'perfect');
      if (!rs.length) err(`TAVERN_ROUTINE.orders[${i}] "${o.text}": 대성공이 가능한 레시피가 없음`);
      if (rs.some((id) => T.recipes[id].basic)) basicOk++;
    });
    calStats.routine.basicOk = `${basicOk}/${orders.length}`;
    RT.customers.forEach((c) => {
      if (!T.customers[c.who] || T.customers[c.who].heroine) err(`TAVERN_ROUTINE.customers ${c.who}: 일반 손님이 아님`);
      if (!c.lines || c.lines.length < 4) err(`TAVERN_ROUTINE.customers ${c.who}: 등장 대사 4개 이상`);
      (c.lines || []).forEach((l) => { if (l.face && !CHARACTERS[c.who].faces[l.face]) err(`TAVERN_ROUTINE.customers ${c.who}: 없는 표정 ${l.face}`); });
    });
    HEROINES.forEach((h) => {
      const hd = RT.heroines[h];
      if (!hd || hd.lines.length < 4 || hd.orders.length < 3) { err(`TAVERN_ROUTINE.heroines.${h}: 대사 4개/주문 3개 이상`); return; }
      hd.lines.forEach((l) => { if (l.face && !CHARACTERS[h].faces[l.face]) err(`TAVERN_ROUTINE.heroines.${h}: 없는 표정 ${l.face}`); });
      hd.orders.forEach((o, i) => { const rs = Object.keys(T.recipes).filter((id) => TavernCore.judge(o, Object.assign({ id }, T.recipes[id])) === 'perfect' && !(T.customers[h].dislike || []).includes(id)); if (!rs.length) err(`TAVERN_ROUTINE.heroines.${h}.orders[${i}]: 싫어하는 메뉴 말고 대성공이 가능한 레시피가 없음`); });
    });
    RT.specials.forEach((sp, i) => sp.units.forEach((u, j) => {
      if (!T.customers[u.who]) err(`TAVERN_ROUTINE.specials[${i}] unit${j}: 없는 손님 ${u.who}`);
      const rs = Object.keys(T.recipes).filter((id) => TavernCore.judge(u.order, Object.assign({ id }, T.recipes[id])) === 'perfect');
      if (!rs.length) err(`TAVERN_ROUTINE.specials[${i}] "${sp.title}" unit${j}: 대성공이 가능한 레시피가 없음`);
    }));
    // 30일 x 여러 시드로 만들어 본다: 손님 수/중복/특별 주문 횟수
    const cnt = [], spPerWeek = {};
    for (let sd = 1; sd <= 30; sd++) {
      const v = { rev: { seed: sd * 7919, used: [] }, aff: {}, inn: { rank: 3 }, tavern: { upg: {} } };
      for (let w = 1; w <= C.weeks; w++) { const n = TavernCore.routineSpecialDays(v, w).length; spPerWeek[w] = spPerWeek[w] || new Set(); spPerWeek[w].add(n); if (n !== RT.specialsPerWeek[w - 1]) err(`일상 특별 주문: ${w}주차 횟수 ${n} (설정 ${RT.specialsPerWeek[w - 1]})`); }
      for (let d = 1; d <= C.total; d++) {
        const inf = CalCore.info(d); if (inf.main || inf.holiday) continue;
        v.day = d; const key = TavernCore.routine(T, v, d, VN.evalCond), q = TavernCore.queue(T, key, Object.assign({ today: { cust: 0 } }, v), VN.evalCond);
        cnt.push(q.length);
        const who = q.filter((x) => !x.sp).map((x) => x.who); if (new Set(who).size !== who.length) err(`일상 영업 ${d}일차 시드 ${sd}: 같은 손님이 두 번 나옴 ${who}`);
        if (q.length < 3 || q.length > 11) err(`일상 영업 ${d}일차: 손님 ${q.length}명 (3~11명)`);
      }
    }
    calStats.routine.queue = `${Math.min(...cnt)}~${Math.max(...cnt)} (평균 ${(cnt.reduce((a, b) => a + b, 0) / cnt.length).toFixed(1)}명)`;
  }
  // 낮 선택지가 어떤 상태에서도 비지 않는가 (평범한 하루 / 행동은 조건 없음)
  { const v0 = JSON.parse(JSON.stringify(STORY.init)); CalCore.ensure(v0); for (let d = 2; d <= 28; d++) { v0.day = d; if (CalCore.pickOptions(v0, VN.evalCond).length < 4) err(`낮 선택지가 4개 미만 (${d}일차)`); } }
}

// sw.js 캐시 목록 / index.html 스크립트 목록
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const list = [...sw.match(/const ASSETS = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
list.forEach((p) => { if (p !== './' && !fs.existsSync(path.join(root, p))) err(`sw.js 목록의 파일이 없음: ${p}`); });
files.forEach((p) => { if (!list.includes(p)) wn(`sw.js 캐시 목록에 없음(오프라인 시 누락): ${p}`); });
scripts.forEach((p) => { if (!list.includes(p)) wn(`sw.js 캐시 목록에 없는 스크립트: ${p}`); });
fs.readdirSync(path.join(root, 'story')).filter((f) => f.endsWith('.js')).forEach((f) => { if (!scripts.includes('story/' + f)) wn(`index.html 에서 읽지 않는 story 파일: ${f}`); });
if (!/const VERSION = '[^']+'/.test(sw)) err('sw.js VERSION 형식 확인');

// ---------- 시뮬레이션 (브라우저 없이 스토리 실행) ----------
function setPath(v, p, val, add) {
  const ks = p.split('.'); let o = v;
  for (let i = 0; i < ks.length - 1; i++) { if (typeof o[ks[i]] !== 'object' || o[ks[i]] === null) o[ks[i]] = {}; o = o[ks[i]]; }
  const k = ks[ks.length - 1]; o[k] = add ? (Number(o[k]) || 0) + val : val;
}
function applySet(v, s) { Object.keys(s || {}).forEach((k) => { if (k === 'fat') CalCore.addFat(v, s[k]); else setPath(v, k, s[k], typeof s[k] === 'number'); }); }
let seed = 12345;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

// 영업 플레이어 모델 — 미리보기가 없는 현재 규칙 기준: "메뉴판을 기억하는 플레이어"
//  plan  : 특별 주문 예고를 보고 재료를 미리 챙길 확률
//  right : 주문마다 메뉴판(알게 된 레시피와 속성)을 보고 정확히 조합할 확률. 실패하면 이름만 기억나는 레시피를 아무거나 내거나 재료를 아무렇게나 섞음
//  fav   : 히로인 최애를 알고 있을 확률(힌트를 해석함),  taste : 단골 숨은 취향을 노릴 확률(알아냈거나 힌트를 눈치챈 경우)
//  숙련 = 메뉴판을 거의 완벽히 외움, 보통 = 가끔 헷갈림, 서툰 = 자주 헷갈림, 대충 = 메뉴판을 안 봄
//  (옛 모델은 미리보기가 있어서 right 가 숙련 1 / 보통 0.7 / 서툰 0.35 였음. 이제는 "알게 된 레시피를 메뉴판대로 정확히 조합"하는 확률이라 숙련 0.97 / 보통 0.75 / 서툰 0.4. 미리보기가 없어서 헷갈린 만큼 실수가 남는다고 본 값)
const POL = {
  expert: { stock: 3, reserve: 5, keep: 12, buy: ['sign', 'barrel', 'shelf', 'cellar', 'stove', 'sign2', 'barrel2', 'stove2'], right: 0.97, fav: 1, taste: 0.8, plan: 1,   lodge: 0.95, gift: 0.9, roomBuy: ['soundproof', 'bedding', 'windowbox', 'attic'] },
  decent: { stock: 3, reserve: 10, keep: 15, buy: ['sign', 'barrel', 'shelf', 'stove', 'cellar', 'sign2', 'barrel2'], right: 0.75, fav: 0.5, taste: 0.35, plan: 0.7, lodge: 0.7, gift: 0.5, roomBuy: ['bedding', 'soundproof'] },
  novice: { stock: 2, reserve: 10, keep: 15, buy: ['barrel', 'sign', 'stove'], right: 0.4, fav: 0, taste: 0.1, plan: 0.3,                       lodge: 0.35, gift: 0.25, roomBuy: [] },
  lazy:   { stock: 2, reserve: 20, keep: 20, buy: [], right: 0, fav: 0, taste: 0, plan: 0,                                            lodge: 0.1, gift: 0.05, roomBuy: [] }
};
// 숙박/선물 플레이어 모델
//  lodge   : 손님 요청을 읽고 방을 최적으로 배정할 확률 (아니면 무작위 배정, 가끔 거절)
//  gift    : 낮에 함께 보낸 히로인에게 선물을 줄 확률 (취향은 처음엔 모르고, 줘 보고 반응으로 알게 되면 좋아하는 선물을 산다)
//  roomBuy : 밤에 사는 객실 개조 우선순위
const polNames = Object.keys(POL);
function randIds(t, n) {
  const have = Object.keys(TAVERN.ingredients).filter((i) => (t.stock[i] || 0) > 0);
  if (have.length < 2) return null;
  const pick = []; while (pick.length < Math.min(n, have.length)) { const i = have[Math.floor(rnd() * have.length)]; if (!pick.includes(i)) pick.push(i); }
  return pick;
}
function randKnown(t) {
  const ok = Object.keys(TAVERN.recipes).filter((id) => t.known[id] && TAVERN.recipes[id].ing.every((i) => (t.stock[i] || 0) > 0));
  return ok.length ? TAVERN.recipes[ok[Math.floor(rnd() * ok.length)]].ing.slice() : null;
}
function tavernService(v, dayId, pol, acc) {
  if (dayId === 'routine') dayId = TavernCore.routine(TAVERN, v, v.day, VN.evalCond);
  const t = v.tavern; TavernCore.ensure(TAVERN, v); TavernCore.resetToday(v);
  const goldStart = v.gold;
  // 특별 주문 예고(장보기 화면)를 본 플레이어는 그 주문에 쓸 재료를 먼저 사 두고 일반 손님에게 쓰지 않는다 (pol.plan 확률)
  const reserved = {}, planned = [], spec = TAVERN.specials && TAVERN.specials[dayId];
  if (spec && rnd() < pol.plan) {
    spec.units.forEach((u) => {
      const cands = Object.keys(TAVERN.recipes).filter((id) => t.known[id] && TavernCore.judge(u.order, Object.assign({ id }, TAVERN.recipes[id])) === 'perfect');
      cands.sort((a, b) => TAVERN.recipes[a].ing.reduce((x, i) => x + TAVERN.ingredients[i].price, 0) - TAVERN.recipes[b].ing.reduce((x, i) => x + TAVERN.ingredients[i].price, 0));
      if (cands.length) { planned.push(TAVERN.recipes[cands[0]].ing.slice()); TAVERN.recipes[cands[0]].ing.forEach((i) => { reserved[i] = (reserved[i] || 0) + 1; }); } else planned.push(null);
    });
    Object.keys(reserved).forEach((i) => { const pr = TavernCore.price(TAVERN, v, i); while ((t.stock[i] || 0) < reserved[i] && v.gold - pr >= 0) { v.gold -= pr; t.stock[i] = (t.stock[i] || 0) + 1; acc.spent += pr; } });
  }
  const unreserved = (fn) => { const sv = {}; Object.keys(reserved).forEach((i) => { sv[i] = t.stock[i]; t.stock[i] = Math.max(0, (t.stock[i] || 0) - reserved[i]); }); try { return fn(); } finally { Object.keys(sv).forEach((i) => { t.stock[i] = sv[i]; }); } };
  Object.keys(TAVERN.ingredients).sort((a, b) => TAVERN.ingredients[a].price - TAVERN.ingredients[b].price).forEach((id) => {
    const pr = TavernCore.price(TAVERN, v, id);
    while ((t.stock[id] || 0) < pol.stock && v.gold - pr >= pol.reserve) { v.gold -= pr; t.stock[id] = (t.stock[id] || 0) + 1; acc.spent += pr; }
  });
  const ctx = { repSum: 0, free: !!(TAVERN.days[dayId] && TAVERN.days[dayId].free) }, spRes = [];   // free = 6일차 무료 배식 (매출/팁/특별 주문 사례금 없음)
  TavernCore.queue(TAVERN, dayId, v, VN.evalCond).forEach((cu) => {
    let ids = null;
    const note = TavernCore.note(v, cu.who);
    const choose = () => {
      let r = null;
      if (cu.sp && planned[cu.sp.i] && rnd() < pol.right && planned[cu.sp.i].every((i) => (t.stock[i] || 0) > 0)) return planned[cu.sp.i];   // 미리 챙긴 재료로 만든다
      if (rnd() < pol.right) r = TavernCore.bestKnown(TAVERN, v, cu.who, cu.order, rnd() < pol.fav, !cu.sp && (note.taste || rnd() < pol.taste));
      return r || (rnd() < 0.6 ? randKnown(t) : randIds(t, 2 + Math.floor(rnd() * 2)));
    };
    ids = cu.sp ? choose() : unreserved(choose);
    let out;
    if (!ids) { out = TavernCore.skip(TAVERN, v, ctx, cu); v.rep += out.rep; acc.skipped++; out.who = cu.who; }
    else {
      out = TavernCore.serve(TAVERN, v, cu.who, cu.order, ids, ctx, cu);
      TavernCore.applyDelta(v, out);
      acc.sold += out.sale; acc.tips += out.tip; acc[out.result] = (acc[out.result] || 0) + 1;
      if (cu.reward && (out.result === 'perfect' || out.result === 'good')) { v.gold += ctx.free ? 0 : cu.reward.gold; v.rep += cu.reward.rep; acc.noble = 1; }
      if (out.fav) acc.fav++;
      if (out.taste) acc.taste++;
    }
    if (cu.sp) {
      spRes.push(out);
      if (cu.sp.i === cu.sp.n - 1) { // 특별 주문 마지막 손님: 판정과 보상
        const vd = TavernCore.specialVerdict(TAVERN, dayId, spRes);
        vd.rep = TavernCore.capRep(TAVERN, ctx, vd.rep); if (ctx.free) vd.gold = 0; v.gold += vd.gold; v.rep += vd.rep; acc.spGold += vd.gold;
        v.tavern.sp[dayId] = vd.ok ? 'win' : 'lose'; if (vd.ok) { v.tavern.spWin++; acc.spWin++; } else { v.tavern.spLose++; acc.spLose++; }
      }
    }
  });
  acc.net += v.gold - goldStart;
  CalCore.addFat(v, CALENDAR.fatigue.business);
  (acc.perDay = acc.perDay || {})[v.day] = { net: v.gold - goldStart, fat: v.fat, rep: v.rep };
}
function buyUpgrades(v, pol, acc) {
  let n = 0;
  pol.buy.forEach((id) => {
    const u = TAVERN.upgrades.find((x) => x.id === id);
    if (!u || v.tavern.upg[id] || n >= 2 || v.gold - u.price < pol.keep || (u.needs && !v.tavern.upg[u.needs])) return;
    v.gold -= u.price; v.tavern.upg[id] = true; (u.learn || []).forEach((r) => TavernCore.learn(v, r)); acc.upgrades.push(id); n++;
  });
}

// ----- 숙박: 그날 손님 배정 (최적 배정을 pol.lodge 확률로, 아니면 무작위) -----
function lodgeNight(v, pol, acc) {
  InnCore.ensure(v);
  const day = v.day;
  if (InnCore.hasLodged(v, day)) return;
  const guests = InnCore.guestsFor(v, day), open = InnCore.roomList(v).filter((r) => r.open).map((r) => r.id);
  let assign = {};
  if (rnd() < pol.lodge) {   // 모든 배정을 훑어 총 (숙박비 + 만족 가치) 이 가장 큰 것
    let best = -1, rec = (i, cur, used) => {
      if (i === guests.length) { let t = 0; guests.forEach((g) => { const q = InnCore.quote(v, g, cur[g.id] || null); t += q.pay + q.sat * 8; }); if (t > best) { best = t; assign = Object.assign({}, cur); } return; }
      rec(i + 1, cur, used);
      open.forEach((r) => { if (!used.has(r)) { cur[guests[i].id] = r; used.add(r); rec(i + 1, cur, used); used.delete(r); delete cur[guests[i].id]; } });
    }; rec(0, {}, new Set());
  } else {
    const free = open.slice();
    guests.forEach((g) => { if (free.length && rnd() > 0.2) assign[g.id] = free.splice(Math.floor(rnd() * free.length), 1)[0]; });
  }
  const out = InnCore.settle(v, day, assign);
  acc.lodgeGold += out.gold; acc.sat += out.sat; acc.nights++;
}
function buyRoomUpgrades(v, pol, acc) {
  InnCore.ensure(v);
  for (const id of pol.roomBuy) {
    const u = LODGING.upgrades.find((x) => x.id === id);
    if (!u || InnCore.buyRoomUpg(v, u) !== 'ok' || v.gold - u.price < pol.keep) continue;
    v.gold -= u.price; v.lodge.upg[id] = true; acc.roomUpg.push(id); break;   // 하룻밤에 하나
  }
}
function rankCheck(v, acc, learn) {
  const r = InnCore.checkRank(v);
  if (r) { acc.rankLog.push(`${v.day}일차 ${r.to}★`); if (learn) r.levels.forEach((n) => ((INN_RANK.unlocks[n] || {}).learn || []).forEach((id) => TavernCore.learn(v, id))); }
}
// ----- 선물: 낮에 함께 보낸 히로인에게 (취향을 모르면 탐색, 알면 좋아하는 것) -----
function simGift(v, who, pol, acc) {
  InnCore.ensure(v);
  if (!InnCore.canGive(v, who) || rnd() >= pol.gift) return;
  const G = v.gift, ids = Object.keys(GIFTS.items), pts = { fav: 3, like: 2, normal: 1, hate: -1 };
  const rank = (id) => { const k = (G.known[who] || {})[id]; return k ? pts[k] : 0.5; };
  let id = ids.filter((i) => G.inv[i] > 0).sort((a, b) => rank(b) - rank(a))[0];
  if (!id || rank(id) < 2) {
    const want = ids.filter((i) => rank(i) >= 2).sort((a, b) => rank(b) - rank(a) || GIFTS.items[a].price - GIFTS.items[b].price)[0];
    const cand = want || ids.filter((i) => rank(i) === 0.5).sort(() => rnd() - 0.5)[0];
    if (cand && v.gold - GIFTS.items[cand].price >= pol.keep) { acc.giftSpent += GIFTS.items[cand].price; InnCore.buyGift(v, cand); id = cand; }
  }
  if (!id) return;
  const res = InnCore.giveGift(v, who, id);
  if (!res) return;
  applySet(v, { ['aff.' + who]: res.points });
  acc.gifts++; acc.giftAff += res.points;
}

// pickFn(options, vars, sceneId) -> 선택한 option, pol: 영업 플레이어 모델
function simulate(pickFn, pol) {
  pol = pol || POL.decent;
  const v = JSON.parse(JSON.stringify(STORY.init));
  const acc = { sold: 0, tips: 0, spent: 0, net: 0, skipped: 0, fav: 0, taste: 0, spWin: 0, spLose: 0, spGold: 0, upgrades: [], events: [], lodgeGold: 0, sat: 0, nights: 0, roomUpg: [], rankLog: [], gifts: 0, giftAff: 0, giftSpent: 0, nev: [], riv: [], noble: 0 };
  let sc = STORY.start, pc = 0, steps = 0, ending = null, read = 0;
  const visit = new Set(), snapRep = {};
  EventCore.ensure(v, () => Math.floor(rnd() * 4294967296));   // 이번 회차 랜덤 사건 시드
  InnCore.ensure(v);
  while (steps++ < 20000) {
    const c = scenes[sc][pc];
    if (!c) return { error: `씬 끝: ${sc}`, v };
    if (pc === 0) { visit.add(sc); if (/^d\d_open$/.test(sc)) snapRep[sc] = v.rep; }
    if ('ending' in c) { ending = c.ending; break; }
    if ('say' in c || 'narr' in c) read++;
    if ('choice' in c) {
      const base = c.dynamic === 'pick' ? CalCore.pickOptions(v, VN.evalCond) : c.dynamic === 'holiday' ? CalCore.holidayOptions(v, VN.evalCond) : c.choice;
      const opts = (base.length ? base : c.choice).filter((o) => (!o.if || VN.evalCond(o.if, v)) && (!o.cost || (v.gold || 0) >= o.cost));
      if (!opts.length) return { error: `선택지 막힘: ${sc}`, v };
      const o = pickFn(opts, v, sc);
      if (o.cost) v.gold -= o.cost;
      applySet(v, o.set);
      if (o.put) Object.keys(o.put).forEach((k) => setPath(v, k, o.put[k], false));
      if (c.talkpick && o.who) simGift(v, o.who, pol, acc);   // 낮에 함께 보낸 히로인에게 선물 (영업 모델별 확률)
      if (o.goto) { sc = o.goto; pc = 0; } else pc++;
      continue;
    }
    if ('if' in c) { const ok = VN.evalCond(c.if, v); if (ok && c.goto) { sc = c.goto; pc = 0; } else if (!ok && c.else) { sc = c.else; pc = 0; } else pc++; continue; }
    if ('goto' in c) { sc = c.goto; pc = 0; continue; }
    if ('day' in c) {
      const nd = c.day === 'next' ? v.day + 1 : c.day, inf = CalCore.info(nd);
      (acc.snap = acc.snap || {})[nd] = { rank: v.inn.rank, rep: v.rep, gold: v.gold, aff: Object.assign({}, v.aff), fat: v.fat, score: InnCore.score(v) };
      v.time = c.time || '아침'; CalCore.setDay(v, nd); if (nd > 1) CalCore.sleep(v, inf.holiday); EventCore.newDay(v); pc++; continue;
    }
    if ('cal' in c) { sc = c.cal === 'next' ? CalCore.entry(v.day + 1) : CalCore.evening(v.day); pc = 0; continue; }
    if ('rand' in c) {
      const ev = EventCore.pick(RANDOM_EVENTS, v, v.day, VN.evalCond);
      EventCore.begin(v, ev, c.then);
      if (ev) { acc.events.push(ev); sc = 'rev_' + ev; } else sc = c.then;
      pc = 0; continue;
    }
    if ('randret' in c) { sc = v.rev.ret; pc = 0; continue; }
    if ('time' in c) { v.time = c.time; pc++; continue; }
    if ('tavern' in c) { tavernService(v, c.tavern, pol, acc); rankCheck(v, acc, true); pc++; continue; }
    if ('lodging' in c) { lodgeNight(v, pol, acc); CalCore.addFat(v, CALENDAR.fatigue.lodging); pc++; continue; }
    if ('nightev' in c) {
      const nid = InnCore.nightEvent(v, v.day, VN.evalCond);
      if (nid) { v.nev.used.push(nid); v.nev.last = v.day; v.nev.ret = sc + '#' + (pc + 1); acc.nev.push(nid); sc = 'nev_' + nid; pc = 0; } else pc++;
      continue;
    }
    if ('nightret' in c) { const m = v.nev.ret.split('#'); sc = m[0]; pc = Number(m[1]); continue; }
    if ('rivalry' in c) {
      const rp = InnCore.rivalryPick(v, v.day);
      if (rp) { v.riv.done.push(rp.id); v.riv.n++; v.riv.last = v.day; v.riv.ret = sc + '#' + (pc + 1); acc.riv.push(rp.id); sc = rp.scene; pc = 0; } else pc++;
      continue;
    }
    if ('rivret' in c) { const m = v.riv.ret.split('#'); sc = m[0]; pc = Number(m[1]); continue; }
    if ('rankcheck' in c) { rankCheck(v, acc, c.rankcheck !== 'quiet'); pc++; continue; }
    if ('giftoffer' in c) { pc++; continue; }
    if ('learn' in c) { [].concat(c.learn).forEach((r) => TavernCore.learn(v, r)); pc++; continue; }
    if ('upgrades' in c) { buyUpgrades(v, pol, acc); buyRoomUpgrades(v, pol, acc); pc++; continue; }
    if ('set' in c) applySet(v, c.set);
    if ('put' in c) Object.keys(c.put).forEach((k) => setPath(v, k, c.put[k], false));
    pc++;
  }
  return { ending, v, steps, read, acc, visit, snapRep };
}
const sum = (o) => Object.values(o.aff).reduce((a, b) => a + b, 0);
const med = (a) => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
const stat = { random: {}, errors: 0, byPol: {}, read: [] };
const pickRand = (opts) => opts[Math.floor(rnd() * opts.length)];
// 낮 행동 선택지(동적)용 보정: 피로가 높으면 쉬고, 너무 안 쓰는 날은 평판/골드 행동을 고르는 정도의 사람 모델
const restBias = (o, v) => (o.act === 'rest' ? (v.fat >= 62 ? 12 : v.fat >= 40 ? 1 : -4) : 0) + (o.act && o.act !== 'rest' && v.fat >= 80 ? -6 : 0);
const mgmtScore = (o) => ({ work: 5, fix: 3, town: 2, rest: 0 }[o.act] || 0);
const score = (o, who) => (o.set && o.set['aff.' + who] || 0) * 10 + (o.who === who ? 5 : 0) + (o.weekly ? 1 : 0) + (o.tag === '깊은 이야기' && o.who === who ? 3 : 0) + (o.set && o.set.rep || 0) * 2 - (o.cost || 0) * 0.05;
const focusPick = (h, noise) => (opts, v) => { let best = opts[0], bs = -1e9; opts.forEach((o) => { const s2 = score(o, h) + rnd() * noise + restBias(o, v || { fat: 0 }); if (s2 > bs) { bs = s2; best = o; } }); return best; };
const evenPick = (opts, v) => {
  const min = Math.min(...Object.values(v.aff));
  let best = opts[0], bs = -1e9;
  opts.forEach((o) => { let s2 = (o.set && o.set.rep || 0) * 3 - (o.cost || 0) * 0.02 + restBias(o, v); HEROINES.forEach((h) => { if (v.aff[h] === min && o.who === h) s2 += 6; if (v.aff[h] > 4 && o.set && o.set['aff.' + h] > 0) s2 -= 8; }); if (s2 > bs) { bs = s2; best = o; } });
  return best;
};
// "모두 챙기기": 가장 호감도가 낮은 히로인부터 고르게 챙기고, 동굴에서 "모두와 함께"가 나오면 고른다 (진 엔딩 노림)
const allPick = (opts, v) => {
  const t = opts.find((o) => o.tag === '모두와 함께'); if (t) return t;
  const min = Math.min(...Object.values(v.aff));
  let best = opts[0], bs = -1e9;
  opts.forEach((o) => { let s2 = (o.set && o.set.rep || 0) * 3 - (o.cost || 0) * 0.02 + restBias(o, v); HEROINES.forEach((h) => { if (v.aff[h] === min && o.who === h) s2 += 6; if (o.set && o.set['aff.' + h] > 0) s2 += (v.aff[h] === min ? 3 : 1) * o.set['aff.' + h] * 0.3; }); if (s2 > bs) { bs = s2; best = o; } });
  return best;
};
// 여관 경영 올인: 낮에는 일/손보기/장보기(피로가 높으면 휴식)만 하고 히로인은 거의 안 만난다 (명가 엔딩 노림)
const masterPick = (opts, v) => { const t = opts.find((o) => o.tag === '모두와 함께'); if (t && false) return t; let best = opts[0], bs = -1e9; opts.forEach((o) => { const s2 = (o.act ? mgmtScore(o) : 0) + restBias(o, v) + (o.who ? 0 : 0.5) + (o.set && o.set.rep || 0) * 3 - (o.cost || 0) * 0.02 + rnd() * 0.5; if (s2 > bs) { bs = s2; best = o; } }); return best; };
const badPick = (opts) => opts.reduce((a, b) => ((((b.set && b.set.rep) || 0) - (b.act === 'rest' ? 2 : 0)) < (((a.set && a.set.rep) || 0) - (a.act === 'rest' ? 2 : 0)) ? b : a));
// 평균 집계 도우미
const agg = () => ({ n: 0, gold: [], rep: [], net: [], perfect: [], fav: [], upg: [], taste: [], spWin: [], fail: [], end: {}, aff: {}, rank: {}, lodge: [], sat: [], gifts: [], giftAff: [], giftSpent: [], deep: [], riv: [], nev: [], score: [], noble: 0, roomUpg: [] });
const addAgg = (g, r) => {
  g.n++; g.gold.push(r.v.gold); g.rep.push(r.v.rep); g.net.push(r.acc.net); g.perfect.push(r.v.tavern.perfect); g.fav.push(r.acc.fav); g.upg.push(r.acc.upgrades.length); g.taste.push(r.acc.taste); g.spWin.push(r.acc.spWin); g.fail.push(r.v.tavern.fail);
  g.end[r.ending] = (g.end[r.ending] || 0) + 1;
  g.rank[r.v.inn.rank] = (g.rank[r.v.inn.rank] || 0) + 1; g.lodge.push(r.acc.lodgeGold); g.sat.push(r.acc.sat); g.gifts.push(r.acc.gifts); g.giftAff.push(r.acc.giftAff); g.giftSpent.push(r.acc.giftSpent);
  g.deep.push(HEROINES.filter((h) => r.v.flag['deep_' + h]).length); g.riv.push(r.acc.riv.length); g.nev.push(r.acc.nev.length); g.score.push(InnCore.score(r.v)); g.noble += r.acc.noble; g.roomUpg.push(r.acc.roomUpg.length);
  HEROINES.forEach((h) => { (g.aff[h] = g.aff[h] || []).push(r.v.aff[h]); });
};
const avg = (a) => (a.reduce((x, y) => x + y, 0) / (a.length || 1)).toFixed(1);
const rankStr = (g) => Object.keys(g.rank).sort().map((k) => `${k}★ ${Math.round(g.rank[k] * 100 / g.n)}%`).join(' ');
const innLine = (g) => `여관 등급 ${rankStr(g)} (점수 ${fmt(g.score)}) / 숙박 수입 평균 ${avg(g.lodge)}G, 만족 평균 ${avg(g.sat)} / 객실 개조 ${avg(g.roomUpg)}개 / 선물 ${avg(g.gifts)}개 (호감도 +${avg(g.giftAff)}, 지출 ${avg(g.giftSpent)}G) / 깊은 이벤트 ${avg(g.deep)}개 / 신경전 ${avg(g.riv)}회 / 밤 사건 ${avg(g.nev)}회 / 5성 귀족 ${g.noble}회`;
const fmt = (a) => `${Math.min(...a)}~${Math.max(...a)} (중앙 ${med(a)})`;

// (1) 무작위 스토리 선택 x 영업 플레이어 모델 섞기 (숙련 15 / 보통 35 / 서툰 35 / 대충 15 %)
const polMix = () => { const r = rnd(); return r < 0.15 ? 'expert' : r < 0.5 ? 'decent' : r < 0.85 ? 'novice' : 'lazy'; };
polNames.forEach((p) => { stat.byPol[p] = agg(); });
for (let i = 0; i < 6000; i++) {
  const pn = polMix();
  const r = simulate(pickRand, POL[pn]);
  if (r.error) { stat.errors++; if (stat.errors < 4) err('시뮬레이션: ' + r.error); continue; }
  stat.random[r.ending] = (stat.random[r.ending] || 0) + 1;
  stat.read.push(r.read);
  addAgg(stat.byPol[pn], r);
}
// (2) 전략: 특정 히로인 집중 / 균등 분배 x 영업 모델 각각
const focusRes = {}, evenRes = {}, badRes = {}, allRes = {};
polNames.forEach((pn) => {
  focusRes[pn] = {}; HEROINES.forEach((h) => { focusRes[pn][h] = agg(); });
  evenRes[pn] = agg(); badRes[pn] = agg(); allRes[pn] = agg();
  HEROINES.forEach((h) => {
    for (let i = 0; i < 40; i++) {
      const r = simulate(focusPick(h, i ? 6 : 0), POL[pn]);
      if (r.error) { err('전략 시뮬레이션: ' + r.error); break; }
      addAgg(focusRes[pn][h], r);
    }
  });
  for (let i = 0; i < 40; i++) { const r = simulate(i ? (opts, v) => (rnd() < 0.15 ? pickRand(opts) : evenPick(opts, v)) : evenPick, POL[pn]); if (!r.error) addAgg(evenRes[pn], r); }
  for (let i = 0; i < 20; i++) { const r = simulate(badPick, POL[pn]); if (!r.error) addAgg(badRes[pn], r); }
  for (let i = 0; i < 80; i++) { const r = simulate(i ? (opts, v) => (rnd() < 0.1 ? pickRand(opts) : allPick(opts, v)) : allPick, POL[pn]); if (!r.error) addAgg(allRes[pn], r); }
});
// (3) 팬: 좋아하는 히로인이 있는 보통 플레이어 (절반은 그 사람, 나머지 무작위)
const fanRes = {};
polNames.forEach((pn) => {
  fanRes[pn] = agg();
  HEROINES.forEach((h) => { for (let i = 0; i < 40; i++) { const r = simulate((opts) => (rnd() < 0.55 ? focusPick(h, 0)(opts) : pickRand(opts)), POL[pn]); if (!r.error) addAgg(fanRes[pn], r); } });
});
// (4) 두 사람 전략: 두 히로인을 번갈아 만난다 (신경전이 일어나는 대표 상황)
const duoPick = (a, b) => (opts, v) => { const low = v.aff[a] <= v.aff[b] ? a : b; let best = opts[0], bs = -1e9; opts.forEach((o) => { const s2 = (o.who === low ? 6 : (o.who === a || o.who === b ? 3 : 0)) + (o.set && o.set.rep || 0) * 2 - (o.cost || 0) * 0.02; if (s2 > bs) { bs = s2; best = o; } }); return best; };
const duoRes = {};
polNames.forEach((pn) => {
  duoRes[pn] = agg();
  [['erion', 'kaela'], ['kaela', 'miho'], ['miho', 'lia'], ['lia', 'erion'], ['erion', 'miho'], ['kaela', 'lia']].forEach(([a, b]) => { for (let i = 0; i < 40; i++) { const r = simulate(duoPick(a, b), POL[pn]); if (!r.error) { addAgg(duoRes[pn], r); r.acc.riv.forEach((x) => { duoRes[pn].rivIds = duoRes[pn].rivIds || {}; duoRes[pn].rivIds[x] = (duoRes[pn].rivIds[x] || 0) + 1; }); } } });
});
// 밸런스 목표 점검 (30일 구성: 서툰/게으른 영업은 평판 하락으로 배드가 나는 것이 정상이라 숙련/보통만 점검): 모두 챙기기 + 숙련 영업이 진 엔딩에 상당한 확률로 닿는가, 숙련 영업이 5성을 절반 이상 찍는가, 보통 영업은 3~4성인가
{ const ae = allRes.expert; if ((ae.end.true || 0) < ae.n * 0.3) err(`모두 챙기기 + expert 영업: 진 엔딩이 30% 미만 ${JSON.stringify(ae.end)}`);
  const fe = Object.values(focusRes.expert).reduce((n, g) => n + (g.rank[5] || 0), 0), fn = Object.values(focusRes.expert).reduce((n, g) => n + g.n, 0);
  if (fe < fn * 0.5) wn(`히로인 집중 + expert 영업: 5성이 절반 미만 (${fe}/${fn})`);
  }
const ref = simulate(evenPick, POL.decent), refBad = simulate(badPick, POL.novice);
if (refBad.ending !== 'bad') err(`평판 최저 + 서툰 영업 전략이 배드 엔딩에 도달하지 못함 (결과: ${refBad.ending}, 평판 ${refBad.v.rep})`);
if (ref.ending !== 'normal' && ref.ending !== 'master') wn(`균등 분배 + 보통 영업 전략이 노멀 엔딩이 아님 (결과: ${ref.ending}, aff ${JSON.stringify(ref.v.aff)})`);
polNames.filter((pn) => pn === 'expert' || pn === 'decent').forEach((pn) => {
  const f = Object.values(focusRes[pn]); const ok = f.every((g, i) => g.end[HEROINES[i]] === g.n);
  if (!ok) wn(`히로인 집중 + ${pn} 영업: 집중한 히로인의 개별 엔딩이 100%가 아님 ${JSON.stringify(Object.fromEntries(HEROINES.map((h) => [h, focusRes[pn][h].end])))}`);
  const e = evenRes[pn].end; if ((e.normal || 0) + (e.master || 0) < evenRes[pn].n * 0.8) wn(`균등 분배 + ${pn} 영업: 노멀/명가가 80% 미만 ${JSON.stringify(e)}`);
});

console.log(`씬 ${Object.keys(scenes).length}개 (도달 가능 ${seen.size}), 대사/나레이션 ${lines}줄, 선택지 ${choices}개, 엔딩 ${ENDINGS.length}종 (도달 ${reachedEndings.size})`);
if (TAVERN) {
  const nR = Object.keys(TAVERN.recipes).length, nI = Object.keys(TAVERN.ingredients).length, nB = Object.values(TAVERN.recipes).filter((r) => r.basic).length;
  console.log(`저녁 영업: 재료 ${nI}종, 레시피 ${nR}개 (기본 ${nB}), 업그레이드 ${TAVERN.upgrades.length}개, 일차별 손님 ${Object.entries(TAVERN.days).map(([k, d]) => `${k}:${d.customers.filter((c) => !c.if).length}${d.customers.some((c) => c.if) ? '+' + d.customers.filter((c) => c.if).length : ''}`).join(' ')}, 주문 ${tvStats.orders}개 (낙관적 지식으로 대성공 가능 ${tvStats.perfectKnown}개)`);
  console.log('히로인 영업 기본 등장 횟수:', JSON.stringify(Object.fromEntries(HEROINES.map((h) => [h, (tvStats.appear || {})[h] || 0]))));
}
if (AUDIO && AUDIO.tracks) {
  const withFile = Object.values(AUDIO.tracks).filter((t) => t.file).length;
  console.log(`BGM: 트랙 ${Object.keys(AUDIO.tracks).length}개 (파일 연결 ${withFile}개, 나머지는 file:null 이라 요청 없음), 스크립트 사용 ${[...bgmUsed].filter((x) => x !== 'stop').length}종, 효과음 ${SFX.names.length}종`);
}
if (innStats.gift) {
  console.log(`선물: 8종, 반응 ${innStats.giftReact}개 (4x8), 가격 ${Object.values(GIFTS.items).map((d) => d.price).join('/')}G`);
  HEROINES.forEach((h) => console.log(`  - ${h}: ` + Object.entries(innStats.gift[h]).map(([k, v2]) => `${k}[${v2}]`).join(' ')));
  console.log(`숙박: 객실 3 (시작 2), 손님 ${LODGING.guests.length}팀, 요청 ${Object.keys(LODGING.requests).length}종, 객실 개조 ${LODGING.upgrades.length}종, 3팀 비율 ${innStats.three}; 밤 사건 ${innStats.nev}개 (발생률 ${innStats.nevRate}); 여관 등급 기준 ${INN_RANK.stars.map((x) => x.n + '★:' + x.min).join(' ')}; 신경전 ${RIVALRY.pairs.length}쌍 (최대 ${RIVALRY.max}회, 호감도 ${RIVALRY.need} 이상)`);
}
if (tvStats.taste) console.log('단골 숨은 취향:', JSON.stringify(tvStats.taste));
if (tvStats.specials) Object.entries(tvStats.specials).forEach(([d, t]) => console.log(`특별 주문 ${d}: ${t}`));
const per = {}; HEROINES.forEach((h) => { per[h] = Object.keys(scenes).filter((s2) => new RegExp('^' + h + '_').test(s2)).length; });
stat.read.sort((a, b) => a - b);
console.log(`한 회차에 읽는 대사/나레이션: 중앙값 ${stat.read[stat.read.length >> 1]}줄 (최소 ${stat.read[0]} ~ 최대 ${stat.read[stat.read.length - 1]}) -> 줄당 3~4초 가정 시 약 ${Math.round(stat.read[stat.read.length >> 1] * 3 / 60)}~${Math.round(stat.read[stat.read.length >> 1] * 4 / 60)}분 + 선택/영업 시간`);
if (process.argv.includes('--weeks')) {
  const rep = (label, fn, pn, N) => {
    const rs = []; for (let i = 0; i < N; i++) { const r = simulate(fn, POL[pn]); if (!r.error) rs.push(r); }
    const days = [8, 15, 22, 29];
    const line = days.map((d) => { const a = rs.map((r) => r.acc.snap[d]).filter(Boolean); const m = (f) => (a.reduce((x, y) => x + f(y), 0) / (a.length || 1)); return `${d - 1}일말 ${m((x) => x.rank).toFixed(1)}★ 평판${m((x) => x.rep).toFixed(0)} 점수${m((x) => x.score).toFixed(0)} G${m((x) => x.gold).toFixed(0)} 피로${m((x) => x.fat).toFixed(0)} 평균호감${m((x) => Object.values(x.aff).reduce((p, q) => p + q, 0) / 4).toFixed(0)}`; }).join(' | ');
    const ends = {}; rs.forEach((r) => { ends[r.ending] = (ends[r.ending] || 0) + 1; });
    const fin = rs.map((r) => r.v.inn.rank), g = {}; fin.forEach((x) => { g[x] = (g[x] || 0) + 1; });
    const nets = []; rs.forEach((r) => Object.entries(r.acc.perDay || {}).forEach(([d, x]) => { const inf = CalCore.info(Number(d)); if (!inf.main && !inf.holiday) nets.push(x.net); }));
    const netAvg = (nets.reduce((a, b) => a + b, 0) / (nets.length || 1)).toFixed(0);
    console.log(`[주간] ${label} / ${pn}: 일상일 영업 순이익 평균 ${netAvg}G | ${line}\n         엔딩 ${JSON.stringify(ends)} 최종등급 ${JSON.stringify(g)} 업그레이드 ${(rs.reduce((x, r) => x + r.acc.upgrades.length, 0) / rs.length).toFixed(1)}개 최종호감 ${HEROINES.map((h) => (rs.reduce((x, r) => x + r.v.aff[h], 0) / rs.length).toFixed(0)).join('/')} 최종평판 ${(rs.reduce((x, r) => x + r.v.rep, 0) / rs.length).toFixed(0)}`);
  };
  ['expert', 'decent', 'novice', 'lazy'].forEach((pn) => {
    rep('균등', evenPick, pn, 30); rep('모두챙기기', allPick, pn, 30); rep('경영올인', masterPick, pn, 30); rep('에리온집중', focusPick('erion', 0), pn, 30);
  });
}
console.log('히로인별 이벤트 씬 수:', JSON.stringify(per));
console.log('무작위 선택 x 영업 모델 섞기 6000회 엔딩 분포:', JSON.stringify(stat.random), stat.errors ? `(막힘 ${stat.errors})` : '(막힘 0)');
polNames.forEach((pn) => { const g = stat.byPol[pn]; console.log(`  * ${pn} 여관: ${innLine(g)}`); });
polNames.forEach((pn) => { const g = stat.byPol[pn]; console.log(`  - 영업 ${pn} (${g.n}회): 엔딩 ${JSON.stringify(g.end)} / 최종 골드 ${fmt(g.gold)} / 평판 ${fmt(g.rep)} / 대성공 ${fmt(g.perfect)}회 / 실패 평균 ${avg(g.fail)}회 / 단골 보너스 평균 ${avg(g.taste)}회 / 특별 주문 성공 평균 ${avg(g.spWin)}/4 / 업그레이드 ${avg(g.upg)}개`); });
console.log('히로인 집중 전략(각 40회) 최종 호감도 범위 (loveLine ' + STORY.loveLine + '):');
polNames.forEach((pn) => { const g = Object.values(focusRes[pn]).reduce((a, b) => { Object.keys(b).forEach((k) => { if (Array.isArray(b[k])) a[k] = (a[k] || []).concat(b[k]); else if (typeof b[k] === 'number') a[k] = (a[k] || 0) + b[k]; else if (k === 'rank') Object.keys(b.rank).forEach((r) => { a.rank[r] = (a.rank[r] || 0) + b.rank[r]; }); }); return a; }, { rank: {}, n: 0 }); console.log(`  * ${pn} 여관: ${innLine(g)}`); });
polNames.forEach((pn) => console.log(`  - 영업 ${pn}: ` + HEROINES.map((h) => { const a = focusRes[pn][h].aff[h]; return `${h} ${Math.min(...a)}~${Math.max(...a)}`; }).join(' / ') + ` | 엔딩 일치 ` + HEROINES.map((h) => `${focusRes[pn][h].end[h] || 0}/${focusRes[pn][h].n}`).join(' ') + ` | 골드 ${fmt(focusRes[pn][HEROINES[0]].gold)}`));
console.log('균등 분배 전략 (여러 사람에게 고르게):');
polNames.forEach((pn) => { const g = evenRes[pn]; console.log(`  * ${pn} 여관: ${innLine(g)}`); });
polNames.forEach((pn) => { const g = evenRes[pn]; console.log(`  - 영업 ${pn}: 엔딩 ${JSON.stringify(g.end)} / ` + HEROINES.map((h) => `${h} ${fmt(g.aff[h])}`).join(' ') + ` / 평판 ${fmt(g.rep)}`); });
console.log('모두 챙기기 전략 (가장 낮은 히로인부터 고르게 + 동굴에서 "모두와 함께", 각 80회):');
polNames.forEach((pn) => { const g = allRes[pn]; console.log(`  - 영업 ${pn}: 엔딩 ${JSON.stringify(g.end)} / ` + HEROINES.map((h) => `${h} ${fmt(g.aff[h])}`).join(' ') + ` / ${rankStr(g)}`); });
console.log('팬 전략 (좋아하는 히로인 55% 집중 + 나머지 무작위, 각 160회):');
polNames.forEach((pn) => { const g = fanRes[pn]; console.log(`  * ${pn} 여관: ${innLine(g)}`); });
polNames.forEach((pn) => { const g = fanRes[pn]; console.log(`  - 영업 ${pn}: 엔딩 ${JSON.stringify(g.end)} / 평판 ${fmt(g.rep)} / 최종 골드 ${fmt(g.gold)}`); });
console.log('두 사람 번갈아 만나기 전략 (6쌍 x 40회):');
polNames.forEach((pn) => { const g = duoRes[pn]; console.log(`  - 영업 ${pn}: 엔딩 ${JSON.stringify(g.end)} / 신경전 평균 ${avg(g.riv)}회 (${JSON.stringify(g.rivIds || {})}) / 깊은 이벤트 평균 ${avg(g.deep)}개 / ${rankStr(g)}`); });
console.log('평판 최저 선택 전략 (배드 엔딩):');
polNames.forEach((pn) => { const g = badRes[pn]; console.log(`  - 영업 ${pn}: 엔딩 ${JSON.stringify(g.end)} / 평판 ${fmt(g.rep)}`); });
// 영업 수입 (균등 분배 전략 기준)
polNames.forEach((pn) => { const g = evenRes[pn]; console.log(`영업 ${pn} 7일 순수익(매출+팁-재료비, 업그레이드 제외): 중앙 ${med(g.net)}G (범위 ${Math.min(...g.net)}~${Math.max(...g.net)}), 최애 서빙 ${avg(g.fav)}회, 단골 보너스 ${avg(g.taste)}회, 특별 주문 성공 ${avg(g.spWin)}/6`); });
console.log(`균등 분배 + 보통 영업 -> ${ref.ending} (호감도 ${JSON.stringify(ref.v.aff)}) / 평판 최저 + 서툰 영업 -> ${refBad.ending} (평판 ${refBad.v.rep})`);
warns.forEach((m) => console.log('경고: ' + m));
errors.forEach((m) => console.log('오류: ' + m));
console.log(errors.length ? `검사 실패 (오류 ${errors.length})` : '검사 통과: 끊긴 goto 없음, 영업 데이터 정상, 모든 엔딩 도달 가능');
process.exit(errors.length ? 1 : 0);
