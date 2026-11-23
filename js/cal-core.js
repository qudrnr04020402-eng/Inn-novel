// ============================================================
//  달력 / 주차 / 피로 / 일상일 규칙 (DOM 과 무관한 순수 함수 모음)
//  - 엔진(js/engine.js)과 검사 스크립트(tools/check-story.js 의 시뮬레이션)가 같이 씁니다.
//  - 데이터는 story/calendar.js (CALENDAR), story/heroine-events.js (HEROINE_EVENTS), story/plain-days.js (PLAIN_DAYS),
//    story/routine.js (DAILY, DAY_ACTIONS), story/weekly-events.js (WEEKLY_EVENTS) 에 있습니다.
//  - 보통은 수정할 필요가 없습니다.
// ============================================================
(function (root) {
  'use strict';
  var C = {};
  function CAL() { return root.CALENDAR; }
  function has(arr, x) { return arr.indexOf(x) >= 0; }
  function rnd(vars, a, b) { return root.EventCore.rand(root.EventCore.ensure(vars).seed, a, b); }

  // ---------- 날짜 ----------
  C.weekOf = function (day) { var T = CAL(); return day > T.weeks * 7 ? T.weeks + 1 : Math.ceil(day / 7); };
  C.dowOf = function (day) { return (((day - 1) + CAL().startDow) % 7 + 7) % 7; };
  C.chapterOf = function (day) {
    var cs = CAL().chapters, r = cs[0];
    cs.forEach(function (c) { if (day >= c.days[0] && day <= c.days[1]) r = c; });
    return r;
  };
  C.isHoliday = function (day) { var T = CAL(); return C.dowOf(day) === T.holidayDow && !T.main[day]; };
  C.info = function (day) {
    var T = CAL(), ch = C.chapterOf(day), dw = C.dowOf(day);
    return {
      day: day, week: C.weekOf(day), dow: dw, dowName: T.dow[dw], holiday: C.isHoliday(day), chapter: ch,
      chapterStart: ch.days[0] === day, main: T.main[day] || null,
      label: C.weekOf(day) + '주차 · ' + day + '일 (' + T.dow[dw] + ')'
    };
  };
  // 그날 아침 장면 id (메인 고정일 > 휴일 > 일상일)
  C.entry = function (day) {
    var T = CAL(), m = T.main[day];
    if (m && m.scene) return m.scene;
    return C.isHoliday(day) ? T.holidayScene : T.routineScene;
  };
  // 낮 행동이 끝난 뒤의 저녁 씬
  C.evening = function (day) {
    var T = CAL(), m = T.main[day];
    return (m && m.evening) || T.routineEvening;
  };
  // 퍼소나가 쓰는 이야기 단계 (옛 7일 구성의 n일차)
  C.stageOf = function (day) {
    var st = CAL().stages, r = 1;
    st.forEach(function (d, i) { if (day >= d) r = i + 1; });
    return r;
  };
  // 새 하루 시작: 일차/주차/요일/오늘의 난수(0~99)를 vars 에 기록 (같은 시드 + 일차면 항상 같은 값)
  C.setDay = function (vars, day) {
    var inf = C.info(day);
    vars.day = day;
    C.ensure(vars);
    var cal = vars.cal;
    cal.week = inf.week; cal.dow = inf.dow; cal.hol = inf.holiday ? 1 : 0; cal.ch = inf.chapter.id;
    cal.roll = Math.floor(rnd(vars, day, 81) * 100);
    return inf;
  };
  // 상태 보정 (옛 세이브/테스트에서 빠진 칸을 채운다)
  C.ensure = function (vars) {
    if (typeof vars.fat !== 'number') vars.fat = 0;
    if (!vars.cal || typeof vars.cal !== 'object') vars.cal = {};
    var c = vars.cal;
    if (typeof c.week !== 'number') c.week = C.weekOf(vars.day || 1);
    if (typeof c.dow !== 'number') c.dow = C.dowOf(vars.day || 1);
    if (typeof c.roll !== 'number') c.roll = 0;
    if (!c.log || typeof c.log !== 'object') c.log = {};
    if (!c.act || typeof c.act !== 'object') c.act = {};
    if (!c.fl || typeof c.fl !== 'object') c.fl = {};
    if (!vars.pl || typeof vars.pl !== 'object') vars.pl = {};
    if (!vars.evdone || typeof vars.evdone !== 'object') vars.evdone = {};
    return vars;
  };

  // ---------- 피로 ----------
  C.addFat = function (vars, n) {
    C.ensure(vars);
    vars.fat = Math.max(0, Math.min(CAL().fatigue.max, (vars.fat || 0) + n));
    return vars.fat;
  };
  // 새 하루가 되면 잔다: 회복 (휴일이면 추가 회복)
  C.sleep = function (vars, hol) {
    var F = CAL().fatigue;
    C.addFat(vars, F.sleep + (hol ? F.holiday : 0));
  };
  // 피로 상태: { level: 'fresh'|'tired'|'exhausted', tipMult, slip }
  C.fatState = function (vars) {
    var F = CAL().fatigue, v = (vars && vars.fat) || 0;
    if (v >= F.exhausted) return { level: 'exhausted', label: '과로', tipMult: F.tipMult.exhausted, slip: F.slip };
    if (v >= F.tired) return { level: 'tired', label: '피곤', tipMult: F.tipMult.tired, slip: 0 };
    return { level: 'fresh', label: '쌩쌩', tipMult: 1, slip: 0 };
  };

  // ---------- 일상 문구 (story/routine.js 의 DAILY) ----------
  //  종류별 풀에서 그날의 한 줄을 고른다. 주차(w)가 맞는 줄만, 어제와 같은 줄은 피한다. 결정적(시드 + 일차).
  C.flavor = function (vars, day, kind) {
    var D = root.DAILY, week = C.weekOf(day), pool = ((D && D[kind]) || []).map(function (e, i) { return { e: e, i: i }; })
      .filter(function (x) { return !x.e.w || has(x.e.w, week); });
    if (!pool.length) return '';
    C.ensure(vars);
    var ix = Math.floor(rnd(vars, day, 90 + kind.length) * pool.length), pick = pool[ix];
    var last = vars.cal.fl[kind];
    if (pool.length > 1 && last === pick.i) pick = pool[(ix + 1) % pool.length];
    vars.cal.fl[kind] = pick.i;
    return pick.e.t;
  };
  // 하루 시작 때 한 번에 뽑아 두기: vars.flav = { morning, eve, night }
  C.flavorDay = function (vars, day) {
    vars.flav = { morning: C.flavor(vars, day, 'morning'), eve: C.flavor(vars, day, 'eve'), night: C.flavor(vars, day, 'night') };
    return vars.flav;
  };

  // ---------- 히로인 낮 이벤트 (story/heroine-events.js) ----------
  //  이벤트 한 개의 조건: minWeek / maxWeek / minDay / maxDay / minAff(호감도 값) / if(조건식, && 만 쓰기)
  C.eventReady = function (vars, e, h, evalCond) {
    var wk = C.weekOf(vars.day || 1), d = vars.day || 1;
    if (e.minWeek && wk < e.minWeek) return false;
    if (e.maxWeek && wk > e.maxWeek) return false;
    if (e.minDay && d < e.minDay) return false;
    if (e.maxDay && d > e.maxDay) return false;
    if (e.minAff && ((vars.aff || {})[h] || 0) < e.minAff) return false;
    if (e.if && !evalCond(e.if, vars)) return false;
    return true;
  };
  // 이 히로인의 "다음 순서 이벤트"(kind != 'extra') — 아직 안 본 것 중 첫 번째
  C.nextSeq = function (vars, h) {
    var list = (root.HEROINE_EVENTS[h] || []).filter(function (e) { return e.kind !== 'extra'; });
    return list[(vars.ev || {})[h] || 0] || null;
  };
  C.plainFor = function (vars, h) {
    var list = (root.PLAIN_DAYS || {})[h] || [];
    if (!list.length) return null;
    C.ensure(vars);
    return list[(vars.pl[h] || 0) % list.length];
  };
  // 낮 행동 선택지 전체: 히로인별 (순서 이벤트 또는 평범한 하루) + 호감도 조건 이벤트들 + 행동(DAY_ACTIONS)
  C.pickOptions = function (vars, evalCond) {
    C.ensure(vars);
    var opts = [];
    root.HEROINES.forEach(function (h) {
      var nx = C.nextSeq(vars, h);
      if (nx && C.eventReady(vars, nx, h, evalCond)) opts.push({ who: h, text: nx.text, tag: nx.tag || '', goto: nx.scene, ev: nx.id });
      else {
        var pl = C.plainFor(vars, h);
        if (pl) opts.push({ who: h, text: pl.text, tag: '평범한 하루', goto: pl.scene, ev: 'plain' });
      }
      (root.HEROINE_EVENTS[h] || []).forEach(function (e) {
        if (e.kind !== 'extra' || vars.evdone[e.id]) return;
        if (!C.eventReady(vars, e, h, evalCond)) return;
        var set = {}; set['evdone.' + e.id] = true;
        opts.push({ who: h, text: e.text, tag: e.tag || '특별한 이야기', goto: e.scene, set: set, ev: e.id });
      });
    });
    (root.DAY_ACTIONS || []).forEach(function (a) {
      if (a.if && !evalCond(a.if, vars)) return;
      opts.push({ text: a.text, tag: a.tag || '', goto: a.scene, act: a.id, set: a.set });
    });
    return opts;
  };
  // 휴일 낮 선택지: 주간 이벤트(조건에 맞고 아직 안 본 것) + 기본 휴일(히로인과 산책 / 푹 쉬기)
  C.weeklyAvail = function (vars, evalCond) {
    C.ensure(vars);
    var wk = C.weekOf(vars.day || 1);
    return ((root.WEEKLY_EVENTS || {}).events || []).filter(function (e) {
      if (vars.evdone[e.id]) return false;
      if (e.week && !has([].concat(e.week), wk)) return false;
      if (e.minAff && root.HEROINES.every(function (h) { return ((vars.aff || {})[h] || 0) < e.minAff; })) return false;
      if (e.if && !evalCond(e.if, vars)) return false;
      return true;
    });
  };
  C.holidayOptions = function (vars, evalCond) {
    var opts = [], W = root.WEEKLY_EVENTS || {};
    C.weeklyAvail(vars, evalCond).forEach(function (e) {
      var set = {}; set['evdone.' + e.id] = true;
      opts.push({ text: e.text, tag: e.tag || '주간 이벤트', goto: e.scene, set: set, ev: e.id, weekly: true });
    });
    root.HEROINES.forEach(function (h) {
      var w = (W.walks || {})[h];
      if (w) opts.push({ who: h, text: w.text, tag: '산책', goto: w.scene, ev: 'walk' });
    });
    (W.extras || []).forEach(function (a) {
      if (a.if && !evalCond(a.if, vars)) return;
      opts.push({ text: a.text, tag: a.tag || '', goto: a.scene, act: a.id, set: a.set });
    });
    return opts;
  };
  // 어떤 장면 id 들이 낮 선택지로 갈 수 있는지 (검사기의 도달 가능성 계산용)
  C.allPickScenes = function () {
    var out = [];
    root.HEROINES.forEach(function (h) { (root.HEROINE_EVENTS[h] || []).forEach(function (e) { out.push(e.scene); }); ((root.PLAIN_DAYS || {})[h] || []).forEach(function (p) { out.push(p.scene); }); });
    (root.DAY_ACTIONS || []).forEach(function (a) { out.push(a.scene); });
    var W = root.WEEKLY_EVENTS || {};
    (W.events || []).forEach(function (e) { out.push(e.scene); });
    Object.keys(W.walks || {}).forEach(function (h) { out.push(W.walks[h].scene); });
    (W.extras || []).forEach(function (a) { out.push(a.scene); });
    return out;
  };

  // ---------- 달력 화면용 데이터 ----------
  //  칸마다 { day, week, dow, holiday, state:'past'|'today'|'future', mark, title, res, act, ch }
  //  지나간 날: 그날 영업 결과 기호(res)와 한 일(act). 미래: 공개된(show) 행사만 mark/title 을 보여 준다.
  C.cells = function (vars) {
    C.ensure(vars);
    var T = CAL(), cur = vars.day || 1, cells = [];
    for (var d = 1; d <= T.total; d++) {
      var inf = C.info(d), m = inf.main, past = d < cur, today = d === cur;
      var showMain = m && (past || today || (m.show && cur >= m.show));
      cells.push({
        day: d, week: inf.week, dow: inf.dow, holiday: inf.holiday, ch: inf.chapter.id,
        state: past ? 'past' : today ? 'today' : 'future',
        mark: showMain ? m.mark : (inf.holiday ? '휴' : ''), title: showMain ? m.title : (inf.holiday ? '휴일' : ''),
        res: past || today ? ((vars.cal.log || {})[d] || {}).q || '' : '', act: (vars.cal.act || {})[d] || ''
      });
    }
    return cells;
  };

  root.CalCore = C;
})(typeof globalThis !== 'undefined' ? globalThis : this);
