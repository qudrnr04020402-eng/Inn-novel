// ============================================================
//  비주얼 노벨 엔진 (프레임워크/빌드 도구 없음)
//  - 스토리 데이터는 story/*.js 에서 전역 STORY / CHARACTERS / BACKGROUNDS 로 제공됨
//  - 이 파일은 일반적으로 수정할 필요가 없습니다.
// ============================================================
(function () {
  'use strict';

  var VN = (globalThis.VN = {});

  // ---------- 변수 / 조건식 (DOM 과 무관한 순수 함수: 검사 스크립트에서도 사용) ----------

  // 'aff.kael' 같은 경로로 값을 읽는다
  function getPath(vars, path) {
    var o = vars, ks = path.split('.');
    for (var i = 0; i < ks.length; i++) {
      if (o == null) return undefined;
      o = o[ks[i]];
    }
    return o;
  }
  // 경로에 값을 쓴다. add=true 이면 더하기
  function setPath(vars, path, val, add) {
    var o = vars, ks = path.split('.');
    for (var i = 0; i < ks.length - 1; i++) {
      if (typeof o[ks[i]] !== 'object' || o[ks[i]] === null) o[ks[i]] = {};
      o = o[ks[i]];
    }
    var k = ks[ks.length - 1];
    o[k] = add ? (Number(o[k]) || 0) + val : val;
  }
  function parseLiteral(s) {
    s = s.trim();
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s !== '' && !isNaN(Number(s))) return Number(s);
    return s.replace(/^['"]|['"]$/g, '');
  }
  var TERM_RE = /^([A-Za-z_][\w.]*)\s*(>=|<=|==|!=|>|<)?\s*(.*)$/;

  // 조건 항 하나: '!flag.x', 'gold>=30', 'aff.kael==2'
  function evalTerm(t, vars) {
    t = t.trim();
    var neg = false;
    if (t.charAt(0) === '!') { neg = true; t = t.slice(1).trim(); }
    var m = t.match(TERM_RE);
    if (!m || (m[2] && m[3] === '')) throw new Error('조건식 오류: ' + t);
    var left = getPath(vars, m[1]), r;
    if (!m[2]) {
      r = !!left;
    } else {
      var right = parseLiteral(m[3]);
      // 오른쪽이 변수 이름이면 그 값과 비교 (호감도 비교용: aff.erion>=aff.kaela)
      if (typeof right === 'string' && /^[A-Za-z_][\w.]*$/.test(right)) {
        var rv = getPath(vars, right);
        if (typeof rv === 'number' || typeof rv === 'boolean') right = rv;
      }
      if (left === undefined) left = typeof right === 'number' ? 0 : (typeof right === 'boolean' ? false : '');
      switch (m[2]) {
        case '>=': r = left >= right; break;
        case '<=': r = left <= right; break;
        case '>':  r = left > right; break;
        case '<':  r = left < right; break;
        case '==': r = left == right; break; // eslint-disable-line eqeqeq
        default:   r = left != right;        // eslint-disable-line eqeqeq
      }
    }
    return neg ? !r : r;
  }
  // 'a>=1 && b || !c' (&& 가 || 보다 먼저 계산됨)
  function evalCond(expr, vars) {
    return String(expr).split('||').some(function (orPart) {
      return orPart.split('&&').every(function (t) { return evalTerm(t, vars); });
    });
  }
  VN.evalCond = evalCond;
  VN.getPath = getPath;
  VN.checkCond = function (expr) { evalCond(expr, {}); }; // 문법 검사용 (잘못되면 throw)

  // 브라우저가 아니면(검사 스크립트) 여기까지만
  if (typeof document === 'undefined') return;

  // ---------- 저장소 (localStorage 가 막혀도 게임은 동작하도록 try/catch) ----------
  // 세이브 형식을 바꾸면 SAVE_VER 와 KEY 의 숫자를 함께 올린다 (옛 세이브는 읽지 않고 무시)
  // v3: 저녁 영업 변수(vars.tavern)가 추가되어 v2 세이브는 읽지 않고 무시한다
  // v4: 숙박/여관 등급/선물/밤 사건/신경전 변수(vars.lodge, inn, nev, gift, riv)가 추가되어 v3 세이브는 읽지 않고 무시한다
  //     (엔딩/CG/레시피/메모/튜토리얼/설정/읽은 대사 기록은 회차 공통이라 처음 한 번 v3 에서 v4 로 옮겨 온다)
  // v5: 7일 구성(씬 id 변경) + 진/명가 엔딩 + 영업 보조 변수(vars.tavern.lastBuy, free)가 추가되어 v4 세이브는 읽지 않고 무시한다
  //     (엔딩/CG/레시피/메모/튜토리얼/설정은 회차 공통이라 처음 한 번 v4 에서 v5 로 옮겨 온다. 읽은 대사 기록은 씬 id 가 달라져 옮기지 않는다)
  // v6: 30일 구성(달력/주차/피로/일상일 변수 vars.cal, fat, pl, evdone + 새 씬 id)으로 v5 세이브는 읽지 않고 무시한다
  //     (엔딩/CG/레시피/메모/튜토리얼/설정은 회차 공통이라 처음 한 번 v5 에서 v6 으로 옮겨 온다)
  var SAVE_VER = 6;
  var KEY = 'inn_vn_v6_';
  var store = {
    get: function (k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(KEY + k, v); return true; } catch (e) { return false; } }
  };
  (function migrateV4() {
    try {
      if (localStorage.getItem(KEY + 'migrated')) return;
      ['inn_vn_v4_', 'inn_vn_v5_'].forEach(function (pre) {   // 옛 버전 -> 새 버전 (v5 가 있으면 v5 가 우선)
        ['endings', 'cg', 'recipes', 'notes', 'tut', 'opt'].forEach(function (k) {
          var old = localStorage.getItem(pre + k);
          if (old != null) localStorage.setItem(KEY + k, old);
        });
      });
      localStorage.setItem(KEY + 'migrated', '1');
    } catch (e) { /* 저장소를 못 쓰면 무시 */ }
  })();
  function readSlot(k) {
    var raw = store.get(k);
    if (!raw) return null;
    try {
      var d = JSON.parse(raw);
      // 형식이 다르거나 없는 씬을 가리키는 세이브는 없는 것으로 취급
      if (!d || d.v !== SAVE_VER || !d.snap || !STORY.scenes[d.snap.scene]) return null;
      return d;
    } catch (e) { return null; }
  }
  function writeSlot(k, sn) { return store.set(k, JSON.stringify({ v: SAVE_VER, t: Date.now(), snap: sn })); }
  // 엔딩 기록 { 엔딩id: 달성 시각 }
  function readEndings() {
    try { var o = JSON.parse(store.get('endings') || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
  }
  function endingDefs() { return globalThis.ENDINGS || []; }

  // ---------- 수집 기록 (회차 공통, localStorage) ----------
  // 'cg' { CG id: 시각 }, 'recipes' { 레시피 id: 시각 }, 'notes' { 손님 id: 시각 (단골=취향을 알아냄 / 히로인=최애를 알아냄) }, 'tut' 튜토리얼을 봤으면 '1'
  function readRec(k) {
    try { var o = JSON.parse(store.get(k) || '{}'); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch (e) { return {}; }
  }
  function markRec(k, id) {
    var r = readRec(k);
    if (r[id]) return false;
    r[id] = Date.now(); store.set(k, JSON.stringify(r));
    return true;
  }
  function cgDefs() { return globalThis.CG_DEFS || {}; }
  // 지금 아는 레시피 / 알아낸 손님 취향을 회차 공통 기록에 추가
  function recordKnown() {
    if (!S || !S.vars || !S.vars.tavern) return;
    var known = S.vars.tavern.known || {}, rec = readRec('recipes'), ch = false;
    Object.keys(known).forEach(function (id) { if (known[id] && TAVERN.recipes[id] && !rec[id]) { rec[id] = Date.now(); ch = true; } });
    if (ch) store.set('recipes', JSON.stringify(rec));
  }
  function recordNotes() {
    if (!S || !S.vars || !S.vars.tavern) return;
    var notes = S.vars.tavern.notes || {}, rec = readRec('notes'), ch = false;
    Object.keys(TAVERN.customers).forEach(function (id) {
      var nt = notes[id], def = TAVERN.customers[id];
      if (nt && (def.heroine ? nt.fav : nt.taste) && !rec[id]) { rec[id] = Date.now(); ch = true; }
    });
    if (ch) store.set('notes', JSON.stringify(rec));
  }
  // 수집 현황: 엔딩 / CG / 레시피 도감 / 손님 메모, 전체 %, 보상 해금 여부
  var REWARD_GOLD = 30, REWARD_ENDINGS = 3;
  function collectStats() {
    var en = readRec('endings'), cg = readRec('cg'), rc = readRec('recipes'), nt = readRec('notes');
    var cnt = function (rec, ids) { return ids.filter(function (id) { return !!rec[id]; }).length; };
    var eIds = endingDefs().map(function (d) { return d.id; }), cIds = Object.keys(cgDefs()), rIds = Object.keys(TAVERN.recipes), nIds = Object.keys(TAVERN.customers).filter(function (id) { return !TAVERN.customers[id].special; });
    var cats = [
      { id: 'endings', name: '엔딩', n: cnt(en, eIds), total: eIds.length },
      { id: 'cg', name: 'CG', n: cnt(cg, cIds), total: cIds.length },
      { id: 'recipes', name: '레시피 도감', n: cnt(rc, rIds), total: rIds.length },
      { id: 'notes', name: '손님 메모', n: cnt(nt, nIds), total: nIds.length }
    ];
    var sn = 0, st = 0;
    cats.forEach(function (c) { sn += c.n; st += c.total; });
    var pct = st ? Math.floor(sn * 100 / st) : 0;
    if (sn === st && st) pct = 100;
    return {
      cats: cats, n: sn, total: st, pct: pct,
      rewards: { allRecipes: cats[2].n === cats[2].total && cats[2].total > 0, gold: cats[0].n >= REWARD_ENDINGS, perfect: sn === st && st > 0 }
    };
  }

  // ---------- 설정 (옵션 화면) ----------
  // localStorage 'inn_vn_v5_opt' 에 저장. 회차/세이브와 무관하게 유지된다.
  var OPT_DEF = { textSpeed: 3, autoSpeed: 3, bgm: 60, sfx: 70, mute: false, skipUnread: false, easy: false, allRecipes: false, fastTv: false, autoSkipUpg: false };
  var OPT = Object.assign({}, OPT_DEF);
  var TYPE_TABLE = [70, 45, 28, 16, 7];           // 글자 속도 1~5 -> 글자당 ms
  var AUTO_BASE = [1400, 1100, 800, 550, 350];    // 오토 속도 1~5: 기본 지연(ms)
  var AUTO_PER = [80, 60, 45, 32, 20];            //               글자당 추가 지연(ms)
  var SKIP_MS = 60;                               // 스킵: 한 줄 넘기는 간격
  function clampNum(v, lo, hi, d) { v = Number(v); return isNaN(v) ? d : Math.max(lo, Math.min(hi, Math.round(v))); }
  function loadOpt() {
    var o = {};
    try { o = JSON.parse(store.get('opt') || '{}') || {}; } catch (e) { o = {}; }
    OPT = {
      textSpeed: clampNum(o.textSpeed, 1, 5, OPT_DEF.textSpeed), autoSpeed: clampNum(o.autoSpeed, 1, 5, OPT_DEF.autoSpeed),
      bgm: clampNum(o.bgm, 0, 100, OPT_DEF.bgm), sfx: clampNum(o.sfx, 0, 100, OPT_DEF.sfx),
      mute: !!o.mute, skipUnread: !!o.skipUnread, easy: !!o.easy, allRecipes: !!o.allRecipes, fastTv: !!o.fastTv, autoSkipUpg: !!o.autoSkipUpg
    };
  }
  function saveOpt() { store.set('opt', JSON.stringify(OPT)); }
  function applyOpt() {
    TYPE_MS = TYPE_TABLE[OPT.textSpeed - 1];
    if (globalThis.SFX) { SFX.setVolume(OPT.sfx / 100); SFX.setMute(OPT.mute); }
    if (globalThis.BGM) { BGM.setVolume(OPT.bgm / 100); BGM.setMute(OPT.mute); }
  }
  function sfx(name) { if (!F.skip && globalThis.SFX) SFX.play(name); }   // 스킵 중에는 효과음을 내지 않는다

  // ---------- 읽은 대사 기록 (회차 공통) ----------
  // { 씬id: { 줄번호: 1 } } 를 localStorage 'inn_vn_v5_read' 에 { 씬id: [줄번호...] } 로 저장 (영업 임시 씬 __tv 는 기록하지 않음)
  var READ = {}, readTimer = 0;
  function loadRead() {
    READ = {};
    try {
      var o = JSON.parse(store.get('read') || '{}') || {};
      Object.keys(o).forEach(function (sc) { if (Array.isArray(o[sc])) { READ[sc] = {}; o[sc].forEach(function (n) { READ[sc][n] = 1; }); } });
    } catch (e) { READ = {}; }
  }
  function flushRead() {
    clearTimeout(readTimer); readTimer = 0;
    var o = {};
    Object.keys(READ).forEach(function (sc) { o[sc] = Object.keys(READ[sc]).map(Number); });
    store.set('read', JSON.stringify(o));
  }
  function isRead(sc, pc) { return !!(READ[sc] && READ[sc][pc]); }
  function markRead(sc, pc) {
    if (sc === '__tv') return;
    if (isRead(sc, pc)) return;
    (READ[sc] = READ[sc] || {})[pc] = 1;
    if (!readTimer) readTimer = setTimeout(flushRead, 600);
  }

  // ---------- 스킵 / 오토 ----------
  // 스킵: 읽은 줄(옵션에 따라 안 읽은 줄도)을 빠르게 넘김. 오토: 타이핑이 끝나면 (기본 지연 + 글자 수 비례) 뒤 자동 진행.
  // 둘 다 선택지 / 영업 / 엔딩 / 일차 카드 / 결과 / 자유 대화 / 메뉴에서 자동으로 꺼지고, 화면을 탭해도 꺼진다.
  var F = { auto: false, skip: false, timer: 0 };
  function updateFastUi() {
    if (!E.btnAuto) return;
    E.btnAuto.classList.toggle('on', F.auto); E.btnAuto.setAttribute('aria-pressed', F.auto ? 'true' : 'false');
    E.btnSkip.classList.toggle('on', F.skip); E.btnSkip.setAttribute('aria-pressed', F.skip ? 'true' : 'false');
  }
  function stopFast() {
    clearTimeout(F.timer); F.timer = 0;
    if (!F.auto && !F.skip) return;
    F.auto = false; F.skip = false; updateFastUi();
  }
  // 지금 보여 줄 줄을 스킵할지 결정하면서 읽은 줄로 기록한다. 처음 보는 줄(옵션이 꺼져 있을 때)·영업 대사면 스킵을 멈춘다
  function lineFast() {
    var rd = isRead(S.scene, S.pc);
    markRead(S.scene, S.pc);
    if (!F.skip) return false;
    if (S.scene === '__tv' || !(rd || OPT.skipUnread)) { stopFast(); return false; }
    return true;
  }
  function autoDelay(len) { var k = OPT.autoSpeed - 1; return AUTO_BASE[k] + AUTO_PER[k] * len; }
  // 한 줄이 다 표시된 뒤(타이핑 완료): 오토/스킵이면 다음 줄을 예약
  function lineShown() {
    clearTimeout(F.timer); F.timer = 0;
    if (mode !== 'text' || modal > 0 || CH) return;
    if (F.skip) F.timer = setTimeout(fastStep, SKIP_MS);
    else if (F.auto) F.timer = setTimeout(fastStep, autoDelay(Array.from(E.text.textContent || '').length));
  }
  function fastStep() {
    F.timer = 0;
    if (!(F.auto || F.skip) || mode !== 'text' || modal > 0 || typing) return;
    advance(true);
  }
  function toggleFast(kind) {
    if (mode !== 'text' || modal > 0) { toast('대사가 나올 때만 쓸 수 있어요', 'down'); return; }
    if (kind === 'skip' && S.scene === '__tv') { toast('영업 중에는 스킵할 수 없어요', 'down'); return; }
    var was = F[kind];
    stopFast();
    if (!was) {
      F[kind] = true; updateFastUi(); sfx('select');
      if (!typing) lineShown();
      else if (kind === 'skip') finishTyping();   // 스킵을 켜면 지금 줄도 바로 완성
    }
  }

  // ---------- 상태 ----------
  var S = null;        // 현재 진행 상태 {scene, pc, vars, bg, sprites, log}
  var snap = null;     // 지금 화면에 떠 있는 줄(대기 지점) 직전의 상태 스냅샷 (세이브 대상)
  var mode = 'title';  // title | text | choice | card | summary | ending | tavern (영업 화면/업그레이드 화면)
  var snapLocked = false; // 영업 중에는 세이브 스냅샷을 영업 시작 시점으로 고정한다
  var TV = null;          // 저녁 영업 진행 상태 (세이브에 들어가지 않음: 영업 중간 저장은 영업 시작 시점으로 돌아감)
  var curOpts = [];    // 지금 화면에 떠 있는 선택지 (테스트용 접근자)
  var modal = 0;       // 열려 있는 오버레이 수 (>0 이면 탭 진행 안 됨)
  var typing = null;   // 타이핑 진행 정보
  var POS = ['left', 'center', 'right'];
  var $ = function (id) { return document.getElementById(id); };
  var E = {};          // DOM 요소 캐시
  var LOG_MAX = 120;
  // ----- 자유 대화(로컬 LLM) 상태: PC 서버(pc-server/inn_server.py)에서 열렸을 때만 켜진다 -----
  var LLM = { server: false, state: 'none', model: '' }; // state: none(PC 서버 아님) | checking | nollm(서버는 있는데 LLM 이 꺼짐) | ready
  var CH = null;        // 자유 대화 진행 상태 (세이브에 들어가지 않음)
  var curPick = false;  // 지금 떠 있는 선택지가 낮 "누구와 시간을 보낼까" 인지 (choice 의 talkpick)
  var cardQueue = null; // 챕터 카드 다음에 이어서 보여 줄 일차 카드 {title, sub, tip}
  var replay = false;   // 같은 줄을 다시 실행하는 중 (백로그에 중복 기록하지 않음)

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function warn(msg) { console.warn('[VN] ' + msg); }

  function freshState() {
    return {
      scene: STORY.start, pc: 0,
      vars: clone(STORY.init || {}),
      bg: null,
      sprites: { left: null, center: null, right: null },
      cg: null,    // 지금 떠 있는 이벤트 CG id (세이브에 같이 저장됨)
      bgm: null,   // 지금 틀어 둔 BGM 트랙 id (세이브에 같이 저장되어 불러오면 이어서 재생)
      log: []
    };
  }

  // {gold} 같은 변수 치환
  function interp(text) {
    return String(text).replace(/\{([A-Za-z_][\w.]*)\}/g, function (m, p) {
      var v = getPath(S.vars, p);
      return v === undefined ? m : v;
    });
  }

  // ---------- 화면 전환 ----------
  function showScreen(name) {
    E.title.classList.toggle('hidden', name !== 'title');
    E.game.classList.toggle('hidden', name !== 'game');
  }
  function openOverlay(el) {
    if (el.classList.contains('hidden')) {
      stopFast();
      el.classList.remove('hidden'); modal++;
      if (el !== E.confirm) sfx('page');
    }
  }
  function closeOverlay(el) { if (!el.classList.contains('hidden')) { el.classList.add('hidden'); modal--; } }
  function closeAllOverlays() {
    tutHide();   // 아래에서 modal 을 0 으로 되돌리므로 튜토리얼은 카운트 없이 닫는다
    [E.menu, E.calendar, E.slots, E.backlog, E.confirm, E.endingList, E.chatPick, E.options, E.gallery, E.cgview, E.collect, E.gift, E.rankup].forEach(closeOverlay);
    modal = 0;
  }

  function toTitle() {
    stopFast();
    stopTyping();
    chatReset();
    tvReset();
    closeAllOverlays();
    E.summary.classList.add('hidden');
    E.ending.classList.add('hidden');
    E.card.classList.add('hidden');
    renderCg(null);
    mode = 'title';
    if (globalThis.BGM) BGM.play('title');
    refreshTitle();
    showScreen('title');
  }
  function refreshTitle() {
    E.btnContinue.disabled = !readSlot('auto');
    var any = [1, 2, 3].some(function (i) { return readSlot('s' + i); }) || !!readSlot('auto');
    E.btnTitleLoad.disabled = !any;
    E.btnEndings.textContent = '엔딩 목록 (' + Object.keys(readEndings()).length + '/' + endingDefs().length + ')';
    var st = collectStats();
    E.btnGallery.textContent = '갤러리 (' + st.cats[1].n + '/' + st.cats[1].total + ')';
    E.btnCollect.textContent = '수집 (' + st.pct + '%)';
    E.title.classList.toggle('perfect', st.rewards.perfect);   // 수집 100% 보상: 별빛 연출
  }

  // ---------- 이벤트 CG ----------
  // 파일이 있으면 <img>, 없으면(null) 배경 + 히로인 스탠딩 확대 + 비네트/빛 효과의 "임시 CG" (이미지 파일 요청 없음)
  function cgPlaceholder(el, d) {
    var who = (d.who || []).filter(function (id) { return CHARACTERS[id]; });
    el.classList.add('cg-ph');
    el.style.setProperty('--tone', d.tone || (who[0] && CHARACTERS[who[0]].color) || '#ffc27a');
    var bg = document.createElement('div'); bg.className = 'cg-bg';
    if (BACKGROUNDS[d.bg]) bg.style.backgroundImage = 'url("' + BACKGROUNDS[d.bg] + '")';
    el.appendChild(bg);
    var glow = document.createElement('div'); glow.className = 'cg-glow'; el.appendChild(glow);
    var figs = document.createElement('div'); figs.className = 'cg-figs'; figs.setAttribute('data-n', who.length);
    who.forEach(function (id, i) {
      var f = CHARACTERS[id].faces, im = document.createElement('img');
      im.className = 'cg-fig f' + i; im.alt = '';
      im.src = f[d.face] || f.smile || f[Object.keys(f)[0]];
      figs.appendChild(im);
    });
    el.appendChild(figs);
    var sp = document.createElement('div'); sp.className = 'cg-sparks'; el.appendChild(sp);
    var vg = document.createElement('div'); vg.className = 'cg-vig'; el.appendChild(vg);
  }
  function cgNode(id) {
    var d = cgDefs()[id], el = document.createElement('div');
    el.className = 'cg-pic'; el.setAttribute('data-cg', id);
    if (!d) return el;
    if (d.file) {
      var im = document.createElement('img');
      im.className = 'cg-img'; im.alt = d.title;
      im.onerror = function () { if (im.parentNode) im.parentNode.removeChild(im); cgPlaceholder(el, d); };   // 파일이 없으면 임시 CG 로
      im.src = d.file; el.appendChild(im);
    } else cgPlaceholder(el, d);
    return el;
  }
  function renderCg(id, animate) {
    E.cg.innerHTML = '';
    E.cg.classList.remove('fadein');
    if (!id || !cgDefs()[id]) { E.cg.classList.add('hidden'); return; }
    E.cg.appendChild(cgNode(id));
    E.cg.classList.remove('hidden');
    if (animate) { void E.cg.offsetWidth; E.cg.classList.add('fadein'); }
  }
  function clearCg() { if (S) S.cg = null; if (E.cg) renderCg(null); }

  // ----- 갤러리 / 전체 화면 보기 -----
  var CGV = { list: [], i: 0 };
  function openGallery() {
    var seen = readRec('cg'), ids = Object.keys(cgDefs()), got = [];
    ids.forEach(function (id) { if (seen[id]) got.push(id); });
    E.galleryGrid.innerHTML = '';
    ids.forEach(function (id) {
      var d = cgDefs()[id], have = !!seen[id];
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gal-item' + (have ? ' got' : ' lock'); b.setAttribute('data-cg', id);
      var th = document.createElement('span'); th.className = 'gal-thumb';
      if (have) th.appendChild(cgNode(id)); else { th.textContent = '?'; }
      var tt = document.createElement('b'); tt.textContent = have ? d.title : '???';
      var hn = document.createElement('small'); hn.textContent = have ? '' : d.hint;
      b.appendChild(th); b.appendChild(tt); if (!have) b.appendChild(hn);
      b.addEventListener('click', function () {
        if (!have) { sfx('select'); return; }
        openCgView(got, got.indexOf(id));
      });
      E.galleryGrid.appendChild(b);
    });
    E.galleryCount.textContent = got.length + ' / ' + ids.length;
    openOverlay(E.gallery);
  }
  function renderCgView() {
    var id = CGV.list[CGV.i], d = cgDefs()[id] || {};
    E.cgviewPic.innerHTML = '';
    E.cgviewPic.appendChild(cgNode(id));
    E.cgviewTitle.textContent = d.title || '';
    E.cgviewN.textContent = (CGV.i + 1) + ' / ' + CGV.list.length;
    var one = CGV.list.length < 2;
    E.cgviewPrev.disabled = one; E.cgviewNext.disabled = one;
  }
  function openCgView(list, i) {
    CGV.list = list; CGV.i = i;
    renderCgView();
    openOverlay(E.cgview);
  }
  function cgViewMove(d) {
    if (CGV.list.length < 2) return;
    CGV.i = (CGV.i + d + CGV.list.length) % CGV.list.length;
    sfx('page');
    renderCgView();
  }

  // ----- 수집 화면: 엔딩 / CG / 레시피 도감 / 손님 메모 달성률과 보상 -----
  function rewardRows(st) {
    var cs = st.cats;
    return [
      { id: 'allRecipes', ok: st.rewards.allRecipes, name: '레시피 도감 완성', prog: cs[2].n + ' / ' + cs[2].total,
        desc: '새 게임을 시작할 때 메뉴판에 모든 레시피를 공개하는 옵션을 쓸 수 있어요.' },
      { id: 'gold', ok: st.rewards.gold, name: '엔딩 ' + REWARD_ENDINGS + '개 달성', prog: Math.min(cs[0].n, REWARD_ENDINGS) + ' / ' + REWARD_ENDINGS,
        desc: '새 게임 시작 골드 +' + REWARD_GOLD + 'G (자동 적용)' },
      { id: 'perfect', ok: st.rewards.perfect, name: '모든 수집 100%', prog: st.pct + '%',
        desc: '타이틀 화면에 네 사람의 미소와 별빛 특별 연출이 나타나요.' }
    ];
  }
  function openCollect() {
    var st = collectStats();
    E.collectPct.textContent = st.pct + '%';
    E.collectBar.style.width = st.pct + '%';
    E.collectCats.innerHTML = '';
    st.cats.forEach(function (c) {
      var row = document.createElement('div');
      row.className = 'col-row' + (c.n === c.total ? ' full' : ''); row.setAttribute('data-cat', c.id);
      var pc = c.total ? Math.round(c.n * 100 / c.total) : 0;
      row.innerHTML = '<span class="col-name"></span><b class="col-n"></b><i class="col-bar"><u></u></i>';
      row.querySelector('.col-name').textContent = c.name;
      row.querySelector('.col-n').textContent = c.n + ' / ' + c.total;
      row.querySelector('u').style.width = pc + '%';
      E.collectCats.appendChild(row);
    });
    E.collectRewards.innerHTML = '';
    rewardRows(st).forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'col-reward' + (r.ok ? ' ok' : ''); row.setAttribute('data-reward', r.id);
      row.innerHTML = '<span class="col-lock"></span><span class="col-rtx"><b></b><small></small></span><em></em>';
      row.querySelector('.col-lock').textContent = r.ok ? '★' : '잠김';
      row.querySelector('b').textContent = r.name;
      row.querySelector('small').textContent = r.desc;
      row.querySelector('em').textContent = r.ok ? '해금' : r.prog;
      if (r.id === 'allRecipes' && r.ok) {
        var tg = document.createElement('button');
        tg.type = 'button'; tg.className = 'col-toggle' + (OPT.allRecipes ? ' on' : ''); tg.textContent = OPT.allRecipes ? '켜짐' : '꺼짐';
        tg.addEventListener('click', function () { OPT.allRecipes = !OPT.allRecipes; saveOpt(); sfx('select'); tg.classList.toggle('on', OPT.allRecipes); tg.textContent = OPT.allRecipes ? '켜짐' : '꺼짐'; });
        row.appendChild(tg);
      }
      E.collectRewards.appendChild(row);
    });
    openOverlay(E.collect);
  }

  // ---------- 배경 / 스프라이트 ----------
  function renderBg(id, animate) {
    var url = BACKGROUNDS[id];
    if (!url) { if (id) warn('없는 배경: ' + id); E.bg.style.backgroundImage = 'none'; return; }
    E.bg.style.backgroundImage = 'url("' + url + '")';
    if (animate) {
      E.bg.classList.remove('fade'); void E.bg.offsetWidth; E.bg.classList.add('fade');
    }
  }

  // 얼굴 동그라미 이미지 설정: 썸네일(icon)이 있으면 그대로(꽉 채움), 없으면 CSS 로 얼굴 부분만 잘라 씀
  function setIcon(im, ch, face) {
    if (ch.icon) { im.src = ch.icon; im.classList.add('thumb'); }
    else im.src = (face && ch.faces[face]) || ch.faces.normal || ch.faces[Object.keys(ch.faces)[0]];
  }
  function faceUrl(id, face) {
    var c = CHARACTERS[id];
    if (!c) { warn('없는 캐릭터: ' + id); return ''; }
    var f = c.faces[face] || c.faces[Object.keys(c.faces)[0]];
    if (!c.faces[face]) warn('없는 표정: ' + id + '.' + face);
    return f;
  }
  // speaker: 말하는 캐릭터 id (그 외는 어둡게). null 이면 모두 밝게
  function renderSprites(speaker) {
    var cnt = POS.filter(function (q) { return S.sprites[q]; }).length;
    E.sprites.left.parentNode.setAttribute('data-n', cnt);
    POS.forEach(function (p) {
      var img = E.sprites[p], s = S.sprites[p];
      if (!s) { img.classList.remove('on'); return; }
      var url = faceUrl(s.id, s.face);
      if (img.getAttribute('src') !== url) img.setAttribute('src', url);
      img.alt = (CHARACTERS[s.id] || {}).name || '';
      img.classList.add('on');
      img.classList.toggle('dim', !!speaker && speaker !== s.id);
    });
  }
  function slotOf(id) {
    for (var i = 0; i < POS.length; i++) { if (S.sprites[POS[i]] && S.sprites[POS[i]].id === id) return POS[i]; }
    return null;
  }

  // ---------- HUD / 토스트 ----------
  function updateHud() {
    E.hudGold.textContent = S.vars.gold || 0;
    E.hudRep.textContent = S.vars.rep || 0;
    var inf = CalCore.info(S.vars.day || 1);
    E.hudDay.textContent = inf.label + (S.vars.time ? ' · ' + S.vars.time : '');
    E.hudDay.parentNode.classList.toggle('holiday', !!inf.holiday);
    var fs = CalCore.fatState(S.vars), fv = Math.round(S.vars.fat || 0);
    E.hudFatBar.style.width = fv + '%';
    E.hudFat.dataset.level = fs.level;
    E.hudFatTxt.textContent = fs.level === 'fresh' ? '피로' : fs.label;
    E.hudFat.title = '피로 ' + fv + ' / ' + CALENDAR.fatigue.max + (fs.level === 'fresh' ? '' : ' — ' + fs.label + ': 영업 팁이 줄어요');
    var rk = (S.vars.inn && S.vars.inn.rank) || 1;
    E.hudRank.textContent = InnCore.starStr(rk);
    E.hudRankWrap.dataset.rank = rk;
  }
  function toast(msg, cls) {
    var d = document.createElement('div');
    d.className = 'toast ' + (cls || '');
    d.textContent = msg;
    E.toasts.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 2200);
  }
  var LABELS = { gold: '골드', rep: '평판', fat: '피로' };
  function labelOf(path) {
    if (LABELS[path]) return LABELS[path];
    var m = path.match(/^aff\.(\w+)$/);
    if (m) return ((CHARACTERS[m[1]] || {}).name || m[1]) + ' 호감도';
    return null;
  }
  // 호감도가 오르면 하트가 떠오르는 연출 (캐릭터 이름색 사용)
  function heartBurst(id) {
    var col = (CHARACTERS[id] || {}).color || '#ff6f8e';
    for (var i = 0; i < 8; i++) {
      var h = document.createElement('i');
      h.className = 'fx-heart';
      h.textContent = '♥';
      h.style.left = (14 + Math.random() * 72) + '%';
      h.style.fontSize = (18 + Math.random() * 20) + 'px';
      h.style.animationDelay = (i * 70) + 'ms';
      h.style.color = i % 2 ? '#ff7a9c' : col;
      E.fx.appendChild(h);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2200); })(h);
    }
  }
  // 호감도 하트 칸 (6칸이 고백 엔딩 기준선)
  // 하트 6칸이 STORY.loveLine(고백 기준 호감도)에 해당 — 6칸이 꽉 차면 개별 엔딩 조건 충족
  var HEART_MAX = 6;
  function heartsHtml(v) {
    var line = STORY.loveLine || HEART_MAX;
    var n = Math.max(0, Math.min(HEART_MAX, Math.floor((v || 0) * HEART_MAX / line))), out = '';
    for (var i = 0; i < HEART_MAX; i++) out += '<i class="' + (i < n ? 'on' : '') + '">♥</i>';
    return out;
  }
  // set 적용: 숫자는 더하고, 그 외(true/false/문자열)는 대입
  //  quiet=true 이면 골드 효과음을 내지 않는다 (영업 판정은 결과 효과음을 따로 냄)
  function applySet(set, quiet) {
    var snd = {};
    Object.keys(set || {}).forEach(function (k) {
      var v = set[k];
      if (typeof v === 'number') {
        if (k === 'fat') CalCore.addFat(S.vars, v); else setPath(S.vars, k, v, true);   // 피로는 0~100 으로 잘린다
        var lb = labelOf(k);
        var isAff = /^aff\./.test(k);
        if (lb && v !== 0) toast((isAff && v > 0 ? '♥ ' : '') + lb + ' ' + (v > 0 ? '+' : '') + v, ((v > 0) !== (k === 'fat') ? 'up' : 'down') + (isAff && v > 0 ? ' heart' : ''));
        if (isAff && v > 0) { heartBurst(k.slice(4)); snd.heart = 1; }
        if (isAff && v < 0) snd.down = 1;
        if (k === 'gold' && v > 0) snd.coin = 1;
      } else {
        setPath(S.vars, k, v, false);
      }
    });
    if (snd.heart) sfx('heart'); else if (snd.down) sfx('heartDown');
    if (snd.coin && !quiet) sfx('coin');
    updateHud();
  }

  // ---------- 텍스트 출력 (타이핑 효과) ----------
  var TYPE_MS = 28;
  function stopTyping() {
    if (typing) { clearInterval(typing.timer); typing = null; }
  }
  function startTyping(text, instant) {
    stopTyping();
    var chars = Array.from(text), i = 0;
    E.text.textContent = '';
    E.nextMark.classList.remove('on');
    if (instant || !chars.length) { typing = { full: text, timer: 0 }; finishTyping(); return; }
    typing = { full: text, timer: setInterval(function () {
      i++;
      E.text.textContent = chars.slice(0, i).join('');
      if (i >= chars.length) finishTyping();
    }, TYPE_MS) };
  }
  function finishTyping() {
    if (!typing) return;
    var full = typing.full;
    stopTyping();
    E.text.textContent = full;
    E.nextMark.classList.add('on');
    lineShown();
  }

  // 현재 줄을 스냅샷으로 저장(자동 저장 포함)
  function takeSnap(label) {
    if (snapLocked) return; // 영업 중: 영업 시작 시점 스냅샷을 유지
    snap = clone(S);
    snap.label = label;
    writeSlot('auto', snap);
  }
  function pushLog(entry) {
    if (replay) return;
    S.log.push(entry);
    if (S.log.length > LOG_MAX) S.log.shift();
  }

  // ---------- 명령 실행 ----------
  function next() { S.pc++; }
  function gotoScene(id) {
    if (!STORY.scenes[id]) { warn('없는 씬으로 goto: ' + id); toTitle(); return false; }
    S.scene = id; S.pc = 0; return true;
  }

  // 'scene#pc' 형태로 저장해 둔 복귀 지점으로 이동 (밤 사건 / 신경전 장면의 끝)
  function gotoRet(ret) {
    var m = /^(.+)#(\d+)$/.exec(ret || '');
    if (!m || !STORY.scenes[m[1]]) { warn('복귀 지점이 없음: ' + ret); toTitle(); return false; }
    S.scene = m[1]; S.pc = Number(m[2]); return true;
  }

  // 반환값 true = 입력 대기(진행 멈춤)
  function exec(c) {
    var d;
    if ('say' in c) {
      var ch = CHARACTERS[c.say];
      if (!ch) warn('없는 캐릭터: ' + c.say);
      // 말하는 캐릭터가 화면에 없으면 중앙에 자동 등장, 표정이 주어지면 교체
      var slot = slotOf(c.say);
      if (!slot && ch && c.face) { slot = 'center'; S.sprites[slot] = { id: c.say, face: c.face }; }
      if (slot && c.face) S.sprites[slot].face = c.face;
      var text = interp(c.text);
      var name = c.as || (ch ? ch.name : c.say);
      var inst = lineFast();
      takeSnap(text.slice(0, 26));
      pushLog({ name: name, color: ch ? ch.color : '#fff', text: text });
      E.dialog.classList.remove('narr');
      E.nametag.textContent = name;
      E.nametag.style.color = ch ? ch.color : '#fff';
      E.nametag.style.borderColor = ch ? ch.color : '#fff';
      E.nametag.classList.remove('hidden');
      renderSprites(c.say);
      E.dialog.classList.remove('hidden');
      E.choices.classList.add('hidden');
      mode = 'text';
      startTyping(text, inst);
      return true;
    }
    if ('narr' in c) {
      var nt = interp(c.narr);
      var ninst = lineFast();
      takeSnap(nt.slice(0, 26));
      pushLog({ name: '', color: '', text: nt });
      E.dialog.classList.add('narr');
      E.nametag.classList.add('hidden');
      renderSprites(null);
      E.dialog.classList.remove('hidden');
      E.choices.classList.add('hidden');
      mode = 'text';
      startTyping(nt, ninst);
      return true;
    }
    if ('choice' in c) {
      var copts = c.choice;
      if (c.dynamic === 'pick') copts = CalCore.pickOptions(S.vars, evalCond);          // 낮 행동 목록은 데이터로 만들어진다 (story/heroine-events.js, plain-days.js, routine.js)
      else if (c.dynamic === 'holiday') copts = CalCore.holidayOptions(S.vars, evalCond);   // 휴일 낮 행동 (story/weekly-events.js)
      if (!copts.length) copts = c.choice;
      showChoices(copts.filter(function (o) { return !o.if || evalCond(o.if, S.vars); }), !!c.talkpick);
      return true;
    }
    if ('talkoffer' in c) { // 낮 이벤트 뒤 "조금 더 이야기하기" 제안 (자유 대화가 가능할 때만. 아니면 그냥 지나감)
      var lst = LLMCore.ensureState(S.vars), tid = lst.last;
      if (tid && LLM.state === 'ready' && chatReady() && LLMCore.remaining(S.vars, tid, LLM_ST()) > 0) { showTalkOffer(tid); return true; }
      lst.last = '';
      next(); return false;
    }
    if ('day' in c) { // 일차 전환 화면: {day:'next', tip:'...'} (다음 날) / {day:1} (처음). 챕터가 시작되는 날이면 챕터 타이틀 카드가 먼저 나옴
      var nd = c.day === 'next' ? (S.vars.day || 1) + 1 : c.day, ninf = CalCore.info(nd);
      // 불러오면 이 명령을 처음부터 다시 실행하므로, 날짜를 바꾸기 전 상태를 저장한다 (일차가 두 번 넘어가지 않음)
      takeSnap(nd + '일차 아침');
      if (nd > 1 && ninf.chapterStart && !snapLocked && snap) { var ws = clone(snap); ws.label = ninf.week + '주차 시작 (' + nd + '일차)'; writeSlot('wk', ws); }
      S.vars.time = c.time || '아침';
      if (ninf.chapterStart) S.vars.wk = { day: nd, gold: S.vars.gold || 0, rep: S.vars.rep || 0, aff: clone(S.vars.aff || {}), rank: (S.vars.inn && S.vars.inn.rank) || 1 };   // 주간 정산 카드의 비교 기준
      CalCore.setDay(S.vars, nd);
      if (nd > 1) CalCore.sleep(S.vars, ninf.holiday);       // 자고 일어나면 피로 회복 (휴일은 더 많이)
      CalCore.flavorDay(S.vars, nd);
      EventCore.newDay(S.vars);   // 오늘의 영업 보정(랜덤 사건)을 새로 시작
      updateHud();
      refreshLlm();
      var dl = nd + '일차 ' + S.vars.time;
      pushLog({ name: '', color: '', text: '— ' + ninf.label + ' —' });
      InnCore.ensure(S.vars);
      var rtxt = nd > 1 ? InnCore.reportText(S.vars) : '';    // 간밤 숙박 정산 / 밤 사건 한 줄
      var fsd = CalCore.fatState(S.vars);
      var dtip = [c.tip ? interp(c.tip) : '', rtxt, fsd.level === 'fresh' ? '' : '※ ' + fsd.label + ' 상태예요. 오늘 영업의 팁이 줄어들어요' + (fsd.level === 'exhausted' ? ' (가끔 손이 미끄러져 요리가 덜 맛있어져요)' : '') + '. 낮에 쉬는 것도 방법이에요.'].filter(Boolean).join('\n\n');
      var dsub = ninf.week + '주차 · ' + ninf.dowName + '요일' + (ninf.holiday ? ' · 휴일' : '');
      cardQueue = null;
      if (ninf.chapterStart) {
        var ch = ninf.chapter;
        cardQueue = { title: nd + '일차', sub: dsub, tip: dtip };
        showCard(ch.label, ch.title, ch.blurb + (nd > 1 ? '\n\n※ 이 시점이 \'주차 시작\' 자동 저장 칸에 저장됐어요.' : ''), { chapter: true });
      } else showCard(nd + '일차', dsub, dtip);
      return true;
    }
    if ('weekcard' in c) { showWeekCard(); return true; }   // 주간 정산 카드: {weekcard:true} (이번 주 영업/평판/등급/호감도 변화 요약)
    if ('cal' in c) { // 달력으로 다음 장면 정하기: {cal:'next'} 다음 날 아침 / {cal:'evening'} 오늘 저녁 (story/calendar.js)
      var cd = S.vars.day || 1, cs;
      if (c.cal === 'next') { cs = CalCore.entry(cd + 1); if (cd + 1 > CALENDAR.total) warn('마지막 날 이후로 넘어감: ' + cd); }
      else cs = CalCore.evening(cd);
      return !gotoScene(cs);
    }
    if ('cg' in c) { // 이벤트 CG: {cg:'id'} 전체 화면 일러스트(대사창은 그 위에 계속) / {cg:'hide'} 걷기. 본 CG 는 회차 공통으로 기록
      var cdef = cgDefs()[c.cg];
      if (c.cg === 'hide') { S.cg = null; renderCg(null); }
      else if (!cdef) warn('없는 CG: ' + c.cg);
      else {
        S.cg = c.cg; renderCg(c.cg, !replay);
        if (markRec('cg', c.cg)) { toast('★ CG 획득: ' + cdef.title, 'up'); sfx('discover'); pushLog({ name: '', color: '', text: '★ CG 획득: ' + cdef.title }); }
      }
      next(); return false;
    }
    if ('rand' in c) { // 아침 랜덤 사건: {rand:'morning', then:'다음씬'} — 확률로 rev_<id> 씬을 거쳐 then 으로 이어진다 (story/random-events.js)
      var RE = globalThis.RANDOM_EVENTS, evid = null;
      try { evid = EventCore.pick(RE, S.vars, S.vars.day || 1, evalCond); } catch (e) { warn(e.message); }
      if (evid && !STORY.scenes['rev_' + evid]) { warn('없는 사건 씬: rev_' + evid); evid = null; }
      EventCore.begin(S.vars, evid, c.then);
      if (evid) { toast('돌발 사건: ' + RE.events[evid].title, 'up'); return !gotoScene('rev_' + evid); }
      return !gotoScene(c.then);
    }
    if ('randret' in c) { return !gotoScene((S.vars.rev && S.vars.rev.ret) || ''); }   // 사건이 끝나면 아침 장면으로 복귀
    if ('time' in c) { // 시간대 표시만 바꿈: {time:'낮'}
      S.vars.time = c.time; updateHud(); next(); return false;
    }
    if ('bgm' in c) { // BGM: {bgm:'inn_day'} / {bgm:'stop'} (트랙은 story/audio.js)
      S.bgm = c.bgm === 'stop' ? null : c.bgm;
      if (globalThis.BGM) BGM.play(c.bgm);
      next(); return false;
    }
    if ('sfx' in c) { sfx(c.sfx); next(); return false; }   // 효과음: {sfx:'quake'} (합성음 이름은 js/sfx.js)
    if ('fx' in c) { // 화면 효과: {fx:'shake'} | {fx:'flash'}
      fxPlay(c.fx); next(); return false;
    }
    if ('ending' in c) { // 엔딩 도달: {ending:'erion'} (endings.js 의 ENDINGS 에 정의된 id)
      var isNew = markEnding(c.ending);
      takeSnap('엔딩');
      showEnding(c.ending, isNew);
      return true;
    }
    if ('summary' in c) {
      takeSnap('결과 요약');
      showSummary(c.summary || {});
      return true;
    }
    if ('end' in c) { toTitle(); return true; }
    if ('tavern' in c) { return startTavern(c.tavern); }           // 저녁 영업 시작: {tavern:'day1'}
    if ('learn' in c) { learnRecipes([].concat(c.learn)); next(); return false; } // 레시피 해금: {learn:'id'} / {learn:['a','b']}
    if ('upgrades' in c) { openUpgrades(); return true; }          // 밤의 여관 업그레이드 화면: {upgrades:true}
    if ('lodging' in c) { return openLodging(); }                  // 밤의 숙박 접수 화면: {lodging:true} (story/lodging.js)
    if ('nightev' in c) {                                          // 밤 사건: 확률로 nev_<id> 씬을 거쳐 이 명령 다음 줄로 돌아온다
      InnCore.ensure(S.vars);
      var nid = null;
      try { nid = InnCore.nightEvent(S.vars, S.vars.day || 1, evalCond); } catch (e) { warn(e.message); }
      if (nid && !STORY.scenes['nev_' + nid]) { warn('없는 밤 사건 씬: nev_' + nid); nid = null; }
      if (!nid) { next(); return false; }
      S.vars.nev.used.push(nid); S.vars.nev.last = S.vars.day || 0; S.vars.nev.today = nid; S.vars.nev.ret = S.scene + '#' + (S.pc + 1);
      toast('밤 사건: ' + LODGING.nightEvents.events[nid].title, 'up');
      return !gotoScene('nev_' + nid);
    }
    if ('nightret' in c) { return !gotoRet(S.vars.nev.ret); }       // 밤 사건 장면의 끝
    if ('rivalry' in c) {                                          // 히로인 신경전: 조건이 맞으면 riv_<쌍> 씬을 거쳐 다음 줄로 돌아온다 (story/rivalry.js)
      var rp = null;
      try { rp = InnCore.rivalryPick(S.vars, S.vars.day || 1); } catch (e) { warn(e.message); }
      if (!rp || !STORY.scenes[rp.scene]) { next(); return false; }
      S.vars.riv.done.push(rp.id); S.vars.riv.n++; S.vars.riv.last = S.vars.day || 0; S.vars.riv.ret = S.scene + '#' + (S.pc + 1);
      toast('히로인 신경전: ' + rp.title, 'up');
      return !gotoScene(rp.scene);
    }
    if ('rivret' in c) { return !gotoRet(S.vars.riv.ret); }         // 신경전 장면의 끝
    if ('rankcheck' in c) {                                        // 여관 등급 검사: {rankcheck:true} 올랐으면 축하 화면 / {rankcheck:'quiet'} 조용히 갱신만
      if (c.rankcheck === 'quiet') { InnCore.checkRank(S.vars); updateHud(); next(); return false; }
      if (rankUp(function () { next(); run(); })) return true;
      next(); return false;
    }
    if ('giftoffer' in c) {                                        // 낮 이벤트 뒤 "선물을 건넨다" 제안 (보관함에 선물이 있고 오늘 아직 안 줬을 때만)
      InnCore.ensure(S.vars);
      var gid = S.vars.gift.last;
      S.vars.gift.last = '';
      if (gid && CHARACTERS[gid] && InnCore.giftCount(S.vars) > 0 && InnCore.canGive(S.vars, gid)) {
        showChoices([
          { who: gid, text: '준비한 선물을 건네 볼까?', tag: '선물 · 보관함 ' + InnCore.giftCount(S.vars) + '개', giftto: gid },
          { text: '선물은 다음 기회에 하기로 한다.' }
        ], false);
        return true;
      }
      next(); return false;
    }
    if ('__tv' in c) {                                             // 영업 내부 진행용 (스토리에서 쓰지 않음)
      if (c.__tv === 'brew') { openBrew(); return true; }
      if (TUT.next === 'notes') { tutNotes(); return true; }   // 튜토리얼 마지막 단계: 손님 메모장을 열어 보여 준다
      tvNextCustomer(); return true;
    }
    if ('if' in c) {
      var ok = false;
      try { ok = evalCond(c.if, S.vars); } catch (e) { warn(e.message); }
      if (ok && c.goto) { gotoScene(c.goto); return false; }
      if (!ok && c.else) { gotoScene(c.else); return false; }
      next(); return false;
    }
    if ('goto' in c) { return !gotoScene(c.goto); }
    if ('show' in c) {
      var old = slotOf(c.show);
      var pos = c.pos || old || 'center'; // pos 를 생략하면 이미 화면에 있을 땐 제자리 유지, 새로 등장하면 가운데
      var face = c.face || (old ? S.sprites[old].face : Object.keys((CHARACTERS[c.show] || { faces: { normal: 1 } }).faces)[0]);
      if (old && old !== pos) S.sprites[old] = null;
      S.sprites[pos] = { id: c.show, face: face };
      renderSprites(null);
      next(); return false;
    }
    if ('hide' in c) {
      POS.forEach(function (p) {
        if (c.hide === 'all' || (S.sprites[p] && S.sprites[p].id === c.hide)) S.sprites[p] = null;
      });
      renderSprites(null);
      next(); return false;
    }
    if ('bg' in c) { S.bg = c.bg; renderBg(c.bg, true); next(); return false; }
    if ('set' in c) { applySet(c.set); next(); return false; }
    if ('put' in c) { // 절대값 대입
      Object.keys(c.put).forEach(function (k) { setPath(S.vars, k, c.put[k], false); });
      updateHud(); next(); return false;
    }
    warn('알 수 없는 명령: ' + JSON.stringify(c));
    next(); return false;
  }

  function run() {
    for (var guard = 0; guard < 5000; guard++) {
      var cmds = STORY.scenes[S.scene];
      if (!cmds) { warn('없는 씬: ' + S.scene); toTitle(); return; }
      if (S.pc >= cmds.length) { warn('씬이 끝났지만 goto/end 가 없음: ' + S.scene); toTitle(); return; }
      if (exec(cmds[S.pc])) return;
    }
    warn('무한 루프 의심: ' + S.scene);
    toTitle();
  }

  function showChoices(opts, talkpick) {
    stopFast();
    takeSnap('선택지');
    mode = 'choice';
    curOpts = opts;
    curPick = !!talkpick;
    stopTyping();
    E.nextMark.classList.remove('on');
    E.choices.innerHTML = '';
    opts.forEach(function (o) { E.choices.appendChild(makeChoiceBtn(o)); });
    if (talkpick) E.choices.appendChild(pickTools());
    E.choices.classList.remove('hidden');
    E.choices.scrollTop = 0;
  }

  // 선택지 클릭
  function pick(o) {
    if (mode !== 'choice') return;
    if (o.cost && (S.vars.gold || 0) < o.cost) return; // 골드 부족
    sfx('select');
    pushLog({ name: '', color: '', text: '▶ ' + interp(o.text), choice: true });
    E.choices.classList.add('hidden');
    curOpts = [];
    if (curPick && o.who && CHARACTERS[o.who]) { // 낮에 함께 보낼 히로인을 골랐다: 자유 대화/선물 대상으로 기억
      InnCore.ensure(S.vars); S.vars.gift.last = o.who;
      var lp = LLMCore.ensureState(S.vars);
      lp.last = o.who;
      if (lp.met.indexOf(o.who) < 0) lp.met.push(o.who);
    }
    curPick = false;
    if (o.act || o.ev || o.weekly) { CalCore.ensure(S.vars); S.vars.cal.act[S.vars.day || 1] = o.act ? o.act : o.weekly ? 'wk' : o.ev === 'walk' ? 'walk:' + o.who : 'h:' + o.who; }
    if (o.talk) { enterChat(o.talk, 'offer'); return; }
    if (o.giftto) { openGift('give', o.giftto, function () { next(); run(); }); return; }
    if (o.cost) applySet({ gold: -o.cost });
    applySet(o.set);
    if (o.put) { Object.keys(o.put).forEach(function (k) { setPath(S.vars, k, o.put[k], false); }); updateHud(); }
    if (o.goto) { if (!gotoScene(o.goto)) return; } else { next(); }
    run();
  }

  // 화면 탭: 타이핑 중이면 즉시 완성, 아니면 다음 줄
  //  fast=true: 오토/스킵이 부른 것 (사람이 탭하면 오토/스킵부터 꺼지므로 advance() 로 오지 않음)
  function advance(fast) {
    if (mode === 'chat') { if (typing) finishTyping(); return; }
    if (mode === 'card' && modal === 0) {
      sfx('tap');
      if (cardQueue) { var cq = cardQueue; cardQueue = null; showCard(cq.title, cq.sub, cq.tip); return; }   // 챕터 카드 -> 일차 카드
      E.card.classList.add('hidden'); next(); run(); return;
    }
    if (mode !== 'text' || modal > 0) return;
    if (typing) { finishTyping(); return; }
    sfx('tap');
    next();
    run();
  }

  // ---------- 선택지 버튼 ----------
  // 옵션: text, set, goto, if, cost(골드 소모), who(히로인 id: 얼굴+호감도 표시), tag(작은 라벨)
  function makeChoiceBtn(o) {
    var b = document.createElement('button');
    b.className = 'choice-btn';
    b.type = 'button';
    var locked = !!o.cost && (S.vars.gold || 0) < o.cost;
    var body = document.createElement('span');
    body.className = 'ch-text';
    body.textContent = interp(o.text);
    if (o.who && CHARACTERS[o.who]) {
      var ch = CHARACTERS[o.who], v = (S.vars.aff && S.vars.aff[o.who]) || 0;
      b.classList.add('who');
      b.dataset.who = o.who;
      var pic = document.createElement('span');
      pic.className = 'who-pic';
      pic.style.borderColor = ch.color;
      var im = document.createElement('img');
      im.alt = ''; setIcon(im, ch);
      pic.appendChild(im);
      var head = document.createElement('span');
      head.className = 'who-head';
      var nm = document.createElement('b');
      nm.textContent = ch.name; nm.style.color = ch.color;
      var hh = document.createElement('em');
      hh.className = 'hearts'; hh.innerHTML = heartsHtml(v);
      head.appendChild(nm); head.appendChild(hh);
      var wrap = document.createElement('span');
      wrap.className = 'who-body';
      wrap.appendChild(head); wrap.appendChild(body);
      b.appendChild(pic); b.appendChild(wrap);
    } else {
      b.appendChild(body);
    }
    if (o.cost || o.tag) {
      var tg = document.createElement('span');
      tg.className = 'ch-tag' + (o.cost ? ' cost' : '');
      tg.textContent = o.cost ? (locked ? '골드 부족 (' + o.cost + 'G)' : '-' + o.cost + 'G') : o.tag;
      b.appendChild(tg);
    }
    if (locked) { b.disabled = true; b.classList.add('locked'); }
    b.addEventListener('click', function (ev) { ev.stopPropagation(); pick(o); });
    return b;
  }

  // ---------- 일차 전환 카드 ----------
  function showCard(title, sub, tip, opt) {
    var chap = !!(opt && opt.chapter);
    E.card.classList.toggle('chapter', chap);
    stopFast();
    stopTyping();
    clearCg();
    E.dialog.classList.add('hidden');
    E.choices.classList.add('hidden');
    E.cardTitle.textContent = title;
    E.cardSub.textContent = sub;
    E.cardTip.textContent = tip || '';
    var h = '<div class="card-stat"><span><i class="coin"></i>' + (S.vars.gold || 0) + ' G</span><span><i class="star">★</i> ' + (S.vars.rep || 0) + '</span></div>';
    Object.keys(CHARACTERS).forEach(function (id) {
      var c = CHARACTERS[id];
      if (!c.affinity) return;
      var v = (S.vars.aff && S.vars.aff[id]) || 0;
      h += '<div class="card-aff"><span style="color:' + c.color + '">' + c.name + '</span><em class="hearts">' + heartsHtml(v) + '</em></div>';
    });
    if (!chap) {
      var fs2 = CalCore.fatState(S.vars);
      h += '<div class="card-fat" data-level="' + fs2.level + '"><span>피로</span><i class="fatbar"><u style="width:' + Math.round(S.vars.fat || 0) + '%"></u></i><b>' + (fs2.level === 'fresh' ? '쌩쌩' : fs2.label) + '</b></div>';
    }
    E.cardBody.innerHTML = chap ? '' : h;
    E.card.classList.remove('hidden');
    E.card.classList.remove('in'); void E.card.offsetWidth; E.card.classList.add('in');
    mode = 'card';
  }

  // ---------- 주간 정산 카드 (일요일 밤 / 폭풍의 밤 끝: {weekcard:true}) ----------
  function showWeekCard() {
    var T = CALENDAR, d = S.vars.day || 1, wk = CalCore.weekOf(d), d0 = (wk - 1) * 7 + 1, d1 = Math.min(wk * 7, T.total);
    var W = S.vars.wk || { day: d0, gold: (STORY.init && STORY.init.gold) || 0, rep: 0, aff: {}, rank: 1 };
    var lg = (S.vars.cal && S.vars.cal.log) || {}, net = 0, strip = '';
    for (var x = d0; x <= d1; x++) {
      var inf = CalCore.info(x), r = lg[x], q = r ? r.q : (inf.holiday ? '休' : '·');
      if (r) net += r.g || 0;
      strip += '<span class="wd' + (inf.holiday ? ' hol' : '') + '"><small>' + inf.dowName + '</small>' + q + '</span>';
    }
    InnCore.ensure(S.vars);
    var rk = S.vars.inn.rank || 1, drep = (S.vars.rep || 0) - (W.rep || 0), dgold = (S.vars.gold || 0) - (W.gold || 0);
    var sgn = function (n) { return (n > 0 ? '+' : '') + n; };
    var h = '<div class="card-days">' + strip + '</div>';
    h += '<div class="card-aff"><span>영업 순이익</span><em>' + sgn(net) + ' G</em></div>';
    h += '<div class="card-aff"><span>금고 (이번 주)</span><em>' + (S.vars.gold || 0) + ' G (' + sgn(dgold) + ')</em></div>';
    h += '<div class="card-aff"><span>평판</span><em>' + (S.vars.rep || 0) + ' (' + sgn(drep) + ')</em></div>';
    h += '<div class="card-aff"><span>여관 등급</span><em>' + InnCore.starStr(rk) + (rk > (W.rank || 1) ? ' (오름!)' : '') + '</em></div>';
    var best = null, bd = 0;
    Object.keys(CHARACTERS).forEach(function (id) {
      var c = CHARACTERS[id];
      if (!c.affinity) return;
      var v = (S.vars.aff && S.vars.aff[id]) || 0, dv = v - ((W.aff && W.aff[id]) || 0);
      if (dv > bd) { bd = dv; best = c.name; }
      h += '<div class="card-aff"><span style="color:' + c.color + '">' + c.name + '</span><em><b class="hearts">' + heartsHtml(v) + '</b> ' + sgn(dv) + '</em></div>';
    });
    var tip = (net > 0 ? '이번 주도 영업으로 ' + net + '골드를 남겼어요.' : '이번 주 영업은 적자였어요.') + (best ? ' 가장 가까워진 사람은 ' + best + '예요.' : ' 이번 주는 누구와도 가까워지지 못했어요.');
    stopFast(); stopTyping(); clearCg();
    E.card.classList.remove('chapter');
    E.dialog.classList.add('hidden'); E.choices.classList.add('hidden');
    E.cardTitle.textContent = wk + '주차 정산';
    E.cardSub.textContent = '마감 · ' + d + '일차 밤';
    E.cardTip.textContent = tip;
    E.cardBody.innerHTML = h;
    E.card.classList.remove('hidden');
    E.card.classList.remove('in'); void E.card.offsetWidth; E.card.classList.add('in');
    sfx('discover');
    mode = 'card';
  }

  // 화면 효과
  function fxPlay(kind) {
    if (kind === 'shake') sfx('quake');   // 화면 흔들림에는 저음 럼블이 같이 난다
    var el = kind === 'flash' ? E.flash : E.game;
    var cls = kind === 'flash' ? 'on' : 'shake';
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 800);
  }

  // ---------- 엔딩 ----------
  function endingDef(id) {
    var l = endingDefs();
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }
  function markEnding(id) {
    var rec = readEndings(), isNew = !rec[id];
    if (isNew) { rec[id] = Date.now(); store.set('endings', JSON.stringify(rec)); }
    return isNew;
  }
  function showEnding(id, isNew) {
    stopFast();
    stopTyping();
    clearCg();
    E.dialog.classList.add('hidden');
    E.choices.classList.add('hidden');
    var def = endingDef(id) || { id: id, title: id, desc: '' };
    var rec = readEndings(), total = endingDefs().length, got = Object.keys(rec).length;
    E.endLabel.textContent = 'ENDING ' + (endingDefs().indexOf(def) + 1) + ' / ' + total;
    E.endTitle.textContent = def.title;
    E.endDesc.textContent = def.desc || '';
    E.endRank.textContent = InnCore.endingLine(S.vars);
    E.endNew.classList.toggle('hidden', !isNew);
    E.endCount.textContent = '획득한 엔딩 ' + got + ' / ' + total;
    var ch = CHARACTERS[def.heroine];
    E.endPic.classList.toggle('hidden', !ch);
    if (ch) { E.endPic.classList.toggle('thumb', !!ch.icon); E.endPic.src = ch.icon || ch.faces[def.face] || ch.faces.smile || ch.faces[Object.keys(ch.faces)[0]]; }
    var h = '';
    h += '<div class="sum-row"><span>골드 / 평판</span><b>' + (S.vars.gold || 0) + ' G / ' + (S.vars.rep || 0) + '</b></div>';
    Object.keys(CHARACTERS).forEach(function (cid) {
      var c = CHARACTERS[cid];
      if (!c.affinity) return;
      var v = (S.vars.aff && S.vars.aff[cid]) || 0;
      h += '<div class="sum-row"><span style="color:' + c.color + '">' + c.name + '</span><b>' + v + ' <em class="hearts">' + heartsHtml(v) + '</em></b></div>';
    });
    E.endBody.innerHTML = h;
    E.ending.classList.remove('hidden');
    mode = 'ending';
  }
  // 타이틀의 엔딩 목록: 획득한 것은 제목/설명, 못 얻은 것은 ??? + 힌트
  function openEndingList() {
    var rec = readEndings(), list = endingDefs(), got = 0;
    E.endingListBody.innerHTML = '';
    list.forEach(function (d) {
      var have = !!rec[d.id]; if (have) got++;
      var row = document.createElement('div');
      row.className = 'end-row' + (have ? ' got' : '');
      var ch = CHARACTERS[d.heroine];
      var pic = document.createElement('span');
      pic.className = 'end-pic';
      if (have && ch) { var im = document.createElement('img'); im.alt = ''; setIcon(im, ch, d.face || 'smile'); pic.appendChild(im); pic.style.borderColor = ch.color; }
      else pic.textContent = have ? '★' : '?';
      var tx = document.createElement('span');
      tx.className = 'end-tx';
      var t = document.createElement('b'); t.textContent = have ? d.title : '???';
      var s2 = document.createElement('small'); s2.textContent = have ? d.desc : '힌트: ' + d.hint;
      tx.appendChild(t); tx.appendChild(s2);
      row.appendChild(pic); row.appendChild(tx);
      E.endingListBody.appendChild(row);
    });
    E.endingListCount.textContent = got + ' / ' + list.length;
    openOverlay(E.endingList);
  }

  // ---------- 결과 요약 ----------
  function showSummary(opt) {
    stopFast();
    stopTyping();
    E.dialog.classList.add('hidden');
    E.summaryTitle.textContent = opt.title || '결과';
    E.summaryNote.textContent = opt.note || '';
    var h = '';
    h += '<div class="sum-row"><span>골드</span><b>' + (S.vars.gold || 0) + '</b></div>';
    h += '<div class="sum-row"><span>평판</span><b>' + (S.vars.rep || 0) + '</b></div>';
    Object.keys(CHARACTERS).forEach(function (id) {
      var c = CHARACTERS[id];
      if (!c.affinity) return;
      var v = (S.vars.aff && S.vars.aff[id]) || 0;
      h += '<div class="sum-row"><span style="color:' + c.color + '">' + c.name + ' 호감도</span><b>' + v + ' <em class="hearts">' + heartsHtml(v) + '</em></b></div>';
    });
    E.summaryBody.innerHTML = h;
    E.summary.classList.remove('hidden');
    mode = 'summary';
  }

  // ---------- 세이브 / 로드 ----------
  function startNew() {
    stopFast();
    S = freshState();
    EventCore.ensure(S.vars, function () { return Math.floor(Math.random() * 4294967296); });   // 이번 회차의 랜덤 사건 시드 (세이브에 저장됨)
    InnCore.ensure(S.vars);
    var rw = collectStats().rewards, bonus = 0;
    if (rw.gold) { bonus = REWARD_GOLD; S.vars.gold = (S.vars.gold || 0) + bonus; }   // 수집 보상: 엔딩 3개 이상이면 시작 골드 +30
    if (rw.allRecipes && OPT.allRecipes) {                                            // 수집 보상: 레시피 도감 완성 -> 메뉴판 전부 공개 (설정에서 켠 경우)
      TavernCore.ensure(TAVERN, S.vars);
      Object.keys(TAVERN.recipes).forEach(function (id) { S.vars.tavern.known[id] = true; });
    }
    if (globalThis.BGM) BGM.play('stop');
    chatReset();
    tvReset();
    closeAllOverlays();
    E.summary.classList.add('hidden');
    E.ending.classList.add('hidden');
    E.card.classList.add('hidden');
    renderCg(null);
    POS.forEach(function (p) { E.sprites[p].classList.remove('on'); });
    showScreen('game');
    updateHud();
    renderBg(null);
    run();
    if (bonus && mode === 'card') E.cardTip.textContent = (E.cardTip.textContent ? E.cardTip.textContent + '\n' : '') + '★ 수집 보상: 시작 골드 +' + bonus + 'G';
  }
  function loadSnap(sn) {
    if (!sn || !STORY.scenes[sn.scene]) { toTitle(); return; }
    stopFast();
    S = clone(sn);
    delete S.label;
    if (globalThis.BGM) BGM.play(S.bgm || 'stop');
    chatReset();
    tvReset();
    closeAllOverlays();
    E.summary.classList.add('hidden');
    E.ending.classList.add('hidden');
    E.card.classList.add('hidden'); cardQueue = null;
    showScreen('game');
    updateHud();
    renderBg(S.bg, false);
    renderSprites(null);
    renderCg(S.cg || null, false);
    run();
  }

  // 슬롯 목록 화면. kind: 'save' | 'load'
  function openSlots(kind) {
    E.slotsTitle.textContent = kind === 'save' ? '저장하기' : '불러오기';
    E.slotList.innerHTML = '';
    var keys = kind === 'save' ? ['s1', 's2', 's3'] : ['auto', 'wk', 's1', 's2', 's3'];
    if (kind === 'save' && snapLocked) toast('영업 중 저장은 영업 시작 시점으로 저장돼요', 'down');
    keys.forEach(function (k) {
      var d = readSlot(k);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot-btn';
      b.disabled = kind === 'load' && !d;
      var name = k === 'auto' ? '자동 저장' : k === 'wk' ? '주차 시작 저장' : '슬롯 ' + k.slice(1);
      var info = '비어 있음';
      if (d) {
        var dt = new Date(d.t);
        var v = d.snap.vars;
        info = (dt.getMonth() + 1) + '/' + dt.getDate() + ' ' + String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0') +
          ' · 골드 ' + (v.gold || 0) + ' · 평판 ' + (v.rep || 0) + '\n' + (d.snap.label || '');
      }
      b.innerHTML = '<strong></strong><span></span>';
      b.firstChild.textContent = name;
      b.lastChild.textContent = info;
      b.addEventListener('click', function () {
        if (kind === 'save') {
          if (!snap) return;
          var ok = writeSlot(k, snap);
          toast(ok ? name + '에 저장했어요' : '저장할 수 없어요 (저장소 사용 불가)', ok ? 'up' : 'down');
          openSlots('save'); // 목록 갱신
        } else if (d) {
          closeOverlay(E.slots);
          loadSnap(d.snap);
        }
      });
      E.slotList.appendChild(b);
    });
    openOverlay(E.slots);
  }


  // ---------- 달력 ----------
  var ACT_NAME = { work: '일', rest: '쉼', town: '장', fix: '수리', wk: '주간' };
  function actText(a) {
    if (!a) return null;
    var m = /^(h|walk):(\w+)$/.exec(a);
    if (m) { var ch = CHARACTERS[m[2]] || {}, nm = ch.name || m[2]; return m[1] === 'walk' ? { t: '산책', full: nm + '와 산책', c: ch.color } : { t: nm.slice(0, 2), full: nm + '와 시간', c: ch.color }; }
    var FULL = { work: '여관 일에 집중', rest: '푹 쉼', town: '이웃 마을 장보기', fix: '여관 손보기', wk: '주간 이벤트' };
    return { t: ACT_NAME[a] || '', full: FULL[a] || '', c: '' };
  }
  function calDetail(cell) {
    var inf = CalCore.info(cell.day), parts = [inf.week + '주차 · ' + cell.day + '일 (' + inf.dowName + ') — ' + inf.chapter.label + ' ' + inf.chapter.title];
    if (cell.title) parts.push('★ ' + cell.title);
    else if (cell.state === 'future') parts.push(inf.holiday ? '휴일: 영업 없이 푹 쉬는 날' : '평범한 하루');
    var lg = (S.vars.cal.log || {})[cell.day], ac = actText((S.vars.cal.act || {})[cell.day]);
    if (cell.state !== 'future') {
      if (ac && ac.t) parts.push('낮: ' + ac.full);
      if (lg) parts.push('영업 ' + lg.q + ' · 순이익 ' + (lg.g >= 0 ? '+' : '') + lg.g + 'G');
      else if (inf.holiday) parts.push('휴일 (영업 없음)');
    }
    E.calInfo.textContent = parts.join('\n');
  }
  function openCalendar() {
    CalCore.ensure(S.vars);
    var cells = CalCore.cells(S.vars), sel = S.vars.day || 1;
    E.calGrid.innerHTML = '';
    CALENDAR.dow.forEach(function (d, i) { var h = document.createElement('div'); h.className = 'cal-dow' + (i === CALENDAR.holidayDow ? ' sun' : ''); h.textContent = d; E.calGrid.appendChild(h); });
    for (var pad = 0; pad < CALENDAR.startDow; pad++) E.calGrid.appendChild(document.createElement('div'));
    cells.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.dataset.day = c.day;
      b.className = 'cal-cell ' + c.state + (c.holiday ? ' hol' : '') + (c.mark && c.mark !== '휴' ? ' ev' : '') + ' w' + (c.week % 2);
      var ac = actText(c.act);
      b.innerHTML = '<em>' + c.day + '</em><i class="mk">' + (c.mark || '') + '</i><b class="rs">' + (c.res || '') + '</b>' +
        (ac && ac.t ? '<small class="ac"' + (ac.c ? ' style="color:' + ac.c + '"' : '') + '>' + ac.t + '</small>' : '');
      b.addEventListener('click', function () { E.calGrid.querySelectorAll('.cal-cell.sel').forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); calDetail(c); sfx('tap'); });
      if (c.day === sel) b.classList.add('sel');
      E.calGrid.appendChild(b);
    });
    // 다가오는 일정: 공개된 메인 사건
    var up = cells.filter(function (c) { return c.state === 'future' && c.title && c.mark !== '휴'; });
    E.calList.innerHTML = up.length ? '<b>예정된 일</b>' + up.map(function (c) { return '<span>' + c.mark + ' ' + c.day + '일 ' + c.title + '</span>'; }).join('') : '';
    calDetail(cells[sel - 1]);
    openOverlay(E.calendar);
  }

  function openBacklog() {
    E.backlogList.innerHTML = '';
    S.log.forEach(function (l) {
      var d = document.createElement('div');
      d.className = 'log-item' + (l.choice ? ' choice' : '');
      if (l.name) {
        var n = document.createElement('div');
        n.className = 'log-name'; n.textContent = l.name; n.style.color = l.color;
        d.appendChild(n);
      }
      var t = document.createElement('div');
      t.className = 'log-text'; t.textContent = l.text;
      d.appendChild(t);
      E.backlogList.appendChild(d);
    });
    openOverlay(E.backlog);
    E.backlogList.scrollTop = E.backlogList.scrollHeight;
  }

  function ask(msg, onYes) {
    E.confirmMsg.textContent = msg;
    E.confirmYes.onclick = function () { closeOverlay(E.confirm); onYes(); };
    openOverlay(E.confirm);
  }

  // ---------- 저녁 영업 (VA-11 Hall-A 식 주문 조합) ----------
  // 흐름: {tavern:'dayN'} -> 장보기 -> 손님마다 [등장 대사 -> 애매한 주문 -> 재료 고르기 -> 내기 -> 판정 -> 반응 대사] -> 하루 결산
  // 손님 대사는 일반 대사창을 쓰기 위해 임시 씬 '__tv' 를 만들어 그대로 실행한다.
  // 세이브: 영업이 시작되면 그 시점의 스냅샷으로 고정(snapLocked)되므로, 영업 중에 저장/불러오기를 하면 영업 시작 전으로 돌아간다.
  var TVE = {}; // 영업 화면 요소 캐시

  function tvReset() { // 타이틀/불러오기/새 게임 때 영업 상태 정리
    TV = null; snapLocked = false;
    TUT.next = ''; tutHide();
    if (TVE.root) {
      TVE.root.classList.add('hidden');
      ['brew', 'shop', 'sum', 'upg', 'lodge', 'menu', 'notes', 'found', 'stamp'].forEach(function (k) { TVE[k].classList.add('hidden'); });
      TVE.prog.classList.add('hidden');
      E.game.classList.remove('tv-brew');
    }
    if (STORY.scenes && STORY.scenes.__tv) delete STORY.scenes.__tv;
  }
  function tvPanel(name) { // 영업 화면 하나만 보이게 (menu/found 는 위에 겹쳐서 쓰므로 따로 다룸)
    ['brew', 'shop', 'sum', 'upg', 'lodge'].forEach(function (k) { TVE[k].classList.toggle('hidden', k !== name); });
    E.game.classList.toggle('tv-brew', name === 'brew');
  }
  function tvEl(tag, cls, html) {
    var d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d;
  }
  function tvIcon(id, cls) {
    var im = document.createElement('img'); im.alt = ''; im.className = cls || 'tv-icon';
    im.src = (TAVERN.ingredients[id] || {}).icon || ''; return im;
  }
  function tagChips(tags) {
    return tags.map(function (t) { var c = (TAVERN.tags[t] || {}).color || '#ccc'; return '<em class="tv-tag" style="border-color:' + c + ';color:' + c + '">' + t + '</em>'; }).join('');
  }
  function tvGold() { return S.vars.gold || 0; }

  // 레시피 해금 (대화/이벤트/업그레이드)
  function learnRecipes(ids) {
    TavernCore.ensure(TAVERN, S.vars);
    ids.forEach(function (id) {
      var r = TAVERN.recipes[id];
      if (!r) { warn('없는 레시피: ' + id); return; }
      if (TavernCore.learn(S.vars, id)) {
        toast('레시피 해금: ' + r.name, 'up');
        pushLog({ name: '', color: '', text: '★ 레시피 해금: ' + r.name });
      }
    });
    recordKnown();
  }

  function startTavern(dayId) {
    if (dayId === 'routine') dayId = TavernCore.routine(TAVERN, S.vars, S.vars.day || 1, evalCond);   // 일상일: 그날의 손님을 만들어 등록 (story/tavern-routine.js)
    var def = TAVERN.days[dayId];
    if (!def) { warn('없는 영업 데이터: ' + dayId); next(); return false; }
    TavernCore.ensure(TAVERN, S.vars);
    TavernCore.resetToday(S.vars);
    stopFast();
    clearCg();
    recordKnown();
    takeSnap('저녁 영업');            // 영업 중 저장은 이 시점으로 되돌아간다
    snapLocked = true;
    TV = {
      id: dayId, def: def, ret: { scene: S.scene, pc: S.pc },
      queue: TavernCore.queue(TAVERN, dayId, S.vars, evalCond), idx: -1, cur: null,
      results: [], sold: 0, tips: 0, spent: 0, repSum: 0, sel: [], phase: 'shop', note: '', startGold: tvGold(), startRep: S.vars.rep || 0,
      spGold: 0, spResult: null, tasteHits: 0, reward: null, free: !!def.free, bought: {}, cart: {}
    };
    if (def.bg) { S.bg = def.bg; renderBg(def.bg, true); }
    POS.forEach(function (p) { S.sprites[p] = null; });
    renderSprites(null);
    stopTyping();
    E.dialog.classList.add('hidden'); E.choices.classList.add('hidden');
    TVE.root.classList.remove('hidden');
    mode = 'tavern';
    openShop();
    return true;
  }

  // ----- 장보기 -----
  function progText() {
    if (!TV) return '';
    if (TV.phase === 'shop') return '저녁 영업 준비';
    var cu = TV.queue[TV.idx], t = '손님 ' + Math.min(TV.idx + 1, TV.queue.length) + ' / ' + TV.queue.length;
    if (cu && cu.sp && TV.phase !== 'summary') t += ' · 특별 ' + (cu.sp.i + 1) + '/' + cu.sp.n;
    return t;
  }
  function openShop() {
    TV.phase = 'shop';
    tvPanel('shop');
    TVE.prog.textContent = progText(); TVE.prog.classList.remove('hidden');
    renderShop();
  }
  function renderShop() {
    var st = S.vars.tavern.stock;
    TVE.shopGold.textContent = tvGold();
    var sp = TAVERN.specials && TAVERN.specials[TV.id];
    var tdn = (S.vars.today && S.vars.today.note) || '';   // 아침 랜덤 사건이 남긴 오늘의 사정
    TVE.shopInfo.textContent = (TV.free ? '무료 배식이라 오늘 매출과 팁은 없어요. 대신 평판과 호감도가 올라요.\n' : '') + '오늘 손님 ' + TV.queue.length + '명. 요리 하나에 재료가 2~3개 들어요. 모자라면 영업 중에 정중히 거절할 수 있지만 평판이 조금 깎입니다.' +
      (tdn ? '\n☆ 오늘의 사정 — ' + tdn : '') +
      (sp ? '\n★ 특별 주문 예고 — ' + sp.title + ': ' + sp.brief : '');
    var lb = S.vars.tavern.lastBuy || {}, lbN = Object.keys(lb).reduce(function (a, k) { return a + (lb[k] || 0); }, 0);
    TVE.shopLast.disabled = !lbN; TVE.shopLast.title = lbN ? '지난 장보기: ' + Object.keys(lb).map(function (k) { return TAVERN.ingredients[k].name + '×' + lb[k]; }).join(', ') : '지난 장보기 기록이 없어요';
    TVE.shopList.innerHTML = '';
    cartClamp();
    Object.keys(TAVERN.ingredients).forEach(function (id) {
      var g = TAVERN.ingredients[id], pr = TavernCore.price(TAVERN, S.vars, id), q = TV.cart[id] || 0, have = shopRefundable(id);
      var row = tvEl('div', 'tv-row');
      row.dataset.id = id;
      row.appendChild(tvIcon(id, 'tv-icon'));
      var mid = tvEl('div', 'tv-row-mid', '<b>' + g.name + '</b><small>' + (pr !== g.price ? '<s>' + g.price + '</s> <em class="tv-sale' + (pr > g.price ? ' up' : '') + '">' + pr + 'G</em>' : pr + 'G') + ' · 재고 <span class="tv-stk">' + (st[id] || 0) + '</span>' + (have ? ' · <span class="tv-have">오늘 산 물건 ' + have + '</span>' : '') + '</small>');
      row.appendChild(mid);
      row.appendChild(stepper(q, q > -have, tvGold() - cartNet() >= pr,
        function () { shopStep(id, -1); }, function () { shopStep(id, 1); }));
      TVE.shopList.appendChild(row);
    });
    // 합계 / 구매 후 잔액
    var net = cartNet(), after = tvGold() - net, empty = !cartCount();
    TVE.shopSum.innerHTML = empty ? '장바구니가 비었어요. 구매 후 잔액 <b>' + after + ' G</b>'
      : (net > 0 ? '결제 <b class="minus">-' + net + ' G</b>' : net < 0 ? '환불 <b class="plus">+' + (-net) + ' G</b>' : '변동 없음') + ' · 구매 후 잔액 <b>' + after + ' G</b>';
    TVE.shopConfirm.disabled = empty; TVE.shopClear.disabled = empty;
  }
  // ----- 장바구니 공용 -----
  // [-] 수량 [+] 한 줄. q > 0 이면 담는 중(구매), q < 0 이면 반품 예약
  function stepper(q, canMinus, canPlus, onMinus, onPlus) {
    var w = tvEl('div', 'tv-step');
    var m = tvEl('button', 'tv-minus', '−'); m.type = 'button'; m.setAttribute('aria-label', '빼기'); m.disabled = !canMinus;
    var n = tvEl('span', 'tv-qty' + (q > 0 ? ' add' : q < 0 ? ' ret' : ''), q > 0 ? '+' + q : String(q)); n.title = q < 0 ? '반품' : '';
    var p = tvEl('button', 'tv-plus', '+'); p.type = 'button'; p.setAttribute('aria-label', '더하기'); p.disabled = !canPlus;
    m.addEventListener('click', function () { onMinus(); }); p.addEventListener('click', function () { onPlus(); });
    w.appendChild(m); w.appendChild(n); w.appendChild(p);
    return w;
  }
  function cartCount() { return Object.keys(TV.cart).reduce(function (a, k) { return a + Math.abs(TV.cart[k] || 0); }, 0); }
  // 아직 쓰지 않은 오늘 구매분 (장보기 중에는 재고를 쓰지 않으니 오늘 산 만큼, 재고를 넘지 않게)
  function shopRefundable(id) { return Math.max(0, Math.min(TV.bought[id] || 0, S.vars.tavern.stock[id] || 0)); }
  // 양수 = 낼 돈, 음수 = 돌려받을 돈
  function cartNet() {
    return Object.keys(TV.cart).reduce(function (a, id) { return a + (TV.cart[id] || 0) * TavernCore.price(TAVERN, S.vars, id); }, 0);
  }
  // 골드/재고가 바뀌어도 장바구니가 불가능한 상태로 남지 않게 다듬는다
  function cartClamp() {
    Object.keys(TV.cart).forEach(function (id) {
      if (!TV.cart[id]) { delete TV.cart[id]; return; }
      if (TV.cart[id] < -shopRefundable(id)) TV.cart[id] = -shopRefundable(id);
      if (!TV.cart[id]) delete TV.cart[id];
    });
  }
  function shopStep(id, d) {
    var pr = TavernCore.price(TAVERN, S.vars, id), q = TV.cart[id] || 0;
    if (d > 0 && tvGold() - cartNet() < pr) { toast('골드가 모자라요', 'down'); return; }
    if (d < 0 && q <= -shopRefundable(id)) return;
    sfx('tap');
    TV.cart[id] = q + d;
    if (!TV.cart[id]) delete TV.cart[id];
    renderShop();
  }
  // 장바구니에 담기만 한다 (확정은 사용자가). want = { 재료id: 개수 }, 잔액이 허락하는 만큼 (재료 정의 순서대로)
  function cartAdd(want) {
    var n = 0, cost = 0;
    Object.keys(TAVERN.ingredients).forEach(function (id) {
      var pr = TavernCore.price(TAVERN, S.vars, id);
      for (var k = 0; k < (want[id] || 0); k++) {
        if (tvGold() - cartNet() < pr) break;
        TV.cart[id] = (TV.cart[id] || 0) + 1; n++; cost += pr;
      }
      if (!TV.cart[id]) delete TV.cart[id];
    });
    renderShop();
    return { n: n, cost: cost };
  }
  function shopClear() { if (!cartCount()) return; sfx('tap'); TV.cart = {}; renderShop(); }
  // 구매 확정: 이때 비로소 골드 차감·재고 반영 (반품은 전액 환불)
  function shopConfirm() {
    cartClamp();
    var net = cartNet();
    if (!cartCount()) return;
    if (net > tvGold()) { toast('골드가 모자라요', 'down'); renderShop(); return; }
    var buyN = 0, retN = 0;
    Object.keys(TV.cart).forEach(function (id) {
      var q = TV.cart[id], pr = TavernCore.price(TAVERN, S.vars, id), t = S.vars.tavern;
      t.stock[id] = (t.stock[id] || 0) + q;
      if (!t.stock[id]) delete t.stock[id];
      TV.bought[id] = (TV.bought[id] || 0) + q;
      if (!TV.bought[id]) delete TV.bought[id];
      TV.spent += q * pr;
      if (q > 0) buyN += q; else retN -= q;
    });
    S.vars.gold -= net;
    TV.cart = {};
    sfx('coin');
    toast((buyN ? '구매 ' + buyN + '개' : '') + (buyN && retN ? ' · ' : '') + (retN ? '반품 ' + retN + '개' : '') + ' 확정 (' + (net > 0 ? '-' : '+') + Math.abs(net) + 'G)', net > 0 ? 'down' : 'up');
    updateHud(); renderShop();
  }
  function buyLast() {   // "지난번처럼 사기": 담기만 한다
    var r = cartAdd(S.vars.tavern.lastBuy || {});
    if (r.n) { sfx('coin'); toast('지난번처럼 ' + r.n + '개 담았어요 (' + r.cost + 'G) · 구매 확정을 눌러 주세요', 'up'); } else toast('담을 수 있는 게 없어요', 'down');
  }
  function buySuggest() {   // "추천 구매": 오늘 손님 주문을 아는 레시피로 맞추는 데 모자라는 재료만 (이미 담은 것은 재고로 친다)
    var stock = Object.assign({}, S.vars.tavern.stock);
    Object.keys(TV.cart).forEach(function (id) { if (TV.cart[id] > 0) stock[id] = (stock[id] || 0) + TV.cart[id]; });
    var fake = Object.assign({}, S.vars, { tavern: Object.assign({}, S.vars.tavern, { stock: stock }) });
    var plan = TavernCore.suggestBuy(TAVERN, fake, TV.queue, tvGold() - cartNet(), function (id) { return TavernCore.price(TAVERN, S.vars, id); });
    var r = cartAdd(plan.buy);
    if (r.n) { sfx('coin'); toast('추천 ' + r.n + '개 담았어요 (' + r.cost + 'G) · 구매 확정을 눌러 주세요', 'up'); } else toast(plan.cost ? '골드가 모자라요' : '이미 재료가 충분해요', plan.cost ? 'down' : 'up');
  }
  // 영업 시작: 장바구니에 담긴 게 있으면 사지 않고 나가는지 한 번 확인
  function shopStart() {
    var go = function () {
      TV.cart = {};
      if (TV && Object.keys(TV.bought).length) S.vars.tavern.lastBuy = Object.assign({}, TV.bought);   // 다음 "지난번처럼 사기"용
      TVE.shop.classList.add('hidden'); tvNextCustomer();
    };
    if (cartCount()) ask('담은 물건을 사지 않고 나갈까요?', go); else go();
  }

  // ----- 손님 한 명 -----
  // 대사 한 줄(문자열 / {text,face,who} / 명령 객체)을 명령 배열로
  function lineCmds(l, who, vars) {
    var fix = function (t) { return vars && vars.dish ? String(t).replace(/\{dish\}/g, vars.dish) : t; };
    if (typeof l === 'string') return [{ say: who, text: fix(l) }];
    if (l && l.text != null) { var o = { say: l.who || who, text: fix(l.text) }; if (l.face) o.face = l.face; return [o]; }
    return [l];
  }
  function noteHint(note, l) { // 들은 힌트 대사를 메모장에 기록 (중복 없이)
    var tx = typeof l === 'string' ? l : (l && l.text) || '';
    if (tx && note.hints.indexOf(tx) < 0) note.hints.push(tx);
  }
  function tvNextCustomer() {
    TV.idx++;
    TVE.stamp.classList.add('hidden'); // 앞 손님의 판정 도장 정리
    E.game.classList.remove('tv-brew');
    TVE.brew.classList.add('hidden');
    if (TV.idx >= TV.queue.length) { tvSummary(); return; }
    var cu = TV.queue[TV.idx];
    TV.cur = cu; TV.sel = []; TV.note = '';
    sfx('door');
    TV.phase = 'talk';
    TVE.prog.textContent = progText(); TVE.prog.classList.remove('hidden');
    var cmds = [{ hide: 'all' }, { show: cu.who, face: 'normal', pos: 'center' }];
    if (cu.sp && cu.sp.i === 0) cmds.splice(1, 0, { narr: '★ 특별 주문이 들어왔다! — ' + cu.sp.title }, { sfx: 'mystery' });
    var sayList = cu.say || [];
    if (OPT.fastTv && sayList.length > 1) sayList = sayList.slice(0, 1);   // 영업 빠른 모드: 등장 대사는 한 줄만
    sayList.forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who)); });
    // 단골의 숨은 취향: 첫 방문 때 은근한 힌트를 흘리고 메모장에 적어 둔다
    var cdef = TAVERN.customers[cu.who] || {}, note = TavernCore.note(S.vars, cu.who);
    note.met = true;
    if (cdef.taste && !note.first && !note.taste) {
      note.first = true;
      asList(cdef.taste.first).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who)); noteHint(note, l); });
    }
    var od = { say: cu.who, text: cu.order.text };
    if (cu.order.face) od.face = cu.order.face;
    cmds.push(od);
    cmds.push({ __tv: 'brew' });
    STORY.scenes.__tv = cmds; S.scene = '__tv'; S.pc = 0;
    run();
  }

  // ----- 재료 고르기 -----
  function openBrew() {
    stopFast();
    TV.phase = 'brew';
    stopTyping();
    E.dialog.classList.add('hidden'); E.choices.classList.add('hidden');
    renderSprites(null);
    mode = 'tavern';
    tvPanel('brew');
    renderBrew();
    if (!TUT.on && TV.id === 'day1' && TV.idx === 0 && !store.get('tut')) tutStart('brew');   // 첫 영업 첫 손님: 튜토리얼 (회차 공통 1회)
  }
  function selRecipe() { return TV.sel.length >= 2 ? TavernCore.recipeFor(TAVERN, TV.sel) : null; }
  function renderBrew() {
    var cu = TV.cur, ch = CHARACTERS[cu.who] || {}, st = S.vars.tavern.stock;
    TVE.cust.textContent = (cu.sp ? '★ 특별 주문 · ' : '') + (ch.name || cu.who); TVE.cust.style.color = ch.color || '#fff';
    TVE.orderText.textContent = '"' + cu.order.text + '"';
    TVE.orderNote.textContent = cu.order.note || ''; TVE.orderNote.classList.toggle('hidden', !cu.order.note);
    TVE.order.classList.toggle('sp', !!cu.sp);
    var nt0 = (S.vars.tavern.notes || {})[cu.who], tdef = (TAVERN.customers[cu.who] || {}).taste;
    TVE.orderTaste.textContent = (nt0 && nt0.taste && tdef) ? '★ 단골 취향: ' + tdef.label : '';
    TVE.orderTaste.classList.toggle('hidden', !(nt0 && nt0.taste && tdef));
    // 슬롯 3칸
    TVE.slots.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      (function (i) {
        var b = tvEl('button', 'tv-slot' + (TV.sel[i] ? ' on' : '') + (i === 2 ? ' opt' : ''));
        b.type = 'button'; b.setAttribute('aria-label', '슬롯 ' + (i + 1));
        if (TV.sel[i]) { b.appendChild(tvIcon(TV.sel[i], 'tv-icon')); b.addEventListener('click', function () { TV.sel.splice(i, 1); renderBrew(); }); }
        else b.textContent = i === 2 ? '+?' : '+';
        TVE.slots.appendChild(b);
      })(i);
    }
    // 재료 버튼 8개
    TVE.ings.innerHTML = '';
    Object.keys(TAVERN.ingredients).forEach(function (id) {
      var g = TAVERN.ingredients[id], n = st[id] || 0;
      var b = tvEl('button', 'tv-ing' + (TV.sel.indexOf(id) >= 0 ? ' sel' : '') + (n <= 0 ? ' empty' : ''));
      b.type = 'button'; b.dataset.id = id;
      b.appendChild(tvIcon(id, 'tv-icon'));
      b.appendChild(tvEl('b', null, g.name));
      b.appendChild(tvEl('i', 'tv-stock', '×' + n));
      b.addEventListener('click', function () { tapIng(id); });
      TVE.ings.appendChild(b);
    });
    // 안내 문구: 재료 설명 / 지금 조합 미리보기
    var note = TV.note;
    if (TV.sel.length >= 2 && OPT.easy) {   // 쉬운 모드(설정)에서만 완성 요리 미리보기. 기본은 메뉴판을 보고 직접 기억해야 한다
      var r = selRecipe();
      note = (r && S.vars.tavern.known[r.id]) ? '▶ ' + r.name + '  ' + tagChips(r.tags) : '▶ 처음 보는 조합이에요. 어떤 요리가 될까요?';
    }
    if (!TavernCore.canBrew(TAVERN, st)) note = '재료가 모자라요. 정중히 거절할 수 있어요.';
    TVE.note.innerHTML = note || (TV.sel.length >= 2 ? '어떤 요리가 될지는 내 봐야 알아요. 헷갈리면 "메뉴판"을 보세요.' : '재료를 2~3개 골라 "내기"를 눌러 보세요.');
    TVE.serve.disabled = TV.sel.length < 2;
    TVE.clear.disabled = TV.sel.length === 0;
  }
  function tapIng(id) {
    var st = S.vars.tavern.stock, at = TV.sel.indexOf(id);
    if (at >= 0) { TV.sel.splice(at, 1); }
    else {
      if ((st[id] || 0) <= 0) { toast(TAVERN.ingredients[id].name + ' 재고가 없어요', 'down'); return; }
      if (TV.sel.length >= 3) { toast('재료는 최대 3개까지예요', 'down'); return; }
      TV.sel.push(id);
    }
    TV.note = TAVERN.ingredients[id].name + ': ' + TAVERN.ingredients[id].note;
    renderBrew();
  }

  // ----- 내기 / 판정 / 반응 -----
  var RES_LABEL = { perfect: '대성공!', good: '보통', fail: '실패…', mystery: '정체불명?!', skip: '거절' };
  var stampTimer = 0;
  function showStamp(out) {
    TVE.stamp.className = 'r-' + out.result;
    TVE.stamp.innerHTML = '<b>' + RES_LABEL[out.result] + '</b><small>' + out.dish + (out.gold ? ' · +' + out.gold + 'G' + (out.tip ? ' (팁 ' + out.tip + ')' : '') : '') + '</small>';
    void TVE.stamp.offsetWidth; TVE.stamp.classList.add('go');
    clearTimeout(stampTimer);
    stampTimer = setTimeout(function () { if (TVE.stamp) TVE.stamp.classList.add('hidden'); }, OPT.fastTv ? 900 : 2300);
  }
  function doServe() {
    if (!TV || TV.phase !== 'brew' || TV.sel.length < 2) return;
    var cu = TV.cur, ids = TV.sel.slice();
    var out = TavernCore.serve(TAVERN, S.vars, cu.who, cu.order, ids, TV, cu);
    TV.results.push(out);
    TV.sold += out.sale; TV.tips += out.tip;
    if (out.taste) TV.tasteHits++;
    recordKnown(); recordNotes();   // 회차 공통 수집 기록 (레시피 도감 / 손님 메모)
    var d = {};
    if (out.gold) d.gold = out.gold;
    if (out.rep) d.rep = out.rep;
    if (out.aff) d['aff.' + cu.who] = out.aff;
    TV.phase = 'react';
    TVE.brew.classList.add('hidden'); E.game.classList.remove('tv-brew');
    var go = function () {
      sfx({ perfect: 'perfect', good: 'coin', fail: 'fail', mystery: 'mystery' }[out.result]);
      applySet(d, true);
      showStamp(out);
      if (out.taste) toast('★ 단골 보너스! 팁 +' + TAVERN.rules.tasteTip, 'up');
      if (out.tasteNew) setTimeout(function () { toast('손님 메모에 ' + ((CHARACTERS[cu.who] || {}).name || '') + '의 취향이 적혔어요', 'up'); sfx('discover'); }, 600);
      tvReaction(cu, out);
      if (TUT.next === 'result') tutStart('result');   // 튜토리얼 5단계: 결과 설명
    };
    if (out.discovered) showFound(out, go); else go();
  }
  function doSkip() {
    if (!TV || TV.phase !== 'brew') return;
    var cu = TV.cur, out = TavernCore.skip(TAVERN, S.vars, TV, cu);
    out.who = cu.who; out.dish = '거절'; out.sale = 0; out.tip = 0;
    TV.results.push(out);
    TV.phase = 'react';
    TVE.brew.classList.add('hidden'); E.game.classList.remove('tv-brew');
    if (out.rep) applySet({ rep: out.rep });
    var cmds = lineCmds({ text: TAVERN.skipLine || '아쉽지만… 다음에 다시 올게요.', face: 'sad' }, cu.who);
    cmds = cmds.concat(spVerdictCmds(cu));
    cmds.push({ __tv: 'next' });
    STORY.scenes.__tv = cmds; S.scene = '__tv'; S.pc = 0;
    run();
  }
  function asList(v) { return v == null ? [] : [].concat(v); }
  function tvReaction(cu, out) {
    var def = TAVERN.customers[cu.who] || { react: {} }, rc = def.react || {};
    var vars = { dish: out.dish }, lines = [];
    if (out.fav && rc.fav) lines = rc.fav;                     // 최애: 특별 대사 전부
    else if (out.hate && rc.hate) lines = rc.hate;             // 싫어하는 메뉴: 특별 리액션 전부
    else {
      var pool = cu[out.result] != null ? asList(cu[out.result]) : (rc[out.result] || []);
      var one = TavernCore.pick(pool);
      lines = one ? [one] : [];
    }
    var cmds = [];
    lines.forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who, vars)); });
    if (!OPT.fastTv) asList(cu.after).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who, vars)); });   // 빠른 모드는 덧붙는 대사를 생략
    // 단골 취향: 맞췄으면 보너스 대사, 주문은 맞췄는데 취향은 못 맞췄으면 (처음 한 번) 힌트 대사를 흘린다
    var td = def.taste, nt = TavernCore.note(S.vars, cu.who);
    if (td && out.taste) { var bl = TavernCore.pick(td.bonus); if (bl) cmds = cmds.concat(lineCmds(bl, cu.who, vars)); }
    else if (td && !nt.miss && !nt.taste && !out.fav && !out.hate && (out.result === 'fail' || out.result === 'good')) {
      nt.miss = true;
      asList(td.miss).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who, vars)); noteHint(nt, l); });
    }
    if (cu.reward && (out.result === 'perfect' || out.result === 'good')) {   // 귀족 같은 특별 손님의 사례금
      var rw = cu.reward;
      asList(rw.lines).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who, vars)); });
      cmds.push({ set: { gold: rw.gold || 0, rep: rw.rep || 0 } });
      TV.spGold += rw.gold || 0; TV.reward = { who: cu.who, gold: rw.gold || 0, rep: rw.rep || 0 };
    }
    var g = cu.gain;
    if (g && asList(g.on || ['perfect', 'good']).indexOf(out.result) >= 0 && !S.vars.tavern.known[g.learn]) {
      cmds.push({ learn: g.learn });
      asList(g.lines).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who, vars)); });
    }
    cmds = cmds.concat(spVerdictCmds(cu));
    cmds.push({ __tv: 'next' });
    STORY.scenes.__tv = cmds; S.scene = '__tv'; S.pc = 0;
    mode = 'text';
    run();
  }

  // 특별 주문의 마지막 손님이면 성공/실패를 판정하고 보상 대사/명령을 돌려준다 (아니면 빈 배열)
  function spVerdictCmds(cu) {
    if (!cu.sp || cu.sp.i !== cu.sp.n - 1) return [];
    var v = TavernCore.specialVerdict(TAVERN, TV.id, TV.results), t = S.vars.tavern, cmds = [];
    TV.spResult = v;
    t.sp[TV.id] = v.ok ? 'win' : 'lose';
    if (v.ok) t.spWin++; else t.spLose++;
    cmds.push({ narr: v.ok ? '★ 특별 주문 성공! — ' + v.title : '특별 주문을 채우지 못했다… — ' + v.title });
    asList(v.lines).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who)); });
    v.rep = TavernCore.capRep(TAVERN, TV, v.rep);   // 평판은 하루 한계(+2/-3) 안에서만 반영
    if (TV.free) v.gold = 0;   // 무료 배식: 특별 주문 사례금도 없다 (평판만)
    var st = {};
    if (v.gold) st.gold = v.gold;
    if (v.rep) st.rep = v.rep;
    if (Object.keys(st).length) cmds.push({ set: st });
    cmds.push({ sfx: v.ok ? 'perfect' : 'fail' });
    TV.spGold += v.gold;
    return cmds;
  }

  // ----- 레시피 발견 -----
  function showFound(out, cont) {
    var r = out.recipe;
    sfx('discover');
    TVE.stamp.classList.add('hidden');
    TVE.foundName.textContent = r.name;
    TVE.foundIng.innerHTML = '';
    r.ing.forEach(function (i, k) {
      if (k) TVE.foundIng.appendChild(tvEl('span', 'tv-plus', '+'));
      var w = tvEl('span', 'tv-found-ing'); w.appendChild(tvIcon(i, 'tv-icon')); w.appendChild(tvEl('small', null, TAVERN.ingredients[i].name));
      TVE.foundIng.appendChild(w);
    });
    TVE.foundTags.innerHTML = tagChips(r.tags) + '<em class="tv-price">' + r.price + 'G</em>';
    TVE.foundBtn.onclick = function () { TVE.found.classList.add('hidden'); cont(); };
    TVE.found.classList.remove('hidden');
  }

  // ----- 메뉴판 (알게 된 레시피) -----
  function openBoard(fillable) {
    sfx('page');
    var known = S.vars.tavern.known, ids = Object.keys(TAVERN.recipes), n = 0;
    TVE.boardList.innerHTML = '';
    ids.forEach(function (id) { if (known[id]) n++; });
    TVE.boardCount.textContent = '발견 ' + n + ' / ' + ids.length;
    // 주문 말 풀이
    TVE.boardTags.innerHTML = '';
    Object.keys(TAVERN.tags).forEach(function (t) {
      var g = TAVERN.tags[t];
      TVE.boardTags.appendChild(tvEl('div', 'tv-gloss', '<em class="tv-tag" style="border-color:' + g.color + ';color:' + g.color + '">' + t + '</em><span>' + g.words + '</span>'));
    });
    ids.sort(function (a, b) { return (known[b] ? 1 : 0) - (known[a] ? 1 : 0); }); // 아는 것 먼저 (같으면 정의 순서 유지)
    ids.forEach(function (id) {
      var r = TAVERN.recipes[id], isKnown = !!known[id];
      var row = tvEl('div', 'tv-recipe' + (isKnown ? '' : ' unk'));
      row.dataset.id = id;
      if (isKnown) {
        var ic = tvEl('div', 'tv-recipe-ing');
        r.ing.forEach(function (i) { ic.appendChild(tvIcon(i, 'tv-icon sm')); });
        row.appendChild(ic);
        row.appendChild(tvEl('div', 'tv-recipe-tx', '<b>' + r.name + '</b><span>' + tagChips(r.tags) + '</span>'));
        row.appendChild(tvEl('div', 'tv-recipe-price', r.price + 'G'));
        if (fillable) {
          row.classList.add('use');
          row.addEventListener('click', function () {
            var st = S.vars.tavern.stock;
            if (!r.ing.every(function (i) { return (st[i] || 0) > 0; })) { toast('재료가 모자라요', 'down'); return; }
            TV.sel = r.ing.slice(); TV.note = ''; TVE.menu.classList.add('hidden'); renderBrew();
          });
        }
      } else {
        row.appendChild(tvEl('div', 'tv-recipe-ing', '<span class="tv-q">?</span>'.repeat(r.ing.length)));
        row.appendChild(tvEl('div', 'tv-recipe-tx', '<b>???</b><span class="hint">' + (r.hint || '아직 모르는 레시피.') + '</span>'));
      }
      TVE.boardList.appendChild(row);
    });
    TVE.menu.classList.remove('hidden');
  }

  // ----- 손님 메모장: 만난 손님과 알아낸 취향 / 최애 (모르는 것은 ??? + 들은 힌트 대사) -----
  function openNotes() {
    sfx('page');
    var t = S.vars.tavern, notes = t.notes || {}, ids = Object.keys(TAVERN.customers), met = 0;
    TVE.notesList.innerHTML = '';
    ids.forEach(function (id) {
      var nt = notes[id], c = CHARACTERS[id] || {}, def = TAVERN.customers[id];
      if (!nt || !nt.met) return;
      met++;
      var row = tvEl('div', 'tv-note-row'); row.dataset.who = id;
      var pic = tvEl('span', 'tv-res-pic'); pic.style.borderColor = c.color || '#888';
      var im = document.createElement('img'); im.alt = ''; if (c.icon) setIcon(im, c); else im.src = (c.faces || {}).normal || ''; pic.appendChild(im);
      var body = tvEl('div', 'tv-note-body');
      body.appendChild(tvEl('b', null, ''));
      body.firstChild.textContent = c.name || id; body.firstChild.style.color = c.color || '#fff';
      var addHints = function (arr) {
        if (!arr.length) return;
        var hd = tvEl('div', 'tv-note-hint');
        arr.forEach(function (x) { var q = document.createElement('q'); q.textContent = x; hd.appendChild(q); });
        body.appendChild(hd);
      };
      if (def.taste) {
        body.appendChild(tvEl('div', 'tv-note-line' + (nt.taste ? ' known' : ''), nt.taste ? '취향 <em>★ ' + def.taste.label + '</em>' : '취향 <em>???</em>'));
        if (!nt.taste) addHints(nt.hints || []);
      } else if (def.heroine) {
        var fr = TAVERN.recipes[def.fav];
        body.appendChild(tvEl('div', 'tv-note-line' + (nt.fav ? ' known' : ''), nt.fav ? '최애 메뉴 <em>★ ' + fr.name + '</em> ' + tagChips(fr.tags) : '최애 메뉴 <em>???</em>'));
        if (!nt.fav) addHints([fr.hint || '낮에 그 사람이 흘린 말을 떠올려 보자.']);
        var hl = (nt.hate || []).map(function (r) { return TAVERN.recipes[r].name; });
        body.appendChild(tvEl('div', 'tv-note-line' + (hl.length ? ' known bad' : ''), hl.length ? '싫어하는 메뉴 <em>' + hl.join(', ') + '</em>' : '싫어하는 메뉴 <em>???</em>'));
        body.appendChild(giftNoteLine(id));
      } else {
        body.appendChild(tvEl('div', 'tv-note-line', '아직 알려진 취향이 없어요'));
      }
      row.appendChild(pic); row.appendChild(body);
      TVE.notesList.appendChild(row);
    });
    if (!met) TVE.notesList.appendChild(tvEl('p', 'tv-info', '아직 만난 손님이 없어요. 영업을 시작하면 손님이 이곳에 기록됩니다.'));
    TVE.notesCount.textContent = '만난 손님 ' + met + ' / ' + ids.length;
    TVE.notes.classList.remove('hidden');
  }

  // ----- 하루 결산 -----
  var RES_ICON = { perfect: '★', good: '○', fail: '✕', mystery: '？', skip: '－' };
  function tvSummary() {
    stopFast();
    TV.phase = 'summary';
    POS.forEach(function (p) { S.sprites[p] = null; });
    renderSprites(null);
    E.dialog.classList.add('hidden');
    tvPanel('sum');
    E.toasts.innerHTML = ''; // 마지막 손님의 알림이 결산 위에 남지 않게 정리
    TVE.prog.classList.add('hidden');
    var net = TV.sold + TV.tips + TV.spGold - TV.spent, repNow = TV.repSum + (TV.reward ? TV.reward.rep : 0);
    var aff = {};
    TV.results.forEach(function (r) { if (r.aff) aff[r.who] = (aff[r.who] || 0) + r.aff; });
    var h = '';
    h += '<div class="sum-row"><span>매출</span><b>+' + TV.sold + ' G</b></div>';
    h += '<div class="sum-row"><span>팁' + (TV.tasteHits ? ' (단골 보너스 ' + TV.tasteHits + '회)' : '') + '</span><b>+' + TV.tips + ' G</b></div>';
    if (TV.spResult) {
      var sr = TV.spResult;
      h += '<div class="sum-row sp ' + (sr.ok ? 'ok' : 'bad') + '"><span>★ 특별 주문 · ' + sr.title + '</span><b class="' + (sr.ok ? 'plus' : 'minus') + '">' + (sr.ok ? '성공 +' + sr.gold + ' G' : '실패') + (sr.rep ? ' / 평판 ' + (sr.rep > 0 ? '+' : '') + sr.rep : '') + '</b></div>';
    }
    if (TV.reward) h += '<div class="sum-row sp ok"><span>★ ' + ((CHARACTERS[TV.reward.who] || {}).name || '귀한 손님') + '의 사례</span><b class="plus">+' + TV.reward.gold + ' G / 평판 +' + TV.reward.rep + '</b></div>';
    h += '<div class="sum-row"><span>장보기</span><b>-' + TV.spent + ' G</b></div>';
    h += '<div class="sum-row total"><span>손익</span><b class="' + (net >= 0 ? 'plus' : 'minus') + '">' + (net >= 0 ? '+' : '') + net + ' G</b></div>';
    h += '<div class="sum-row"><span>평판</span><b class="' + (repNow >= 0 ? 'plus' : 'minus') + '">' + (repNow > 0 ? '+' : '') + repNow + '</b></div>';
    Object.keys(aff).forEach(function (id) {
      var c = CHARACTERS[id] || {};
      h += '<div class="sum-row"><span style="color:' + c.color + '">' + c.name + ' 호감도</span><b class="' + (aff[id] >= 0 ? 'plus' : 'minus') + '">♥ ' + (aff[id] > 0 ? '+' : '') + aff[id] + '</b></div>';
    });
    TVE.sumBody.innerHTML = h;
    TVE.sumIcons.innerHTML = '';
    TV.results.forEach(function (r) {
      var c = CHARACTERS[r.who] || {};
      var w = tvEl('div', 'tv-res r-' + r.result + (r.sp ? ' sp' : ''));
      w.title = (c.name || r.who) + ': ' + RES_LABEL[r.result];
      var pic = tvEl('span', 'tv-res-pic'); var im = document.createElement('img'); im.alt = ''; if (c.icon) setIcon(im, c); else im.src = (c.faces || {}).normal || ''; pic.appendChild(im);
      w.appendChild(pic);
      w.appendChild(tvEl('i', null, RES_ICON[r.result]));
      w.appendChild(tvEl('small', null, (c.name || r.who)));
      TVE.sumIcons.appendChild(w);
    });
    mode = 'tavern';
  }
  function tvClose() { // "영업 종료" -> 스토리로 복귀
    var t = S.vars.tavern;
    recordKnown(); recordNotes();
    t.days[TV.id] = { sales: TV.sold, tips: TV.tips, spent: TV.spent, rep: TV.repSum, special: TV.spResult ? (TV.spResult.ok ? 'win' : 'lose') : '', spGold: TV.spGold, perfect: t.t.perfect, good: t.t.good, fail: t.t.fail, mystery: t.t.mystery };
    var ret = TV.ret;
    var ts = t.t, tot = ts.perfect + ts.good + ts.fail + ts.mystery;   // 달력에 남기는 그날의 영업 결과 기호
    CalCore.ensure(S.vars);
    S.vars.cal.log[S.vars.day || 1] = { q: !tot ? '×' : ts.perfect / tot >= 0.6 ? '◎' : ts.perfect / tot >= 0.34 ? '○' : '△', g: TV.sold + TV.tips - TV.spent, r: TV.repSum };
    CalCore.addFat(S.vars, CALENDAR.fatigue.business);   // 영업을 마치면 피로가 쌓인다
    pushLog({ name: '', color: '', text: '— 영업 결산: 매출 ' + TV.sold + 'G, 팁 ' + TV.tips + 'G' + (TV.spGold ? ', 특별 주문 +' + TV.spGold + 'G' : '') + ', 장보기 ' + TV.spent + 'G —' });
    tvReset();
    S.scene = ret.scene; S.pc = ret.pc + 1;
    if (rankUp(run)) return;    // 영업 결과로 여관 등급이 올랐으면 축하 화면 먼저
    run();
  }

  // ----- 밤: 여관 업그레이드 -----
  // 지금 골드로 살 수 있는 여관 업그레이드/객실 개조가 하나라도 있나
  function anyBuyable() {
    InnCore.ensure(S.vars);
    var have = S.vars.tavern.upg, g = tvGold();
    return TAVERN.upgrades.some(function (u) { return !have[u.id] && g >= u.price && (!u.needs || have[u.needs]); }) ||
      LODGING.upgrades.some(function (u) { return InnCore.buyRoomUpg(S.vars, u) === 'ok'; });
  }
  // 이 밤 화면에서 산 것 (화면을 떠나기 전까지 취소 가능): { tav:{id:{learned:[새로 배운 레시피]}}, room:{id:true} }
  var UPB = { tav: {}, room: {} };
  function openUpgrades() {
    UPB = { tav: {}, room: {} };
    stopFast();
    TavernCore.ensure(TAVERN, S.vars);
    if (OPT.autoSkipUpg && !anyBuyable()) {   // 설정: 살 게 없으면 손보기 화면을 건너뛴다
      toast('살 수 있는 개조가 없어 손보기를 건너뛰었어요', 'up');
      next(); run(); return;
    }
    takeSnap('여관 업그레이드');
    stopTyping();
    E.dialog.classList.add('hidden'); E.choices.classList.add('hidden');
    TVE.root.classList.remove('hidden');
    tvPanel('upg');
    TVE.prog.classList.add('hidden');
    mode = 'tavern';
    renderUpgrades();
  }
  function renderUpgrades() {
    var have = S.vars.tavern.upg;
    TVE.upgGold.textContent = tvGold();
    TVE.upgList.innerHTML = '';
    TAVERN.upgrades.forEach(function (u) {
      var owned = !!have[u.id], lockedBy = u.needs && !have[u.needs] ? u.needs : '';
      var card = tvEl('div', 'tv-upg-card' + (owned ? ' owned' : '') + (lockedBy ? ' locked' : ''));
      card.dataset.id = u.id;
      card.appendChild(tvEl('div', 'tv-upg-tx', '<b>' + u.name + '</b><span>' + u.desc + '</span>'));
      var undo = owned && !!UPB.tav[u.id];
      var b = tvEl('button', 'tv-upg-buy' + (undo ? ' cancel' : ''), undo ? '취소<small>+' + u.price + 'G</small>' : owned ? '구입 완료' : lockedBy ? '먼저<small>' + upgName(lockedBy) + '</small>' : u.price + 'G');
      b.type = 'button';
      if ((owned && !undo) || (!owned && (lockedBy || tvGold() < u.price))) b.disabled = true;
      b.addEventListener('click', function () { if (undo) cancelUpgrade(u); else buyUpgrade(u); });
      card.appendChild(b);
      TVE.upgList.appendChild(card);
    });
    // 객실 개조 (숙박용, story/lodging.js)
    InnCore.ensure(S.vars);
    TVE.upgList.appendChild(tvEl('h3', 'tv-upg-sec', '객실 개조 <small>숙박 접수에서 요청을 맞추기 쉬워져요</small>'));
    LODGING.upgrades.forEach(function (u) {
      var st = InnCore.buyRoomUpg(S.vars, u), owned = st === 'owned';
      var card = tvEl('div', 'tv-upg-card room' + (owned ? ' owned' : ''));
      card.dataset.id = u.id;
      card.appendChild(tvEl('div', 'tv-upg-tx', '<b>' + u.name + '</b><span>' + u.desc + '</span>'));
      var undoR = owned && !!UPB.room[u.id];
      var b = tvEl('button', 'tv-upg-buy' + (undoR ? ' cancel' : ''), undoR ? '취소<small>+' + u.price + 'G</small>' : owned ? '개조 완료' : (st === 'rank' ? '★' + u.needRank + ' 필요' : u.price + 'G'));
      b.type = 'button';
      if ((owned && !undoR) || (!owned && st !== 'ok')) b.disabled = true;
      b.addEventListener('click', function () { if (undoR) cancelRoomUpg(u); else buyRoomUpg(u); });
      card.appendChild(b);
      TVE.upgList.appendChild(card);
    });
  }
  function buyRoomUpg(u) {
    if (InnCore.buyRoomUpg(S.vars, u) !== 'ok') return;
    S.vars.gold -= u.price;
    S.vars.lodge.upg[u.id] = true;
    UPB.room[u.id] = true;
    sfx('coin');
    toast('개조: ' + u.name, 'up');
    updateHud();
    takeSnap('객실 개조');
    renderUpgrades();
  }
  // 객실 개조 취소: 전액 환불
  function cancelRoomUpg(u) {
    if (!S.vars.lodge.upg[u.id] || !UPB.room[u.id]) return;
    S.vars.gold += u.price;
    delete S.vars.lodge.upg[u.id]; delete UPB.room[u.id];
    sfx('tap');
    toast('개조 취소: ' + u.name + ' (+' + u.price + 'G)', 'up');
    updateHud();
    takeSnap('객실 개조 취소');
    renderUpgrades();
  }
  // 업그레이드 취소: 전액 환불, 이 구매로 새로 해금된 레시피도 되돌린다
  function cancelUpgrade(u) {
    var rec = UPB.tav[u.id];
    if (!S.vars.tavern.upg[u.id] || !rec) return;
    if (TAVERN.upgrades.some(function (x) { return x.needs === u.id && S.vars.tavern.upg[x.id]; })) { toast('이 개조를 딛고 산 2단계부터 취소해 주세요', 'down'); return; }
    S.vars.gold += u.price;
    delete S.vars.tavern.upg[u.id];
    var book = readRec('recipes'), ch = false;
    rec.learned.forEach(function (id) {
      delete S.vars.tavern.known[id];
      if (rec.recNew.indexOf(id) >= 0 && book[id]) { delete book[id]; ch = true; }   // 수집 기록도 되돌림 (이 구매로 처음 기록된 것만)
    });
    if (ch) store.set('recipes', JSON.stringify(book));
    delete UPB.tav[u.id];
    sfx('tap');
    toast('구입 취소: ' + u.name + ' (+' + u.price + 'G)', 'up');
    updateHud();
    takeSnap('여관 업그레이드 취소');
    renderUpgrades();
  }
  function upgName(id) { var r = TAVERN.upgrades.filter(function (x) { return x.id === id; })[0]; return r ? r.name : id; }
  function buyUpgrade(u) {
    if (S.vars.tavern.upg[u.id] || tvGold() < u.price || (u.needs && !S.vars.tavern.upg[u.needs])) return;
    S.vars.gold -= u.price;
    S.vars.tavern.upg[u.id] = true;
    var before = Object.assign({}, S.vars.tavern.known), recBefore = readRec('recipes');
    if (u.learn) learnRecipes(u.learn);
    var fresh = (u.learn || []).filter(function (id) { return !before[id] && S.vars.tavern.known[id]; });
    UPB.tav[u.id] = { learned: fresh, recNew: fresh.filter(function (id) { return !recBefore[id]; }) };
    sfx('coin');
    toast('구입: ' + u.name, 'up');
    updateHud();
    takeSnap('여관 업그레이드'); // 구매 결과를 반영해 다시 저장 (불러와도 구매가 유지됨)
    renderUpgrades();
  }
  function closeUpgrades() {
    TVE.root.classList.add('hidden'); TVE.upg.classList.add('hidden');
    next(); run();
  }

  // ---------- 밤: 숙박 접수 ----------
  // {lodging:true}: 그날 묵으려는 손님 2~3팀(story/lodging.js)을 "손님을 누르고 -> 방을 누르면" 배정한다.
  //  요청에 맞는 방 = 숙박비 + 만족 보너스(여관 등급 점수), 안 맞는 방 = 기본 숙박비만, 거절/미배정 = 수입 없음.
  //  정산하면 골드/만족이 상태에 반영되고, 정산 직후 스냅샷을 저장한다 (불러와도 다시 정산하지 않음).
  var LG = null;   // { day, guests, rooms, assign:{손님:방}, rej:{손님:true}, sel:'손님id', stage:'pick'|'done' }
  function lodgeEls() {
    TVE.lodgeRooms = $('lodge-rooms'); TVE.lodgeGuests = $('lodge-guests'); TVE.lodgeResult = $('lodge-result');
    TVE.lodgeInfo = $('lodge-info'); TVE.lodgeNight = $('lodge-night'); TVE.lodgeDone = $('lodge-done');
  }
  function openLodging() {
    InnCore.ensure(S.vars);
    var day = S.vars.day || 1;
    if (InnCore.hasLodged(S.vars, day)) { next(); return false; }   // 이미 정산한 밤 (불러오기 등)
    stopFast(); stopTyping();
    TavernCore.ensure(TAVERN, S.vars);
    E.toasts.innerHTML = '';
    E.dialog.classList.add('hidden'); E.choices.classList.add('hidden');
    LG = { day: day, guests: InnCore.guestsFor(S.vars, day), assign: {}, rej: {}, sel: '', stage: 'pick', out: null };
    takeSnap('숙박 접수');
    TVE.root.classList.remove('hidden');
    tvPanel('lodge');
    TVE.prog.classList.add('hidden');
    mode = 'tavern';
    TVE.lodgeResult.classList.add('hidden');
    TVE.lodgeRooms.classList.remove('hidden'); TVE.lodgeGuests.classList.remove('hidden');
    renderLodging();
    return true;
  }
  function lodgeTotal() {
    var t = 0;
    LG.guests.forEach(function (g) { t += InnCore.quote(S.vars, g, LG.assign[g.id] || null).pay; });
    return t;
  }
  function renderLodging() {
    var rooms = InnCore.roomList(S.vars), byRoom = {};
    Object.keys(LG.assign).forEach(function (gid) { byRoom[LG.assign[gid]] = gid; });
    TVE.lodgeNight.textContent = LG.day + '일차 밤 · 손님 ' + LG.guests.length + '팀';
    var selDef = LG.sel ? InnCore.guestDef(LG.sel) : null;
    TVE.lodgeInfo.textContent = selDef
      ? selDef.name + '의 방을 눌러 정하세요. 요청: ' + LODGING.requests[selDef.req].label
      : '손님을 누른 뒤 방을 눌러 배정하세요. 요청에 맞는 방이면 숙박비에 보너스가 붙고 여관 평가가 올라요. 거절하거나 방이 없으면 수입이 없어요.';
    // 방 3개
    TVE.lodgeRooms.innerHTML = '';
    rooms.forEach(function (r) {
      var b = tvEl('button', 'lodge-room' + (r.open ? '' : ' closed') + (byRoom[r.id] ? ' used' : ''));
      b.type = 'button'; b.dataset.room = r.id;
      var occ = byRoom[r.id] ? InnCore.guestDef(byRoom[r.id]) : null;
      var tagTx = r.tags.map(function (t) { return LODGING.requests[t] ? LODGING.requests[t].label : t; }).join(' · ') || '평범한 방';
      b.innerHTML = '<b>' + r.name + '</b><span class="lodge-price">' + (r.open ? r.price + 'G' : '잠김') + '</span>' +
        '<small>' + (r.open ? tagTx : '다락 개조 필요') + '</small>' +
        '<em>' + (occ ? occ.name : (r.open ? '빈 방' : '')) + '</em>';
      if (!r.open) b.disabled = true;
      b.addEventListener('click', function () { lodgeRoomTap(r.id); });
      TVE.lodgeRooms.appendChild(b);
    });
    // 손님
    TVE.lodgeGuests.innerHTML = '';
    LG.guests.forEach(function (g) {
      var room = LG.assign[g.id] || null, q = InnCore.quote(S.vars, g, room);
      var card = tvEl('div', 'lodge-guest' + (LG.sel === g.id ? ' sel' : '') + (LG.rej[g.id] ? ' rej' : '') + (room ? ' set' : ''));
      card.dataset.guest = g.id;
      var gl = tvEl('span', 'lodge-glyph', g.glyph); gl.style.background = g.color;
      var tx = tvEl('div', 'lodge-gtx');
      tx.innerHTML = '<b></b><small></small><q></q>';
      tx.children[0].textContent = g.name; tx.children[1].textContent = g.kind + ' · 요청 [' + LODGING.requests[g.req].label + ']'; tx.children[2].textContent = g.say;
      var st = tvEl('span', 'lodge-state');
      if (LG.rej[g.id]) st.textContent = '거절';
      else if (room) { st.innerHTML = (q.match ? '<i class="ok">맞음</i>' : '<i class="no">안 맞음</i>') + ' ' + InnCore.roomList(S.vars).filter(function (r) { return r.id === room; })[0].short + ' +' + q.pay + 'G'; }
      else st.textContent = '미배정';
      var rj = tvEl('button', 'lodge-reject', LG.rej[g.id] ? '되돌리기' : '거절');
      rj.type = 'button';
      rj.addEventListener('click', function (ev) { ev.stopPropagation(); lodgeReject(g.id); });
      card.appendChild(gl); card.appendChild(tx); card.appendChild(st); card.appendChild(rj);
      card.addEventListener('click', function () { lodgeGuestTap(g.id); });
      TVE.lodgeGuests.appendChild(card);
    });
    TVE.lodgeDone.textContent = '접수 마감 (+' + lodgeTotal() + 'G)';
  }
  function lodgeGuestTap(gid) {
    if (!LG || LG.stage !== 'pick') return;
    sfx('tap');
    if (LG.rej[gid]) delete LG.rej[gid];
    LG.sel = LG.sel === gid ? '' : gid;
    renderLodging();
  }
  function lodgeRoomTap(rid) {
    if (!LG || LG.stage !== 'pick' || !InnCore.roomOpen(S.vars, rid)) return;
    var occ = Object.keys(LG.assign).filter(function (g) { return LG.assign[g] === rid; })[0];
    if (LG.sel) {
      if (occ && occ !== LG.sel) delete LG.assign[occ];          // 같은 방에 다른 손님이 있으면 내보낸다
      LG.assign[LG.sel] = rid; delete LG.rej[LG.sel];
      sfx('select'); LG.sel = '';
    } else if (occ) { delete LG.assign[occ]; sfx('tap'); }       // 손님을 고르지 않고 찬 방을 누르면 비운다
    renderLodging();
  }
  function lodgeReject(gid) {
    if (!LG || LG.stage !== 'pick') return;
    sfx('tap');
    if (LG.rej[gid]) delete LG.rej[gid]; else { LG.rej[gid] = true; delete LG.assign[gid]; if (LG.sel === gid) LG.sel = ''; }
    renderLodging();
  }
  function lodgeRecommend() {   // "추천 배정": 가장 잘 맞는 배정으로 채운다 (이후 직접 고쳐도 됨)
    if (!LG || LG.stage !== 'pick') return;
    LG.assign = InnCore.recommend(S.vars, LG.guests); LG.rej = {}; LG.sel = '';
    sfx('select'); renderLodging();
  }
  function lodgeFinish() {   // "접수 마감": 한 번 눌러 정산하고 곧바로 다음으로 (결과는 알림으로)
    if (!LG || LG.stage !== 'pick') return;
    var out = InnCore.settle(S.vars, LG.day, LG.assign);
    pushLog({ name: '', color: '', text: '— 숙박 정산: 수입 +' + out.gold + 'G' + (out.sat ? ', 만족 ' + out.sat : '') + ' —' });
    updateHud(); sfx(out.gold > 0 ? 'coin' : 'tap');
    LG = null; TVE.lodge.classList.add('hidden'); TVE.root.classList.add('hidden');
    CalCore.addFat(S.vars, CALENDAR.fatigue.lodging);   // 숙박 접수도 피곤하다
    updateHud();
    next();                      // 정산 직후 스냅샷은 다음 명령을 가리킨다 (불러와도 정산을 다시 하지 않음)
    takeSnap('숙박 정산');
    toast('숙박 수입 +' + out.gold + 'G' + (out.sat ? ' · 만족 ' + out.sat : ''), out.gold > 0 ? 'up' : 'down');
    run();
  }

  // ---------- 여관 등급 상승 연출 ----------
  var RK = { cont: null };
  function rankUp(cont) {
    var r = InnCore.checkRank(S.vars);
    updateHud();
    if (!r) return false;
    var to = r.to, texts = [];
    r.levels.forEach(function (n) {
      var u = INN_RANK.unlocks[n];
      if (!u) return;
      if (u.learn) learnRecipes(u.learn);
      texts.push('★' + n + ' 해금 — ' + u.text);
    });
    // 가장 가까운 히로인이 한마디
    var best = HEROINES.slice().sort(function (a, b) { return ((S.vars.aff || {})[b] || 0) - ((S.vars.aff || {})[a] || 0); })[0];
    var line = ((INN_RANK.cheer[to] || {})[best]) || { face: 'smile', text: '여관이 더 유명해졌네요!' };
    var ch = CHARACTERS[best] || {};
    stopFast(); stopTyping();
    E.rankupStars.innerHTML = '';
    for (var i = 0; i < to; i++) { var st = document.createElement('i'); st.textContent = '★'; st.style.animationDelay = (0.15 * i) + 's'; E.rankupStars.appendChild(st); }
    E.rankupName.textContent = InnCore.rankName(to);
    E.rankupUnlocks.innerHTML = '';
    texts.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; E.rankupUnlocks.appendChild(li); });
    E.rankupPic.src = (ch.faces && (ch.faces[line.face] || ch.faces.smile)) || '';
    E.rankupWho.textContent = ch.name || ''; E.rankupWho.style.color = ch.color || '#fff';
    E.rankupText.textContent = line.text;
    RK.cont = cont;
    pushLog({ name: '', color: '', text: '★ 여관 등급 상승: ' + InnCore.starStr(to) + ' ' + InnCore.rankName(to) });
    E.hudRankWrap.classList.remove('pop'); void E.hudRankWrap.offsetWidth; E.hudRankWrap.classList.add('pop');
    mode = 'rankup';
    openOverlay(E.rankup);
    sfx('rankup');
    return true;
  }
  function rankClose() {
    closeOverlay(E.rankup);
    var c = RK.cont; RK.cont = null;
    if (c) c();
  }

  // ---------- 선물 (장터 / 선물 주기 / 반응) ----------
  var GF = { tab: 'give', target: '', fixed: false, cont: null, shopOk: false, stage: 'list', cart: {} };   // cart: 장터 장바구니 { 선물id: 수량(음수=반품) } (저장하지 않음)
  function pickTools() {   // 낮 선택 화면 아래의 작은 도구 버튼 (선택지 버튼과 class 가 달라서 선택지 번호에 섞이지 않는다)
    var w = document.createElement('div');
    w.className = 'pick-tools';
    var n = InnCore.giftCount(S.vars);
    [['pick-shop', '장터에서 선물 사기', 'shop'], ['pick-gift', '선물 주기 · 보관함 ' + n + '개', 'give']].forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pick-tool'; b.id = d[0]; b.textContent = d[1];
      b.addEventListener('click', function (ev) { ev.stopPropagation(); openGift(d[2], '', null); });
      w.appendChild(b);
    });
    return w;
  }
  function openGift(tab, target, cont) {
    InnCore.ensure(S.vars);
    stopFast();
    GF.shopOk = (mode === 'choice' && curPick) || (mode === 'choice' && !!(curOpts || []).length && !!E.choices.querySelector('.pick-tools'));
    GF.tab = (tab === 'shop' && GF.shopOk) ? 'shop' : 'give';
    GF.target = target || ''; GF.fixed = !!target; GF.cont = cont || null; GF.stage = 'list'; GF.cart = {};
    if (!GF.target && GF.tab === 'give') GF.target = HEROINES.filter(function (h) { return InnCore.canGive(S.vars, h); })[0] || HEROINES[0];
    E.giftReact.classList.add('hidden');
    renderGift();
    openOverlay(E.gift);
  }
  // 닫기: 장바구니에 담긴 게 있으면 사지 않고 나갈지 한 번 묻고, 나가면 장바구니는 버린다
  function giftClose() {
    if (giftCartCount()) { ask('담은 물건을 사지 않고 나갈까요?', function () { GF.cart = {}; giftClose(); }); return; }
    closeOverlay(E.gift);
    if (mode === 'choice' && !snapLocked) takeSnap('선택지');   // 산/준 결과가 불러오기에 남도록 다시 저장
    var c = GF.cont; GF.cont = null;
    if (c) c();
  }
  function tierMark(t) { return GIFTS.tiers[t] ? GIFTS.tiers[t].mark + ' ' + GIFTS.tiers[t].label : '?'; }
  function renderGift() {
    var V = S.vars, G = V.gift;
    E.giftGold.textContent = V.gold || 0;
    E.giftTitle.textContent = GF.tab === 'shop' ? '장터 · 선물 사기' : '선물 주기';
    E.giftTabShop.classList.toggle('on', GF.tab === 'shop'); E.giftTabGive.classList.toggle('on', GF.tab === 'give');
    E.giftTabShop.disabled = !GF.shopOk || GF.fixed; E.giftTabGive.disabled = GF.fixed;
    E.giftTabs.classList.toggle('hidden', GF.fixed);
    E.giftWho.innerHTML = '';
    E.giftWho.classList.toggle('hidden', GF.tab !== 'give');
    E.giftList.innerHTML = '';
    if (GF.tab === 'give') {
      if (!CHARACTERS[GF.target]) GF.target = HEROINES.filter(function (h) { return InnCore.canGive(V, h); })[0] || HEROINES[0];   // 대상 미선택이면 줄 수 있는 첫 사람
      (GF.fixed ? [GF.target] : HEROINES).forEach(function (h) {
        var c = CHARACTERS[h], b = document.createElement('button');
        b.type = 'button'; b.className = 'gift-who' + (GF.target === h ? ' on' : '') + (InnCore.canGive(V, h) ? '' : ' done'); b.dataset.who = h;
        var im = document.createElement('img'); im.alt = ''; setIcon(im, c);
        b.appendChild(im);
        var nm = document.createElement('b'); nm.textContent = c.name; nm.style.color = c.color; b.appendChild(nm);
        var sm = document.createElement('small'); sm.textContent = InnCore.canGive(V, h) ? '오늘 가능' : '오늘 줬어요'; b.appendChild(sm);
        b.addEventListener('click', function () { if (GF.fixed) return; GF.target = h; sfx('tap'); renderGift(); });
        E.giftWho.appendChild(b);
      });
      var tc = CHARACTERS[GF.target] || {};
      E.giftInfo.textContent = !InnCore.canGive(V, GF.target)
        ? (tc.name + '에게는 오늘 이미 선물했어요. 선물은 하루에 한 사람당 하나만 줄 수 있어요.')
        : (tc.name + '에게 줄 선물을 고르세요. 처음 주면 반응으로 취향을 알 수 있어요. (하루에 한 사람당 하나)');
    } else {
      E.giftInfo.textContent = '장터에서 선물을 살 수 있어요. 누가 뭘 좋아할지는 반응을 보고 알아내 보세요.';
    }
    var shop = GF.tab === 'shop';
    giftCartClamp();
    E.giftCart.classList.toggle('hidden', !shop);
    var ids = Object.keys(GIFTS.items).filter(function (id) { return shop || (G.inv[id] > 0); });
    if (!ids.length) E.giftList.appendChild(tvEl('p', 'tv-info', GF.tab === 'give' ? '보관함이 비었어요. 낮에 "장터에서 선물 사기"로 살 수 있어요.' : ''));
    ids.forEach(function (id) {
      var d = GIFTS.items[id], row = tvEl('div', 'tv-row gift-row'); row.dataset.id = id;
      var ic = document.createElement('img'); ic.alt = ''; ic.className = 'tv-icon'; ic.src = d.icon; row.appendChild(ic);
      var known = GF.tab === 'give' && G.known[GF.target] && G.known[GF.target][id];
      var mid = tvEl('div', 'tv-row-mid');
      var have = shop ? InnCore.giftRefundable(V, id) : 0;
      var nm = tvEl('b', null, ''); nm.textContent = d.name + (G.inv[id] ? ' ×' + G.inv[id] : '');
      var sm = tvEl('small', null, ''); sm.textContent = (shop ? d.price + 'G · ' : '') + d.desc + ' ' + (GF.tab === 'give' ? (known ? '[' + tierMark(known) + ']' : '') : d.hint) + (have ? ' · 오늘 산 선물 ' + have + '개 (반품 가능)' : '');
      mid.appendChild(nm); mid.appendChild(sm); row.appendChild(mid);
      if (shop) {
        var q = GF.cart[id] || 0;
        row.appendChild(stepper(q, q > -have, (V.gold || 0) - giftCartNet() >= d.price, function () { giftStep(id, -1); }, function () { giftStep(id, 1); }));
      } else {
        var btn = tvEl('button', 'tv-buy gift-btn', '주기');
        btn.type = 'button';
        if (!InnCore.canGive(V, GF.target)) btn.disabled = true;
        btn.addEventListener('click', function () { giftGive(id); });
        row.appendChild(btn);
      }
      E.giftList.appendChild(row);
    });
    if (shop) {
      var net = giftCartNet(), after = (V.gold || 0) - net, empty = !giftCartCount();
      E.giftSum.innerHTML = empty ? '장바구니가 비었어요. 구매 후 잔액 <b>' + after + ' G</b>'
        : (net > 0 ? '결제 <b class="minus">-' + net + ' G</b>' : net < 0 ? '환불 <b class="plus">+' + (-net) + ' G</b>' : '변동 없음') + ' · 구매 후 잔액 <b>' + after + ' G</b>';
      E.giftConfirm.disabled = empty; E.giftClear.disabled = empty;
    }
  }
  function giftCartCount() { return Object.keys(GF.cart).reduce(function (a, k) { return a + Math.abs(GF.cart[k] || 0); }, 0); }
  function giftCartNet() { return Object.keys(GF.cart).reduce(function (a, id) { return a + (GF.cart[id] || 0) * GIFTS.items[id].price; }, 0); }
  function giftCartClamp() {   // 반품 예약이 반품 가능 수를 넘지 않게 (그 사이 선물을 줬다면 줄어든다)
    Object.keys(GF.cart).forEach(function (id) {
      var m = -InnCore.giftRefundable(S.vars, id);
      if (GF.cart[id] < m) GF.cart[id] = m;
      if (!GF.cart[id]) delete GF.cart[id];
    });
  }
  function giftStep(id, d) {
    var q = GF.cart[id] || 0, pr = GIFTS.items[id].price;
    if (d > 0 && (S.vars.gold || 0) - giftCartNet() < pr) { toast('골드가 모자라요', 'down'); return; }
    if (d < 0 && q <= -InnCore.giftRefundable(S.vars, id)) return;
    sfx('tap');
    GF.cart[id] = q + d; if (!GF.cart[id]) delete GF.cart[id];
    renderGift();
  }
  function giftClear() { if (!giftCartCount()) return; sfx('tap'); GF.cart = {}; renderGift(); }
  // 구매 확정: 이때 비로소 골드 차감·보관함 반영 (반품은 오늘 산, 아직 주지 않은 선물만 전액 환불)
  function giftConfirm() {
    giftCartClamp();
    var net = giftCartNet();
    if (!giftCartCount()) return;
    if (net > (S.vars.gold || 0)) { toast('골드가 모자라요', 'down'); renderGift(); return; }
    var buyN = 0, retN = 0;
    Object.keys(GF.cart).forEach(function (id) {
      var q = GF.cart[id], k;
      for (k = 0; k < q; k++) if (InnCore.buyGift(S.vars, id)) buyN++;
      for (k = 0; k > q; k--) if (InnCore.refundGift(S.vars, id)) retN++;
      if (q > 0) pushLog({ name: '', color: '', text: '— 선물 구입: ' + GIFTS.items[id].name + (q > 1 ? ' ×' + q : '') + ' —' });
      if (q < 0) pushLog({ name: '', color: '', text: '— 선물 반품: ' + GIFTS.items[id].name + (q < -1 ? ' ×' + (-q) : '') + ' —' });
    });
    GF.cart = {};
    sfx('coin'); updateHud();
    toast((buyN ? '구매 ' + buyN + '개' : '') + (buyN && retN ? ' · ' : '') + (retN ? '반품 ' + retN + '개' : '') + ' 확정 (' + (net > 0 ? '-' : '+') + Math.abs(net) + 'G)', net > 0 ? 'down' : 'up');
    renderGift();
    var pt = document.getElementById('pick-gift'); if (pt) pt.textContent = '선물 주기 · 보관함 ' + InnCore.giftCount(S.vars) + '개';
  }
  function giftGive(id) {
    var h = GF.target, res = InnCore.giveGift(S.vars, h, id);
    if (!res) return;
    var c = CHARACTERS[h] || {};
    applySet({ ['aff.' + h]: res.points });
    pushLog({ name: c.name || h, color: c.color || '#fff', text: '(' + GIFTS.items[id].name + ' · ' + res.label + ') ' + res.react.text });
    GF.stage = 'react';
    E.giftReactPic.src = (c.faces && (c.faces[res.react.face] || c.faces.normal)) || '';
    E.giftReactName.textContent = c.name || h; E.giftReactName.style.color = c.color || '#fff';
    E.giftReactTier.textContent = GIFTS.items[id].name + ' · ' + tierMark(res.tier);
    E.giftReactTier.className = 'tier-' + res.tier;
    E.giftReactText.textContent = res.react.text;
    E.giftReactAff.innerHTML = '<span class="' + (res.points >= 0 ? 'plus' : 'minus') + '">' + (res.points >= 0 ? '♥ +' : '') + res.points + '</span>' + (res.first ? ' <em>취향을 알게 됐어요 (손님 메모에 기록)</em>' : '');
    E.giftReact.classList.remove('hidden');
    sfx(res.points > 0 ? 'heart' : 'heartDown');
  }
  function giftReactOk() {
    E.giftReact.classList.add('hidden'); GF.stage = 'list';
    if (GF.fixed) { giftClose(); return; }
    renderGift();
    var pt = document.getElementById('pick-gift'); if (pt) pt.textContent = '선물 주기 · 보관함 ' + InnCore.giftCount(S.vars) + '개';
  }
  // 손님 메모장의 히로인 칸에 붙는 "선물 취향" 줄 (알아낸 것만)
  function giftNoteLine(id) {
    var kn = ((S.vars.gift || {}).known || {})[id] || {}, ks = Object.keys(kn);
    var line = tvEl('div', 'tv-note-line gift' + (ks.length ? ' known' : ''), '');
    if (!ks.length) { line.innerHTML = '선물 취향 <em>???</em>'; return line; }
    var parts = [];
    ['fav', 'like', 'normal', 'hate'].forEach(function (t) {
      var names = ks.filter(function (k) { return kn[k] === t; }).map(function (k) { return GIFTS.items[k].name; });
      if (names.length) parts.push(GIFTS.tiers[t].label + ' ' + names.join(', '));
    });
    line.innerHTML = '선물 취향 <em></em> <small>(' + ks.length + '/' + Object.keys(GIFTS.items).length + ')</small>';
    line.querySelector('em').textContent = parts.join(' / ');
    return line;
  }


  // ---------- 첫 영업 튜토리얼 (리아가 설명) ----------
  // 1일차 첫 영업 첫 손님에서만(회차 공통 1회, localStorage 'tut'). 설정의 "튜토리얼 다시 보기"로 예약/즉시 재생.
  // 단계: 주문 읽기 -> 메뉴판 -> 재료 고르기 -> 내기 (재료 고르기 화면) / 결과 (내고 난 뒤 반응 대사) / 손님 메모 (다음 손님으로 넘어가기 전 메모장)
  var TUT = { on: false, stage: '', i: 0, next: '' };
  var TUT_TOTAL = 6, TUT_BASE = { brew: 0, result: 4, notes: 5 };
  var TUT_STEPS = {
    brew: [
      { sel: '.tv-order', text: '영업 첫날이네! 내가 간단히 알려 줄게. 먼저 손님의 주문을 잘 읽어 봐. "따뜻한 걸로", "술은 빼고"처럼 말 속에 원하는 맛이 숨어 있어.' },
      { sel: '#tv-board', text: '뭘 만들지 모르겠으면 "메뉴판"을 열어 봐. 아는 레시피와 속성(따뜻함, 든든함…)이 다 적혀 있어. 메뉴판에서 레시피를 누르면 재료가 바로 들어가기도 해.' },
      { sel: '#tv-ings', text: '재료는 2~3개를 골라서 슬롯에 넣어. 조합이 맞으면 레시피가 되고, 다시 누르면 뺄 수 있어. 처음 보는 조합은 직접 만들어 봐야 알 수 있지!' },
      { sel: '#tv-serve', text: '다 골랐으면 "내기"! 주문에 딱 맞으면 대성공, 어긋나면 평판이 깎일 수도 있어. 자신 없으면 "정중히 거절"도 방법이야. 자, 한번 내 볼래?' }
    ],
    result: [
      { sel: '#dialog', text: '결과는 도장과 손님의 반응으로 알 수 있어. 대성공이면 팁도 받고, 히로인 손님이라면 호감도도 올라가. 실패해도 괜찮아, 다음엔 더 잘할 수 있으니까!' }
    ],
    notes: [
      { sel: '#tv-notes-list .tv-note-row', text: '손님마다 숨은 취향이 있어. 반응 속의 힌트가 이 "손님 메모"에 쌓이니까 틈틈이 확인해 봐. 주문을 맞히면서 취향까지 맞히면 단골 보너스! 이제 영업을 이어 가자, 파이팅!' }
    ]
  };
  function tutStart(stage) {
    if (!TUT_STEPS[stage] || !E.tut) return;
    stopFast();
    if (!TUT.on) modal++;
    TUT.on = true; TUT.stage = stage; TUT.i = 0; TUT.next = '';
    E.tut.classList.remove('hidden');
    tutShow();
  }
  function tutShow() {
    var st = TUT_STEPS[TUT.stage][TUT.i], el = document.querySelector(st.sel);
    var app = E.app.getBoundingClientRect(), r = el ? el.getBoundingClientRect() : null, pad = 6;
    if (r && r.width > 0 && r.height > 0) {
      var l = Math.max(2, r.left - app.left - pad), t = Math.max(2, r.top - app.top - pad);
      E.tutHole.style.cssText = 'left:' + l + 'px;top:' + t + 'px;width:' + Math.min(app.width - l - 2, r.width + pad * 2) + 'px;height:' + (r.height + pad * 2) + 'px';
      E.tutHole.classList.remove('hidden');
    } else E.tutHole.classList.add('hidden');
    E.tut.classList.toggle('nohole', !r || !r.width);
    E.tutText.textContent = st.text;
    E.tutStep.textContent = (TUT_BASE[TUT.stage] + TUT.i + 1) + ' / ' + TUT_TOTAL;
    var b = E.tutBubble, mid = r ? (r.top + r.height / 2 - app.top) : app.height / 2;
    b.style.top = 'auto'; b.style.bottom = 'auto';
    if (r && mid < app.height * 0.5) b.style.top = Math.min(app.height - 190, r.bottom - app.top + pad + 12) + 'px';
    else if (r) b.style.bottom = Math.max(10, app.bottom - r.top + pad + 12) + 'px';
    else b.style.top = '30%';
    E.tutBubble.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  }
  function tutHide() { if (TUT.on) { TUT.on = false; if (E.tut) E.tut.classList.add('hidden'); } }   // modal 카운트는 건드리지 않음 (closeAllOverlays 가 0 으로 초기화)
  function tutClose() { if (!TUT.on) return; TUT.on = false; E.tut.classList.add('hidden'); modal = Math.max(0, modal - 1); }
  function tutAdvance() {
    if (!TUT.on) return;
    sfx('tap');
    if (++TUT.i < TUT_STEPS[TUT.stage].length) { tutShow(); return; }
    tutEnd(false);
  }
  function tutEnd(skipped) {
    var stage = TUT.stage;
    tutClose();
    if (skipped) { store.set('tut', '1'); TUT.next = ''; if (stage === 'notes') tutAfterNotes(); return; }
    if (stage === 'brew') TUT.next = 'result';
    else if (stage === 'result') TUT.next = 'notes';
    else { store.set('tut', '1'); TUT.next = ''; tutAfterNotes(); }
  }
  function tutNotes() {          // 첫 손님 반응이 끝난 직후, 다음 손님으로 넘어가기 전
    TUT.next = '';
    E.dialog.classList.add('hidden'); E.choices.classList.add('hidden');
    openNotes();
    tutStart('notes');
  }
  function tutAfterNotes() { TVE.notes.classList.add('hidden'); tvNextCustomer(); }

  // ---------- 설정 화면 ----------
  var SPEED_NAMES = ['매우 느림', '느림', '보통', '빠름', '매우 빠름'];
  var OPT_TOGGLES = [['opt-mute', 'mute'], ['opt-unread', 'skipUnread'], ['opt-easy', 'easy'], ['opt-fasttv', 'fastTv'], ['opt-autoupg', 'autoSkipUpg']];
  function renderOptions() {
    $('opt-text').value = OPT.textSpeed; $('opt-auto').value = OPT.autoSpeed; $('opt-bgm').value = OPT.bgm; $('opt-sfx').value = OPT.sfx;
    $('opt-text-v').textContent = SPEED_NAMES[OPT.textSpeed - 1]; $('opt-auto-v').textContent = SPEED_NAMES[OPT.autoSpeed - 1];
    $('opt-bgm-v').textContent = OPT.bgm + '%'; $('opt-sfx-v').textContent = OPT.sfx + '%';
    OPT_TOGGLES.forEach(function (p) {
      var b = $(p[0]), on = !!OPT[p[1]];
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.opt-state').textContent = on ? '켜짐' : '꺼짐';
    });
    // 수집 보상: 레시피 도감 완성 시 해금되는 "시작부터 모든 레시피 공개" 옵션
    var ar = $('opt-allrecipes'), unl = collectStats().rewards.allRecipes, aon = unl && OPT.allRecipes;
    ar.classList.toggle('on', aon); ar.classList.toggle('locked', !unl); ar.setAttribute('aria-pressed', aon ? 'true' : 'false');
    ar.querySelector('.opt-state').textContent = !unl ? '잠김' : (aon ? '켜짐' : '꺼짐');
    $('opt-tut').querySelector('.opt-state').textContent = store.get('tut') ? '보기' : '예약됨';
  }
  function openOptions() { renderOptions(); openOverlay(E.options); }
  function closeOptions() {
    closeOverlay(E.options);
    if (TV && TV.phase === 'brew' && mode === 'tavern') renderBrew();   // 쉬운 모드(미리보기)를 바꿨을 수 있다
  }
  function initOptions() {
    [['opt-text', 'textSpeed'], ['opt-auto', 'autoSpeed'], ['opt-bgm', 'bgm'], ['opt-sfx', 'sfx']].forEach(function (p) {
      var el = $(p[0]);
      el.addEventListener('input', function () { OPT[p[1]] = Number(el.value); applyOpt(); renderOptions(); saveOpt(); });
      el.addEventListener('change', function () { if (p[1] === 'sfx') sfx('select'); });
    });
    OPT_TOGGLES.forEach(function (p) {
      $(p[0]).addEventListener('click', function () { OPT[p[1]] = !OPT[p[1]]; applyOpt(); renderOptions(); saveOpt(); sfx('select'); });
    });
    $('opt-allrecipes').addEventListener('click', function () {
      if (!collectStats().rewards.allRecipes) return;   // 잠김
      OPT.allRecipes = !OPT.allRecipes; saveOpt(); renderOptions(); sfx('select');
    });
    $('opt-tut').addEventListener('click', function () {
      sfx('select');
      if (TV && TV.phase === 'brew' && mode === 'tavern') { closeOptions(); tutStart('brew'); return; }   // 주문을 받는 중이면 지금 바로
      store.set('tut', ''); renderOptions();                                                              // 아니면 다음 첫 영업(1일차 첫 손님)에서
    });
    $('options-close').addEventListener('click', closeOptions);
    $('menu-options').addEventListener('click', function () { closeOverlay(E.menu); openOptions(); });
    $('btn-options').addEventListener('click', openOptions);
  }

  // ---------- 자유 대화 (로컬 LLM) ----------
  // 흐름: 진입(낮 이벤트 뒤 제안 'offer' / 메뉴 'menu') -> 입력 -> js/llm-core.js 가 PC 서버(/llm/chat)로 요청 -> 대사/표정/호감도 반영
  // 하루 턴 수 / 호감도 상한은 story/llm-persona.js 의 settings. 사용량은 S.vars.llm 에 저장된다.
  var CHE = {};  // 자유 대화 화면 요소 캐시
  function LLM_ST() { return globalThis.LLM_PERSONA.settings; }
  function chatReady() { return !!(globalThis.LLMCore && globalThis.LLM_PERSONA); }

  // PC 서버/LLM 상태 확인 (PC 서버 표식이 없으면 요청 자체를 보내지 않는다 -> GitHub Pages 에서는 네트워크 오류 0)
  function refreshLlm() {
    if (!LLM.server || !chatReady()) return Promise.resolve();
    return LLMCore.status().then(function (st) {
      LLM.state = st.state; LLM.model = st.model || '';
      updateMenuChat();
    });
  }
  function updateMenuChat() {
    var b = $('menu-chat'); if (!b) return;
    var msg = {
      none: 'PC 서버에서 실행할 때만 사용 가능',
      checking: 'PC 서버 연결 확인 중…',
      nollm: 'LLM 에 연결되지 않았어요 (탭하면 다시 확인)',
      ready: '히로인과 자유롭게 이야기하기'
    }[LLM.state];
    b.innerHTML = '자유 대화<small></small>';
    b.lastChild.textContent = msg;
    b.classList.toggle('off', LLM.state !== 'ready');
  }

  // 오늘 대화할 수 있는 히로인 (낮에 함께 보낸 사람, 저녁부터는 전원)
  function chatCandidates() {
    var l = LLMCore.ensureState(S.vars), evening = /^(저녁|밤|황혼)$/.test(S.vars.time || '');
    return HEROINES.filter(function (id) { return evening || l.met.indexOf(id) >= 0; });
  }
  function openChatPick() {
    if (!chatReady() || LLM.state === 'none') return; // PC 서버가 아니면 메뉴 버튼의 안내 문구만 보여 준다
    LLM.state = 'checking'; updateMenuChat();
    refreshLlm().then(function () {
      if (LLM.state !== 'ready') return;             // 연결 실패: 메뉴 버튼의 안내 문구가 바뀐다
      closeOverlay(E.menu);
      if (mode !== 'text' && mode !== 'choice') { toast('지금은 이야기를 나눌 수 없어요 (장면이 끝난 뒤에 시도해 주세요)', 'down'); return; }
      var list = chatCandidates(), st = LLM_ST();
      E.chatPickList.innerHTML = '';
      E.chatPickNote.textContent = list.length ? '오늘 대화할 수 있는 사람이에요. (한 사람당 하루 ' + st.turnsPerDay + '번)' : '아직 오늘 만난 사람이 없어요. 낮에 누군가와 시간을 보낸 뒤 다시 와 주세요.';
      list.forEach(function (id) {
        var ch = CHARACTERS[id], rem = LLMCore.remaining(S.vars, id, st), v = (S.vars.aff && S.vars.aff[id]) || 0;
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'slot-btn chat-pick-btn'; b.dataset.who = id; b.disabled = rem <= 0;
        var im = document.createElement('img'); im.alt = ''; setIcon(im, ch);
        var tx = document.createElement('span'); tx.className = 'cp-tx';
        var nm = document.createElement('strong'); nm.textContent = ch.name; nm.style.color = ch.color;
        var sub = document.createElement('span'); sub.textContent = rem > 0 ? '남은 대화 ' + rem + '/' + st.turnsPerDay : '오늘은 충분히 이야기했어요';
        var hh = document.createElement('em'); hh.className = 'hearts'; hh.innerHTML = heartsHtml(v);
        tx.appendChild(nm); tx.appendChild(hh); tx.appendChild(sub);
        b.appendChild(im); b.appendChild(tx);
        b.addEventListener('click', function () { closeOverlay(E.chatPick); enterChat(id, 'menu'); });
        E.chatPickList.appendChild(b);
      });
      openOverlay(E.chatPick);
    });
  }

  function showTalkOffer(id) {
    var rem = LLMCore.remaining(S.vars, id, LLM_ST());
    var opts = [
      { who: id, text: '조금 더 이야기해 볼까?', tag: '자유 대화 · 남은 ' + rem + '번', talk: id },
      { text: '이만 저녁 준비를 하러 간다.' }
    ];
    showChoices(opts, false);        // 스냅샷은 last 가 남은 상태로 저장된다 (불러오면 다시 제안)
    LLMCore.ensureState(S.vars).last = '';
  }

  function chatReset() {
    if (CH) { try { if (CH.abort) CH.abort.abort(); } catch (e) { /* 무시 */ } clearInterval(CH.dots); }
    CH = null;
    if (E.game) E.game.classList.remove('chatting');
    if (CHE.root) CHE.root.classList.add('hidden');
    if (E.app) E.app.style.height = '';
  }
  function chatSay(text, face) {
    var id = CH.id, ch = CHARACTERS[id];
    if (face && S.sprites.center) S.sprites.center.face = face;
    E.dialog.classList.remove('narr');
    E.nametag.textContent = ch.name; E.nametag.style.color = ch.color; E.nametag.style.borderColor = ch.color;
    E.nametag.classList.remove('hidden');
    renderSprites(id);
    startTyping(text);
  }
  function chatNote(text) { // 설명용 문장(오류 등): 이름표 없이 대사창에
    E.dialog.classList.add('narr');
    E.nametag.classList.add('hidden');
    renderSprites(null);
    startTyping(text);
  }
  function enterChat(id, entry) {
    var P = globalThis.LLM_PERSONA, h = P.heroines[id], ch = CHARACTERS[id];
    if (!h || !ch) { warn('자유 대화: 없는 히로인 ' + id); return; }
    stopFast();
    stopTyping();
    CH = { id: id, entry: entry, busy: false, hist: [], lastText: '', token: 0, abort: null, dots: null, prevMode: mode, saved: clone(S.sprites), gainShown: false };
    S.sprites = { left: null, center: { id: id, face: 'normal' }, right: null };
    E.choices.classList.add('hidden');
    E.dialog.classList.remove('hidden');
    E.game.classList.add('chatting');
    CHE.root.classList.remove('hidden');
    CHE.input.value = ''; CHE.status.classList.add('hidden');
    mode = 'chat';
    var g = (h.greet && h.greet.length) ? h.greet[Math.floor(Math.random() * h.greet.length)] : { text: '…무슨 일이야?', face: 'normal' };
    chatSay(g.text, g.face);
    pushLog({ name: ch.name, color: ch.color, text: g.text });
    updateChatBar();
    chatViewport();
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) CHE.input.focus(); // 폰에서는 키보드가 바로 뜨지 않게 자동 포커스 안 함
  }
  function updateChatBar() {
    if (!CH) return;
    var st = LLM_ST(), l = LLMCore.ensureState(S.vars), rem = LLMCore.remaining(S.vars, CH.id, st), g = l.gain[CH.id] || 0;
    CHE.turns.textContent = '남은 대화 ' + rem + '/' + st.turnsPerDay + '  ·  오늘 ♥ +' + g + '/' + st.maxGainPerHeroinePerDay;
    var done = rem <= 0;
    CHE.input.disabled = done || CH.busy; CHE.send.disabled = done || CH.busy;
    CHE.input.placeholder = done ? '오늘은 충분히 이야기했어요' : '말을 건네 보세요 (' + st.maxInputChars + '자)';
    CHE.root.classList.toggle('done', done);
    if (done && !CHE.status.classList.contains('err')) {
      var nm = CHARACTERS[CH.id].name, lc = nm.charCodeAt(nm.length - 1) - 0xAC00;
      CHE.msg.textContent = nm + ((lc >= 0 && lc % 28 !== 0) ? '과' : '와') + ' 오늘 나눌 수 있는 이야기는 여기까지예요. 내일 또 이야기해요.';
      CHE.status.classList.remove('hidden', 'err'); CHE.retry.classList.add('hidden');
    }
    syncChatH();
  }
  function syncChatH() { E.game.style.setProperty('--chat-h', CHE.root.offsetHeight + 'px'); }
  // 모바일 키보드: visualViewport 높이에 맞춰 앱 높이를 줄여서 입력창이 키보드에 가려지지 않게 한다
  function chatViewport() {
    if (!CH || !window.visualViewport) { syncChatH(); return; }
    E.app.style.height = Math.round(window.visualViewport.height) + 'px';
    window.scrollTo(0, 0);
    syncChatH();
  }
  function setThinking(on) {
    clearInterval(CH.dots);
    if (!on) return;
    var n = 0, ch = CHARACTERS[CH.id];
    stopTyping();
    E.dialog.classList.remove('narr');
    E.nametag.textContent = ch.name; E.nametag.style.color = ch.color; E.nametag.style.borderColor = ch.color;
    E.nametag.classList.remove('hidden');
    E.nextMark.classList.remove('on');
    var tick = function () { E.text.textContent = '…생각 중' + '.'.repeat(n++ % 4); };
    tick();
    CH.dots = setInterval(tick, 380);
  }
  function sendChat(again) {
    if (!CH || CH.busy) return;
    var st = LLM_ST();
    var text = String(again || CHE.input.value).trim().slice(0, st.maxInputChars);
    if (!text || LLMCore.remaining(S.vars, CH.id, st) <= 0) return;
    CH.busy = true; CH.lastText = text;
    CHE.status.classList.add('hidden'); CHE.status.classList.remove('err');
    updateChatBar();
    setThinking(true);
    var tok = ++CH.token, ac = new AbortController(), id = CH.id;
    CH.abort = ac;
    var c = { id: id, day: S.vars.day || 1, time: S.vars.time || '', aff: (S.vars.aff || {})[id] || 0, ev: (S.vars.ev || {})[id] || 0, flags: S.vars.flag || {}, hist: CH.hist, text: text, where: CH.entry };
    LLMCore.ask(globalThis.LLM_PERSONA, c, ac.signal).then(function (res) {
      if (!CH || tok !== CH.token) return;
      onChatReply(text, res);
    }, function (e) {
      if (!CH || tok !== CH.token || (e && e.code === 'aborted')) return;
      onChatError(e);
    });
  }
  function onChatReply(text, res) {
    var id = CH.id, st = LLM_ST(), ch = CHARACTERS[id];
    setThinking(false);
    CH.busy = false;
    var l = LLMCore.ensureState(S.vars);
    l.used[id] = (l.used[id] || 0) + 1;                       // 성공한 턴만 센다
    var delta = LLMCore.capAffection(S.vars, id, res.affection, st);
    chatSay(res.reply, res.face);
    if (delta) applySet({ ['aff.' + id]: delta });            // 토스트 + 하트 연출은 applySet 이 처리
    else if (res.affection > 0) toast('오늘 대화로 올릴 수 있는 호감도는 여기까지예요', '');
    CH.hist.push({ user: text, assistant: JSON.stringify({ reply: res.reply, face: res.face, affection: res.affection }) });
    pushLog({ name: '', color: '', text: '▶ ' + text, choice: true });
    pushLog({ name: ch.name, color: ch.color, text: res.reply });
    CHE.input.value = '';
    takeSnap('자유 대화');                                    // 턴 사용량/호감도가 저장되도록 (불러오기로 되돌려 파밍 방지)
    updateChatBar();
  }
  function onChatError(e) {
    setThinking(false);
    CH.busy = false;
    var msg = LLMCore.errorText(e);
    chatNote('…(' + msg + ')');
    CHE.msg.textContent = msg;
    CHE.status.classList.remove('hidden'); CHE.status.classList.add('err');
    CHE.retry.classList.remove('hidden');
    if (e && (e.code === 'llm_unreachable' || e.code === 'network' || e.code === 'no_server')) refreshLlm();
    updateChatBar();
  }
  function endChat() {
    if (!CH) return;
    var entry = CH.entry, saved = CH.saved, prev = CH.prevMode;
    stopTyping();
    chatReset();
    S.sprites = saved;
    renderSprites(null);
    E.nametag.classList.add('hidden');
    pushLog({ name: '', color: '', text: '— 자유 대화를 마쳤다 —' });
    takeSnap('자유 대화 후');
    if (entry === 'offer') { mode = 'text'; next(); run(); return; }
    // 메뉴에서 시작했으면 원래 보던 줄을 그대로 다시 보여 준다
    mode = prev; replay = true;
    try { run(); } finally { replay = false; }
  }

  // ---------- 초기화 ----------
  function init() {
    ['title', 'game', 'bg', 'hud', 'dialog', 'nametag', 'text', 'choices', 'toasts', 'menu', 'slots', 'backlog',
      'summary', 'confirm', 'ending', 'fx', 'flash'].forEach(function (id) { E[id] = $(id); });
    E.card = $('daycard'); E.cardTitle = $('card-title'); E.cardSub = $('card-sub'); E.cardTip = $('card-tip'); E.cardBody = $('card-body');
    E.endLabel = $('ending-label'); E.endTitle = $('ending-title'); E.endDesc = $('ending-desc'); E.endNew = $('ending-new');
    E.endCount = $('ending-count'); E.endPic = $('ending-pic'); E.endBody = $('ending-body');
    E.btnEndings = $('btn-endings'); E.endingList = $('endings'); E.endingListBody = $('endings-body'); E.endingListCount = $('endings-count');
    E.nextMark = $('next-mark'); E.options = $('options'); E.btnAuto = $('btn-auto'); E.btnSkip = $('btn-skip');
    E.hudGold = $('hud-gold'); E.hudRep = $('hud-rep'); E.hudDay = $('hud-day'); E.hudRank = $('hud-rank'); E.hudRankWrap = $('hud-rank-wrap');
    E.hudFat = $('hud-fat'); E.hudFatBar = $('hud-fat-bar'); E.hudFatTxt = $('hud-fat-txt');
    E.calendar = $('calendar'); E.calGrid = $('cal-grid'); E.calInfo = $('cal-info'); E.calList = $('cal-list');
    E.endRank = $('ending-rank');
    E.rankup = $('rankup'); E.rankupStars = $('rankup-stars'); E.rankupName = $('rankup-name'); E.rankupUnlocks = $('rankup-unlocks');
    E.rankupPic = $('rankup-pic'); E.rankupWho = $('rankup-who'); E.rankupText = $('rankup-text');
    E.gift = $('gift'); E.giftGold = $('gift-gold'); E.giftTitle = $('gift-title'); E.giftTabs = $('gift-tabs'); E.giftTabShop = $('gift-tab-shop'); E.giftTabGive = $('gift-tab-give');
    E.giftWho = $('gift-who'); E.giftInfo = $('gift-info'); E.giftList = $('gift-list'); E.giftReact = $('gift-react');
    E.giftCart = $('gift-cart'); E.giftSum = $('gift-sum'); E.giftConfirm = $('gift-confirm'); E.giftClear = $('gift-clear');
    E.giftConfirm.addEventListener('click', giftConfirm); E.giftClear.addEventListener('click', giftClear);
    E.giftReactPic = $('gift-react-pic'); E.giftReactName = $('gift-react-name'); E.giftReactTier = $('gift-react-tier'); E.giftReactText = $('gift-react-text'); E.giftReactAff = $('gift-react-aff');
    E.btnContinue = $('btn-continue'); E.btnTitleLoad = $('btn-title-load');
    E.cg = $('cg'); E.btnGallery = $('btn-gallery'); E.btnCollect = $('btn-collect');
    E.gallery = $('gallery'); E.galleryGrid = $('gallery-grid'); E.galleryCount = $('gallery-count');
    E.cgview = $('cgview'); E.cgviewPic = $('cgview-pic'); E.cgviewTitle = $('cgview-title'); E.cgviewN = $('cgview-n');
    E.cgviewPrev = $('cgview-prev'); E.cgviewNext = $('cgview-next');
    E.collect = $('collect'); E.collectPct = $('collect-pct'); E.collectBar = $('collect-bar'); E.collectCats = $('collect-cats'); E.collectRewards = $('collect-rewards');
    setIcon($('tut-pic'), CHARACTERS.lia);   // 튜토리얼 말풍선의 리아 얼굴
    E.tut = $('tut'); E.tutHole = $('tut-hole'); E.tutBubble = $('tut-bubble'); E.tutText = $('tut-text'); E.tutStep = $('tut-step');
    E.slotsTitle = $('slots-title'); E.slotList = $('slot-list');
    E.backlogList = $('backlog-list');
    E.summaryTitle = $('summary-title'); E.summaryNote = $('summary-note'); E.summaryBody = $('summary-body');
    E.confirmMsg = $('confirm-msg'); E.confirmYes = $('confirm-yes');
    E.app = $('app'); E.chatPick = $('chat-pick'); E.chatPickList = $('chat-pick-list'); E.chatPickNote = $('chat-pick-note');
    CHE.root = $('chat'); CHE.turns = $('chat-turns'); CHE.status = $('chat-status'); CHE.msg = $('chat-msg');
    CHE.retry = $('chat-retry'); CHE.input = $('chat-input'); CHE.send = $('chat-send');
    E.sprites = {};
    POS.forEach(function (p) { E.sprites[p] = document.querySelector('.sprite[data-pos="' + p + '"]'); });

    // 저녁 영업 화면 요소
    TVE.root = $('tavern'); TVE.prog = $('tv-prog'); TVE.brew = $('tv-brew'); TVE.shop = $('tv-shop'); TVE.sum = $('tv-sum'); TVE.upg = $('tv-upg');
    TVE.lodge = $('tv-lodge'); lodgeEls();
    TVE.menu = $('tv-menu'); TVE.found = $('tv-found'); TVE.stamp = $('tv-stamp');
    TVE.order = document.querySelector('.tv-order'); TVE.orderNote = $('tv-order-note'); TVE.orderTaste = $('tv-order-taste');
    TVE.notes = $('tv-notes'); TVE.notesList = $('tv-notes-list'); TVE.notesCount = $('tv-notes-count');
    TVE.cust = $('tv-cust'); TVE.orderText = $('tv-order-text'); TVE.slots = $('tv-slots'); TVE.note = $('tv-note'); TVE.ings = $('tv-ings');
    TVE.clear = $('tv-clear'); TVE.serve = $('tv-serve');
    TVE.shopGold = $('tv-shop-gold'); TVE.shopInfo = $('tv-shop-info'); TVE.shopList = $('tv-shop-list');
    TVE.sumBody = $('tv-sum-body'); TVE.sumIcons = $('tv-sum-icons');
    TVE.upgGold = $('tv-upg-gold'); TVE.upgList = $('tv-upg-list');
    TVE.boardList = $('tv-board-list'); TVE.boardCount = $('tv-board-count'); TVE.boardTags = $('tv-board-tags');
    TVE.foundName = $('tv-found-name'); TVE.foundIng = $('tv-found-ing'); TVE.foundTags = $('tv-found-tags'); TVE.foundBtn = $('tv-found-btn');
    $('tv-clear').addEventListener('click', function () { TV.sel = []; TV.note = ''; renderBrew(); });
    $('tv-serve').addEventListener('click', doServe);
    $('tv-skip').addEventListener('click', function () { ask('이 손님을 정중히 돌려보낼까요? (평판이 조금 깎여요)', doSkip); });
    $('tv-board').addEventListener('click', function () { openBoard(true); });
    $('tv-notes-btn').addEventListener('click', openNotes);
    $('tv-shop-notes').addEventListener('click', openNotes);
    $('tv-notes-close').addEventListener('click', function () { TVE.notes.classList.add('hidden'); });
    $('tv-shop-board').addEventListener('click', function () { openBoard(false); });
    $('tv-board-close').addEventListener('click', function () { TVE.menu.classList.add('hidden'); });
    $('tv-shop-start').addEventListener('click', shopStart);
    TVE.shopSum = $('tv-shop-sum'); TVE.shopConfirm = $('tv-shop-confirm'); TVE.shopClear = $('tv-shop-clear');
    TVE.shopConfirm.addEventListener('click', shopConfirm); TVE.shopClear.addEventListener('click', shopClear);
    TVE.shopLast = $('tv-shop-last'); TVE.shopLast.addEventListener('click', buyLast);
    $('tv-shop-suggest').addEventListener('click', buySuggest);
    $('tv-sum-btn').addEventListener('click', tvClose);
    $('tv-upg-next').addEventListener('click', closeUpgrades);
    $('lodge-done').addEventListener('click', lodgeFinish);
    $('lodge-recommend').addEventListener('click', lodgeRecommend);
    $('rankup-btn').addEventListener('click', rankClose);
    $('gift-close').addEventListener('click', giftClose);
    $('gift-react-ok').addEventListener('click', giftReactOk);
    E.giftTabShop.addEventListener('click', function () { if (GF.shopOk) { GF.tab = 'shop'; sfx('tap'); renderGift(); } });
    E.giftTabGive.addEventListener('click', function () { GF.tab = 'give'; sfx('tap'); renderGift(); });
    $('menu-gift').addEventListener('click', function () {
      if (mode !== 'text' && mode !== 'choice') { toast('지금은 선물을 줄 수 없어요', 'down'); return; }
      closeOverlay(E.menu); openGift('give', '', null);
    });

    // 설정 / 읽은 대사 / 스킵·오토 버튼
    loadOpt(); applyOpt(); loadRead(); initOptions();
    E.btnAuto.addEventListener('click', function (ev) { ev.stopPropagation(); toggleFast('auto'); });
    E.btnSkip.addEventListener('click', function (ev) { ev.stopPropagation(); toggleFast('skip'); });
    window.addEventListener('pagehide', flushRead);
    document.addEventListener('visibilitychange', function () { if (document.hidden) flushRead(); });
    if (globalThis.BGM) BGM.play('title');

    // 자유 대화 (로컬 LLM): index.html 에 PC 서버 표식(<meta name="inn-server">)이 있을 때만 서버에 물어본다
    CHE.root.addEventListener('submit', function (ev) { ev.preventDefault(); sendChat(); });
    $('chat-end').addEventListener('click', endChat);
    CHE.retry.addEventListener('click', function () { sendChat(CH && CH.lastText); });
    $('chat-pick-close').addEventListener('click', function () { closeOverlay(E.chatPick); });
    $('menu-chat').addEventListener('click', openChatPick);
    if (chatReady()) CHE.input.maxLength = LLM_ST().maxInputChars;
    LLM.server = !!document.querySelector('meta[name="inn-server"]') && chatReady();
    LLM.state = LLM.server ? 'checking' : 'none';
    updateMenuChat();
    if (LLM.server) refreshLlm();
    if (window.visualViewport) { window.visualViewport.addEventListener('resize', chatViewport); window.visualViewport.addEventListener('scroll', chatViewport); }
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(function () { if (CH) syncChatH(); }).observe(CHE.root);

    // 타이틀 문구
    $('title-name').textContent = STORY.title || '';
    $('title-sub').textContent = STORY.subtitle || '';
    document.title = STORY.title || document.title;
    var tb = BACKGROUNDS.inn_front || BACKGROUNDS[Object.keys(BACKGROUNDS)[0]];
    if (tb) E.title.style.backgroundImage = 'url("' + tb + '")';

    // 수집 100% 보상 연출용 별빛 (타이틀에 .perfect 가 붙을 때만 보임)
    var stars = $('title-stars');
    for (var si = 0; si < 26; si++) {
      var star = document.createElement('i');
      star.style.left = ((si * 37 + 11) % 97 + 1) + '%'; star.style.top = ((si * 53 + 7) % 60 + 2) + '%';
      star.style.animationDelay = ((si % 9) * 0.45) + 's'; star.style.fontSize = (8 + (si % 4) * 4) + 'px';
      star.textContent = '✦';
      stars.appendChild(star);
    }

    // 타이틀 히로인 소개 (STORY.cast 의 캐릭터를 포스터처럼 나란히)
    var castBox = $('title-cast'), names = $('title-names');
    (STORY.cast || []).forEach(function (cid, i) {
      var ch = CHARACTERS[cid]; if (!ch) return;
      var im = document.createElement('img');
      im.className = 'cast cast-' + i; im.alt = ch.name; im.src = ch.faces.smile || ch.faces[Object.keys(ch.faces)[0]];
      castBox.appendChild(im);
      var sp = document.createElement('span');
      sp.textContent = ch.name; sp.style.color = ch.color; sp.title = ch.tag || '';
      names.appendChild(sp);
    });

    // 이미지 미리 로드 (표정 교체 시 깜빡임 방지)
    Object.keys(CHARACTERS).forEach(function (id) {
      var f = CHARACTERS[id].faces;
      Object.keys(f).forEach(function (k) { new Image().src = f[k]; });
      if (CHARACTERS[id].icon) new Image().src = CHARACTERS[id].icon;
    });
    Object.keys(BACKGROUNDS).forEach(function (k) { new Image().src = BACKGROUNDS[k]; });

    // 타이틀
    $('btn-new').addEventListener('click', startNew);
    E.btnContinue.addEventListener('click', function () {
      var d = readSlot('auto');
      if (d) loadSnap(d.snap);
    });
    E.btnTitleLoad.addEventListener('click', function () { openSlots('load'); });

    // 일차 전환 카드 탭 = 진행 (카드는 #game 바깥에 있으므로 따로 연결)
    E.card.addEventListener('click', function () { advance(); });

    // 게임 화면 탭 = 진행
    E.game.addEventListener('click', function (ev) {
      if (ev.target.closest('button, input, form')) return;
      if (F.auto || F.skip) { stopFast(); return; }   // 화면을 탭하면 오토/스킵 해제
      advance();
    });

    // 메뉴
    $('menu-btn').addEventListener('click', function (ev) { ev.stopPropagation(); openOverlay(E.menu); });
    $('menu-close').addEventListener('click', function () { closeOverlay(E.menu); });
    $('menu-save').addEventListener('click', function () { closeOverlay(E.menu); openSlots('save'); });
    $('menu-load').addEventListener('click', function () { closeOverlay(E.menu); openSlots('load'); });
    $('menu-cal').addEventListener('click', function () { closeOverlay(E.menu); openCalendar(); });
    $('cal-close').addEventListener('click', function () { closeOverlay(E.calendar); });
    $('menu-log').addEventListener('click', function () { closeOverlay(E.menu); openBacklog(); });
    $('menu-restart').addEventListener('click', function () {
      closeOverlay(E.menu);
      ask('처음부터 다시 시작할까요?\n(저장하지 않은 진행은 사라져요)', startNew);
    });
    $('menu-title').addEventListener('click', function () { closeOverlay(E.menu); toTitle(); });
    $('slots-close').addEventListener('click', function () { closeOverlay(E.slots); });
    $('backlog-close').addEventListener('click', function () { closeOverlay(E.backlog); });
    $('confirm-no').addEventListener('click', function () { closeOverlay(E.confirm); });
    $('summary-btn').addEventListener('click', toTitle);
    $('ending-btn').addEventListener('click', toTitle);
    E.btnEndings.addEventListener('click', openEndingList);
    E.btnGallery.addEventListener('click', openGallery);
    E.btnCollect.addEventListener('click', openCollect);
    $('gallery-close').addEventListener('click', function () { closeOverlay(E.gallery); });
    $('collect-close').addEventListener('click', function () { closeOverlay(E.collect); });
    $('cgview-close').addEventListener('click', function () { closeOverlay(E.cgview); });
    E.cgviewPrev.addEventListener('click', function () { cgViewMove(-1); });
    E.cgviewNext.addEventListener('click', function () { cgViewMove(1); });
    (function () {   // CG 전체 화면 보기: 좌우로 쓸어 넘기기
      var x0 = null;
      E.cgview.addEventListener('touchstart', function (ev) { x0 = ev.touches.length === 1 ? ev.touches[0].clientX : null; }, { passive: true });
      E.cgview.addEventListener('touchend', function (ev) {
        if (x0 === null) return;
        var dx = ev.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 50) cgViewMove(dx < 0 ? 1 : -1);
      }, { passive: true });
    })();
    E.tut.addEventListener('click', function (ev) { if (!ev.target.closest('#tut-skip')) tutAdvance(); });
    $('tut-skip').addEventListener('click', function (ev) { ev.stopPropagation(); tutEnd(true); });
    document.addEventListener('keydown', function (ev) {
      if (E.cgview.classList.contains('hidden')) return;
      if (ev.key === 'ArrowLeft') cgViewMove(-1); else if (ev.key === 'ArrowRight') cgViewMove(1); else if (ev.key === 'Escape') closeOverlay(E.cgview);
    });
    $('endings-close').addEventListener('click', function () { closeOverlay(E.endingList); });

    // 키보드(데스크톱 편의): 스페이스/엔터 = 진행
    document.addEventListener('keydown', function (ev) {
      if ((ev.key === ' ' || ev.key === 'Enter') && mode === 'text' && !ev.target.closest('button')) {
        ev.preventDefault();
        if (F.auto || F.skip) { stopFast(); return; }
        advance();
      }
    });

    // PWA 서비스 워커 (http/https 에서만)
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function (e) { warn('서비스 워커 등록 실패: ' + e.message); });
    }

    refreshTitle();
    showScreen('title');
  }

  // 테스트/디버그용 읽기 전용 접근자
  Object.defineProperty(VN, 'state', { get: function () { return S; } });
  Object.defineProperty(VN, 'mode', { get: function () { return mode; } });
  Object.defineProperty(VN, 'options', { get: function () { return curOpts; } });
  Object.defineProperty(VN, 'llm', { get: function () { return { state: LLM.state, server: LLM.server, chat: CH ? { id: CH.id, entry: CH.entry, busy: CH.busy, hist: CH.hist.length } : null, st: S && S.vars && S.vars.llm }; } });
  Object.defineProperty(VN, 'endings', { get: function () { return readEndings(); } });
  // 수집 현황 / 본 CG / 랜덤 사건 상태 / 튜토리얼 상태 (테스트/디버그용)
  Object.defineProperty(VN, 'collect', { get: function () { return collectStats(); } });
  Object.defineProperty(VN, 'cgSeen', { get: function () { return readRec('cg'); } });
  Object.defineProperty(VN, 'cgNow', { get: function () { return S ? (S.cg || null) : null; } });
  Object.defineProperty(VN, 'tut', { get: function () { return { on: TUT.on, stage: TUT.stage, i: TUT.i, next: TUT.next, done: !!store.get('tut') }; } });
  // 설정 / 읽은 대사 / 스킵·오토 상태 (테스트/디버그용)
  Object.defineProperty(VN, 'opt', { get: function () { return Object.assign({}, OPT); } });
  Object.defineProperty(VN, 'fast', { get: function () { return { auto: F.auto, skip: F.skip }; } });
  Object.defineProperty(VN, 'readCount', { get: function () { var n = 0; Object.keys(READ).forEach(function (k) { n += Object.keys(READ[k]).length; }); return n; } });
  VN.flushRead = flushRead;
  // 숙박 / 선물 / 등급 상태 (테스트/디버그용)
  Object.defineProperty(VN, 'lodging', { get: function () { return LG ? { stage: LG.stage, day: LG.day, sel: LG.sel, guests: LG.guests.map(function (g) { return g.id; }), assign: Object.assign({}, LG.assign), rej: Object.assign({}, LG.rej), out: LG.out } : null; } });
  Object.defineProperty(VN, 'gift', { get: function () { return { tab: GF.tab, target: GF.target, fixed: GF.fixed, stage: GF.stage, shopOk: GF.shopOk, open: !!E.gift && !E.gift.classList.contains('hidden') }; } });
  Object.defineProperty(VN, 'rankPopup', { get: function () { return !!E.rankup && !E.rankup.classList.contains('hidden'); } });
  // 영업 상태 (테스트/디버그용): 단계, 손님 순번, 고른 재료, 결과 목록
  Object.defineProperty(VN, 'tavern', { get: function () { return TV ? { id: TV.id, free: !!TV.free, bought: Object.assign({}, TV.bought), phase: TV.phase, idx: TV.idx, total: TV.queue.length, cur: TV.cur && TV.cur.who, order: TV.cur && TV.cur.order, sp: TV.cur && TV.cur.sp || null, spResult: TV.spResult, tasteHits: TV.tasteHits, sel: TV.sel.slice(), results: TV.results.map(function (r) { return { who: r.who, result: r.result, dish: r.dish, gold: r.gold, aff: r.aff, rep: r.rep, fav: r.fav, hate: r.hate, taste: r.taste, sp: r.sp, ids: r.ids }; }), repSum: TV.repSum } : null; } });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
