// ============================================================
//  경영 심화 규칙 (DOM 과 무관한 순수 함수 모음) — 재료 시세 / 직원 / 레시피 해금 트리
//  - 엔진(js/engine.js)과 검사 스크립트(tools/check-story.js 의 시뮬레이션)가 같이 씁니다.
//  - 데이터는 story/management.js (window.MGMT) 에 있습니다. 수치는 거기서 바꾸세요.
//  - 새 변수(vars.staff, vars.tavern.mastery)는 쓸 때 만들어집니다 (ensure) — 옛 세이브도 그대로 불러와집니다.
// ============================================================
(function (root) {
  'use strict';
  var M = {};
  function D() { return root.MGMT; }
  function seedOf(vars) { return root.EventCore.ensure(vars).seed; }
  function rand(seed, a, b) { return root.EventCore.rand(seed, a, b); }
  function ingIds() { return Object.keys(root.TAVERN.ingredients); }

  // ================= 1. 재료 시세 =================
  M.marketOn = function (day) { return (day || 1) >= D().market.from; };
  // 그날 특가 재료 id (없으면 '')
  M.saleId = function (seed, day) {
    var mk = D().market;
    if (!M.marketOn(day) || rand(seed, day, 290) >= mk.saleChance) return '';
    var ids = ingIds();
    return ids[Math.floor(rand(seed, day, 291) * ids.length)];
  };
  // 그날 재료의 시세 변동 % (정수). 날씨/주차 물가와는 별개로, 값에 곱해진다.
  M.pctFor = function (seed, day, id) {
    var mk = D().market;
    if (!M.marketOn(day)) return 0;
    if (M.saleId(seed, day) === id) return mk.salePct;
    var idx = ingIds().indexOf(id);
    if (idx < 0) return 0;
    return mk.swing[Math.floor(rand(seed, day, 300 + idx) * mk.swing.length)] + (mk.bias || 0);
  };
  M.marketPct = function (vars, id) { return M.pctFor(seedOf(vars), vars.day || 1, id); };
  // 시세판: 재료별 { id, pct, sale } (정의 순서). dayShift=1 이면 내일 예보
  M.board = function (vars, dayShift) {
    var seed = seedOf(vars), day = (vars.day || 1) + (dayShift || 0), sale = M.saleId(seed, day);
    return ingIds().map(function (id) { return { id: id, pct: M.pctFor(seed, day, id), sale: sale === id }; });
  };
  // 실제 값(G)으로 본 변동: { id, pct(시세 %), sale, now(오늘/그날 값), ref(평소가), eff(실제 변동 %, 반올림 포함) }
  M.quote = function (vars, dayShift) {
    var T = root.TAVERN, v2 = dayShift ? Object.assign({}, vars, { day: (vars.day || 1) + dayShift }) : vars;
    return M.board(vars, dayShift).map(function (x) {
      var now = root.TavernCore.price(T, v2, x.id), ref = root.TavernCore.price(T, v2, x.id, true);
      x.now = now; x.ref = ref; x.eff = ref ? Math.round((now - ref) * 100 / ref) : 0;
      return x;
    });
  };
  // 시세판 한 줄 설명 (가장 많이 움직인 재료의 사연 / 특가 문구). 실제 값이 바뀐 재료만 다룬다.
  M.news = function (vars, dayShift) {
    var mk = D().market, seed = seedOf(vars), day = (vars.day || 1) + (dayShift || 0), b = M.quote(vars, dayShift), out = [];
    var sale = b.filter(function (x) { return x.sale; })[0];
    if (sale) out.push({ id: sale.id, sale: true, text: mk.saleLines[Math.floor(rand(seed, day, 292) * mk.saleLines.length)] });
    var mv = b.filter(function (x) { return !x.sale && x.now !== x.ref && Math.abs(x.pct) >= 15; }).sort(function (p, q) { return Math.abs(q.eff) - Math.abs(p.eff); })[0];
    if (mv && mk.why[mv.id]) out.push({ id: mv.id, sale: false, text: mk.why[mv.id][mv.now > mv.ref ? 0 : 1] });
    return out;
  };

  // ================= 2. 직원 =================
  M.ensure = function (vars) {
    var s = vars.staff;
    if (!s || typeof s !== 'object') s = vars.staff = {};
    if (!s.hired || typeof s.hired !== 'object') s.hired = {};
    if (typeof s.seq !== 'number') s.seq = 0;
    if (typeof s.paid !== 'number') s.paid = 0;      // 지금까지 나간 급여 합계
    if (typeof s.nights !== 'number') s.nights = 0;  // 급여를 낸 영업 횟수
    if (!Array.isArray(s.quit)) s.quit = [];         // 급여를 못 줘서 떠난 직원 id 기록
    return s;
  };
  M.def = function (id) { return D().staff.filter(function (d) { return d.id === id; })[0] || null; };
  M.isHired = function (vars, id) { return !!M.ensure(vars).hired[id]; };
  M.hiredList = function (vars) {   // 고용 순서대로
    var s = M.ensure(vars);
    return Object.keys(s.hired).filter(function (id) { return M.def(id); })
      .sort(function (a, b) { return s.hired[a].seq - s.hired[b].seq; }).map(M.def);
  };
  M.unlockInfo = function (vars, def) {   // { ok, text }
    var u = def.unlock || {}, wk = root.CalCore ? root.CalCore.weekOf(vars.day || 1) : 1, rk = (vars.inn && vars.inn.rank) || 1;
    var ok = (u.week && wk >= u.week) || (u.rank && rk >= u.rank) || (!u.week && !u.rank);
    var parts = [];
    if (u.week) parts.push(u.week + '주차부터');
    if (u.rank) parts.push('여관 ★' + u.rank);
    return { ok: !!ok, text: parts.join(' 또는 ') };
  };
  // 이 효과의 합 (숫자) / 불리언 효과는 하나라도 있으면 true
  M.fx = function (vars, key) {
    var v = 0, b = false;
    M.hiredList(vars).forEach(function (d) { var x = (d.fx || {})[key]; if (x === true) b = true; else if (typeof x === 'number') v += x; });
    return b || v;
  };
  // 고용: 'ok' | 'owned' | 'locked' | 'max'
  M.hire = function (vars, id) {
    var d = M.def(id), s = M.ensure(vars);
    if (!d) return 'none';
    if (s.hired[id]) return 'owned';
    if (!M.unlockInfo(vars, d).ok) return 'locked';
    if (M.hiredList(vars).length >= D().staffMax) return 'max';
    s.hired[id] = { day: vars.day || 1, seq: ++s.seq };
    return 'ok';
  };
  M.fire = function (vars, id) {
    var s = M.ensure(vars);
    if (!s.hired[id]) return false;
    delete s.hired[id];
    return true;
  };
  M.wageTotal = function (vars) { return M.hiredList(vars).reduce(function (a, d) { return a + d.wage; }, 0); };
  // 영업을 마칠 때의 급여 정산. apply=false 면 미리보기만 (골드/직원을 바꾸지 않음).
  //  먼저 고용한 직원부터 지급하고, 골드가 모자라 못 주는 직원은 그만둔다. 반환 { total, rows:[{id,name,role,wage,paid}], quit:[def], left }
  M.settle = function (vars, apply) {
    var s = M.ensure(vars), gold = vars.gold || 0, rows = [], quit = [], total = 0;
    M.hiredList(vars).forEach(function (d) {
      var ok = gold >= d.wage;
      if (ok) { gold -= d.wage; total += d.wage; } else quit.push(d);
      rows.push({ id: d.id, name: d.name, role: d.role, wage: d.wage, paid: ok });
    });
    if (apply) {
      vars.gold = gold;
      s.paid += total;
      if (rows.length) s.nights++;
      quit.forEach(function (d) { delete s.hired[d.id]; s.quit.push(d.id); });
    }
    return { total: total, rows: rows, quit: quit, left: gold };
  };
  M.quitText = function (d) { return D().quitLine.replace('{name}', d.name).replace('{role}', d.role); };
  // 영업 결산의 직원 한마디 { name, role, text } (확률 + 시드/일차로 정해짐)
  M.quip = function (vars, rows) {
    var paid = (rows || []).filter(function (r) { return r.paid; });
    if (!paid.length) return null;
    var seed = seedOf(vars), day = vars.day || 1;
    if (rand(seed, day, 340) * 100 >= D().quipChance) return null;
    var r = paid[Math.floor(rand(seed, day, 341) * paid.length)], d = M.def(r.id), q = d.quips || [];
    if (!q.length) return null;
    return { id: d.id, name: d.name, role: d.role, text: q[Math.floor(rand(seed, day, 342) * q.length)] };
  };
  // 효과 적용 도우미
  M.tip = function (vars, tip) {
    var p = M.fx(vars, 'tipPct');
    return p && tip ? Math.ceil(tip * (100 + p) / 100) : tip;
  };
  M.bizFat = function (vars, base) { return Math.max(0, base + (M.fx(vars, 'fatBiz') || 0)); };
  // 숙박 정산 보너스: out = { gold, sat, rows } 에 더한다 (InnCore.settle 에서 호출)
  M.lodgeBonus = function (vars, out) {
    var hosted = out.rows.filter(function (r) { return r.room; }), g = M.fx(vars, 'lodgeGold') || 0, st = M.fx(vars, 'lodgeSat') || 0;
    out.staffGold = 0; out.staffSat = 0;
    if (!hosted.length) return out;
    if (g) { out.gold += g; out.staffGold = g; }
    if (st && hosted.length >= 3 && hosted.every(function (r) { return r.match; })) { out.sat += st; out.staffSat = st; }
    return out;
  };

  // ================= 3. 레시피 해금 트리 =================
  M.node = function (id) { return D().nodes[id] || null; };
  M.tierOf = function (id) {
    var n = M.node(id);
    if (n) return n.tier;
    return (root.TAVERN.recipes[id] || {}).basic ? 1 : 2;
  };
  M.mastery = function (vars, id) { return (((vars.tavern || {}).mastery) || {})[id] || 0; };
  // 해금 상태: { id, tier, known, conds:[{kind,text,ok}], free, canResearch, cost, how, blocked }
  //  conds 는 "무료 해금 조건" 목록 (need 전부 / rank), free = 둘 중 하나라도 충족.
  M.info = function (vars, id) {
    var T = root.TAVERN, r = T.recipes[id], nd = M.node(id) || {}, known = !!(vars.tavern && vars.tavern.known && vars.tavern.known[id]);
    var rk = (vars.inn && vars.inn.rank) || 1, conds = [], needOk = false, rankOk = false;
    if (nd.need) {
      var all = true;
      Object.keys(nd.need).forEach(function (rid) {
        var cur = M.mastery(vars, rid), ok = cur >= nd.need[rid]; if (!ok) all = false;
        conds.push({ kind: 'need', text: (T.recipes[rid] || {}).name + ' 대성공 ' + Math.min(cur, nd.need[rid]) + '/' + nd.need[rid], ok: ok });
      });
      needOk = all;
    }
    if (nd.rank) { rankOk = rk >= nd.rank; conds.push({ kind: 'rank', text: '여관 ★' + nd.rank + ' 달성', ok: rankOk }); }
    var blocked = (nd.after || []).filter(function (a) { return !(vars.tavern && vars.tavern.known && vars.tavern.known[a]); });
    return { id: id, name: r.name, tier: M.tierOf(id), known: known, conds: conds, needOk: needOk, rankOk: rankOk, free: !!(nd.need || nd.rank) && (needOk || rankOk), cost: nd.cost || 0,
      canResearch: !!nd.cost && !nd.how, how: nd.how || '', blocked: blocked.map(function (a) { return (T.recipes[a] || {}).name || a; }) };
  };
  // 무료로 해금할 수 있는(아직 모르는) 레시피 id 목록
  M.freeReady = function (vars) {
    return Object.keys(root.TAVERN.recipes).filter(function (id) { var i = M.info(vars, id); return !i.known && !i.how && i.free && !i.blocked.length; });
  };
  // 해금 시도: { ok, paid, how:'free'|'research', reason }
  M.unlock = function (vars, id) {
    var i = M.info(vars, id);
    root.TavernCore.ensure(root.TAVERN, vars);
    if (i.known) return { ok: false, reason: 'known' };
    if (i.how) return { ok: false, reason: 'how' };
    if (i.blocked.length) return { ok: false, reason: 'after' };
    if (i.free) { root.TavernCore.learn(vars, id); return { ok: true, paid: 0, how: 'free' }; }
    if (!i.canResearch) return { ok: false, reason: 'none' };
    if ((vars.gold || 0) < i.cost) return { ok: false, reason: 'gold' };
    vars.gold -= i.cost;
    root.TavernCore.learn(vars, id);
    return { ok: true, paid: i.cost, how: 'research' };
  };

  root.MgmtCore = M;
})(typeof globalThis !== 'undefined' ? globalThis : this);
