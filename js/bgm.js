// ============================================================
//  BGM 재생기 (story/audio.js 의 트랙 정의를 읽음)
//  - BGM.play('inn_day') / BGM.play('stop') / BGM.stop()
//  - 곡이 바뀔 때 1초 크로스페이드, 볼륨/음소거는 설정 화면에서 BGM.setVolume / setMute 로 반영
//  - file 이 null 이거나 로드에 실패한 트랙은 조용히 무시합니다. (null 인 트랙은 요청 자체를 하지 않음)
//  - 탭이 백그라운드로 가면 일시정지, 돌아오면 이어서 재생 (visibilitychange)
//  - 모바일은 첫 터치 전에는 소리를 낼 수 없어서, 막혀 있던 곡은 첫 입력 때 다시 시도합니다.
// ============================================================
(function (root) {
  'use strict';
  var B = { want: null, vol: 0.6, mute: false, live: [], failed: {}, blocked: false, hidden: false, timer: 0 };
  var noop = function () {};

  function def(id) { var A = root.AUDIO; return A && A.tracks && A.tracks[id] ? A.tracks[id] : null; }
  function fadeMs() { var A = root.AUDIO; return (A && A.fadeMs) || 1000; }
  function level(it) { var d = def(it.id) || {}; return (d.gain == null ? 1 : d.gain); }
  function apply(it) { try { it.el.volume = Math.max(0, Math.min(1, it.k * level(it) * (B.mute ? 0 : B.vol))); } catch (e) { /* 무시 */ } }
  function kill(it) {
    try { it.el.pause(); it.el.removeAttribute('src'); it.el.load(); } catch (e) { /* 무시 */ }
    var i = B.live.indexOf(it); if (i >= 0) B.live.splice(i, 1);
  }
  function tick() {
    var step = 50 / fadeMs();
    B.live.slice().forEach(function (it) {
      if (it.k < it.goal) it.k = Math.min(it.goal, it.k + step);
      else if (it.k > it.goal) it.k = Math.max(it.goal, it.k - step);
      apply(it);
      if (it.goal === 0 && it.k === 0) kill(it);
    });
    if (!B.live.some(function (it) { return it.k !== it.goal; })) { clearInterval(B.timer); B.timer = 0; }
  }
  function ensureTimer() { if (!B.timer) B.timer = setInterval(tick, 50); }
  function tryPlay(it) {
    try {
      var p = it.el.play();
      if (p && p.catch) p.catch(function () { B.blocked = true; });   // 자동재생이 막힘 -> 첫 입력 때 재시도
    } catch (e) { B.blocked = true; }
  }
  function fadeOutAll() { B.live.forEach(function (it) { it.goal = 0; }); if (B.live.length) ensureTimer(); }

  function start(id, d) {
    var el;
    try { el = new Audio(); } catch (e) { return; }
    var it = { id: id, el: el, k: 0, goal: 1 };
    el.preload = 'auto';
    el.loop = d.loop !== false;
    el.addEventListener('error', function () { B.failed[id] = true; kill(it); });   // 못 읽는 파일: 조용히 비활성
    el.src = d.file;
    B.live.push(it);
    apply(it);
    if (!B.hidden) tryPlay(it);
    ensureTimer();
  }

  B.play = function (id) {
    if (!id || id === 'stop') return B.stop();
    B.want = id;
    var cur = B.live.filter(function (it) { return it.goal === 1; })[0];
    if (cur && cur.id === id) return;
    fadeOutAll();
    var d = def(id);
    if (!d || !d.file || B.failed[id]) return;   // 파일 없음(null): 아무것도 하지 않는다
    start(id, d);
  };
  B.stop = function () { B.want = null; fadeOutAll(); };
  B.setVolume = function (v) { B.vol = Math.max(0, Math.min(1, Number(v) || 0)); B.live.forEach(apply); };
  B.setMute = function (b) { B.mute = !!b; B.live.forEach(apply); };
  // 테스트/디버그: 지금 상태
  B.info = function () {
    var cur = B.live.filter(function (it) { return it.goal === 1; })[0];
    return { want: B.want, playing: cur ? cur.id : null, live: B.live.length, vol: B.vol, mute: B.mute, blocked: B.blocked, hidden: B.hidden, failed: Object.keys(B.failed) };
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      B.hidden = document.hidden;
      B.live.forEach(function (it) { if (B.hidden) { try { it.el.pause(); } catch (e) { /* 무시 */ } } else tryPlay(it); });
    });
    ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        if (!e.isTrusted || !B.blocked || B.hidden) return;
        B.blocked = false;
        B.live.forEach(function (it) { if (it.el.paused) tryPlay(it); });
      }, { capture: true, passive: true });
    });
  }

  root.BGM = B;
})(typeof globalThis !== 'undefined' ? globalThis : this);
