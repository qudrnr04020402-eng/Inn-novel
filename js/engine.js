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
  var SAVE_VER = 2;
  var KEY = 'inn_vn_v2_';
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
  var mode = 'title';  // title | text | choice | card | summary | ending
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

  function faceUrl(id, face) {
    var c = CHARACTERS[id];
    if (!c) { warn('없는 캐릭터: ' + id); return ''; }
    var f = c.faces[face] || c.faces[Object.keys(c.faces)[0]];
    if (!c.faces[face]) warn('없는 표정: ' + id + '.' + face);
    return f;
  }
  // speaker: 말하는 캐릭터 id (그 외는 어둡게). null 이면 모두 밝게
  function renderSprites(speaker) {
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
      im.alt = ''; im.src = ch.faces.normal || ch.faces[Object.keys(ch.faces)[0]];
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
    if (ch) E.endPic.src = ch.faces[def.face] || ch.faces.smile || ch.faces[Object.keys(ch.faces)[0]];
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
      if (have && ch) { var im = document.createElement('img'); im.alt = ''; im.src = ch.faces[d.face] || ch.faces.smile; pic.appendChild(im); pic.style.borderColor = ch.color; }
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
