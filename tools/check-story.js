// 스토리 데이터 정적 검사 + 시뮬레이션: node tools/check-story.js
// - index.html 이 읽는 story/*.js 를 순서대로 로드
// - goto 대상 씬 존재, 도달 불가 씬, 씬 끝 처리, 조건식 문법, 변수 이름
// - 배경/캐릭터/표정 id, 이미지 파일 존재, sw.js 캐시 목록과 비교, index.html 스크립트 목록 비교
// - 선택지 막힘(전부 유료/조건부) 검사, 히로인별 이벤트 4개 이상, 엔딩 6종 도달 가능
// - 저녁 영업 데이터(story/tavern.js) 무결성: 레시피 재료 존재/조합 중복, 태그 유효, 손님/주문 유효, 히로인 최애가 실제 레시피, 이미지 존재
// - 브라우저 없이 스토리를 수천 번 무작위/전략 플레이(저녁 영업 포함: 숙련/보통/서툰 플레이어 모델)해서 엔딩 분포와 호감도 범위를 알려 준다
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
scripts.forEach(load);
const { STORY, CHARACTERS, BACKGROUNDS, VN, ENDINGS, HEROINES, TAVERN, TavernCore } = ctx;

const errors = [], warns = [];
const err = (m) => errors.push(m), wn = (m) => warns.push(m);
const scenes = STORY.scenes;
const edges = {};
const KNOWN = ['say', 'narr', 'choice', 'summary', 'end', 'ending', 'if', 'goto', 'show', 'hide', 'bg', 'day', 'time', 'fx', 'set', 'put', 'tavern', 'learn', 'upgrades'];
const TERMINAL = ['goto', 'choice', 'summary', 'end', 'ending'];
const files = new Set();
let lines = 0, choices = 0;

if (!scenes[STORY.start]) err(`시작 씬 없음: ${STORY.start}`);
if (!TAVERN || !TavernCore) err('story/tavern.js 또는 js/tavern-core.js 가 index.html 에서 로드되지 않음');
if (!STORY.init.tavern) err('STORY.init.tavern 없음 (story/tavern.js 맨 아래)');
const tavernDaysUsed = new Set(), upgradeCmds = [];
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
    if (key === 'day' && !(Number.isInteger(c.day) && c.day >= 1)) err(`[${id}] ${w}: day 는 1 이상의 정수`);
    if (key === 'fx' && !['shake', 'flash'].includes(c.fx)) err(`[${id}] ${w}: 알 수 없는 fx ${c.fx}`);
    if (key === 'ending' && !(ENDINGS || []).some((e) => e.id === c.ending)) err(`[${id}] ${w}: ENDINGS 에 없는 엔딩 id ${c.ending}`);
    if (key === 'tavern') { tavernDaysUsed.add(c.tavern); if (!TAVERN.days[c.tavern]) err(`[${id}] ${w}: TAVERN.days 에 없는 영업 id ${c.tavern}`); }
    if (key === 'learn') [].concat(c.learn).forEach((r) => { if (!TAVERN.recipes[r]) err(`[${id}] ${w}: 없는 레시피 ${r}`); });
    if (key === 'upgrades') upgradeCmds.push(id);
    if (key === 'goto') target(c.goto, w);
    if (key === 'if') {
      try { VN.checkCond(c.if); } catch (e) { err(`[${id}] ${w}: ${e.message}`); }
      if (!c.goto) err(`[${id}] ${w}: if 에 goto 없음`); else target(c.goto, w + ' if');
      if (c.else) target(c.else, w + ' else');
    }
    if (key === 'choice') {
      choices++;
      if (!Array.isArray(c.choice) || !c.choice.length) err(`[${id}] ${w}: 빈 선택지`);
      (c.choice || []).forEach((o, j) => {
        const ow = `${w} 선택지${j + 1}`;
        if (!o.text) err(`[${id}] ${ow}: text 없음`);
        if (o.if) { try { VN.checkCond(o.if); } catch (e) { err(`[${id}] ${ow}: ${e.message}`); } }
        if (o.who && !CHARACTERS[o.who]) err(`[${id}] ${ow}: who 에 없는 캐릭터 ${o.who}`);
        if ('cost' in o && !(typeof o.cost === 'number' && o.cost > 0)) err(`[${id}] ${ow}: cost 는 양수여야 함`);
        if (o.goto) target(o.goto, ow);
        else if (i === cmds.length - 1) err(`[${id}] ${ow}: 마지막 명령인데 goto 없음`);
      });
      // 어떤 상태에서도 고를 수 있는 선택지(조건 없음 + 무료)가 하나는 있어야 진행이 막히지 않는다
      if (!(c.choice || []).some((o) => !o.if && !o.cost)) err(`[${id}] ${w}: 조건/비용 없는 선택지가 하나도 없음 (골드 부족 시 막힐 수 있음)`);
    }
  });
  // 변수 경로 검사
  const sets = [];
  cmds.forEach((c) => { if (c.set) sets.push(c.set); if (c.put) sets.push(c.put); (c.choice || []).forEach((o) => o.set && sets.push(o.set)); });
  sets.forEach((s) => Object.keys(s).forEach((k) => {
    const m = k.match(/^(gold|rep)$|^(?:aff|ev)\.(\w+)$|^flag\.\w+$|^tavern\.[\w.]+$/);
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
  for (let n = 1; n <= 4; n++) if (!scenes[`${h}_${n}`]) err(`히로인 이벤트 없음: ${h}_${n}`);
  if (!CHARACTERS[h]) err(`HEROINES 의 캐릭터 정의 없음: ${h}`);
});
(ENDINGS || []).forEach((e) => { if (e.heroine && !CHARACTERS[e.heroine]) err(`ENDINGS ${e.id}: 없는 heroine ${e.heroine}`); });

// 이미지 파일
Object.entries(CHARACTERS).forEach(([id, c]) => Object.entries(c.faces).forEach(([f, p]) => {
  files.add(p); if (!fs.existsSync(path.join(root, p))) err(`캐릭터 이미지 없음: ${id}.${f} -> ${p}`);
}));
['normal', 'smile', 'angry', 'shy', 'surprised'].forEach((f) => (HEROINES || []).forEach((h) => { if (!(CHARACTERS[h] && CHARACTERS[h].faces[f])) err(`히로인 ${h} 에 필수 표정 ${f} 없음`); }));
Object.entries(BACKGROUNDS).forEach(([id, p]) => { files.add(p); if (!fs.existsSync(path.join(root, p))) err(`배경 이미지 없음: ${id} -> ${p}`); });


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
  // 업그레이드 화면은 1~4일차 밤 뒤에 있어야 한다
  if (upgradeCmds.length < 3) wn(`{upgrades:true} 씬이 ${upgradeCmds.length}개뿐 (밤마다 구입 기회를 주는 것을 권장)`);
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
function applySet(v, s) { Object.keys(s || {}).forEach((k) => setPath(v, k, s[k], typeof s[k] === 'number')); }
let seed = 12345;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

// 영업 플레이어 모델: 숙련(주문을 거의 다 맞히고 힌트로 최애도 앎) / 보통 / 서툰 / 대충(재료를 아무렇게나)
const POL = {
  expert: { stock: 3, reserve: 5, keep: 12, buy: ['sign', 'barrel', 'stove', 'shelf'], right: 1, fav: 1 },
  decent: { stock: 3, reserve: 10, keep: 15, buy: ['sign', 'barrel', 'shelf', 'stove'], right: 0.7, fav: 0.5 },
  novice: { stock: 2, reserve: 10, keep: 15, buy: ['barrel', 'sign'], right: 0.35, fav: 0 },
  lazy:   { stock: 2, reserve: 20, keep: 20, buy: [], right: 0, fav: 0 }
};
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
  const t = v.tavern; TavernCore.ensure(TAVERN, v); TavernCore.resetToday(v);
  const goldStart = v.gold;
  Object.keys(TAVERN.ingredients).sort((a, b) => TAVERN.ingredients[a].price - TAVERN.ingredients[b].price).forEach((id) => {
    const pr = TAVERN.ingredients[id].price;
    while ((t.stock[id] || 0) < pol.stock && v.gold - pr >= pol.reserve) { v.gold -= pr; t.stock[id] = (t.stock[id] || 0) + 1; acc.spent += pr; }
  });
  const ctx = { repSum: 0 };
  TavernCore.queue(TAVERN, dayId, v, VN.evalCond).forEach((cu) => {
    let ids = null;
    if (rnd() < pol.right) ids = TavernCore.bestKnown(TAVERN, v, cu.who, cu.order, rnd() < pol.fav);
    if (!ids) ids = rnd() < 0.6 ? randKnown(t) : randIds(t, 2 + Math.floor(rnd() * 2));
    if (!ids) { const o = TavernCore.skip(TAVERN, v, ctx); v.rep += o.rep; acc.skipped++; return; }
    const out = TavernCore.serve(TAVERN, v, cu.who, cu.order, ids, ctx);
    TavernCore.applyDelta(v, out);
    acc.sold += out.sale; acc.tips += out.tip; acc[out.result] = (acc[out.result] || 0) + 1;
    if (out.fav) acc.fav++;
  });
  acc.net += v.gold - goldStart;
}
function buyUpgrades(v, pol, acc) {
  let n = 0;
  pol.buy.forEach((id) => {
    const u = TAVERN.upgrades.find((x) => x.id === id);
    if (!u || v.tavern.upg[id] || n >= 2 || v.gold - u.price < pol.keep) return;
    v.gold -= u.price; v.tavern.upg[id] = true; (u.learn || []).forEach((r) => TavernCore.learn(v, r)); acc.upgrades.push(id); n++;
  });
}

// pickFn(options, vars, sceneId) -> 선택한 option, pol: 영업 플레이어 모델
function simulate(pickFn, pol) {
  pol = pol || POL.decent;
  const v = JSON.parse(JSON.stringify(STORY.init));
  const acc = { sold: 0, tips: 0, spent: 0, net: 0, skipped: 0, fav: 0, upgrades: [] };
  let sc = STORY.start, pc = 0, steps = 0, ending = null, read = 0;
  const visit = new Set(), snapRep = {};
  while (steps++ < 20000) {
    const c = scenes[sc][pc];
    if (!c) return { error: `씬 끝: ${sc}`, v };
    if (pc === 0) { visit.add(sc); if (/^d\d_open$/.test(sc)) snapRep[sc] = v.rep; }
    if ('ending' in c) { ending = c.ending; break; }
    if ('say' in c || 'narr' in c) read++;
    if ('choice' in c) {
      const opts = c.choice.filter((o) => (!o.if || VN.evalCond(o.if, v)) && (!o.cost || (v.gold || 0) >= o.cost));
      if (!opts.length) return { error: `선택지 막힘: ${sc}`, v };
      const o = pickFn(opts, v, sc);
      if (o.cost) v.gold -= o.cost;
      applySet(v, o.set);
      if (o.goto) { sc = o.goto; pc = 0; } else pc++;
      continue;
    }
    if ('if' in c) { const ok = VN.evalCond(c.if, v); if (ok && c.goto) { sc = c.goto; pc = 0; } else if (!ok && c.else) { sc = c.else; pc = 0; } else pc++; continue; }
    if ('goto' in c) { sc = c.goto; pc = 0; continue; }
    if ('day' in c) { v.day = c.day; v.time = c.time || '아침'; pc++; continue; }
    if ('time' in c) { v.time = c.time; pc++; continue; }
    if ('tavern' in c) { tavernService(v, c.tavern, pol, acc); pc++; continue; }
    if ('learn' in c) { [].concat(c.learn).forEach((r) => TavernCore.learn(v, r)); pc++; continue; }
    if ('upgrades' in c) { buyUpgrades(v, pol, acc); pc++; continue; }
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
const score = (o, who) => (o.set && o.set['aff.' + who] || 0) * 10 + (o.who === who ? 5 : 0) + (o.set && o.set.rep || 0) * 2 - (o.cost || 0) * 0.05;
const focusPick = (h, noise) => (opts) => { let best = opts[0], bs = -1e9; opts.forEach((o) => { const s2 = score(o, h) + rnd() * noise; if (s2 > bs) { bs = s2; best = o; } }); return best; };
const evenPick = (opts, v) => {
  const min = Math.min(...Object.values(v.aff));
  let best = opts[0], bs = -1e9;
  opts.forEach((o) => { let s2 = (o.set && o.set.rep || 0) * 3 - (o.cost || 0) * 0.02; HEROINES.forEach((h) => { if (v.aff[h] === min && o.who === h) s2 += 6; if (v.aff[h] > 4 && o.set && o.set['aff.' + h] > 0) s2 -= 8; }); if (s2 > bs) { bs = s2; best = o; } });
  return best;
};
const badPick = (opts) => opts.reduce((a, b) => (((b.set && b.set.rep) || 0) < ((a.set && a.set.rep) || 0) ? b : a));
// 평균 집계 도우미
const agg = () => ({ n: 0, gold: [], rep: [], net: [], perfect: [], fav: [], upg: [], end: {}, aff: {} });
const addAgg = (g, r) => {
  g.n++; g.gold.push(r.v.gold); g.rep.push(r.v.rep); g.net.push(r.acc.net); g.perfect.push(r.v.tavern.perfect); g.fav.push(r.acc.fav); g.upg.push(r.acc.upgrades.length);
  g.end[r.ending] = (g.end[r.ending] || 0) + 1;
  HEROINES.forEach((h) => { (g.aff[h] = g.aff[h] || []).push(r.v.aff[h]); });
};
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
const focusRes = {}, evenRes = {}, badRes = {};
polNames.forEach((pn) => {
  focusRes[pn] = {}; HEROINES.forEach((h) => { focusRes[pn][h] = agg(); });
  evenRes[pn] = agg(); badRes[pn] = agg();
  HEROINES.forEach((h) => {
    for (let i = 0; i < 40; i++) {
      const r = simulate(focusPick(h, i ? 6 : 0), POL[pn]);
      if (r.error) { err('전략 시뮬레이션: ' + r.error); break; }
      addAgg(focusRes[pn][h], r);
    }
  });
  for (let i = 0; i < 40; i++) { const r = simulate(i ? (opts, v) => (rnd() < 0.15 ? pickRand(opts) : evenPick(opts, v)) : evenPick, POL[pn]); if (!r.error) addAgg(evenRes[pn], r); }
  for (let i = 0; i < 20; i++) { const r = simulate(badPick, POL[pn]); if (!r.error) addAgg(badRes[pn], r); }
});
// (3) 팬: 좋아하는 히로인이 있는 보통 플레이어 (절반은 그 사람, 나머지 무작위)
const fanRes = {};
polNames.forEach((pn) => {
  fanRes[pn] = agg();
  HEROINES.forEach((h) => { for (let i = 0; i < 40; i++) { const r = simulate((opts) => (rnd() < 0.55 ? focusPick(h, 0)(opts) : pickRand(opts)), POL[pn]); if (!r.error) addAgg(fanRes[pn], r); } });
});
const ref = simulate(evenPick, POL.decent), refBad = simulate(badPick, POL.novice);
if (refBad.ending !== 'bad') err(`평판 최저 + 서툰 영업 전략이 배드 엔딩에 도달하지 못함 (결과: ${refBad.ending}, 평판 ${refBad.v.rep})`);
if (ref.ending !== 'normal') wn(`균등 분배 + 보통 영업 전략이 노멀 엔딩이 아님 (결과: ${ref.ending}, aff ${JSON.stringify(ref.v.aff)})`);
polNames.forEach((pn) => {
  const f = Object.values(focusRes[pn]); const ok = f.every((g, i) => g.end[HEROINES[i]] === g.n);
  if (!ok) wn(`히로인 집중 + ${pn} 영업: 집중한 히로인의 개별 엔딩이 100%가 아님 ${JSON.stringify(Object.fromEntries(HEROINES.map((h) => [h, focusRes[pn][h].end])))}`);
  const e = evenRes[pn].end; if ((e.normal || 0) < evenRes[pn].n * 0.8) wn(`균등 분배 + ${pn} 영업: 노멀이 80% 미만 ${JSON.stringify(e)}`);
});

console.log(`씬 ${Object.keys(scenes).length}개 (도달 가능 ${seen.size}), 대사/나레이션 ${lines}줄, 선택지 ${choices}개, 엔딩 ${ENDINGS.length}종 (도달 ${reachedEndings.size})`);
if (TAVERN) {
  const nR = Object.keys(TAVERN.recipes).length, nI = Object.keys(TAVERN.ingredients).length, nB = Object.values(TAVERN.recipes).filter((r) => r.basic).length;
  console.log(`저녁 영업: 재료 ${nI}종, 레시피 ${nR}개 (기본 ${nB}), 업그레이드 ${TAVERN.upgrades.length}개, 일차별 손님 ${Object.entries(TAVERN.days).map(([k, d]) => `${k}:${d.customers.filter((c) => !c.if).length}${d.customers.some((c) => c.if) ? '+' + d.customers.filter((c) => c.if).length : ''}`).join(' ')}, 주문 ${tvStats.orders}개 (낙관적 지식으로 대성공 가능 ${tvStats.perfectKnown}개)`);
  console.log('히로인 영업 기본 등장 횟수:', JSON.stringify(Object.fromEntries(HEROINES.map((h) => [h, (tvStats.appear || {})[h] || 0]))));
}
const per = {}; HEROINES.forEach((h) => { per[h] = Object.keys(scenes).filter((s2) => new RegExp('^' + h + '_').test(s2)).length; });
stat.read.sort((a, b) => a - b);
console.log(`한 회차에 읽는 대사/나레이션: 중앙값 ${stat.read[stat.read.length >> 1]}줄 (최소 ${stat.read[0]} ~ 최대 ${stat.read[stat.read.length - 1]}) -> 줄당 3~4초 가정 시 약 ${Math.round(stat.read[stat.read.length >> 1] * 3 / 60)}~${Math.round(stat.read[stat.read.length >> 1] * 4 / 60)}분 + 선택/영업 시간`);
console.log('히로인별 이벤트 씬 수:', JSON.stringify(per));
console.log('무작위 선택 x 영업 모델 섞기 6000회 엔딩 분포:', JSON.stringify(stat.random), stat.errors ? `(막힘 ${stat.errors})` : '(막힘 0)');
polNames.forEach((pn) => { const g = stat.byPol[pn]; console.log(`  - 영업 ${pn} (${g.n}회): 엔딩 ${JSON.stringify(g.end)} / 최종 골드 ${fmt(g.gold)} / 평판 ${fmt(g.rep)} / 대성공 ${fmt(g.perfect)}회 / 업그레이드 ${(g.upg.reduce((a, b) => a + b, 0) / g.n).toFixed(1)}개`); });
console.log('히로인 집중 전략(각 40회) 최종 호감도 범위 (loveLine ' + STORY.loveLine + '):');
polNames.forEach((pn) => console.log(`  - 영업 ${pn}: ` + HEROINES.map((h) => { const a = focusRes[pn][h].aff[h]; return `${h} ${Math.min(...a)}~${Math.max(...a)}`; }).join(' / ') + ` | 엔딩 일치 ` + HEROINES.map((h) => `${focusRes[pn][h].end[h] || 0}/${focusRes[pn][h].n}`).join(' ') + ` | 골드 ${fmt(focusRes[pn][HEROINES[0]].gold)}`));
console.log('균등 분배 전략 (여러 사람에게 고르게):');
polNames.forEach((pn) => { const g = evenRes[pn]; console.log(`  - 영업 ${pn}: 엔딩 ${JSON.stringify(g.end)} / ` + HEROINES.map((h) => `${h} ${fmt(g.aff[h])}`).join(' ') + ` / 평판 ${fmt(g.rep)}`); });
console.log('팬 전략 (좋아하는 히로인 55% 집중 + 나머지 무작위, 각 160회):');
polNames.forEach((pn) => { const g = fanRes[pn]; console.log(`  - 영업 ${pn}: 엔딩 ${JSON.stringify(g.end)} / 평판 ${fmt(g.rep)} / 최종 골드 ${fmt(g.gold)}`); });
console.log('평판 최저 선택 전략 (배드 엔딩):');
polNames.forEach((pn) => { const g = badRes[pn]; console.log(`  - 영업 ${pn}: 엔딩 ${JSON.stringify(g.end)} / 평판 ${fmt(g.rep)}`); });
// 영업 수입 (균등 분배 전략 기준)
polNames.forEach((pn) => { const g = evenRes[pn]; console.log(`영업 ${pn} 5일 순수익(매출+팁-재료비, 업그레이드 제외): 중앙 ${med(g.net)}G (범위 ${Math.min(...g.net)}~${Math.max(...g.net)}), 최애 서빙 ${(g.fav.reduce((a, b) => a + b, 0) / g.n).toFixed(1)}회`); });
console.log(`균등 분배 + 보통 영업 -> ${ref.ending} (호감도 ${JSON.stringify(ref.v.aff)}) / 평판 최저 + 서툰 영업 -> ${refBad.ending} (평판 ${refBad.v.rep})`);
warns.forEach((m) => console.log('경고: ' + m));
errors.forEach((m) => console.log('오류: ' + m));
console.log(errors.length ? `검사 실패 (오류 ${errors.length})` : '검사 통과: 끊긴 goto 없음, 영업 데이터 정상, 모든 엔딩 도달 가능');
process.exit(errors.length ? 1 : 0);
