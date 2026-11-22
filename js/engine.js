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

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function warn(msg) { console.warn('[VN] ' + msg); }

  function freshState() {
    return {
      scene: STORY.start, pc: 0,
      vars: clone(STORY.init || {}),
      bg: null,
      sprites: { left: null, center: null, right: null },
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
  function openOverlay(el) { if (el.classList.contains('hidden')) { el.classList.remove('hidden'); modal++; } }
  function closeOverlay(el) { if (!el.classList.contains('hidden')) { el.classList.add('hidden'); modal--; } }
  function closeAllOverlays() {
    [E.menu, E.slots, E.backlog, E.confirm, E.endingList].forEach(closeOverlay);
    modal = 0;
  }

  function toTitle() {
    stopTyping();
    tvReset();
    closeAllOverlays();
    E.summary.classList.add('hidden');
    E.ending.classList.add('hidden');
    E.card.classList.add('hidden');
    mode = 'title';
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
  function applySet(set) {
    Object.keys(set || {}).forEach(function (k) {
      var v = set[k];
      if (typeof v === 'number') {
        setPath(S.vars, k, v, true);
        var lb = labelOf(k);
        var isAff = /^aff\./.test(k);
        if (lb && v !== 0) toast((isAff && v > 0 ? '♥ ' : '') + lb + ' ' + (v > 0 ? '+' : '') + v, (v > 0 ? 'up' : 'down') + (isAff && v > 0 ? ' heart' : ''));
        if (isAff && v > 0) heartBurst(k.slice(4));
      } else {
        setPath(S.vars, k, v, false);
      }
    });
    updateHud();
  }

  // ---------- 텍스트 출력 (타이핑 효과) ----------
  var TYPE_MS = 28;
  function stopTyping() {
    if (typing) { clearInterval(typing.timer); typing = null; }
  }
  function startTyping(text) {
    stopTyping();
    var chars = Array.from(text), i = 0;
    E.text.textContent = '';
    E.nextMark.classList.remove('on');
    typing = { full: text, timer: setInterval(function () {
      i++;
      E.text.textContent = chars.slice(0, i).join('');
      if (i >= chars.length) finishTyping();
    }, TYPE_MS) };
    if (!chars.length) finishTyping();
  }
  function finishTyping() {
    if (!typing) return;
    var full = typing.full;
    stopTyping();
    E.text.textContent = full;
    E.nextMark.classList.add('on');
  }

  // 현재 줄을 스냅샷으로 저장(자동 저장 포함)
  function takeSnap(label) {
    if (snapLocked) return; // 영업 중: 영업 시작 시점 스냅샷을 유지
    snap = clone(S);
    snap.label = label;
    writeSlot('auto', snap);
  }
  function pushLog(entry) {
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
      startTyping(text);
      return true;
    }
    if ('narr' in c) {
      var nt = interp(c.narr);
      takeSnap(nt.slice(0, 26));
      pushLog({ name: '', color: '', text: nt });
      E.dialog.classList.add('narr');
      E.nametag.classList.add('hidden');
      renderSprites(null);
      E.dialog.classList.remove('hidden');
      E.choices.classList.add('hidden');
      mode = 'text';
      startTyping(nt);
      return true;
    }
    if ('choice' in c) {
      var opts = c.choice.filter(function (o) { return !o.if || evalCond(o.if, S.vars); });
      takeSnap('선택지');
      mode = 'choice';
      curOpts = opts;
      stopTyping();
      E.nextMark.classList.remove('on');
      E.choices.innerHTML = '';
      opts.forEach(function (o) { E.choices.appendChild(makeChoiceBtn(o)); });
      E.choices.classList.remove('hidden');
      E.choices.scrollTop = 0;
      return true;
    }
    if ('day' in c) { // 일차 전환 화면: {day:2, time:'아침', tip:'...'}
      S.vars.day = c.day; S.vars.time = c.time || '아침';
      updateHud();
      var dl = c.day + '일차 ' + S.vars.time;
      takeSnap(dl);
      pushLog({ name: '', color: '', text: '— ' + dl + ' —' });
      showCard(c.day + '일차', S.vars.time, c.tip);
      return true;
    }
    if ('time' in c) { // 시간대 표시만 바꿈: {time:'낮'}
      S.vars.time = c.time; updateHud(); next(); return false;
    }
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

  // 선택지 클릭
  function pick(o) {
    if (mode !== 'choice') return;
    if (o.cost && (S.vars.gold || 0) < o.cost) return; // 골드 부족
    pushLog({ name: '', color: '', text: '▶ ' + interp(o.text), choice: true });
    E.choices.classList.add('hidden');
    curOpts = [];
    if (o.cost) applySet({ gold: -o.cost });
    applySet(o.set);
    if (o.goto) { if (!gotoScene(o.goto)) return; } else { next(); }
    run();
  }

  // 화면 탭: 타이핑 중이면 즉시 완성, 아니면 다음 줄
  function advance() {
    if (mode === 'card' && modal === 0) { E.card.classList.add('hidden'); next(); run(); return; }
    if (mode !== 'text' || modal > 0) return;
    if (typing) { finishTyping(); return; }
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
    S = freshState();
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
    S = clone(sn);
    delete S.label;
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
      ['brew', 'shop', 'sum', 'upg', 'menu', 'found', 'stamp'].forEach(function (k) { TVE[k].classList.add('hidden'); });
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
    takeSnap('저녁 영업');            // 영업 중 저장은 이 시점으로 되돌아간다
    snapLocked = true;
    TV = {
      id: dayId, def: def, ret: { scene: S.scene, pc: S.pc },
      queue: TavernCore.queue(TAVERN, dayId, S.vars, evalCond), idx: -1, cur: null,
      results: [], sold: 0, tips: 0, spent: 0, repSum: 0, sel: [], phase: 'shop', note: '', startGold: tvGold(), startRep: S.vars.rep || 0
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
    return '손님 ' + Math.min(TV.idx + 1, TV.queue.length) + ' / ' + TV.queue.length;
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
    TVE.shopInfo.textContent = '오늘 손님 ' + TV.queue.length + '명. 요리 하나에 재료가 2~3개 들어요. 모자라면 영업 중에 정중히 거절할 수 있지만 평판이 조금 깎입니다.';
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
  function tvNextCustomer() {
    TV.idx++;
    TVE.stamp.classList.add('hidden'); // 앞 손님의 판정 도장 정리
    E.game.classList.remove('tv-brew');
    TVE.brew.classList.add('hidden');
    if (TV.idx >= TV.queue.length) { tvSummary(); return; }
    var cu = TV.queue[TV.idx];
    TV.cur = cu; TV.sel = []; TV.note = '';
    TV.phase = 'talk';
    TVE.prog.textContent = progText(); TVE.prog.classList.remove('hidden');
    var cmds = [{ hide: 'all' }, { show: cu.who, face: 'normal', pos: 'center' }];
    (cu.say || []).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who)); });
    var od = { say: cu.who, text: cu.order.text };
    if (cu.order.face) od.face = cu.order.face;
    cmds.push(od);
    cmds.push({ __tv: 'brew' });
    STORY.scenes.__tv = cmds; S.scene = '__tv'; S.pc = 0;
    run();
  }

  // ----- 재료 고르기 -----
  function openBrew() {
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
    TVE.cust.textContent = ch.name || cu.who; TVE.cust.style.color = ch.color || '#fff';
    TVE.orderText.textContent = '"' + cu.order.text + '"';
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
    if (TV.sel.length >= 2) {
      var r = selRecipe();
      note = (r && S.vars.tavern.known[r.id]) ? '▶ ' + r.name + '  ' + tagChips(r.tags) : '▶ 처음 보는 조합이에요. 어떤 요리가 될까요?';
    }
    if (!TavernCore.canBrew(TAVERN, st)) note = '재료가 모자라요. 정중히 거절할 수 있어요.';
    TVE.note.innerHTML = note || '재료를 2~3개 골라 "내기"를 눌러 보세요.';
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
    var out = TavernCore.serve(TAVERN, S.vars, cu.who, cu.order, ids, TV);
    TV.results.push(out);
    TV.sold += out.sale; TV.tips += out.tip;
    var d = {};
    if (out.gold) d.gold = out.gold;
    if (out.rep) d.rep = out.rep;
    if (out.aff) d['aff.' + cu.who] = out.aff;
    TV.phase = 'react';
    TVE.brew.classList.add('hidden'); E.game.classList.remove('tv-brew');
    var go = function () {
      applySet(d);
      showStamp(out);
      tvReaction(cu, out);
    };
    if (out.discovered) showFound(out, go); else go();
  }
  function doSkip() {
    if (!TV || TV.phase !== 'brew') return;
    var cu = TV.cur, out = TavernCore.skip(TAVERN, S.vars, TV);
    out.who = cu.who; out.dish = '거절'; out.sale = 0; out.tip = 0;
    TV.results.push(out);
    TV.phase = 'react';
    TVE.brew.classList.add('hidden'); E.game.classList.remove('tv-brew');
    if (out.rep) applySet({ rep: out.rep });
    var cmds = lineCmds({ text: TAVERN.skipLine || '아쉽지만… 다음에 다시 올게요.', face: 'sad' }, cu.who);
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
    var g = cu.gain;
    if (g && asList(g.on || ['perfect', 'good']).indexOf(out.result) >= 0 && !S.vars.tavern.known[g.learn]) {
      cmds.push({ learn: g.learn });
      asList(g.lines).forEach(function (l) { cmds = cmds.concat(lineCmds(l, cu.who, vars)); });
    }
    cmds.push({ __tv: 'next' });
    STORY.scenes.__tv = cmds; S.scene = '__tv'; S.pc = 0;
    mode = 'text';
    run();
  }

  // ----- 레시피 발견 -----
  function showFound(out, cont) {
    var r = out.recipe;
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

  // ----- 하루 결산 -----
  var RES_ICON = { perfect: '★', good: '○', fail: '✕', mystery: '？', skip: '－' };
  function tvSummary() {
    TV.phase = 'summary';
    POS.forEach(function (p) { S.sprites[p] = null; });
    renderSprites(null);
    E.dialog.classList.add('hidden');
    tvPanel('sum');
    E.toasts.innerHTML = ''; // 마지막 손님의 알림이 결산 위에 남지 않게 정리
    TVE.prog.classList.add('hidden');
    var net = TV.sold + TV.tips - TV.spent, repNow = TV.repSum;
    var aff = {};
    TV.results.forEach(function (r) { if (r.aff) aff[r.who] = (aff[r.who] || 0) + r.aff; });
    var h = '';
    h += '<div class="sum-row"><span>매출</span><b>+' + TV.sold + ' G</b></div>';
    h += '<div class="sum-row"><span>팁</span><b>+' + TV.tips + ' G</b></div>';
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
      var w = tvEl('div', 'tv-res r-' + r.result);
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
    t.days[TV.id] = { sales: TV.sold, tips: TV.tips, spent: TV.spent, rep: TV.repSum, perfect: t.t.perfect, good: t.t.good, fail: t.t.fail, mystery: t.t.mystery };
    var ret = TV.ret;
    pushLog({ name: '', color: '', text: '— 영업 결산: 매출 ' + TV.sold + 'G, 팁 ' + TV.tips + 'G, 장보기 ' + TV.spent + 'G —' });
    tvReset();
    S.scene = ret.scene; S.pc = ret.pc + 1;
    run();
  }

  // ----- 밤: 여관 업그레이드 -----
  function openUpgrades() {
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
    toast('구입: ' + u.name, 'up');
    updateHud();
    takeSnap('여관 업그레이드'); // 구매 결과를 반영해 다시 저장 (불러와도 구매가 유지됨)
    renderUpgrades();
  }
  function closeUpgrades() {
    TVE.root.classList.add('hidden'); TVE.upg.classList.add('hidden');
    next(); run();
  }

  // ---------- 초기화 ----------
  function init() {
    ['title', 'game', 'bg', 'hud', 'dialog', 'nametag', 'text', 'choices', 'toasts', 'menu', 'slots', 'backlog',
      'summary', 'confirm', 'ending', 'fx', 'flash'].forEach(function (id) { E[id] = $(id); });
    E.card = $('daycard'); E.cardTitle = $('card-title'); E.cardSub = $('card-sub'); E.cardTip = $('card-tip'); E.cardBody = $('card-body');
    E.endLabel = $('ending-label'); E.endTitle = $('ending-title'); E.endDesc = $('ending-desc'); E.endNew = $('ending-new');
    E.endCount = $('ending-count'); E.endPic = $('ending-pic'); E.endBody = $('ending-body');
    E.btnEndings = $('btn-endings'); E.endingList = $('endings'); E.endingListBody = $('endings-body'); E.endingListCount = $('endings-count');
    E.nextMark = $('next-mark');
    E.hudGold = $('hud-gold'); E.hudRep = $('hud-rep'); E.hudDay = $('hud-day');
    E.btnContinue = $('btn-continue'); E.btnTitleLoad = $('btn-title-load');
    E.slotsTitle = $('slots-title'); E.slotList = $('slot-list');
    E.backlogList = $('backlog-list');
    E.summaryTitle = $('summary-title'); E.summaryNote = $('summary-note'); E.summaryBody = $('summary-body');
    E.confirmMsg = $('confirm-msg'); E.confirmYes = $('confirm-yes');
    E.sprites = {};
    POS.forEach(function (p) { E.sprites[p] = document.querySelector('.sprite[data-pos="' + p + '"]'); });

    // 저녁 영업 화면 요소
    TVE.root = $('tavern'); TVE.prog = $('tv-prog'); TVE.brew = $('tv-brew'); TVE.shop = $('tv-shop'); TVE.sum = $('tv-sum'); TVE.upg = $('tv-upg');
    TVE.menu = $('tv-menu'); TVE.found = $('tv-found'); TVE.stamp = $('tv-stamp');
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
    $('tv-shop-board').addEventListener('click', function () { openBoard(false); });
    $('tv-board-close').addEventListener('click', function () { TVE.menu.classList.add('hidden'); });
    $('tv-shop-start').addEventListener('click', function () { TVE.shop.classList.add('hidden'); tvNextCustomer(); });
    $('tv-sum-btn').addEventListener('click', tvClose);
    $('tv-upg-next').addEventListener('click', closeUpgrades);

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
    E.card.addEventListener('click', advance);

    // 게임 화면 탭 = 진행
    E.game.addEventListener('click', function (ev) {
      if (ev.target.closest('button')) return;
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
        ev.preventDefault(); advance();
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
  Object.defineProperty(VN, 'endings', { get: function () { return readEndings(); } });
  // 영업 상태 (테스트/디버그용): 단계, 손님 순번, 고른 재료, 결과 목록
  Object.defineProperty(VN, 'tavern', { get: function () { return TV ? { phase: TV.phase, idx: TV.idx, total: TV.queue.length, cur: TV.cur && TV.cur.who, order: TV.cur && TV.cur.order, sel: TV.sel.slice(), results: TV.results.map(function (r) { return { who: r.who, result: r.result, dish: r.dish, gold: r.gold, aff: r.aff, rep: r.rep, fav: r.fav, hate: r.hate }; }), repSum: TV.repSum } : null; } });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
