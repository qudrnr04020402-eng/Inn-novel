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
  //  - want 를 전부 만족하고 avoid 가 하나도 없으면 perfect (특별 주문은 재료 조건 ing/noIng 까지 맞아야 perfect)
  //  - want 를 하나라도 만족하면 good (avoid 가 섞였어도 want 를 다 채웠으면 good)
  //  - 그 외 fail
  C.judge = function (order, recipe) {
    if (!recipe) return 'mystery';
    var tags = recipe.tags, want = order.want || [], avoid = order.avoid || [];
    var hasAvoid = avoid.some(function (t) { return tags.indexOf(t) >= 0; });
    var all = want.every(function (t) { return tags.indexOf(t) >= 0; });
    var some = want.some(function (t) { return tags.indexOf(t) >= 0; });
    // 특별 주문의 재료 조건: ing(꼭 들어가야 하는 재료) / noIng(들어가면 안 되는 재료). 어기면 대성공이 보통으로 내려간다
    var ingOk = (order.ing || []).every(function (i) { return recipe.ing.indexOf(i) >= 0; }) &&
      !(order.noIng || []).some(function (i) { return recipe.ing.indexOf(i) >= 0; });
    if (all && !hasAvoid) return ingOk ? 'perfect' : 'good';
    if ((some && !hasAvoid) || (all && hasAvoid)) return 'good';
    return 'fail';
  };

  // 그날 나올 손님 줄 세우기: if 조건(예: 'tavern.upg.sign')을 통과한 손님만, 그 뒤에 그날의 특별 주문 손님들이 이어진다.
  //  특별 주문 손님에는 sp = { day, i(몇 번째), n(전체 몇 명), title } 가 붙는다.
  C.queue = function (T, dayId, vars, evalCond) {
    var d = T.days[dayId];
    if (!d) return [];
    var q = d.customers.filter(function (c) { return !c.if || evalCond(c.if, vars); });
    // 아침 랜덤 사건의 영업 보정 (vars.today.cust): 음수면 일반 손님을 줄이고(히로인/레시피를 전수하는 손님은 남김), 양수면 단골을 더 부른다
    var cust = ((vars && vars.today && vars.today.cust) | 0);
    if (cust < 0) {
      for (var n = 0; n < -cust; n++) {
        for (var i = q.length - 1; i >= 0; i--) {
          var cd = T.customers[q[i].who] || {};
          if (!cd.heroine && !q[i].gain && !q[i].reward) { q.splice(i, 1); break; }
        }
      }
    } else if (cust > 0 && T.extras && T.extras.length) {
      var start = (vars.day || 0) % T.extras.length, added = 0;
      for (var k = 0; k < T.extras.length && added < cust; k++) {
        var ex = T.extras[(start + k) % T.extras.length];
        if (q.some(function (c) { return c.who === ex.who; })) continue;
        q.push(ex); added++;
      }
    }
    var sp = T.specials && T.specials[dayId];
    if (sp) sp.units.forEach(function (u, i) { q.push(Object.assign({}, u, { sp: { day: dayId, i: i, n: sp.units.length, title: sp.title } })); });
    return q;
  };
  // ----- 일상일 영업: 그날의 손님/특별 주문을 만들어 T.days / T.specials 에 등록한다 (story/tavern-routine.js) -----
  //  같은 시드 + 일차면 언제나 같은 구성. 돌려주는 값은 영업 id ('r<일차>') 이고, 이후엔 일반 영업과 똑같이 다룬다.
  function rr(vars, day, k) { return root.EventCore.rand(root.EventCore.ensure(vars).seed, day, 200 + k); }
  // 그 주(1~4)의 특별 주문 날짜 목록 (일상일 중에서 시드로 정함)
  C.routineSpecialDays = function (vars, wk) {
    var RT = root.TAVERN_ROUTINE, CC = root.CalCore, n = (RT.specialsPerWeek || [])[wk - 1] || 0, days = [];
    for (var d = (wk - 1) * 7 + 1; d <= wk * 7; d++) { var inf = CC.info(d); if (!inf.main && !inf.holiday) days.push(d); }
    days.sort(function (a, b) { return rr(vars, a, 50 + wk) - rr(vars, b, 50 + wk); });
    return days.slice(0, n).sort(function (a, b) { return a - b; });
  };
  C.routineKey = function (day) { return 'r' + day; };
  C.routine = function (T, vars, day, evalCond) {
    var RT = root.TAVERN_ROUTINE, CC = root.CalCore, wk = CC.weekOf(day), key = C.routineKey(day);
    var has = function (arr, x) { return !arr || arr.indexOf(x) >= 0; };
    var rank = (vars.inn && vars.inn.rank) || 1, n = RT.count[Math.min(wk, RT.count.length) - 1] || 3;
    Object.keys(RT.rankBonus || {}).forEach(function (r) { if (rank >= Number(r)) n += RT.rankBonus[r]; });
    var list = [], used = {};
    // 히로인: 확률로 최대 2명
    var hs = root.HEROINES.filter(function (h, i) { return rr(vars, day, 10 + i) * 100 < RT.heroineChance; });
    hs.sort(function (a, b) { return rr(vars, day, 20 + root.HEROINES.indexOf(a)) - rr(vars, day, 20 + root.HEROINES.indexOf(b)); });
    hs.slice(0, 2).forEach(function (h) {
      var hd = RT.heroines[h]; if (!hd) return;
      var pick = function (arr, k) { return arr[Math.floor(rr(vars, day, k) * arr.length) % arr.length]; };
      list.push({ who: h, say: [pick(hd.lines, 30 + root.HEROINES.indexOf(h))], order: pick(hd.orders, 40 + root.HEROINES.indexOf(h)), __h: true });
      used[h] = true;
    });
    // 일반 손님: 시드 순으로 섞어서 앞에서부터
    var pool = RT.customers.filter(function (c) { return has(c.w, wk); }).map(function (c, i) { return { c: c, r: rr(vars, day, 60 + i) }; });
    pool.sort(function (a, b) { return a.r - b.r; });
    var oi = Math.floor(rr(vars, day, 90) * RT.orders.length);
    for (var i = 0; i < pool.length && list.length < n + hs.slice(0, 2).length; i++) {
      var c = pool[i].c; if (used[c.who]) continue; used[c.who] = true;
      var line = c.lines[Math.floor(rr(vars, day, 100 + i) * c.lines.length) % c.lines.length];
      var od = RT.orders[(oi + i * 7) % RT.orders.length];
      list.push({ who: c.who, say: [line], order: od });
    }
    // 업그레이드 간판: 단골 한 명씩 더 (조건식이라 간판이 없으면 건너뜀)
    var extra = pool.map(function (x) { return x.c; }).filter(function (c) { return !used[c.who]; });
    if (extra.length) { var c2 = extra[0]; list.push({ who: c2.who, if: 'tavern.upg.sign', say: [c2.lines[0]], order: RT.orders[(oi + 3) % RT.orders.length] }); }
    if (extra.length > 1) { var c3 = extra[1]; list.push({ who: c3.who, if: 'tavern.upg.sign2', say: [c3.lines[1 % c3.lines.length]], order: RT.orders[(oi + 11) % RT.orders.length] }); }
    T.days[key] = { bg: 'inn_evening', customers: list, routine: true };
    // 특별 주문 (그 주의 특별 주문 날짜에 해당하면)
    delete T.specials[key];
    var sd = C.routineSpecialDays(vars, wk), j = sd.indexOf(day);
    if (j >= 0 && RT.specials.length) {
      var k = 0; for (var w = 1; w < wk; w++) k += (RT.specialsPerWeek[w - 1] || 0);
      var cand = RT.specials.filter(function (s) { return has(s.w, wk); });
      var sp = cand[(k + j) % cand.length];
      T.specials[key] = { title: sp.title, brief: sp.brief, win: sp.win, lose: sp.lose, units: sp.units };
    }
    return key;
  };

  // 장보기 재료 값 (아침 랜덤 사건의 오늘 가격 보정 vars.today.price % 반영, 최소 1G)
  C.price = function (T, vars, id) {
    var base = T.ingredients[id].price, pct = ((vars && vars.today && vars.today.price) | 0);
    var CAL = root.CALENDAR, wk = root.CalCore && vars ? root.CalCore.weekOf(vars.day || 1) : 1;
    if (CAL && CAL.price) pct += CAL.price[wk] || 0;                 // 주차별 재료 물가 (story/calendar.js 의 price)
    if (vars && vars.tavern && vars.tavern.upg && vars.tavern.upg.cellar && T.rules.cellarPct) pct -= T.rules.cellarPct;   // '저장고' 업그레이드: 재료 값 할인
    return pct ? Math.max(1, Math.round(base * (100 + pct) / 100)) : base;
  };
  // 특별 주문 판정: 모든 손님이 대성공(재료 조건 포함)이어야 성공. results = 그 특별 주문의 serve/skip 결과들
  C.specialVerdict = function (T, dayId, results) {
    var sp = T.specials && T.specials[dayId];
    if (!sp) return null;
    var pass = results.filter(function (r) { return r.sp && r.result === 'perfect'; }).length;
    var ok = pass === sp.units.length;
    return { ok: ok, pass: pass, n: sp.units.length, title: sp.title, gold: ok ? sp.win.gold : 0, rep: ok ? sp.win.rep : sp.lose.rep, lines: ok ? sp.win.lines : sp.lose.lines };
  };

  // 평판 변화를 하루 한계(rules.repDay)에 맞춰 깎아서 돌려주고 ctx.repSum 에 반영 (특별 주문 보상/벌점도 이 한계 안에서만 반영된다)
  C.capRep = function (T, ctx, rep) {
    var R = T.rules, cum = (ctx && ctx.repSum) || 0;
    var capped = Math.max(R.repDay[0], Math.min(R.repDay[1], cum + rep)) - cum;
    if (ctx) ctx.repSum = cum + capped;
    return capped;
  };

  // ----- 단골 숨은 취향 / 손님 메모장 -----
  //  취향 정의(customers[id].taste): { tag:'든든함' } (그 태그가 있는 요리) 또는 { ing:'meat' } (그 재료가 들어간 요리)
  C.tasteMatch = function (cu, recipe) {
    var ts = cu && cu.taste;
    if (!ts || !recipe) return false;
    if (ts.tag) return recipe.tags.indexOf(ts.tag) >= 0;
    if (ts.ing) return recipe.ing.indexOf(ts.ing) >= 0;
    return false;
  };
  // 메모장 기록 (없으면 만든다): met(만났나) first(첫 방문 힌트를 했나) hints(들은 힌트 대사) taste(취향을 알아냈나) fav(최애를 알아냈나) hate(알아낸 싫어하는 메뉴 id) miss(힌트 대사를 이미 했나)
  C.note = function (vars, who) {
    var t = C.ensure(null, vars);
    if (!t.notes[who]) t.notes[who] = { met: false, first: false, hints: [], taste: false, fav: false, hate: [], miss: false };
    return t.notes[who];
  };

  // 영업 시작 전 상태 보정 (옛 변수가 없을 때 대비)
  C.ensure = function (T, vars) {
    var t = vars.tavern = vars.tavern || {};
    ['perfect', 'good', 'fail', 'mystery', 'served', 'skipped', 'sales', 'tips'].forEach(function (k) { if (typeof t[k] !== 'number') t[k] = 0; });
    ['spWin', 'spLose', 'tasteHits'].forEach(function (k) { if (typeof t[k] !== 'number') t[k] = 0; });
    ['stock', 'known', 'upg', 'fav', 'days', 'notes', 'sp'].forEach(function (k) { if (!t[k] || typeof t[k] !== 'object') t[k] = {}; });
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
  //  entry: 손님 항목(특별 주문이면 entry.sp 가 있음). 특별 주문 손님은 건별 평판이 없고 마지막에 한꺼번에 판정한다.
  C.serve = function (T, vars, who, order, ids, ctx, entry) {
    var R = T.rules, t = C.ensure(T, vars), cu = T.customers[who] || {};
    var isSp = !!(entry && entry.sp);
    ids.forEach(function (id) { t.stock[id] = Math.max(0, (t.stock[id] || 0) - 1); });
    var recipe = C.recipeFor(T, ids);
    var out = { who: who, ids: ids.slice(), recipe: recipe, dish: recipe ? recipe.name : '정체불명 요리', discovered: false, fav: false, hate: false, taste: false, tasteNew: false, sp: isSp };
    if (recipe && !t.known[recipe.id]) { t.known[recipe.id] = true; out.discovered = true; }
    var result = C.judge(order, recipe);
    // 주인의 피로: 과로 상태에서는 가끔 손이 미끄러져 대성공이 보통으로 내려간다 (결정적 난수: 시드 + 일차 + 손님 순번)
    var fs = root.CalCore ? root.CalCore.fatState(vars) : { level: 'fresh', tipMult: 1, slip: 0 };
    out.fatigue = fs.level;
    if (result === 'perfect' && fs.slip && root.EventCore &&
        root.EventCore.rand(root.EventCore.ensure(vars).seed, (vars.day || 1) * 100 + t.served, 5) < fs.slip) { result = 'good'; out.slip = true; }
    out.fav = !!(recipe && cu.fav && cu.fav === recipe.id);
    out.hate = !!(recipe && cu.dislike && cu.dislike.indexOf(recipe.id) >= 0);
    if (out.fav) result = 'perfect';
    else if (out.hate) result = 'fail';
    out.result = result;

    var price = recipe ? recipe.price : 0;
    out.sale = Math.round(price * (R.pay[result] || 0));
    var tip = 0;
    if (result === 'perfect') tip = Math.max(1, Math.round(price * R.tipRate)) + (out.fav ? (R.favTip || 0) : 0);
    if (tip && t.upg.barrel2) tip = Math.ceil(tip * (R.barrelTip2 || R.barrelTip));
    else if (tip && t.upg.barrel) tip = Math.ceil(tip * R.barrelTip);
    var tipPct = ((vars.today && vars.today.tip) | 0);   // 아침 랜덤 사건: 오늘 팁 보정 % (예: 비 오는 날 +50)
    if (tip && tipPct) tip = Math.ceil(tip * (100 + tipPct) / 100);
    if (t.upg.stove && (order.want || []).indexOf('따뜻함') >= 0 && (result === 'perfect' || result === 'good')) { tip += (t.upg.stove2 ? (R.stoveBonus2 || R.stoveBonus) : R.stoveBonus); out.stove = true; }
    // 단골 보너스: 주문을 (대성공/보통으로) 맞히면서 숨은 취향까지 맞췄을 때 팁과 평판이 조금 더
    var note = C.note(vars, who);
    note.met = true;
    var tasteHit = !cu.heroine && C.tasteMatch(cu, recipe) && (result === 'perfect' || result === 'good');
    if (tasteHit) { tip += R.tasteTip || 0; out.taste = true; out.tasteNew = !note.taste; note.taste = true; t.tasteHits++; }
    if (tip && fs.tipMult < 1) tip = Math.max(1, Math.round(tip * fs.tipMult));   // 피곤/과로: 팁 감소
    if (ctx && ctx.free) { out.sale = 0; tip = 0; out.free = true; }   // 무료 배식: 매출과 팁 없음 (평판/호감도는 그대로)
    out.tip = tip;
    out.gold = out.sale + out.tip;

    var rep = out.hate ? 0 : (R.rep[result] || 0);
    if (tasteHit) rep += R.tasteRep || 0;
    var cum = (ctx && ctx.repSum) || 0;
    var capped = Math.max(R.repDay[0], Math.min(R.repDay[1], cum + rep)) - cum;
    if (isSp) capped = 0;
    out.rep = capped;
    if (ctx) ctx.repSum = cum + capped;

    out.aff = 0;
    if (cu.heroine) {
      if (out.fav) { out.aff = (t.fav[who] || 0) === 0 ? R.favLove : R.favLoveRepeat; t.fav[who] = (t.fav[who] || 0) + 1; }
      else if (out.hate) out.aff = R.love.hate;
      else out.aff = R.love[result] || 0;
    }

    if (out.fav) note.fav = true;
    if (out.hate && note.hate.indexOf(recipe.id) < 0) note.hate.push(recipe.id);
    t.served++; t[result]++; t.t[result]++;
    t.sales += out.sale; t.tips += out.tip;
    return out;
  };

  // 손님을 정중히 돌려보냄 (재료 부족 등): 평판만 조금 깎임
  C.skip = function (T, vars, ctx, entry) {
    var R = T.rules, t = C.ensure(T, vars), cum = (ctx && ctx.repSum) || 0;
    var capped = Math.max(R.repDay[0], Math.min(R.repDay[1], cum + R.rep.skip)) - cum;
    var isSp = !!(entry && entry.sp);
    if (isSp) capped = 0;
    if (ctx) ctx.repSum = cum + capped;
    t.skipped++;
    if (entry && entry.who) C.note(vars, entry.who).met = true;
    return { result: 'skip', rep: capped, gold: 0, aff: 0, sp: isSp };
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
  //  wantTaste=true 이면 주문을 (보통 이상으로) 맞히는 요리 중 숨은 취향에도 맞는 것을 우선한다
  C.bestKnown = function (T, vars, who, order, withFav, wantTaste) {
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
      if (wantTaste && res !== 'fail' && C.tasteMatch(cu, Object.assign({ id: id }, r))) s += 12;
      if (cu.dislike && cu.dislike.indexOf(id) >= 0) s -= 100;
      if (s > bs) { bs = s; best = r.ing.slice(); }
    });
    return best;
  };

  // "추천 구매" 계산: 오늘 손님 줄(queue)의 주문을 지금 아는 레시피로 맞추는 데 모자라는 재료만 골라 돌려준다.
  //  손님 순서대로 가장 잘 맞고 재료가 덜 드는 레시피를 정하고, 가진 재고(가상)를 깎으며 부족분만 센다. 골드가 허락하는 만큼만.
  //  priceOf(id) = 재료 값. 반환 { buy: {재료id: 개수}, cost: 필요한 총 골드(살 수 있는 만큼) }
  C.suggestBuy = function (T, vars, queue, gold, priceOf) {
    var t = C.ensure(T, vars), stock = Object.assign({}, t.stock), buy = {}, cost = 0, left = gold;
    var score = { perfect: 3, good: 2, fail: 1, mystery: 0 };
    queue.forEach(function (entry) {
      var cu = T.customers[entry.who] || {}, best = null, bs = -1e9;
      Object.keys(T.recipes).forEach(function (id) {
        if (!t.known[id]) return;
        var r = T.recipes[id], res = C.judge(entry.order, Object.assign({ id: id }, r));
        var mc = r.ing.reduce(function (a, i) { return a + ((stock[i] || 0) > 0 ? 0 : priceOf(i)); }, 0);
        var sc = score[res] * 100 - mc + r.price / 10 + (cu.fav === id ? 60 : 0) - (cu.dislike && cu.dislike.indexOf(id) >= 0 ? 500 : 0);
        if (sc > bs) { bs = sc; best = r; }
      });
      if (!best) return;
      best.ing.forEach(function (i) {
        if ((stock[i] || 0) > 0) { stock[i]--; return; }
        var pr = priceOf(i);
        if (pr <= left) { left -= pr; cost += pr; buy[i] = (buy[i] || 0) + 1; }
      });
    });
    return { buy: buy, cost: cost };
  };

  root.TavernCore = C;
})(typeof globalThis !== 'undefined' ? globalThis : this);
