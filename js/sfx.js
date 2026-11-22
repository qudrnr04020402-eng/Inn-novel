// ============================================================
//  효과음 (WebAudio 합성 — 소리 파일이 하나도 필요 없습니다)
//  - SFX.play('select') 처럼 이름으로 재생. 이름 목록은 SFX.names (스토리의 {sfx:'이름'} 명령 검사에도 쓰임)
//  - 모바일 정책상 AudioContext 는 "첫 사용자 터치/클릭/키 입력" 안에서 만들고 resume 합니다.
//    그 전에 부르면 조용히 무시되고, 콘솔 경고도 나오지 않습니다 (신뢰할 수 없는 합성 이벤트도 무시).
//  - 어떤 오류가 나도 게임이 멈추지 않도록 모든 호출을 try/catch 로 감쌉니다.
//  - 새 효과음을 만들려면 아래 SYN 에 함수를 추가하고 NAMES 에 이름을 넣으면 됩니다.
// ============================================================
(function (root) {
  'use strict';
  var NAMES = ['tap', 'select', 'heart', 'heartDown', 'coin', 'perfect', 'fail', 'mystery', 'quake', 'door', 'page', 'discover', 'rankup'];
  var S = { names: NAMES, vol: 0.7, mute: false, ctx: null, master: null, noiseBuf: null, last: {},
    stats: { created: false, running: false, played: 0, ignored: 0, errors: 0, byName: {} } };
  var noop = function () {};

  // 볼륨 슬라이더(0~1)는 제곱 곡선으로 (작은 값에서도 조절이 잘 되게)
  function applyVol() { if (S.master) S.master.gain.value = S.mute ? 0 : S.vol * S.vol; }
  S.setVolume = function (v) { S.vol = Math.max(0, Math.min(1, Number(v) || 0)); applyVol(); };
  S.setMute = function (b) { S.mute = !!b; applyVol(); };

  S.unlock = function () {
    try {
      if (!S.ctx) {
        var AC = root.AudioContext || root.webkitAudioContext;
        if (!AC) return;
        S.ctx = new AC();
        S.master = S.ctx.createGain();
        S.master.connect(S.ctx.destination);
        applyVol();
        S.stats.created = true;
      }
      if (S.ctx.state === 'suspended') { var p = S.ctx.resume(); if (p && p.catch) p.catch(noop); }
      S.stats.running = S.ctx.state === 'running';
    } catch (e) { S.stats.errors++; }
  };

  // ---------- 합성 도우미 ----------
  function osc(c, type, f0, f1, t0, dur, vol, out) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(out);
    o.start(t0); o.stop(t0 + dur + 0.03);
    return o;
  }
  function noise(c, kind, freq, q, t0, dur, vol, out, freq1) {
    if (!S.noiseBuf) {
      var n = c.sampleRate, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      S.noiseBuf = b;
    }
    var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = S.noiseBuf; src.loop = true;
    f.type = kind; f.frequency.setValueAtTime(freq, t0); f.Q.value = q || 1;
    if (freq1) f.frequency.exponentialRampToValueAtTime(freq1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.05, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(out);
    src.start(t0); src.stop(t0 + dur + 0.05);
  }

  var SYN = {
    // 대사 넘김: 아주 작고 짧은 틱
    tap: function (c, t, o) { osc(c, 'triangle', 1400, 900, t, 0.035, 0.05, o); },
    // 선택지: 올라가는 두 음
    select: function (c, t, o) { osc(c, 'triangle', 660, 660, t, 0.07, 0.16, o); osc(c, 'triangle', 990, 990, t + 0.06, 0.1, 0.16, o); },
    // 호감도 상승: 반짝이는 아르페지오
    heart: function (c, t, o) { [880, 1175, 1568, 2093].forEach(function (f, i) { osc(c, 'sine', f, f, t + i * 0.07, 0.28, 0.14, o); osc(c, 'sine', f * 2, f * 2, t + i * 0.07, 0.15, 0.04, o); }); },
    // 호감도 하락: 내려가는 음
    heartDown: function (c, t, o) { osc(c, 'triangle', 440, 330, t, 0.16, 0.16, o); osc(c, 'triangle', 330, 220, t + 0.14, 0.24, 0.16, o); },
    // 골드: 동전 소리
    coin: function (c, t, o) { osc(c, 'square', 988, 988, t, 0.07, 0.07, o); osc(c, 'square', 1319, 1319, t + 0.07, 0.22, 0.07, o); },
    // 대성공: 짧은 팡파르
    perfect: function (c, t, o) { [523, 659, 784, 1047].forEach(function (f, i) { osc(c, 'square', f, f, t + i * 0.09, i === 3 ? 0.4 : 0.11, 0.07, o); osc(c, 'triangle', f / 2, f / 2, t + i * 0.09, i === 3 ? 0.4 : 0.11, 0.12, o); }); },
    // 실패: 풀 죽은 음
    fail: function (c, t, o) { osc(c, 'sawtooth', 247, 196, t, 0.22, 0.09, o); osc(c, 'sawtooth', 208, 110, t + 0.2, 0.42, 0.09, o); },
    // 정체불명 요리: 갸우뚱하게 일렁이는 소리
    mystery: function (c, t, o) { var x = osc(c, 'sine', 300, 900, t, 0.6, 0.12, o); try { var l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 9; lg.gain.value = 90; l.connect(lg); lg.connect(x.frequency); l.start(t); l.stop(t + 0.65); } catch (e) { /* 무시 */ } osc(c, 'triangle', 1200, 500, t + 0.25, 0.4, 0.05, o); },
    // 지진: 저음 럼블 (화면 흔들림과 같이 재생됨)
    quake: function (c, t, o) { noise(c, 'lowpass', 140, 0.8, t, 1.3, 0.9, o, 60); osc(c, 'sine', 46, 28, t, 1.3, 0.5, o); osc(c, 'sine', 70, 40, t + 0.1, 1.0, 0.25, o); },
    // 손님 등장: 문에 달린 종소리
    door: function (c, t, o) { [[1319, 0], [1976, 0.02], [2637, 0.04]].forEach(function (p, i) { osc(c, 'sine', p[0], p[0], t + p[1], 0.9 - i * 0.2, 0.13 - i * 0.03, o); }); osc(c, 'sine', 1319, 1319, t + 0.32, 0.7, 0.09, o); },
    // 메뉴/메뉴판: 종이 넘기는 소리
    page: function (c, t, o) { noise(c, 'bandpass', 2400, 0.9, t, 0.12, 0.35, o, 800); },
    // 여관 등급 상승: 밝고 당당한 팡파르
    rankup: function (c, t, o) { [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3], [784, 0.46], [1047, 0.56], [1319, 0.68]].forEach(function (p, i) { var d = i === 6 ? 0.7 : 0.16; osc(c, 'square', p[0], p[0], t + p[1], d, 0.07, o); osc(c, 'triangle', p[0] / 2, p[0] / 2, t + p[1], d, 0.12, o); osc(c, 'sine', p[0] * 2, p[0] * 2, t + p[1], d * 0.8, 0.03, o); }); },
    // 레시피 발견: 올라가는 반짝임
    discover: function (c, t, o) { [523, 659, 784, 988, 1175, 1568].forEach(function (f, i) { osc(c, 'triangle', f, f, t + i * 0.08, 0.35, 0.12, o); osc(c, 'sine', f * 2, f * 2, t + i * 0.08, 0.2, 0.04, o); }); }
  };

  S.play = function (name) {
    try {
      if (NAMES.indexOf(name) < 0) { S.stats.errors++; return false; }
      var c = S.ctx;
      if (!c || c.state !== 'running' || S.mute || S.vol <= 0) { S.stats.ignored++; return false; }
      var now = c.currentTime;
      if (S.last[name] != null && now - S.last[name] < (name === 'quake' ? 0.5 : 0.06)) { S.stats.ignored++; return false; } // 같은 소리가 겹쳐 시끄러워지지 않게
      S.last[name] = now;
      SYN[name](c, now + 0.005, S.master);
      S.stats.played++; S.stats.byName[name] = (S.stats.byName[name] || 0) + 1;
      return true;
    } catch (e) { S.stats.errors++; return false; }
  };

  // 첫 사용자 입력에서 AudioContext 생성/재개. isTrusted 가 아닌(스크립트가 만든) 이벤트는 무시한다 (브라우저 경고 방지)
  if (typeof document !== 'undefined') {
    ['pointerdown', 'touchend', 'click', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        if (!e.isTrusted) return;
        if (!S.ctx || S.ctx.state !== 'running') S.unlock();
      }, { capture: true, passive: true });
    });
  }

  root.SFX = S;
})(typeof globalThis !== 'undefined' ? globalThis : this);
