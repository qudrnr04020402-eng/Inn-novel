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
  var SAVE_VER = 3;
  var KEY = 'inn_vn_v3_';
  var store = {
    get: function (k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(KEY + k, v); return true; } catch (e) { return false; } }
  };
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

  // ---------- 설정 (옵션 화면) ----------
  // localStorage 'inn_vn_v3_opt' 에 저장. 회차/세이브와 무관하게 유지된다.
  var OPT_DEF = { textSpeed: 3, autoSpeed: 3, bgm: 60, sfx: 70, mute: false, skipUnread: false, easy: false };
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
      mute: !!o.mute, skipUnread: !!o.skipUnread, easy: !!o.easy
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
  // { 씬id: { 줄번호: 1 } } 를 localStorage 'inn_vn_v3_read' 에 { 씬id: [줄번호...] } 로 저장 (영업 임시 씬 __tv 는 기록하지 않음)
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
  var replay = false;   // 같은 줄을 다시 실행하는 중 (백로그에 중복 기록하지 않음)

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function warn(msg) { console.warn('[VN] ' + msg); }

  function freshState() {
    return {
      scene: STORY.start, pc: 0,
      vars: clone(STORY.init || {}),
      bg: null,
      sprites: { left: null, center: null, right: null },
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
    [E.menu, E.slots, E.backlog, E.confirm, E.endingList, E.chatPick, E.options].forEach(closeOverlay);
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
    E.hudDay.textContent = (S.vars.day || 1) + '일차 ' + (S.vars.time || '');
  }
  function toast(msg, cls) {
    var d = document.createElement('div');
    d.className = 'toast ' + (cls || '');
    d.textContent = msg;
    E.toasts.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 2200);
  }
  var LABELS = { gold: '골드', rep: '평판' };
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
        setPath(S.vars, k, v, true);
        var lb = labelOf(k);
        var isAff = /^aff\./.test(k);
        if (lb && v !== 0) toast((isAff && v > 0 ? '♥ ' : '') + lb + ' ' + (v > 0 ? '+' : '') + v, (v > 0 ? 'up' : 'down') + (isAff && v > 0 ? ' heart' : ''));
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
      showChoices(c.choice.filter(function (o) { return !o.if || evalCond(o.if, S.vars); }), !!c.talkpick);
      return true;
    }
    if ('talkoffer' in c) { // 낮 이벤트 뒤 "조금 더 이야기하기" 제안 (자유 대화가 가능할 때만. 아니면 그냥 지나감)
      var lst = LLMCore.ensureState(S.vars), tid = lst.last;
      if (tid && LLM.state === 'ready' && chatReady() && LLMCore.remaining(S.vars, tid, LLM_ST()) > 0) { showTalkOffer(tid); return true; }
      lst.last = '';
      next(); return false;
    }
    if ('day' in c) { // 일차 전환 화면: {day:2, time:'아침', tip:'...'}
      S.vars.day = c.day; S.vars.time = c.time || '아침';
      updateHud();
      refreshLlm();
      var dl = c.day + '일차 ' + S.vars.time;
      takeSnap(dl);
      pushLog({ name: '', color: '', text: '— ' + dl + ' —' });
      showCard(c.day + '일차', S.vars.time, c.tip);
      return true;
    }
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
    if ('__tv' in c) {                                             // 영업 내부 진행용 (스토리에서 쓰지 않음)
      if (c.__tv === 'brew') { openBrew(); return true; }
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
    if (curPick && o.who && CHARACTERS[o.who]) { // 낮에 함께 보낼 히로인을 골랐다: 자유 대화 대상으로 기억
      var lp = LLMCore.ensureState(S.vars);
      lp.last = o.who;
      if (lp.met.indexOf(o.who) < 0) lp.met.push(o.who);
    }
    curPick = false;
    if (o.talk) { enterChat(o.talk, 'offer'); return; }
    if (o.cost) applySet({ gold: -o.cost });
    applySet(o.set);
    if (o.goto) { if (!gotoScene(o.goto)) return; } else { next(); }
    run();
  }

  // 화면 탭: 타이핑 중이면 즉시 완성, 아니면 다음 줄
  //  fast=true: 오토/스킵이 부른 것 (사람이 탭하면 오토/스킵부터 꺼지므로 advance() 로 오지 않음)
  function advance(fast) {
    if (mode === 'chat') { if (typing) finishTyping(); return; }
    if (mode === 'card' && modal === 0) { sfx('tap'); E.card.classList.add('hidden'); next(); run(); return; }
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
  function showCard(title, sub, tip) {
    stopFast();
    stopTyping();
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
    E.cardBody.innerHTML = h;
    E.card.classList.remove('hidden');
    E.card.classList.remove('in'); void E.card.offsetWidth; E.card.classList.add('in');
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
    E.dialog.classList.add('hidden');
    E.choices.classList.add('hidden');
    var def = endingDef(id) || { id: id, title: id, desc: '' };
    var rec = readEndings(), total = endingDefs().length, got = Object.keys(rec).length;
    E.endLabel.textContent = 'ENDING ' + (endingDefs().indexOf(def) + 1) + ' / ' + total;
    E.endTitle.textContent = def.title;
    E.endDesc.textContent = def.desc || '';
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
    if (globalThis.BGM) BGM.play('stop');
    chatReset();
    tvReset();
    closeAllOverlays();
    E.summary.classList.add('hidden');
    E.ending.classList.add('hidden');
    E.card.classList.add('hidden');
    POS.forEach(function (p) { E.sprites[p].classList.remove('on'); });
    showScreen('game');
    updateHud();
    renderBg(null);
    run();
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
    E.card.classList.add('hidden');
    showScreen('game');
    updateHud();
    renderBg(S.bg, false);
    renderSprites(null);
    run();
  }

  // 슬롯 목록 화면. kind: 'save' | 'load'
  function openSlots(kind) {
    E.slotsTitle.textContent = kind === 'save' ? '저장하기' : '불러오기';
    E.slotList.innerHTML = '';
    var keys = kind === 'save' ? ['s1', 's2', 's3'] : ['auto', 's1', 's2', 's3'];
    if (kind === 'save' && snapLocked) toast('영업 중 저장은 영업 시작 시점으로 저장돼요', 'down');
    keys.forEach(function (k) {
      var d = readSlot(k);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot-btn';
      b.disabled = kind === 'load' && !d;
      var name = k === 'auto' ? '자동 저장' : '슬롯 ' + k.slice(1);
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
    if (TVE.root) {
      TVE.root.classList.add('hidden');
      ['brew', 'shop', 'sum', 'upg', 'menu', 'notes', 'found', 'stamp'].forEach(function (k) { TVE[k].classList.add('hidden'); });
      TVE.prog.classList.add('hidden');
      E.game.classList.remove('tv-brew');
    }
    if (STORY.scenes && STORY.scenes.__tv) delete STORY.scenes.__tv;
  }
  function tvPanel(name) { // 영업 화면 하나만 보이게 (menu/found 는 위에 겹쳐서 쓰므로 따로 다룸)
    ['brew', 'shop', 'sum', 'upg'].forEach(function (k) { TVE[k].classList.toggle('hidden', k !== name); });
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
  }

  function startTavern(dayId) {
    var def = TAVERN.days[dayId];
    if (!def) { warn('없는 영업 데이터: ' + dayId); next(); return false; }
    TavernCore.ensure(TAVERN, S.vars);
    TavernCore.resetToday(S.vars);
    stopFast();
    takeSnap('저녁 영업');            // 영업 중 저장은 이 시점으로 되돌아간다
    snapLocked = true;
    TV = {
      id: dayId, def: def, ret: { scene: S.scene, pc: S.pc },
      queue: TavernCore.queue(TAVERN, dayId, S.vars, evalCond), idx: -1, cur: null,
      results: [], sold: 0, tips: 0, spent: 0, repSum: 0, sel: [], phase: 'shop', note: '', startGold: tvGold(), startRep: S.vars.rep || 0,
      spGold: 0, spResult: null, tasteHits: 0
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
    TVE.shopInfo.textContent = '오늘 손님 ' + TV.queue.length + '명. 요리 하나에 재료가 2~3개 들어요. 모자라면 영업 중에 정중히 거절할 수 있지만 평판이 조금 깎입니다.' +
      (sp ? '\n★ 특별 주문 예고 — ' + sp.title + ': ' + sp.brief : '');
    TVE.shopList.innerHTML = '';
    Object.keys(TAVERN.ingredients).forEach(function (id) {
      var g = TAVERN.ingredients[id];
      var row = tvEl('div', 'tv-row');
      row.dataset.id = id;
      row.appendChild(tvIcon(id, 'tv-icon'));
      var mid = tvEl('div', 'tv-row-mid', '<b>' + g.name + '</b><small>' + g.price + 'G · 재고 <span class="tv-stk">' + (st[id] || 0) + '</span></small>');
      row.appendChild(mid);
      [1, 3].forEach(function (n) {
        var b = tvEl('button', 'tv-buy', '+' + n + '<small>' + (g.price * n) + 'G</small>');
        b.type = 'button'; b.dataset.n = n;
        if (tvGold() < g.price * n) b.disabled = true;
        b.addEventListener('click', function () { buyIng(id, n); });
        row.appendChild(b);
      });
      TVE.shopList.appendChild(row);
    });
  }
  function buyIng(id, n) {
    var g = TAVERN.ingredients[id], cost = g.price * n;
    if (tvGold() < cost) { toast('골드가 모자라요', 'down'); return; }
    sfx('select');
    S.vars.gold -= cost; TV.spent += cost;
    S.vars.tavern.stock[id] = (S.vars.tavern.stock[id] || 0) + n;
    updateHud(); renderShop();
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
    (cu.say || []).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who)); });
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
    stampTimer = setTimeout(function () { if (TVE.stamp) TVE.stamp.classList.add('hidden'); }, 2300);
  }
  function doServe() {
    if (!TV || TV.phase !== 'brew' || TV.sel.length < 2) return;
    var cu = TV.cur, ids = TV.sel.slice();
    var out = TavernCore.serve(TAVERN, S.vars, cu.who, cu.order, ids, TV, cu);
    TV.results.push(out);
    TV.sold += out.sale; TV.tips += out.tip;
    if (out.taste) TV.tasteHits++;
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
    asList(cu.after).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who, vars)); });
    // 단골 취향: 맞췄으면 보너스 대사, 주문은 맞췄는데 취향은 못 맞췄으면 (처음 한 번) 힌트 대사를 흘린다
    var td = def.taste, nt = TavernCore.note(S.vars, cu.who);
    if (td && out.taste) { var bl = TavernCore.pick(td.bonus); if (bl) cmds = cmds.concat(lineCmds(bl, cu.who, vars)); }
    else if (td && !nt.miss && !nt.taste && !out.fav && !out.hate && (out.result === 'fail' || out.result === 'good')) {
      nt.miss = true;
      asList(td.miss).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who, vars)); noteHint(nt, l); });
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
    var net = TV.sold + TV.tips + TV.spGold - TV.spent, repNow = TV.repSum;
    var aff = {};
    TV.results.forEach(function (r) { if (r.aff) aff[r.who] = (aff[r.who] || 0) + r.aff; });
    var h = '';
    h += '<div class="sum-row"><span>매출</span><b>+' + TV.sold + ' G</b></div>';
    h += '<div class="sum-row"><span>팁' + (TV.tasteHits ? ' (단골 보너스 ' + TV.tasteHits + '회)' : '') + '</span><b>+' + TV.tips + ' G</b></div>';
    if (TV.spResult) {
      var sr = TV.spResult;
      h += '<div class="sum-row sp ' + (sr.ok ? 'ok' : 'bad') + '"><span>★ 특별 주문 · ' + sr.title + '</span><b class="' + (sr.ok ? 'plus' : 'minus') + '">' + (sr.ok ? '성공 +' + sr.gold + ' G' : '실패') + (sr.rep ? ' / 평판 ' + (sr.rep > 0 ? '+' : '') + sr.rep : '') + '</b></div>';
    }
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
    t.days[TV.id] = { sales: TV.sold, tips: TV.tips, spent: TV.spent, rep: TV.repSum, special: TV.spResult ? (TV.spResult.ok ? 'win' : 'lose') : '', spGold: TV.spGold, perfect: t.t.perfect, good: t.t.good, fail: t.t.fail, mystery: t.t.mystery };
    var ret = TV.ret;
    pushLog({ name: '', color: '', text: '— 영업 결산: 매출 ' + TV.sold + 'G, 팁 ' + TV.tips + 'G' + (TV.spGold ? ', 특별 주문 +' + TV.spGold + 'G' : '') + ', 장보기 ' + TV.spent + 'G —' });
    tvReset();
    S.scene = ret.scene; S.pc = ret.pc + 1;
    run();
  }

  // ----- 밤: 여관 업그레이드 -----
  function openUpgrades() {
    stopFast();
    TavernCore.ensure(TAVERN, S.vars);
    takeSnap('여관 업그레이드');
    E.toasts.innerHTML = '';
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
      var owned = !!have[u.id];
      var card = tvEl('div', 'tv-upg-card' + (owned ? ' owned' : ''));
      card.dataset.id = u.id;
      card.appendChild(tvEl('div', 'tv-upg-tx', '<b>' + u.name + '</b><span>' + u.desc + '</span>'));
      var b = tvEl('button', 'tv-upg-buy', owned ? '구입 완료' : u.price + 'G');
      b.type = 'button';
      if (owned || tvGold() < u.price) b.disabled = true;
      b.addEventListener('click', function () { buyUpgrade(u); });
      card.appendChild(b);
      TVE.upgList.appendChild(card);
    });
  }
  function buyUpgrade(u) {
    if (S.vars.tavern.upg[u.id] || tvGold() < u.price) return;
    S.vars.gold -= u.price;
    S.vars.tavern.upg[u.id] = true;
    if (u.learn) learnRecipes(u.learn);
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

  // ---------- 설정 화면 ----------
  var SPEED_NAMES = ['매우 느림', '느림', '보통', '빠름', '매우 빠름'];
  var OPT_TOGGLES = [['opt-mute', 'mute'], ['opt-unread', 'skipUnread'], ['opt-easy', 'easy']];
  function renderOptions() {
    $('opt-text').value = OPT.textSpeed; $('opt-auto').value = OPT.autoSpeed; $('opt-bgm').value = OPT.bgm; $('opt-sfx').value = OPT.sfx;
    $('opt-text-v').textContent = SPEED_NAMES[OPT.textSpeed - 1]; $('opt-auto-v').textContent = SPEED_NAMES[OPT.autoSpeed - 1];
    $('opt-bgm-v').textContent = OPT.bgm + '%'; $('opt-sfx-v').textContent = OPT.sfx + '%';
    OPT_TOGGLES.forEach(function (p) {
      var b = $(p[0]), on = !!OPT[p[1]];
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.opt-state').textContent = on ? '켜짐' : '꺼짐';
    });
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
    E.hudGold = $('hud-gold'); E.hudRep = $('hud-rep'); E.hudDay = $('hud-day');
    E.btnContinue = $('btn-continue'); E.btnTitleLoad = $('btn-title-load');
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
    $('tv-shop-start').addEventListener('click', function () { TVE.shop.classList.add('hidden'); tvNextCustomer(); });
    $('tv-sum-btn').addEventListener('click', tvClose);
    $('tv-upg-next').addEventListener('click', closeUpgrades);

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
  // 설정 / 읽은 대사 / 스킵·오토 상태 (테스트/디버그용)
  Object.defineProperty(VN, 'opt', { get: function () { return Object.assign({}, OPT); } });
  Object.defineProperty(VN, 'fast', { get: function () { return { auto: F.auto, skip: F.skip }; } });
  Object.defineProperty(VN, 'readCount', { get: function () { var n = 0; Object.keys(READ).forEach(function (k) { n += Object.keys(READ[k]).length; }); return n; } });
  VN.flushRead = flushRead;
  // 영업 상태 (테스트/디버그용): 단계, 손님 순번, 고른 재료, 결과 목록
  Object.defineProperty(VN, 'tavern', { get: function () { return TV ? { phase: TV.phase, idx: TV.idx, total: TV.queue.length, cur: TV.cur && TV.cur.who, order: TV.cur && TV.cur.order, sp: TV.cur && TV.cur.sp || null, spResult: TV.spResult, tasteHits: TV.tasteHits, sel: TV.sel.slice(), results: TV.results.map(function (r) { return { who: r.who, result: r.result, dish: r.dish, gold: r.gold, aff: r.aff, rep: r.rep, fav: r.fav, hate: r.hate, taste: r.taste, sp: r.sp, ids: r.ids }; }), repSum: TV.repSum } : null; } });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
