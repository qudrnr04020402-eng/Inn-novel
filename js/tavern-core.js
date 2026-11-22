// ============================================================
//  저녁 영업 규칙 (DOM 과 무관한 순수 함수 모음)
//  - 엔진(js/engine.js)과 검사 스크립트(tools/check-story.js 의 시뮬레이션)가 같이 씁니다.
//  - 데이터는 story/tavern.js (window.TAVERN) 에 있고, 이 파일은 "판정과 보상 계산"만 합니다.
//  - 보통은 수정할 필요가 없습니다. 판정 수치(보상/호감도/평판)는 story/tavern.js 의 rules 에서 바꿉니다.
// ============================================================
(function (root) {
  'use strict';
  var C = {};

  // 재료 id 목록 -> 순서 없는 키 ('bread+mead')
  C.key = function (ids) { return ids.slice().sort().join('+'); };

  // 재료 조합이 정확히 맞는 레시피를 찾는다 (없으면 null = 정체불명 요리)
  C.recipeFor = function (T, ids) {
    var k = C.key(ids), found = null;
    Object.keys(T.recipes).forEach(function (id) {
      if (C.key(T.recipes[id].ing) === k) found = Object.assign({ id: id }, T.recipes[id]);
    });
    return found;
  };

  // 주문과 요리의 일치도: perfect(대성공) / good(보통) / fail(실패) / mystery(정체불명)
  //  - want 를 전부 만족하고 avoid 가 하나도 없으면 perfect
  //  - want 를 하나라도 만족하면 good (avoid 가 섞였어도 want 를 다 채웠으면 good)
  //  - 그 외 fail
  C.judge = function (order, recipe) {
    if (!recipe) return 'mystery';
    var tags = recipe.tags, want = order.want || [], avoid = order.avoid || [];
    var hasAvoid = avoid.some(function (t) { return tags.indexOf(t) >= 0; });
    var all = want.every(function (t) { return tags.indexOf(t) >= 0; });
    var some = want.some(function (t) { return tags.indexOf(t) >= 0; });
    if (all && !hasAvoid) return 'perfect';
    if ((some && !hasAvoid) || (all && hasAvoid)) return 'good';
    return 'fail';
  };

  // 그날 나올 손님 줄 세우기: if 조건(예: 'tavern.upg.sign')을 통과한 손님만
  C.queue = function (T, dayId, vars, evalCond) {
    var d = T.days[dayId];
    if (!d) return [];
    return d.customers.filter(function (c) { return !c.if || evalCond(c.if, vars); });
  };

  // 영업 시작 전 상태 보정 (옛 변수가 없을 때 대비)
  C.ensure = function (T, vars) {
    var t = vars.tavern = vars.tavern || {};
    ['perfect', 'good', 'fail', 'mystery', 'served', 'skipped', 'sales', 'tips'].forEach(function (k) { if (typeof t[k] !== 'number') t[k] = 0; });
    ['stock', 'known', 'upg', 'fav', 'days'].forEach(function (k) { if (!t[k] || typeof t[k] !== 'object') t[k] = {}; });
    if (!t.t || typeof t.t !== 'object') t.t = { perfect: 0, good: 0, fail: 0, mystery: 0 };
    return t;
  };
  C.resetToday = function (vars) { vars.tavern.t = { perfect: 0, good: 0, fail: 0, mystery: 0 }; };

  // 재료가 있는 종류가 2개 미만이면 아무 요리도 만들 수 없다
  C.canBrew = function (T, stock) {
    var n = 0;
    Object.keys(T.ingredients).forEach(function (id) { if ((stock[id] || 0) > 0) n++; });
    return n >= 2;
  };

  // 레시피 해금 (이미 알면 false)
  C.learn = function (vars, id) {
    if (vars.tavern.known[id]) return false;
    vars.tavern.known[id] = true;
    return true;
  };

  // 요리 내기: 재료를 소모하고 결과(보상 포함)를 돌려준다.
  //  ids: 고른 재료 id 배열, ctx: { repSum } (그날 평판 증감 누계 — 하루 상한/하한 적용용)
  //  변수 중 골드/평판/호감도는 직접 바꾸지 않고 outcome.gold / rep / aff 로 돌려준다
  //  (엔진은 applySet 으로 알림과 함께 적용, 시뮬레이션은 C.applyDelta 로 적용).
  C.serve = function (T, vars, who, order, ids, ctx) {
    var R = T.rules, t = C.ensure(T, vars), cu = T.customers[who] || {};
    ids.forEach(function (id) { t.stock[id] = Math.max(0, (t.stock[id] || 0) - 1); });
    var recipe = C.recipeFor(T, ids);
    var out = { who: who, ids: ids.slice(), recipe: recipe, dish: recipe ? recipe.name : '정체불명 요리', discovered: false, fav: false, hate: false };
    if (recipe && !t.known[recipe.id]) { t.known[recipe.id] = true; out.discovered = true; }
    var result = C.judge(order, recipe);
    out.fav = !!(recipe && cu.fav && cu.fav === recipe.id);
    out.hate = !!(recipe && cu.dislike && cu.dislike.indexOf(recipe.id) >= 0);
    if (out.fav) result = 'perfect';
    else if (out.hate) result = 'fail';
    out.result = result;

    var price = recipe ? recipe.price : 0;
    out.sale = Math.round(price * (R.pay[result] || 0));
    var tip = 0;
    if (result === 'perfect') tip = Math.max(1, Math.round(price * R.tipRate)) + (out.fav ? (R.favTip || 0) : 0);
    if (tip && t.upg.barrel) tip = Math.ceil(tip * R.barrelTip);
    if (t.upg.stove && (order.want || []).indexOf('따뜻함') >= 0 && (result === 'perfect' || result === 'good')) { tip += R.stoveBonus; out.stove = true; }
    out.tip = tip;
    out.gold = out.sale + out.tip;

    var rep = out.hate ? 0 : (R.rep[result] || 0);
    var cum = (ctx && ctx.repSum) || 0;
    var capped = Math.max(R.repDay[0], Math.min(R.repDay[1], cum + rep)) - cum;
    out.rep = capped;
    if (ctx) ctx.repSum = cum + capped;

    out.aff = 0;
    if (cu.heroine) {
      if (out.fav) { out.aff = (t.fav[who] || 0) === 0 ? R.favLove : R.favLoveRepeat; t.fav[who] = (t.fav[who] || 0) + 1; }
      else if (out.hate) out.aff = R.love.hate;
      else out.aff = R.love[result] || 0;
    }

    t.served++; t[result]++; t.t[result]++;
    t.sales += out.sale; t.tips += out.tip;
    return out;
  };

  // 손님을 정중히 돌려보냄 (재료 부족 등): 평판만 조금 깎임
  C.skip = function (T, vars, ctx) {
    var R = T.rules, t = C.ensure(T, vars), cum = (ctx && ctx.repSum) || 0;
    var capped = Math.max(R.repDay[0], Math.min(R.repDay[1], cum + R.rep.skip)) - cum;
    if (ctx) ctx.repSum = cum + capped;
    t.skipped++;
    return { result: 'skip', rep: capped, gold: 0, aff: 0 };
  };

  // 시뮬레이션용: 골드/평판/호감도 적용
  C.applyDelta = function (vars, out) {
    vars.gold = (vars.gold || 0) + (out.gold || 0);
    vars.rep = (vars.rep || 0) + (out.rep || 0);
    if (out.aff && out.who) vars.aff[out.who] = (vars.aff[out.who] || 0) + out.aff;
  };

  // 반응 대사 고르기: 풀(문자열/객체 배열)에서 하나. 객체면 {text, face}
  C.pick = function (pool, rnd) {
    if (!pool || !pool.length) return null;
    return pool[Math.floor((rnd || Math.random)() * pool.length)];
  };

  // 시뮬레이션용 "정답 찾기": 가진 재료로 만들 수 있고 이미 아는 레시피 중 주문에 가장 잘 맞는 것
  //  (fav 를 알고 있다고 가정하면 withFav=true)
  C.bestKnown = function (T, vars, who, order, withFav) {
    var t = vars.tavern, cu = T.customers[who] || {}, best = null, bs = -1;
    var score = { perfect: 3, good: 2, fail: 1, mystery: 0 };
    Object.keys(T.recipes).forEach(function (id) {
      var r = T.recipes[id];
      var known = t.known[id] || (withFav && cu.fav === id);
      if (!known) return;
      if (!r.ing.every(function (i) { return (t.stock[i] || 0) > 0; })) return;
      var res = C.judge(order, Object.assign({ id: id }, r));
      var s = score[res] * 10 + (r.price / 100);
      if (cu.fav === id) s += 50;
      if (cu.dislike && cu.dislike.indexOf(id) >= 0) s -= 100;
      if (s > bs) { bs = s; best = r.ing.slice(); }
    });
    return best;
  };

  root.TavernCore = C;
})(typeof globalThis !== 'undefined' ? globalThis : this);
