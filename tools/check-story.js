// 스토리 데이터 정적 검사 + 시뮬레이션: node tools/check-story.js
// - index.html 이 읽는 story/*.js 를 순서대로 로드
// - goto 대상 씬 존재, 도달 불가 씬, 씬 끝 처리, 조건식 문법, 변수 이름
// - 배경/캐릭터/표정 id, 이미지 파일 존재, sw.js 캐시 목록과 비교, index.html 스크립트 목록 비교
// - 선택지 막힘(전부 유료/조건부) 검사, 히로인별 이벤트 4개 이상, 엔딩 6종 도달 가능
// - 브라우저 없이 스토리를 수천 번 무작위/전략 플레이해서 엔딩 분포와 호감도 범위를 알려 준다
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
scripts.forEach(load);
const { STORY, CHARACTERS, BACKGROUNDS, VN, ENDINGS, HEROINES } = ctx;

const errors = [], warns = [];
const err = (m) => errors.push(m), wn = (m) => warns.push(m);
const scenes = STORY.scenes;
const edges = {};
const KNOWN = ['say', 'narr', 'choice', 'summary', 'end', 'ending', 'if', 'goto', 'show', 'hide', 'bg', 'day', 'time', 'fx', 'set', 'put'];
const TERMINAL = ['goto', 'choice', 'summary', 'end', 'ending'];
const files = new Set();
let lines = 0, choices = 0;

if (!scenes[STORY.start]) err(`시작 씬 없음: ${STORY.start}`);
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
    const m = k.match(/^(gold|rep)$|^(?:aff|ev)\.(\w+)$|^flag\.\w+$/);
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
// pickFn(options, vars, sceneId) -> 선택한 option
function simulate(pickFn) {
  const v = JSON.parse(JSON.stringify(STORY.init));
  let sc = STORY.start, pc = 0, steps = 0, ending = null, read = 0;
  while (steps++ < 20000) {
    const c = scenes[sc][pc];
    if (!c) return { error: `씬 끝: ${sc}`, v };
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
    if ('set' in c) applySet(v, c.set);
    if ('put' in c) Object.keys(c.put).forEach((k) => setPath(v, k, c.put[k], false));
    pc++;
  }
  return { ending, v, steps, read };
}
let seed = 12345;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const sum = (o) => Object.values(o.aff).reduce((a, b) => a + b, 0);
const stat = { random: {}, errors: 0 };
const affMax = {}, affFocusMin = {}, affFocusMax = {}, focusEnd = {};
for (let i = 0; i < 6000; i++) {
  const r = simulate((opts) => opts[Math.floor(rnd() * opts.length)]);
  if (r.error) { stat.errors++; if (stat.errors < 4) err('시뮬레이션: ' + r.error); continue; }
  stat.random[r.ending] = (stat.random[r.ending] || 0) + 1;
  stat.read = (stat.read || []).concat(r.read);
}
// 전략: 특정 히로인을 노린다 (낮에는 그 사람, 그 외에는 그 사람의 호감도를 가장 올리는 선택, 나머지는 평판 높은 쪽)
const score = (o, who) => (o.set && o.set['aff.' + who] || 0) * 10 + (o.who === who ? 5 : 0) + (o.set && o.set.rep || 0) * 2 - (o.cost || 0) * 0.05;
(HEROINES || []).forEach((h) => {
  for (let i = 0; i < 40; i++) {
    const r = simulate((opts) => { let best = opts[0], bs = -1e9; opts.forEach((o) => { const s = score(o, h) + rnd() * (i ? 6 : 0); if (s > bs) { bs = s; best = o; } }); return best; });
    if (r.error) { err('전략 시뮬레이션: ' + r.error); break; }
    (focusEnd[h] = focusEnd[h] || {})[r.ending] = ((focusEnd[h] || {})[r.ending] || 0) + 1;
    affFocusMax[h] = Math.max(affFocusMax[h] || 0, r.v.aff[h]);
    affFocusMin[h] = Math.min(affFocusMin[h] === undefined ? 99 : affFocusMin[h], r.v.aff[h]);
  }
});
// 최저 평판 전략 (배드 엔딩 가능 여부) / 균등 분배 전략 (노멀 엔딩 가능 여부)
const bad = simulate((opts) => opts.reduce((a, b) => (((b.set && b.set.rep) || 0) < ((a.set && a.set.rep) || 0) ? b : a)));
const even = simulate((opts, v) => {
  const min = Math.min(...Object.values(v.aff));
  let best = opts[0], bs = -1e9;
  opts.forEach((o) => { let s = (o.set && o.set.rep || 0) * 3 - (o.cost || 0) * 0.02; HEROINES.forEach((h) => { if (v.aff[h] === min && o.who === h) s += 6; if (v.aff[h] > 4 && o.set && o.set['aff.' + h] > 0) s -= 8; }); if (s > bs) { bs = s; best = o; } });
  return best;
});
if (bad.ending !== 'bad') err(`평판 최저 전략이 배드 엔딩에 도달하지 못함 (결과: ${bad.ending}, 평판 ${bad.v.rep})`);
if (even.ending !== 'normal') wn(`균등 분배 전략이 노멀 엔딩이 아님 (결과: ${even.ending}, aff ${JSON.stringify(even.v.aff)})`);

console.log(`씬 ${Object.keys(scenes).length}개 (도달 가능 ${seen.size}), 대사/나레이션 ${lines}줄, 선택지 ${choices}개, 엔딩 ${ENDINGS.length}종 (도달 ${reachedEndings.size})`);
const per = {}; HEROINES.forEach((h) => { per[h] = Object.keys(scenes).filter((s) => new RegExp('^' + h + '_').test(s)).length; });
stat.read.sort((a, b) => a - b);
console.log(`한 회차에 읽는 대사/나레이션: 중앙값 ${stat.read[stat.read.length >> 1]}줄 (최소 ${stat.read[0]} ~ 최대 ${stat.read[stat.read.length - 1]}) -> 줄당 3~4초 가정 시 약 ${Math.round(stat.read[stat.read.length >> 1] * 3 / 60)}~${Math.round(stat.read[stat.read.length >> 1] * 4 / 60)}분 + 선택 고민 시간`);
console.log('히로인별 이벤트 씬 수:', JSON.stringify(per));
console.log('무작위 6000회 엔딩 분포:', JSON.stringify(stat.random), stat.errors ? `(막힘 ${stat.errors})` : '(막힘 0)');
console.log('히로인 집중 전략(각 40회) 최종 호감도 범위:', HEROINES.map((h) => `${h} ${affFocusMin[h]}~${affFocusMax[h]}`).join(' / '));
console.log('히로인 집중 전략 엔딩:', JSON.stringify(focusEnd));
console.log(`평판 최저 전략 -> ${bad.ending} (평판 ${bad.v.rep}) / 균등 분배 전략 -> ${even.ending} (호감도 ${JSON.stringify(even.v.aff)})`);
warns.forEach((m) => console.log('경고: ' + m));
errors.forEach((m) => console.log('오류: ' + m));
console.log(errors.length ? `검사 실패 (오류 ${errors.length})` : '검사 통과: 끊긴 goto 없음, 모든 엔딩 도달 가능');
process.exit(errors.length ? 1 : 0);
