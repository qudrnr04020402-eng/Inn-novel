// ============================================================
//  아침 랜덤 사건 규칙 (DOM 과 무관한 순수 함수 모음)
//  - 엔진(js/engine.js)과 검사 스크립트(tools/check-story.js 의 시뮬레이션)가 같이 씁니다.
//  - 데이터(사건 풀/확률/장면)는 story/random-events.js (window.RANDOM_EVENTS + 씬 rev_*) 에 있습니다.
//  - 난수는 "세이브에 저장된 시드 + 일차"로 계산하는 해시라서, 같은 세이브를 불러오면 언제나 같은 결과입니다.
//    (세이브/로드로 사건을 다시 뽑을 수 없음. 새 게임을 시작할 때만 시드가 새로 정해짐)
// ============================================================
(function (root) {
  'use strict';
  var E = {};

  // 시드와 두 정수로 [0,1) 난수 (mulberry32 변형, 결정적)
  E.rand = function (seed, a, b) {
    var x = ((seed >>> 0) + Math.imul((a | 0) + 1, 0x9E3779B1) + Math.imul((b | 0) + 7, 0x85EBCA6B)) >>> 0;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  // 사건 상태 보정: vars.rev = { seed, used:[사건 id], today:'오늘 사건 id', ret:'끝난 뒤 이어질 씬' }, vars.today = 오늘의 영업 보정
  E.ensure = function (vars, makeSeed) {
    var r = vars.rev = (vars.rev && typeof vars.rev === 'object') ? vars.rev : {};
    if (!(typeof r.seed === 'number')) r.seed = makeSeed ? makeSeed() : 1;
    if (!Array.isArray(r.used)) r.used = [];
    if (typeof r.today !== 'string') r.today = '';
    if (typeof r.ret !== 'string') r.ret = '';
    if (typeof r.last !== 'number') r.last = -9;      // 마지막 사건이 일어난 일차
    var t = vars.today = (vars.today && typeof vars.today === 'object') ? vars.today : {};
    ['cust', 'price', 'tip'].forEach(function (k) { if (typeof t[k] !== 'number') t[k] = 0; });
    if (typeof t.note !== 'string') t.note = '';
    return r;
  };
  // 새 하루가 시작되면 오늘의 보정을 지운다 ({day:N} 명령에서 호출)
  E.newDay = function (vars) {
    E.ensure(vars);
    vars.today = { cust: 0, price: 0, tip: 0, note: '' };
    vars.rev.today = '';
  };

  // 오늘 아침에 일어날 사건 id (없으면 null). 같은 시드/일차/사용 기록이면 항상 같은 결과.
  E.pick = function (R, vars, day, evalCond) {
    var rev = E.ensure(vars);
    if (!R || !E.inRange(R.range, day)) return null;
    if (R.gap && typeof rev.last === 'number' && day - rev.last <= R.gap) return null;   // 직전 사건과 간격 두기 (연속으로 터지지 않게)
    if (E.rand(rev.seed, day, 1) >= R.chance) return null;
    var wk = root.CalCore ? root.CalCore.weekOf(day) : Math.ceil(day / 7);
    var ids = Object.keys(R.events).filter(function (id) {
      var ev = R.events[id];
      if (rev.used.indexOf(id) >= 0) return false;
      if (ev.weeks && ev.weeks.indexOf(wk) < 0) return false;                 // weeks: 나올 수 있는 주차 (생략하면 전 기간)
      if (ev.days && ev.days.indexOf(day) < 0) return false;                  // days: 나올 수 있는 일차 (생략 가능)
      if (ev.minDay && day < ev.minDay) return false;
      if (ev.maxDay && day > ev.maxDay) return false;
      return !ev.if || evalCond(ev.if, vars);
    });
    if (!ids.length) return null;
    var total = 0;
    ids.forEach(function (id) { total += R.events[id].weight || 1; });
    var x = E.rand(rev.seed, day, 2) * total;
    for (var i = 0; i < ids.length; i++) { x -= R.events[ids[i]].weight || 1; if (x < 0) return ids[i]; }
    return ids[ids.length - 1];
  };
  // range = [처음 일차, 마지막 일차] (생략하면 항상 true)
  E.inRange = function (range, day) { return !range || (day >= range[0] && day <= range[1]); };
  // 사건 시작 기록 (사용한 사건 / 끝난 뒤 돌아갈 씬)
  E.begin = function (vars, id, thenScene) {
    var rev = E.ensure(vars);
    rev.ret = thenScene;
    rev.today = id || '';
    if (id) { rev.used.push(id); rev.last = vars.day || 0; }
  };

  root.EventCore = E;
})(typeof globalThis !== 'undefined' ? globalThis : this);
