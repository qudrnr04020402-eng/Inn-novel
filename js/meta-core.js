// ============================================================
//  회차 / 업적 규칙 (DOM 과 무관한 순수 함수) — 2회차 보너스(New Game+) + 업적 판정
//  - 회차 공통 기록(localStorage)은 엔진(js/engine.js)이 읽고 써서 이 함수들에 넘겨 줍니다.
//      'runs' : 마친 회차 수(엔딩에 도달한 회차) — 없으면 0   /  'ach' : { 업적 id: 시각 }
//  - 데이터: story/achievements.js (ACHIEVEMENTS), 회차 한정 장면: story/ngplus.js
//  - 변수 vars.run = 지금 회차(1, 2, 3 …). 옛 세이브엔 없을 수 있어서 조건식에서는 없으면 0 으로 읽힙니다. (run>=2 = 2회차 이상)
//  - 세이브 형식은 바꾸지 않습니다: vars.run / vars.ng 는 처음 쓸 때 만들어집니다.
// ============================================================
(function (root) {
  'use strict';
  var M = {};
  M.MAX_PICK = 2;        // 보너스는 최대 2개
  M.GOLD = 60;           // 시작 자금 +60G
  M.REST = 10;           // 첫 주(1~8일차) 아침마다 피로 -10 추가 회복
  M.AFF = 6;             // 엔딩 본 히로인 호감도 +6 (하트 1칸 미만)
  M.RECIPES = 3;         // 지난 회차에 배운 레시피 최대 3개 유지

  // 실제 회차 수: 기록된 runs 와 엔딩 기록 중 큰 쪽 (옛 기록은 runs 가 없고 엔딩만 있을 수 있음)
  M.doneRuns = function (runs, endings) {
    var r = Math.max(0, Math.floor(Number(runs) || 0));
    if (!r && endings && Object.keys(endings).length) r = 1;
    return r;
  };

  // 지금 고를 수 있는 2회차 보너스 목록 (rec: { runs, endings, recipes }). 엔딩 기록이 없으면 빈 배열
  M.bonusOptions = function (rec) {
    var runs = M.doneRuns(rec.runs, rec.endings);
    if (!runs) return [];
    var out = [
      { id: 'gold', name: '시작 자금 +' + M.GOLD + 'G', desc: '지난 회차의 단골들이 선물을 남기고 갔어요.' },
      { id: 'rest', name: '가벼운 첫 주', desc: '첫 주(1~8일차) 동안 아침마다 피로가 ' + M.REST + ' 더 풀려요.' }
    ];
    (root.HEROINES || []).forEach(function (h) {
      var seen = (root.ENDINGS || []).some(function (e) { return e.heroine === h && rec.endings && rec.endings[e.id]; });
      var ch = (root.CHARACTERS || {})[h];
      if (seen && ch) out.push({ id: 'aff:' + h, who: h, name: ch.name + '의 기억', desc: '엔딩을 본 ' + ch.name + '의 호감도 +' + M.AFF + ' 로 시작해요.' });
    });
    var rc = M.rememberable(rec.recipes);
    if (rc.length) out.push({ id: 'recipes', name: '레시피 기억', desc: '지난 회차에 배운 레시피 ' + Math.min(rc.length, M.RECIPES) + '개를 처음부터 알고 시작해요. (' + rc.slice(0, M.RECIPES).map(function (id) { return root.TAVERN.recipes[id].name; }).join(', ') + ')' });
    return out;
  };
  // 도감에 있고 기본 메뉴가 아닌 레시피 id (기록 순서대로)
  M.rememberable = function (recRecipes) {
    var R = (root.TAVERN && root.TAVERN.recipes) || {};
    return Object.keys(recRecipes || {}).filter(function (id) { return R[id] && !R[id].basic; })
      .sort(function (a, b) { return (recRecipes[a] || 0) - (recRecipes[b] || 0); });
  };

  // 보너스 적용: picks = ['gold','aff:erion', …]. 적용한 내용을 한 줄씩 돌려준다. 이번 회차 번호(vars.run)도 여기서 정한다.
  M.apply = function (vars, picks, rec) {
    var runs = M.doneRuns(rec.runs, rec.endings), lines = [], ok = {};
    M.bonusOptions(rec).forEach(function (o) { ok[o.id] = o; });
    vars.run = runs + 1;
    picks = (picks || []).filter(function (p, i, a) { return ok[p] && a.indexOf(p) === i; }).slice(0, M.MAX_PICK);
    vars.ng = { picks: picks.slice() };
    picks.forEach(function (p) {
      if (p === 'gold') { vars.gold = (vars.gold || 0) + M.GOLD; lines.push('시작 자금 +' + M.GOLD + 'G'); }
      else if (p === 'rest') { vars.ng.rest = M.REST; lines.push('첫 주 피로 회복 +' + M.REST); }
      else if (p.indexOf('aff:') === 0) {
        var h = p.slice(4); if (!vars.aff) vars.aff = {};
        vars.aff[h] = (vars.aff[h] || 0) + M.AFF; lines.push(((root.CHARACTERS || {})[h] || {}).name + ' 호감도 +' + M.AFF);
      } else if (p === 'recipes') {
        root.TavernCore.ensure(root.TAVERN, vars);
        var ids = M.rememberable(rec.recipes).slice(0, M.RECIPES);
        ids.forEach(function (id) { vars.tavern.known[id] = true; });
        lines.push('레시피 기억: ' + ids.map(function (id) { return root.TAVERN.recipes[id].name; }).join(', '));
      }
    });
    return lines;
  };
  // 하루가 바뀔 때(nd = 새 일차): 첫 주 피로 보너스
  M.onDay = function (vars, nd) {
    if (vars.ng && vars.ng.rest && nd > 1 && nd <= 8 && root.CalCore) root.CalCore.addFat(vars, -vars.ng.rest);
  };

  // 업적 판정: ctx = { vars, ending, endings, recipes, notes, cg, runs }, done = 이미 달성한 { id: 시각 } → 새로 달성한 업적 정의 배열
  M.check = function (ctx, done) {
    var out = [];
    (root.ACHIEVEMENTS || []).forEach(function (a) {
      if (done[a.id]) return;
      try { if (a.test(ctx)) out.push(a); } catch (e) { /* 잘못된 업적 조건은 건너뜀 */ }
    });
    return out;
  };

  root.MetaCore = M;
})(typeof globalThis !== 'undefined' ? globalThis : this);
