// 히로인 일러스트(SVG) 생성기: node tools/gen-chars.js
// - 히로인 4명 x 표정 6종(normal/smile/angry/shy/surprised/sad)을 assets/char/<id>/<표정>.svg 로 만든다.
// - 400x600 상반신. 머리색/머리 모양/귀/꼬리/의상으로 구분. PNG 일러스트로 교체할 때는 이 파일은 무시해도 된다.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'assets', 'char');

const SKIN = '#ffe7d8', SHADE = '#f4c6b0', LINE = '#7a4a3c';
const FACE = 'M134,226 C134,172 164,150 200,150 C236,150 266,172 266,226 C266,276 240,332 200,338 C160,332 134,276 134,226Z';
const BODY = 'M64,600 C64,470 108,396 184,382 L216,382 C292,396 336,470 336,600Z';

// ---------- 히로인별 설정 ----------
const HEROINES = {
  // 엘프 마법사: 은발 장발, 푸른 눈, 긴 귀, 푸른빛 책
  erion: {
    hair: ['#fbfcff', '#cdd5f2', '#7c88c4'], iris: ['#2250c8', '#7fd4ff'], brow: '#7c88c4', pupil: '#102460',
    back: 'M120,214 C104,128 150,106 200,106 C250,106 296,128 280,214 L314,470 C318,520 302,566 286,600 L114,600 C98,566 82,520 86,470Z',
    ears() {
      return ['L', 'R'].map((s, i) => {
        const m = i ? -1 : 1, x = (v) => 200 + (v - 200) * m;
        return `<path d="M${x(138)},232 L${x(76)},196 L${x(134)},276Z" fill="${SKIN}" stroke="${SHADE}" stroke-width="3" stroke-linejoin="round"/>` +
               `<path d="M${x(130)},236 L${x(92)},210 L${x(128)},262Z" fill="#ffc3b8" opacity=".55"/>`;
      }).join('');
    },
    front: 'M200,124 C148,124 122,170 126,250 C138,216 158,198 182,172 C190,164 196,158 200,152 C204,158 210,164 218,172 C242,198 262,216 274,250 C278,170 252,124 200,124Z',
    strands: 'M128,236 C120,300 116,380 102,472 C100,504 114,516 124,494 C138,430 144,330 152,262Z M272,236 C280,300 284,380 298,472 C300,504 286,516 276,494 C262,430 256,330 248,262Z',
    hl: 'M156,152 C176,134 224,134 244,152',
    outfit() {
      return `<path d="${BODY}" fill="#2f3a7c" stroke="#1d2456" stroke-width="3"/>` +
        `<path d="M64,600 C64,520 80,470 100,440 L130,450 L120,600Z" fill="#3b4796" opacity=".7"/>` +
        `<path d="M150,386 L200,520 L250,386 L232,384 L200,470 L168,384Z" fill="#f2f0ff"/>` +
        `<path d="M150,386 L200,520 L250,386" fill="none" stroke="#e1c15e" stroke-width="4"/>` +
        `<path d="M76,560 L324,560" stroke="#e1c15e" stroke-width="3" opacity=".6"/>` +
        `<circle cx="200" cy="440" r="9" fill="#e1c15e" stroke="#9c7f2a" stroke-width="2"/>` +
        // 푸른빛 책
        `<circle cx="292" cy="512" r="64" fill="url(#glow)"/>` +
        `<g transform="rotate(-14 292 512)"><rect x="258" y="478" width="68" height="84" rx="6" fill="#2a63d6" stroke="#e1c15e" stroke-width="4"/>` +
        `<circle cx="292" cy="520" r="17" fill="none" stroke="#bff3ff" stroke-width="3"/><path d="M292,503 L296,517 L310,520 L296,523 L292,537 L288,523 L274,520 L288,517Z" fill="#e8ffff"/></g>`;
    },
    defs: '<radialGradient id="glow"><stop offset="0" stop-color="#e8ffff"/><stop offset=".4" stop-color="#5de6ff" stop-opacity=".8"/><stop offset="1" stop-color="#5de6ff" stop-opacity="0"/></radialGradient>',
    acc: ''
  },

  // 인간 여기사: 붉은 포니테일, 호기로운 눈, 은빛 갑옷 + 가격표
  kaela: {
    hair: ['#ff8a5a', '#e5463a', '#8e1f26'], iris: ['#b32a2a', '#ffb070'], brow: '#8e1f26', pupil: '#4a0f12',
    back: 'M126,226 C116,148 156,108 200,108 C244,108 286,148 274,226Z M262,150 C340,140 380,230 356,330 C348,376 326,414 302,438 C312,384 304,334 272,296Z',
    ears() { return ''; },
    front: 'M128,244 C120,160 152,122 204,122 C254,122 282,158 274,240 C268,208 254,186 240,176 C228,198 214,208 196,208 C184,196 176,186 170,172 C160,194 148,220 128,244Z',
    strands: 'M200,124 C192,94 214,80 230,90 C216,96 214,110 208,126Z',
    hl: 'M154,150 C176,132 226,132 248,150',
    outfit() {
      return `<path d="${BODY}" fill="#c43d3d" stroke="#7d2020" stroke-width="3"/>` +
        `<path d="M160,386 L240,386 L262,600 L138,600Z" fill="#cfd8e6" stroke="#7b869a" stroke-width="3"/>` +
        `<path d="M170,400 L230,400 L246,520 L154,520Z" fill="#e8eef8" opacity=".55"/>` +
        `<circle cx="200" cy="470" r="22" fill="#e1b84a" stroke="#8a6a14" stroke-width="3"/>` +
        `<path d="M200,454 L206,466 L220,468 L210,477 L213,491 L200,484 L187,491 L190,477 L180,468 L194,466Z" fill="#fff0b0"/>` +
        `<ellipse cx="108" cy="440" rx="54" ry="40" fill="#d3dbe8" stroke="#7b869a" stroke-width="3"/>` +
        `<ellipse cx="292" cy="440" rx="54" ry="40" fill="#d3dbe8" stroke="#7b869a" stroke-width="3"/>` +
        `<path d="M70,434 Q108,404 146,434" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>` +
        `<path d="M254,434 Q292,404 330,434" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>` +
        `<path d="M170,386 C176,402 190,410 200,410 C210,410 224,402 230,386Z" fill="#26325c"/>` +
        // 가격표 (아직 안 뗐다)
        `<path d="M326,468 C334,500 338,520 336,540" stroke="#555" stroke-width="2" fill="none"/>` +
        `<g transform="rotate(8 336 560)"><rect x="318" y="538" width="38" height="46" rx="3" fill="#fffbe6" stroke="#b33" stroke-width="2"/>` +
        `<circle cx="337" cy="546" r="3" fill="#fff" stroke="#555"/><path d="M324,562 H350 M324,570 H344" stroke="#d33" stroke-width="3"/></g>`;
    },
    defs: '',
    acc: '<circle cx="268" cy="166" r="9" fill="#f2c94c" stroke="#9c7a1a" stroke-width="2.5"/>' +
      '<path d="M120,196 L138,172" stroke="#f2c94c" stroke-width="0"/>'
  },

  // 여우 수인 도적: 금빛 단발, 여우 귀, 큰 꼬리, 세로 동공
  miho: {
    hair: ['#ffd27a', '#f5a53a', '#b8651a'], iris: ['#d98a00', '#fff09a'], brow: '#9a5416', pupil: '#3a1d06', slit: true,
    back: 'M120,238 C106,148 150,110 200,110 C250,110 294,148 280,238 L288,304 C270,314 256,298 254,282 L146,282 C144,298 130,314 112,304Z',
    behind() { // 꼬리 (몸 뒤)
      return `<defs><clipPath id="tailc"><path id="tailp" d="M180,596 C70,600 14,520 22,424 C26,372 56,340 86,330 C78,372 92,420 124,448 C150,472 196,486 214,540Z"/></clipPath></defs>` +
        `<path d="M180,596 C70,600 14,520 22,424 C26,372 56,340 86,330 C78,372 92,420 124,448 C150,472 196,486 214,540Z" fill="#f5a53a" stroke="#b8651a" stroke-width="3" stroke-linejoin="round"/>` +
        `<g clip-path="url(#tailc)"><path d="M0,300 L130,300 C110,350 90,380 60,400 L0,420Z" fill="#fff6e4"/><path d="M40,470 C70,480 130,470 160,520" stroke="#e08a1f" stroke-width="10" fill="none" opacity=".35"/></g>` +
        `<path d="M180,596 C70,600 14,520 22,424 C26,372 56,340 86,330 C78,372 92,420 124,448 C150,472 196,486 214,540Z" fill="none" stroke="#b8651a" stroke-width="3"/>`;
    },
    ears() {
      return [1, -1].map((m) => {
        const x = (v) => 200 + (v - 200) * m;
        return `<path d="M${x(138)},188 L${x(116)},78 L${x(196)},138Z" fill="#f5a53a" stroke="#b8651a" stroke-width="3" stroke-linejoin="round"/>` +
          `<path d="M${x(146)},176 L${x(130)},106 L${x(184)},142Z" fill="#ffd9d0"/>` +
          `<path d="M${x(121)},98 L${x(116)},78 L${x(136)},90Z" fill="#6a3410"/>`;
      }).join('');
    },
    front: 'M126,244 C118,160 150,124 200,122 C250,124 282,160 274,244 C270,216 262,198 252,184 L244,208 L232,180 L218,214 L204,176 L190,216 L174,182 L162,210 L150,184 C140,198 132,218 126,244Z',
    strands: 'M126,244 C122,274 126,298 142,312 C140,284 144,262 152,246Z M274,244 C278,274 274,298 258,312 C260,284 256,262 248,246Z',
    hl: 'M156,150 C176,134 226,134 246,150',
    outfit() {
      return `<path d="M50,600 C50,480 96,404 150,392 L250,392 C304,404 350,480 350,600Z" fill="#2c4a52" stroke="#17292e" stroke-width="3"/>` +
        `<path d="M150,392 C130,420 120,470 120,600 L280,600 C280,470 270,420 250,392 L200,430Z" fill="#8a5a34" stroke="#4e2f18" stroke-width="3"/>` +
        `<path d="M150,392 L200,452 L250,392 L232,386 L200,418 L168,386Z" fill="#fff4e0"/>` +
        `<path d="M138,470 L262,540 M262,470 L138,540" stroke="#4e2f18" stroke-width="5" opacity=".55"/>` +
        `<path d="M160,380 C176,402 224,402 240,380 L246,398 C226,420 174,420 154,398Z" fill="#e0553a" stroke="#9c2f1c" stroke-width="3"/>` +
        `<path d="M196,404 L176,452 L194,446 L200,462 L210,440Z" fill="#e0553a" stroke="#9c2f1c" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<circle cx="200" cy="500" r="19" fill="#ffd24a" stroke="#a37a0a" stroke-width="3"/><circle cx="200" cy="500" r="9" fill="none" stroke="#a37a0a" stroke-width="2.5"/><circle cx="200" cy="476" r="3" fill="#a37a0a"/>`;
    },
    defs: '',
    acc: ''
  },

  // 수습 성직자(소꿉친구): 분홍 장발 + 옆 땋은머리, 꽃 장식, 흰 성직복
  lia: {
    hair: ['#ffd0e2', '#f4a0c2', '#c4628c'], iris: ['#1e9b72', '#a6f6cc'], brow: '#c4628c', pupil: '#0b4a36',
    back: 'M120,222 C102,130 150,106 200,106 C250,106 298,130 280,222 L306,420 C314,474 292,508 270,526 L130,526 C108,508 86,474 94,420Z',
    ears() { return ''; },
    front: 'M126,244 C118,160 150,120 200,120 C252,120 282,160 274,244 C268,216 256,196 240,184 C222,208 200,216 176,208 C160,216 140,228 126,244Z',
    strands: 'M274,244 C280,290 282,330 276,380 C262,340 254,300 248,262Z',
    braid() { // 왼쪽(화면 기준) 어깨 앞으로 내려온 땋은머리
      let s = '<path d="M142,262 C130,320 128,380 134,440" stroke="#c4628c" stroke-width="30" fill="none" stroke-linecap="round"/>' +
              '<path d="M142,262 C130,320 128,380 134,440" stroke="url(#hg)" stroke-width="24" fill="none" stroke-linecap="round"/>';
      for (let i = 0; i < 6; i++) { const y = 296 + i * 24; s += `<path d="M${116 + (i % 2) * 4},${y} Q136,${y + 12} ${154 - (i % 2) * 4},${y}" stroke="#c4628c" stroke-width="3" fill="none" opacity=".7"/>`; }
      s += '<rect x="118" y="436" width="34" height="14" rx="6" fill="#fff" stroke="#9aa" stroke-width="2"/><path d="M122,452 L108,484 M152,452 L158,484" stroke="#f4a0c2" stroke-width="10" stroke-linecap="round"/>';
      return s;
    },
    hl: 'M156,150 C176,134 226,134 246,150',
    outfit() {
      return `<path d="${BODY}" fill="#f8f5ea" stroke="#c9c1a4" stroke-width="3"/>` +
        `<path d="M64,600 C64,520 84,466 108,440 L134,452 L126,600Z" fill="#ece6d0"/>` +
        `<path d="M170,384 C176,404 190,412 200,412 C210,412 224,404 230,384 L222,382 C216,396 208,402 200,402 C192,402 184,396 178,382Z" fill="#e4c36a"/>` +
        `<path d="M176,400 L168,600 L232,600 L224,400 C216,414 184,414 176,400Z" fill="#46a98a" stroke="#2b7a62" stroke-width="3"/>` +
        `<path d="M200,420 L200,600" stroke="#e8c85a" stroke-width="4"/>` +
        `<path d="M170,470 H230 M170,540 H230" stroke="#e8c85a" stroke-width="3" opacity=".8"/>` +
        `<circle cx="200" cy="456" r="14" fill="#f2cf5a" stroke="#a37f1a" stroke-width="3"/>` +
        `<path d="M200,436 V476 M180,456 H220" stroke="#a37f1a" stroke-width="3"/>`;
    },
    defs: '',
    acc: // 꽃 머리핀
      (() => { let f = ''; for (let i = 0; i < 5; i++) { const a = (i * 72 - 90) * Math.PI / 180; f += `<ellipse cx="${252 + Math.cos(a) * 12}" cy="${172 + Math.sin(a) * 12}" rx="9" ry="7" fill="#fff" stroke="#e29ab8" stroke-width="2" transform="rotate(${i * 72} ${252 + Math.cos(a) * 12} ${172 + Math.sin(a) * 12})"/>`; } return f + '<circle cx="252" cy="172" r="6" fill="#ffd84a" stroke="#c9a017" stroke-width="2"/>'; })()
  }
};

// ---------- 표정 ----------
// lid: 윗눈꺼풀 선 (바깥쪽 y, 안쪽 y; 눈 중심 기준. -40 이면 가려지지 않음)
const EXPR = {
  normal:    { lidO: -40, lidI: -40, dx: 0, dy: 0, irisS: 1, brow: [-44, -46], arch: -6, mouth: 'normal', blush: 0.35 },
  smile:     { closed: true, brow: [-46, -50], arch: -8, mouth: 'smile', blush: 0.5 },
  angry:     { lidO: -17, lidI: 2, dx: 0, dy: 0, irisS: 1, brow: [-52, -34], arch: 0, mouth: 'angry', blush: 0.3, vein: true },
  shy:       { lidO: -13, lidI: -13, dx: -6, dy: 7, irisS: 1.02, brow: [-40, -53], arch: -4, mouth: 'shy', blush: 0.9, hatch: true, sweat: true },
  surprised: { lidO: -40, lidI: -40, dx: 0, dy: 0, irisS: 0.66, wide: true, brow: [-62, -66], arch: -8, mouth: 'o', blush: 0.3, lines: true },
  sad:       { lidO: -8, lidI: -26, dx: 0, dy: 2, irisS: 1.05, brow: [-36, -54], arch: -2, mouth: 'sad', blush: 0.2, tears: true }
};

function eye(cx, cy, side, e, H, key) {
  const dark = H.hair[2];
  const lash = '#3a2430';
  const id = (n) => `${n}${key}`;
  if (e.closed) { // 웃는 눈 ^ ^
    return `<path d="M${cx - 23},${cy + 6} Q${cx},${cy - 24} ${cx + 23},${cy + 6}" stroke="${lash}" stroke-width="6" fill="none" stroke-linecap="round"/>` +
      `<path d="M${cx + side * 23},${cy + 6} l${side * 6},-5" stroke="${lash}" stroke-width="4" stroke-linecap="round"/>`;
  }
  const rx = e.wide ? 27 : 24, ry = e.wide ? 33 : 29;
  const xo = cx + side * 26, xi = cx - side * 26;
  const lineY = (x) => cy + e.lidO + (x - xo) * (e.lidI - e.lidO) / (xi - xo);
  const xa = cx + side * 44, xb = cx - side * 44;
  const poly = `${xa},${lineY(xa)} ${xb},${lineY(xb)} ${xb},${cy + 70} ${xa},${cy + 70}`;
  const s = e.irisS, ix = cx + e.dx, iy = cy + 3 + e.dy;
  let g = `<defs><clipPath id="${id('ce')}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath><clipPath id="${id('cl')}"><polygon points="${poly}"/></clipPath></defs>`;
  g += `<g clip-path="url(#${id('ce')})"><g clip-path="url(#${id('cl')})">`;
  g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>`;
  g += `<ellipse cx="${ix}" cy="${iy}" rx="${17 * s}" ry="${23 * s}" fill="url(#ig)"/>`;
  g += H.slit ? `<ellipse cx="${ix}" cy="${iy}" rx="${4.4 * s}" ry="${14 * s}" fill="${H.pupil}"/>`
              : `<ellipse cx="${ix}" cy="${iy}" rx="${8 * s}" ry="${12.5 * s}" fill="${H.pupil}"/>`;
  g += `<ellipse cx="${ix}" cy="${iy + 11 * s}" rx="${11 * s}" ry="${6 * s}" fill="#fff" opacity=".28"/>`;
  g += `<circle cx="${ix - 6 * s}" cy="${iy - 9 * s}" r="${6 * s}" fill="#fff"/><circle cx="${ix + 7 * s}" cy="${iy + 8 * s}" r="${2.8 * s}" fill="#fff"/>`;
  if (e.tears) g += `<ellipse cx="${cx}" cy="${cy + 22}" rx="18" ry="6" fill="#d8f4ff" opacity=".85"/>`;
  g += `</g></g>`;
  // 윗 속눈썹
  if (e.lidO <= -40) {
    g += `<path d="M${cx - rx},${cy} A${rx},${ry} 0 0 1 ${cx + rx},${cy}" stroke="${lash}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  } else {
    g += `<path d="M${xo},${lineY(xo)} Q${cx},${(lineY(xo) + lineY(xi)) / 2 - 7} ${xi},${lineY(xi)}" stroke="${lash}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  }
  g += `<path d="M${cx + side * (rx - 1)},${e.lidO <= -40 ? cy - 2 : lineY(xo)} l${side * 8},-7" stroke="${lash}" stroke-width="4.5" stroke-linecap="round"/>`;
  g += `<path d="M${cx - 16},${cy + ry - 3} Q${cx},${cy + ry + 3} ${cx + 16},${cy + ry - 3}" stroke="${lash}" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>`;
  return g;
}

function mouth(kind) {
  switch (kind) {
    case 'smile':
      return `<path d="M180,306 Q200,334 220,306 Q200,311 180,306Z" fill="#b8404a" stroke="#6a2a2a" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M186,311 Q200,318 214,311 Q214,326 200,328 Q186,326 186,311Z" fill="#ff8f9a"/>` +
        `<path d="M184,307 Q200,312 216,307 L215,311 Q200,316 185,311Z" fill="#fff"/>`;
    case 'angry':
      return `<path d="M184,319 Q192,310 200,314 Q208,310 216,319" stroke="#6a2a2a" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case 'shy':
      return `<path d="M187,314 Q193,309 199,314 Q205,319 211,314" stroke="#7a3a3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    case 'o':
      return `<ellipse cx="200" cy="316" rx="9" ry="12" fill="#b8404a" stroke="#6a2a2a" stroke-width="3"/><ellipse cx="200" cy="321" rx="5" ry="5" fill="#ff8f9a"/>`;
    case 'sad':
      return `<path d="M186,320 Q200,306 214,320" stroke="#7a3a3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    default:
      return `<path d="M185,311 Q200,320 215,311" stroke="#7a3a3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  }
}

function brows(e, H) {
  let s = '';
  [-1, 1].forEach((side) => {
    const cx = 200 + side * 35, cy = 262;
    const xo = cx + side * 26, xi = cx - side * 14;
    const yo = cy + e.brow[0], yi = cy + e.brow[1];
    const cyc = (yo + yi) / 2 + e.arch;
    s += `<path d="M${xo},${yo} Q${cx},${cyc} ${xi},${yi}" stroke="${H.brow}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  });
  return s;
}

function marks(e) {
  let s = '';
  if (e.vein) s += '<g stroke="#e0383e" stroke-width="5" stroke-linecap="round" fill="none"><path d="M262,166 q8,-2 10,-10 M262,166 q10,4 18,-2 M262,166 q-2,10 4,18 M262,166 q-8,8 -16,6"/></g>';
  if (e.sweat) s += '<path d="M280,210 C276,222 268,226 272,236 C278,242 288,236 286,226 C285,220 283,214 280,210Z" fill="#bfe9ff" stroke="#6fb8e0" stroke-width="2"/>';
  if (e.lines) s += '<g stroke="#8a8aa8" stroke-width="4" stroke-linecap="round"><path d="M288,150 L304,138 M292,172 L312,168 M282,128 L290,112"/></g>';
  if (e.tears) s += '<path d="M136,296 C132,306 130,314 136,318 C142,314 140,304 136,296Z M264,296 C260,306 258,314 264,318 C270,314 268,304 264,296Z" fill="#bfe9ff" stroke="#6fb8e0" stroke-width="2"/>';
  return s;
}

function build(id, name) {
  const H = HEROINES[id], e = EXPR[name];
  const hg = `<linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${H.hair[0]}"/><stop offset="1" stop-color="${H.hair[1]}"/></linearGradient>`;
  const ig = `<linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${H.iris[0]}"/><stop offset="1" stop-color="${H.iris[1]}"/></linearGradient>`;
  const sg = `<radialGradient id="sg" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${SKIN}"/><stop offset="1" stop-color="#fbd6c2"/></radialGradient>`;
  const hairStroke = `fill="url(#hg)" stroke="${H.hair[2]}" stroke-width="3" stroke-linejoin="round"`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600"><defs>${hg}${ig}${sg}${H.defs}</defs>`;
  if (H.behind) s += H.behind();
  s += `<path d="${H.back}" ${hairStroke}/>`;
  s += H.ears();
  // 목 + 의상
  s += `<path d="M182,318 L182,392 L218,392 L218,318Z" fill="${SKIN}"/><path d="M182,340 Q200,362 218,340 L218,392 L182,392Z" fill="${SHADE}" opacity=".7"/>`;
  s += H.outfit();
  // 얼굴
  s += `<path d="${FACE}" fill="url(#sg)" stroke="${SHADE}" stroke-width="2"/>`;
  if (H.braid) s += H.braid();
  if (H.strands && id === 'erion') s += `<path d="${H.strands}" ${hairStroke}/>`;
  // 볼 / 코 / 입
  const bl = e.blush;
  s += `<ellipse cx="150" cy="296" rx="19" ry="10" fill="#ff7f90" opacity="${bl}"/><ellipse cx="250" cy="296" rx="19" ry="10" fill="#ff7f90" opacity="${bl}"/>`;
  if (e.hatch) s += '<g stroke="#ff5a70" stroke-width="2.5" stroke-linecap="round" opacity=".8"><path d="M138,290 l8,-8 M148,292 l8,-8 M158,294 l8,-8 M234,294 l8,-8 M244,292 l8,-8 M254,290 l8,-8"/></g>';
  s += '<path d="M197,293 Q200,297 203,293" stroke="#d99a86" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  s += mouth(e.mouth);
  s += eye(165, 262, -1, e, H, 'L') + eye(235, 262, 1, e, H, 'R');
  // 앞머리/옆머리
  s += `<path d="${H.front}" ${hairStroke}/>`;
  if (H.strands && id !== 'erion') s += `<path d="${H.strands}" ${hairStroke}/>`;
  s += `<path d="${H.hl}" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".55"/>`;
  s += brows(e, H);
  s += H.acc;
  s += marks(e);
  return s + '</svg>';
}

let n = 0;
Object.keys(HEROINES).forEach((id) => {
  fs.mkdirSync(path.join(OUT, id), { recursive: true });
  Object.keys(EXPR).forEach((name) => { fs.writeFileSync(path.join(OUT, id, name + '.svg'), build(id, name)); n++; });
});
console.log(`캐릭터 SVG ${n}개 생성`);
