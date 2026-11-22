// ============================================================
//  여관 운영 규칙 (DOM 과 무관한 순수 함수 모음) — 숙박 / 여관 등급 / 선물 / 밤 사건 / 히로인 신경전
//  - 엔진(js/engine.js)과 검사 스크립트(tools/check-story.js 의 시뮬레이션)가 같이 씁니다.
//  - 데이터는 story/lodging.js (LODGING), story/inn-rank.js (INN_RANK), story/gifts.js (GIFTS), story/rivalry.js (RIVALRY) 에 있습니다.
//  - 손님 구성 / 밤 사건은 "세이브에 저장된 시드(vars.rev.seed) + 일차"로 정하는 해시 난수라서,
//    같은 세이브를 불러오면 언제나 같은 결과입니다. (저장/불러오기로 다시 뽑을 수 없음)
//  - 보통은 수정할 필요가 없습니다.
// ============================================================
(function (root) {
  'use strict';
  var I = {};
  function rnd(vars, a, b) { return root.EventCore.rand(root.EventCore.ensure(vars).seed, a, b); }
  function has(arr, x) { return arr.indexOf(x) >= 0; }

  // 상태 보정 (이전 세이브/테스트에서 빠진 칸을 채운다)
  I.ensure = function (vars) {
    var init = root.STORY.init || {};
    ['lodge', 'inn', 'nev', 'gift', 'riv'].forEach(function (k) {
      if (!vars[k] || typeof vars[k] !== 'object') vars[k] = JSON.parse(JSON.stringify(init[k] || {}));
    });
    var L = vars.lodge;
    if (!L.upg) L.upg = {}; if (!L.hosted) L.hosted = {}; if (!Array.isArray(L.seen)) L.seen = []; if (!Array.isArray(L.report)) L.report = []; if (!Array.isArray(L.log)) L.log = [];
    if (!L.roster) L.roster = null;
    var G = vars.gift;
    if (!G.inv) G.inv = {}; if (!G.given) G.given = {}; if (!G.known) G.known = {}; if (!Array.isArray(G.met)) G.met = [];
    return vars;
  };

  // ================= 여관 등급 =================
  I.score = function (vars) {
    I.ensure(vars);
    return (vars.rep || 0) + (vars.inn.sat || 0) * (root.INN_RANK.satWeight || 1);
  };
  I.rankFor = function (score) {
    var r = 1;
    root.INN_RANK.stars.forEach(function (s) { if (score >= s.min) r = s.n; });
    return r;
  };
  I.starStr = function (n) { var s = ''; for (var i = 0; i < n; i++) s += '★'; return s || '★'; };
  I.rankName = function (n) {
    var d = root.INN_RANK.stars.filter(function (s) { return s.n === n; })[0];
    return d ? d.name : '';
  };
  // 등급 검사: 올랐으면 { from, to, levels:[새로 도달한 등급들] } (상태에도 반영), 아니면 null. 등급은 내려가지 않는다.
  I.checkRank = function (vars) {
    I.ensure(vars);
    var cur = vars.inn.rank || 1, to = I.rankFor(I.score(vars));
    if (to <= cur) { vars.inn.stars = I.starStr(cur); return null; }
    var levels = [];
    for (var n = cur + 1; n <= to; n++) levels.push(n);
    vars.inn.rank = to; vars.inn.stars = I.starStr(to);
    vars.inn.log.push({ day: vars.day, rank: to, score: I.score(vars) });
    return { from: cur, to: to, levels: levels };
  };
  // 엔딩 문구에 덧붙일 한 줄
  I.endingLine = function (vars) {
    I.ensure(vars);
    var n = vars.inn.rank || 1;
    return String(root.INN_RANK.endingLine).replace('{stars}', I.starStr(n)).replace('{name}', I.rankName(n));
  };

  // ================= 숙박 =================
  I.roomOpen = function (vars, id) {
    var r = root.LODGING.rooms[id];
    return !!r && (!!r.open || (!!r.unlock && !!vars.lodge.upg[r.unlock]));
  };
  I.roomTags = function (vars, id) {
    var r = root.LODGING.rooms[id], tags = r.tags.slice();
    root.LODGING.upgrades.forEach(function (u) {
      if (!vars.lodge.upg[u.id] || !u.tags) return;
      [].concat(u.tags.all || [], u.tags[id] || []).forEach(function (t) { if (!has(tags, t)) tags.push(t); });
    });
    return tags;
  };
  I.roomPrice = function (vars, id) {
    var p = root.LODGING.rooms[id].price;
    root.LODGING.upgrades.forEach(function (u) { if (vars.lodge.upg[u.id] && u.payBonus) p += u.payBonus; });
    return p;
  };
  I.roomList = function (vars) {
    I.ensure(vars);
    return Object.keys(root.LODGING.rooms).map(function (id) {
      var r = root.LODGING.rooms[id];
      return { id: id, name: r.name, short: r.short, desc: r.desc, open: I.roomOpen(vars, id), price: I.roomPrice(vars, id), tags: I.roomTags(vars, id) };
    });
  };
  I.guestDef = function (id) {
    return root.LODGING.guests.filter(function (g) { return g.id === id; })[0] || null;
  };
  I.matches = function (vars, guest, roomId) {
    return guest.req === 'any' || has(I.roomTags(vars, roomId), guest.req);
  };
  // 그날 묵으려는 손님 (처음 부르면 정해서 vars.lodge.roster 에 기록 -> 같은 날은 항상 같은 구성)
  I.guestsFor = function (vars, day) {
    I.ensure(vars);
    var L = vars.lodge, Lg = root.LODGING;
    if (L.roster && L.roster.day === day) return L.roster.ids.map(I.guestDef);
    if (Lg.special && Lg.special[day]) {   // 그날 고정 손님 (예: 5일차 왕도 사절단)
      L.roster = { day: day, ids: Lg.special[day].slice() };
      return L.roster.ids.map(I.guestDef);
    }
    var n = rnd(vars, day, 41) < Lg.settings.threeChance ? 3 : 2;
    var regular = Lg.guests.filter(function (g) { return !g.only; });
    var pool = regular.filter(function (g) { return !has(L.seen, g.id); });
    if (pool.length < n) pool = regular.slice();
    pool = pool.map(function (g, i) { return { g: g, k: rnd(vars, day * 31 + i, 42) }; }).sort(function (a, b) { return a.k - b.k; }).map(function (x) { return x.g; });
    var pick = pool.slice(0, n);
    // 처음 열린 방만으로도 만족시킬 수 있는 손님이 한 팀은 있어야 한다 (전부 못 맞추는 밤을 막는다)
    var open = Object.keys(Lg.rooms).filter(function (id) { return I.roomOpen(vars, id); });
    var ok = function (g) { return open.some(function (id) { return I.matches(vars, g, id); }); };
    if (!pick.some(ok)) {
      var alt = pool.slice(n).filter(ok)[0];
      if (alt) pick[pick.length - 1] = alt;
    }
    L.roster = { day: day, ids: pick.map(function (g) { return g.id; }) };
    return pick;
  };
  // 이 손님을 이 방에 재우면: { pay, base, match, sat } (roomId 가 null 이면 거절 = 수입 없음)
  I.quote = function (vars, guest, roomId) {
    if (!roomId) return { pay: 0, base: 0, match: false, sat: 0 };
    var base = I.roomPrice(vars, roomId);
    if (guest.cap) base = Math.min(base, guest.cap);
    var match = I.matches(vars, guest, roomId);
    return { pay: base + (match ? guest.bonus : 0), base: base, match: match, sat: match ? root.LODGING.settings.satPoints : 0 };
  };
  // "추천 배정": 열린 방에 손님을 짝지어 숙박 수입(+만족)이 가장 큰 배정을 찾는다 (손님 3팀 이하라 전수 탐색). 반환 { 손님id: 방id } (배정 안 하는 손님은 빠짐)
  I.recommend = function (vars, guests) {
    I.ensure(vars);
    var open = Object.keys(root.LODGING.rooms).filter(function (id) { return I.roomOpen(vars, id); });
    var best = { v: -1, a: {} };
    (function go(i, used, cur, val) {
      if (i === guests.length) { if (val > best.v) best = { v: val, a: Object.assign({}, cur) }; return; }
      var g = guests[i];
      go(i + 1, used, cur, val);   // 이 손님은 배정하지 않는다 (수입이 더 크면 선택되지 않음)
      open.forEach(function (r) {
        if (used[r]) return;
        var q = I.quote(vars, g, r);
        used[r] = true; cur[g.id] = r;
        go(i + 1, used, cur, val + q.pay + q.sat * 100);   // 만족(여관 등급 점수)을 골드보다 우선한다
        delete cur[g.id]; delete used[r];
      });
    })(0, {}, {}, 0);
    return best.a;
  };
  // 정산: assigns = { 손님id: 방id | null }. 골드/만족/기록을 상태에 반영하고 결과를 돌려준다.
  I.settle = function (vars, day, assigns) {
    I.ensure(vars);
    var L = vars.lodge, used = {}, out = { gold: 0, sat: 0, rows: [], day: day };
    I.guestsFor(vars, day).forEach(function (g) {
      var room = assigns[g.id] || null;
      if (room && (!I.roomOpen(vars, room) || used[room])) room = null;
      if (room) used[room] = true;
      var q = I.quote(vars, g, room);
      out.rows.push({ id: g.id, name: g.name, room: room, pay: q.pay, match: q.match, say: !room ? '' : (q.match ? g.ok : g.meh) });
      out.gold += q.pay; out.sat += q.sat;
      if (room) { L.hosted[g.id] = (L.hosted[g.id] || 0) + 1; }
      if (!has(L.seen, g.id)) L.seen.push(g.id);
    });
    vars.gold = (vars.gold || 0) + out.gold;
    vars.inn.sat = (vars.inn.sat || 0) + out.sat;
    L.gold += out.gold; L.nights++;
    L.log.push({ day: day, gold: out.gold, sat: out.sat, guests: out.rows.map(function (r) { return r.id + ':' + (r.room || '-'); }) });
    // 다음 날 아침 카드에 실릴 한 줄 (만족한 손님 한 팀 + 합계)
    var happy = out.rows.filter(function (r) { return r.room && r.match; })[0] || out.rows.filter(function (r) { return r.room; })[0];
    L.report = [];
    if (happy) L.report.push(happy.name + ': "' + happy.say + '"');
    L.report.push('간밤 숙박 수입 +' + out.gold + 'G' + (out.sat ? ' · 만족 ' + out.sat : ''));
    L.roster = null; L.note = '';
    return out;
  };
  I.hasLodged = function (vars, day) { I.ensure(vars); return vars.lodge.log.some(function (l) { return l.day === day; }); };
  I.buyRoomUpg = function (vars, u) {   // 구입 가능 여부 + 이유
    if (vars.lodge.upg[u.id]) return 'owned';
    if (u.needRank && (vars.inn.rank || 1) < u.needRank) return 'rank';
    if ((vars.gold || 0) < u.price) return 'gold';
    return 'ok';
  };
  // 아침 카드에 붙일 문구 (간밤 숙박 정산 + 밤 사건 한 줄). 다음 숙박 정산 때 새로 쓰이므로 지우지 않는다 (저장/불러오기에도 안전).
  I.reportText = function (vars) {
    I.ensure(vars);
    var L = vars.lodge, lines = L.report.slice();
    if (L.note) lines.push(L.note);
    return lines.join('\n');
  };

  // ================= 밤 사건 =================
  I.nightEvent = function (vars, day, evalCond) {
    I.ensure(vars);
    var N = root.LODGING.nightEvents;
    if (N.days.indexOf(day) < 0) return null;
    if (rnd(vars, day, 51) >= N.chance) return null;
    var ids = Object.keys(N.events).filter(function (id) {
      var ev = N.events[id];
      return !has(vars.nev.used, id) && (!ev.if || evalCond(ev.if, vars));
    });
    if (!ids.length) return null;
    var total = 0;
    ids.forEach(function (id) { total += N.events[id].weight || 1; });
    var x = rnd(vars, day, 52) * total;
    for (var i = 0; i < ids.length; i++) { x -= N.events[ids[i]].weight || 1; if (x < 0) return ids[i]; }
    return ids[ids.length - 1];
  };

  // ================= 선물 =================
  I.giftTier = function (h, item) { return ((root.GIFTS.prefs[h] || {})[item]) || 'normal'; };
  I.giftCount = function (vars) {
    I.ensure(vars);
    return Object.keys(vars.gift.inv).reduce(function (n, k) { return n + (vars.gift.inv[k] || 0); }, 0);
  };
  I.canGive = function (vars, h) { I.ensure(vars); return vars.gift.given[h] !== vars.day; };
  I.buyGift = function (vars, item) {
    I.ensure(vars);
    var d = root.GIFTS.items[item];
    if (!d || (vars.gold || 0) < d.price) return false;
    vars.gold -= d.price;
    vars.gift.inv[item] = (vars.gift.inv[item] || 0) + 1;
    vars.gift.bought = (vars.gift.bought || 0) + 1;
    return true;
  };
  // 선물 주기: 호감도는 호출한 쪽(엔진/시뮬레이션)이 points 만큼 올린다. 실패하면 null.
  I.giveGift = function (vars, h, item) {
    I.ensure(vars);
    var G = vars.gift;
    if (!root.GIFTS.items[item] || !(G.inv[item] > 0) || !I.canGive(vars, h)) return null;
    var tier = I.giftTier(h, item), t = root.GIFTS.tiers[tier];
    G.inv[item]--; if (!G.inv[item]) delete G.inv[item];
    G.given[h] = vars.day; G.gave = (G.gave || 0) + 1;
    var first = !(G.known[h] && G.known[h][item]);
    if (!G.known[h]) G.known[h] = {};
    G.known[h][item] = tier;
    return { tier: tier, label: t.label, points: t.points, react: (root.GIFTS.react[h] || {})[item] || { face: 'normal', text: '…고마워.' }, first: first };
  };

  // ================= 히로인 신경전 =================
  // 지금 일어날 신경전 쌍 (없으면 null): 일차/횟수/조건(두 사람 모두 need 이상)을 만족하는 쌍 중 호감도 합이 가장 높은 쌍
  I.rivalryPick = function (vars, day) {
    I.ensure(vars);
    var R = root.RIVALRY;
    if (R.days.indexOf(day) < 0 || vars.riv.n >= R.max) return null;
    var best = null, bs = -1;
    R.pairs.forEach(function (p) {
      if (has(vars.riv.done, p.id)) return;
      var a = (vars.aff[p.a] || 0), b = (vars.aff[p.b] || 0);
      if (a < R.need || b < R.need) return;
      if (a + b > bs) { bs = a + b; best = p; }
    });
    return best;
  };

  root.InnCore = I;
})(typeof globalThis !== 'undefined' ? globalThis : this);
