// 스토리 데이터 정적 검사: node tools/check-story.js
// - goto 대상 씬 존재, 시작 씬, 도달 불가 씬, 씬 끝 처리, 조건식 문법
// - 배경/캐릭터/표정 id, 이미지 파일 존재, sw.js 캐시 목록과 비교
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { console }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
['story/characters.js', 'story/backgrounds.js', 'story/day1.js', 'js/engine.js'].forEach(load);
const { STORY, CHARACTERS, BACKGROUNDS, VN } = ctx;

const errors = [], warns = [];
const err = (m) => errors.push(m), wn = (m) => warns.push(m);
const scenes = STORY.scenes;
const edges = {}; // 씬 -> 이동 가능한 씬들
const KNOWN = ['say', 'narr', 'choice', 'summary', 'end', 'if', 'goto', 'show', 'hide', 'bg', 'set', 'put'];
const files = new Set();

if (!scenes[STORY.start]) err(`시작 씬 없음: ${STORY.start}`);

for (const [id, cmds] of Object.entries(scenes)) {
  edges[id] = [];
  const target = (t, where) => {
    if (!scenes[t]) err(`[${id}] ${where}: 없는 씬으로 goto -> ${t}`); else edges[id].push(t);
  };
  if (!Array.isArray(cmds) || !cmds.length) { err(`[${id}] 비어 있는 씬`); continue; }
  cmds.forEach((c, i) => {
    const w = `#${i}`;
    const key = KNOWN.find((k) => k in c);
    if (!key) return err(`[${id}] ${w}: 알 수 없는 명령 ${JSON.stringify(c)}`);
    if (key === 'say') {
      const ch = CHARACTERS[c.say];
      if (!ch) err(`[${id}] ${w}: 없는 캐릭터 ${c.say}`);
      else if (c.face && !ch.faces[c.face]) err(`[${id}] ${w}: ${c.say} 에 없는 표정 ${c.face}`);
      if (typeof c.text !== 'string') err(`[${id}] ${w}: say 에 text 없음`);
    }
    if (key === 'show') {
      const ch = CHARACTERS[c.show];
      if (!ch) err(`[${id}] ${w}: 없는 캐릭터 ${c.show}`);
      else if (c.face && !ch.faces[c.face]) err(`[${id}] ${w}: ${c.show} 에 없는 표정 ${c.face}`);
      if (c.pos && !['left', 'center', 'right'].includes(c.pos)) err(`[${id}] ${w}: 잘못된 pos ${c.pos}`);
    }
    if (key === 'hide' && c.hide !== 'all' && !CHARACTERS[c.hide]) err(`[${id}] ${w}: 없는 캐릭터 ${c.hide}`);
    if (key === 'bg' && !BACKGROUNDS[c.bg]) err(`[${id}] ${w}: 없는 배경 ${c.bg}`);
    if (key === 'goto') target(c.goto, w);
    if (key === 'if') {
      try { VN.checkCond(c.if); } catch (e) { err(`[${id}] ${w}: ${e.message}`); }
      if (!c.goto) err(`[${id}] ${w}: if 에 goto 없음`);
      else target(c.goto, w + ' if');
      if (c.else) target(c.else, w + ' else');
    }
    if (key === 'choice') {
      if (!Array.isArray(c.choice) || !c.choice.length) err(`[${id}] ${w}: 빈 선택지`);
      (c.choice || []).forEach((o, j) => {
        const ow = `${w} 선택지${j + 1}`;
        if (!o.text) err(`[${id}] ${ow}: text 없음`);
        if (o.if) { try { VN.checkCond(o.if); } catch (e) { err(`[${id}] ${ow}: ${e.message}`); } }
        if (o.goto) target(o.goto, ow);
        else if (i === cmds.length - 1) err(`[${id}] ${ow}: 마지막 명령인데 goto 없음`);
      });
      // 조건 선택지만 있는 경우 모두 숨겨질 수 있음
      if (c.choice.every((o) => o.if)) wn(`[${id}] ${w}: 모든 선택지에 if 가 있어 아무것도 안 보일 수 있음`);
    }
    for (const sk of ['set', 'put']) {
      if (key === sk || (key === 'choice')) { /* 아래에서 검사 */ }
    }
  });
  // 변수 경로 검사 (set/put/선택지 set)
  const sets = [];
  cmds.forEach((c) => { if (c.set) sets.push(c.set); if (c.put) sets.push(c.put); (c.choice || []).forEach((o) => o.set && sets.push(o.set)); });
  sets.forEach((s) => Object.keys(s).forEach((k) => {
    const m = k.match(/^(gold|rep)$|^aff\.(\w+)$|^flag\.\w+$/);
    if (!m) wn(`[${id}] 변수 이름 확인: ${k}`);
    else if (m[2] && !CHARACTERS[m[2]]) err(`[${id}] 없는 캐릭터의 호감도: ${k}`);
  }));
  // 마지막 명령은 씬을 끝내야 함
  const last = cmds[cmds.length - 1];
  if (!('goto' in last || 'choice' in last || 'summary' in last || 'end' in last)) {
    err(`[${id}] 마지막 명령이 goto/choice/summary/end 가 아님 (끊긴 흐름)`);
  }
}

// 도달 가능성 (BFS)
const seen = new Set([STORY.start]), q = [STORY.start];
while (q.length) { const s = q.shift(); (edges[s] || []).forEach((t) => { if (!seen.has(t)) { seen.add(t); q.push(t); } }); }
Object.keys(scenes).forEach((id) => { if (!seen.has(id)) wn(`도달 불가 씬: ${id}`); });
// 종료(summary/end) 도달 확인
const reachEnd = [...seen].some((id) => scenes[id].some((c) => 'summary' in c || 'end' in c));
if (!reachEnd) err('시작 씬에서 summary/end 에 도달할 수 없음');

// 이미지 파일 존재
Object.entries(CHARACTERS).forEach(([id, c]) => Object.entries(c.faces).forEach(([f, p]) => {
  files.add(p); if (!fs.existsSync(path.join(root, p))) err(`캐릭터 이미지 없음: ${id}.${f} -> ${p}`);
}));
Object.entries(BACKGROUNDS).forEach(([id, p]) => { files.add(p); if (!fs.existsSync(path.join(root, p))) err(`배경 이미지 없음: ${id} -> ${p}`); });

// sw.js 캐시 목록
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const list = [...sw.match(/const ASSETS = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
list.forEach((p) => { if (p !== './' && !fs.existsSync(path.join(root, p))) err(`sw.js 목록의 파일이 없음: ${p}`); });
files.forEach((p) => { if (!list.includes(p)) wn(`sw.js 캐시 목록에 없음(오프라인 시 누락): ${p}`); });

// 경로 열거(분기 개수 참고용)
let paths = 0;
const count = (id, depth) => {
  if (depth > 60) return 0;
  const cmds = scenes[id]; let total = 0, branching = false;
  for (const c of cmds) if (c.choice) { branching = true; total += c.choice.reduce((a, o) => a + (o.goto ? count(o.goto, depth + 1) : 1), 0); }
  if (!branching) { const g = cmds.filter((c) => c.goto).map((c) => c.goto); total = g.length ? g.reduce((a, t) => a + count(t, depth + 1), 0) : 1; }
  return total;
};
try { paths = count(STORY.start, 0); } catch (e) {}

console.log(`씬 ${Object.keys(scenes).length}개, 도달 가능 ${seen.size}개, 대략적인 경로 수 ${paths}`);
warns.forEach((m) => console.log('경고: ' + m));
errors.forEach((m) => console.log('오류: ' + m));
console.log(errors.length ? `검사 실패 (오류 ${errors.length})` : '검사 통과: 끊긴 goto 없음');
process.exit(errors.length ? 1 : 0);
