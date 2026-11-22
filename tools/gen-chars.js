// 캐릭터 일러스트(SVG) 생성기: node tools/gen-chars.js
// - 히로인 4명 + 단골 손님 8명(로사, 귀족 미식가 포함) x 표정 6종(normal/smile/angry/shy/surprised/sad)을 assets/char/<id>/<표정>.svg 로 만든다.
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

// ---------- 단골 손님(저녁 영업) 설정 ----------
// 히로인과 같은 얼굴 틀(FACE)에 머리/모자/옷만 바꾼 임시 그림. id 는 story/characters.js 와 story/tavern.js 의 손님 id 와 같아야 합니다.
const SHORT_BACK = 'M126,226 C116,148 156,108 200,108 C244,108 286,148 274,226Z';
const ROBE = (c1, c2) => `<path d="${BODY}" fill="${c1}" stroke="${c2}" stroke-width="3"/>`;
const COLLAR = (c) => `<path d="M170,384 C176,404 190,412 200,412 C210,412 224,404 230,384 L222,382 C216,396 208,402 200,402 C192,402 184,396 178,382Z" fill="${c}"/>`;
const CUSTOMERS = {
  // 바론 영감: 양치기 노인. 흰머리, 풍성한 콧수염과 수염, 밀짚모자
  baron: {
    hair: ['#ffffff', '#e4e4ea', '#9a9aae'], iris: ['#5a4a2a', '#b89a5a'], brow: '#c9c9d6', pupil: '#2a1e0c',
    back: 'M132,230 C124,176 150,150 200,150 C250,150 276,176 268,230 C262,206 240,196 200,196 C160,196 138,206 132,230Z',
    ears() { return `<ellipse cx="134" cy="248" rx="10" ry="16" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/><ellipse cx="266" cy="248" rx="10" ry="16" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/>`; },
    front: 'M140,196 C150,172 176,164 200,164 C224,164 250,172 260,196 C240,184 222,180 200,180 C178,180 160,184 140,196Z',
    strands: '', hl: '',
    outfit() {
      return ROBE('#8a6a3a', '#4e3a1c') + `<path d="M150,386 L200,520 L250,386 L232,384 L200,470 L168,384Z" fill="#efe6cc"/>` +
        COLLAR('#6e5228') + `<path d="M120,470 H280 M110,540 H290" stroke="#4e3a1c" stroke-width="3" opacity=".5"/>` +
        // 콧수염 + 수염
        `<path d="M160,300 C170,288 190,292 200,300 C210,292 230,288 240,300 C232,322 214,316 200,310 C186,316 168,322 160,300Z" fill="#fafafc" stroke="#aaaabe" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M146,320 C150,360 170,392 200,402 C230,392 250,360 254,320 C240,342 220,340 200,336 C180,340 160,342 146,320Z" fill="#fafafc" stroke="#aaaabe" stroke-width="3" stroke-linejoin="round"/>`;
    },
    defs: '',
    acc: // 밀짚모자
      '<ellipse cx="200" cy="168" rx="104" ry="20" fill="#e8c76a" stroke="#a8842a" stroke-width="3"/><path d="M142,170 C142,112 258,112 258,170Z" fill="#f2d57e" stroke="#a8842a" stroke-width="3"/><path d="M144,158 C176,170 224,170 256,158" stroke="#b5532a" stroke-width="8" fill="none"/>'
  },
  // 토비: 행상인. 갈색 단발, 깃털 달린 푸른 모자, 큰 배낭끈
  tobi: {
    hair: ['#9a6a42', '#7a4f2e', '#4a2e1a'], iris: ['#2f7a58', '#9be0b8'], brow: '#4a2e1a', pupil: '#0e3a28',
    back: SHORT_BACK,
    ears() { return ''; },
    front: 'M128,238 C122,170 154,134 202,134 C250,134 280,168 272,238 C264,204 246,186 226,176 C214,194 190,200 168,190 C150,200 136,218 128,238Z',
    strands: '', hl: 'M156,150 C176,134 226,134 246,150',
    outfit() {
      return ROBE('#2f7a58', '#1a4a34') + `<path d="M150,386 L200,520 L250,386 L232,384 L200,470 L168,384Z" fill="#f4ecd8"/>` + COLLAR('#e1c15e') +
        `<path d="M110,420 L150,600 M290,420 L250,600" stroke="#7a4a1a" stroke-width="16" stroke-linecap="round"/>` +
        `<circle cx="200" cy="470" r="9" fill="#ffd24a" stroke="#a37a0a" stroke-width="2.5"/><circle cx="200" cy="520" r="9" fill="#ffd24a" stroke="#a37a0a" stroke-width="2.5"/>`;
    },
    defs: '',
    acc: '<path d="M126,176 C130,120 270,120 274,176 C240,164 160,164 126,176Z" fill="#2b5fb5" stroke="#173a78" stroke-width="3"/><ellipse cx="200" cy="176" rx="82" ry="12" fill="#3a74d0" stroke="#173a78" stroke-width="3"/><path d="M246,150 C290,120 320,80 330,40 C300,70 270,100 240,130Z" fill="#fff" stroke="#9aa" stroke-width="2.5"/>'
  },
  // 그레타: 은퇴한 여성 용병. 회색 섞인 짧은 머리, 볼의 흉터, 가죽 갑옷, 붉은 스카프
  greta: {
    hair: ['#c9c4c0', '#9c9692', '#5c5652'], iris: ['#4a5a7a', '#a8c0e8'], brow: '#5c5652', pupil: '#101830',
    back: SHORT_BACK,
    ears() { return ''; },
    front: 'M126,236 C120,160 154,124 204,124 C254,124 282,160 274,236 C270,206 258,190 244,180 C228,200 208,206 190,202 C172,198 160,190 154,176 C142,194 130,214 126,236Z',
    strands: '', hl: 'M156,150 C176,134 226,134 246,150',
    outfit() {
      return ROBE('#6a4a30', '#3a2616') + `<path d="M160,386 L240,386 L262,600 L138,600Z" fill="#8a6440" stroke="#3a2616" stroke-width="3"/>` +
        `<ellipse cx="104" cy="440" rx="50" ry="36" fill="#7a5638" stroke="#3a2616" stroke-width="3"/><ellipse cx="296" cy="440" rx="50" ry="36" fill="#7a5638" stroke="#3a2616" stroke-width="3"/>` +
        `<path d="M70,434 Q104,408 138,434 M262,434 Q296,408 330,434" stroke="#b08a5a" stroke-width="4" fill="none" opacity=".7"/>` +
        `<path d="M150,380 C170,404 230,404 250,380 L256,402 C230,426 170,426 144,402Z" fill="#c43d3d" stroke="#7d2020" stroke-width="3"/>` +
        `<path d="M170,470 H230 M170,520 H230" stroke="#3a2616" stroke-width="4" opacity=".6"/>`;
    },
    defs: '',
    acc: '<path d="M246,262 L262,306" stroke="#b86a6a" stroke-width="4" stroke-linecap="round"/><path d="M240,276 L256,272 M246,290 L262,286" stroke="#b86a6a" stroke-width="2.5" stroke-linecap="round"/>'
  },
  // 마르타 아주머니: 꿀빵 가게 단골. 갈색 쪽머리, 흰 두건, 앞치마
  marta: {
    hair: ['#b07a4a', '#8a5a32', '#4e301a'], iris: ['#6a4a2a', '#d0a070'], brow: '#6a4222', pupil: '#2a1a0a',
    back: 'M122,230 C108,150 152,110 200,110 C248,110 292,150 278,230 L284,290 L116,290Z',
    ears() { return ''; },
    front: 'M126,240 C120,166 154,128 200,128 C246,128 280,166 274,240 C268,210 250,190 232,182 C218,198 184,198 168,182 C150,190 132,212 126,240Z',
    strands: '', hl: 'M156,152 C176,138 226,138 246,152',
    outfit() {
      return ROBE('#c9744a', '#7a3e20') + `<path d="M150,386 L250,386 L270,600 L130,600Z" fill="#fffaf0" stroke="#d4c8a8" stroke-width="3"/>` +
        `<path d="M170,420 H230 M165,470 H235 M160,520 H240" stroke="#e8d8b0" stroke-width="3"/>` + COLLAR('#f0e6d0') +
        `<path d="M150,386 C150,420 140,450 130,470 M250,386 C250,420 260,450 270,470" stroke="#d4c8a8" stroke-width="3" fill="none"/>`;
    },
    defs: '',
    acc: '<path d="M122,190 C118,120 282,120 278,190 C262,160 138,160 122,190Z" fill="#fffaf0" stroke="#d4c8a8" stroke-width="3"/><path d="M130,176 C170,158 230,158 270,176" stroke="#e46a4a" stroke-width="6" fill="none"/>'
  },
  // 핀: 청년단원. 삐죽삐죽한 밤색 머리, 머리띠, 가죽 조끼
  fin: {
    hair: ['#d09a5a', '#b07a3a', '#6a4418'], iris: ['#3a6aa8', '#a0d0ff'], brow: '#6a4418', pupil: '#102a50',
    back: SHORT_BACK,
    ears() { return `<ellipse cx="134" cy="250" rx="10" ry="15" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/><ellipse cx="266" cy="250" rx="10" ry="15" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/>`; },
    front: 'M126,240 C120,160 150,116 200,112 C250,116 282,160 274,240 C270,210 262,196 252,186 L246,206 L234,176 L220,208 L204,168 L190,208 L174,174 L162,206 L152,184 C140,196 132,216 126,240Z',
    strands: '', hl: 'M156,148 C176,134 226,134 246,148',
    outfit() {
      return ROBE('#5a7ab0', '#2c4570') + `<path d="M150,386 L200,520 L250,386 L232,384 L200,470 L168,384Z" fill="#efe6cc"/>` +
        `<path d="M140,396 L130,600 L200,600 L200,420Z M260,396 L270,600 L200,600 L200,420Z" fill="#8a6440" stroke="#4a3018" stroke-width="3"/>` +
        `<path d="M160,440 H190 M210,440 H240 M160,500 H190 M210,500 H240" stroke="#4a3018" stroke-width="4"/>` + COLLAR('#cfd8e6');
    },
    defs: '',
    acc: '<path d="M128,176 C160,160 240,160 272,176 L272,194 C240,180 160,180 128,194Z" fill="#e0553a" stroke="#9c2f1c" stroke-width="3"/>'
  },
  // 로사: 여관 ★2 에 찾아오는 떠돌이 약초 상인. 연둣빛 웨이브 머리, 이파리 머리띠, 약초 다발이 달린 앞치마
  rosa: {
    hair: ['#bfe3a0', '#8cc27a', '#4a8a52'], iris: ['#a8741a', '#ffd37a'], brow: '#4a8a52', pupil: '#3a2208',
    back: 'M120,226 C106,140 150,108 200,108 C250,108 294,140 280,226 L294,404 C298,436 276,456 254,450 L146,450 C124,456 102,436 106,404Z',
    ears() { return ''; },
    front: 'M126,244 C118,162 150,122 200,120 C250,122 282,162 274,244 C268,214 254,194 238,184 C224,204 206,208 190,204 C172,206 158,200 146,190 C136,206 130,224 126,244Z',
    strands: 'M126,244 C120,290 118,334 126,376 C136,340 142,296 150,258Z M274,244 C280,290 282,334 274,376 C264,340 258,296 250,258Z',
    hl: 'M156,148 C176,132 226,132 246,148',
    outfit() {
      return ROBE('#7a9a5a', '#3e5a2e') + `<path d="M150,386 L250,386 L272,600 L128,600Z" fill="#f2e6c8" stroke="#bda878" stroke-width="3"/>` +
        COLLAR('#e8d8a8') +
        `<path d="M166,430 H234 M160,480 H240 M154,530 H246" stroke="#d8c898" stroke-width="3"/>` +
        // 약초 다발 (앞치마 주머니)
        `<path d="M170,500 L176,560 L224,560 L230,500Z" fill="#d6b27a" stroke="#8a6a3a" stroke-width="3"/>` +
        `<path d="M186,500 C180,470 172,460 168,448 M200,500 C200,466 200,452 202,438 M214,500 C220,470 230,460 234,450" stroke="#4a9a4a" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="168" cy="446" rx="8" ry="14" fill="#7be07a" stroke="#2f7a3a" stroke-width="2" transform="rotate(-24 168 446)"/><ellipse cx="202" cy="436" rx="8" ry="15" fill="#5cc05a" stroke="#2f7a3a" stroke-width="2"/><ellipse cx="234" cy="448" rx="8" ry="14" fill="#7be07a" stroke="#2f7a3a" stroke-width="2" transform="rotate(24 234 448)"/>`;
    },
    defs: '',
    acc: '<path d="M128,186 C160,164 240,164 272,186 L268,198 C238,180 162,180 132,198Z" fill="#5a8a3a" stroke="#2f5a22" stroke-width="3"/>' +
      '<ellipse cx="260" cy="176" rx="11" ry="18" fill="#7be07a" stroke="#2f7a3a" stroke-width="2.5" transform="rotate(34 260 176)"/><ellipse cx="144" cy="178" rx="10" ry="16" fill="#5cc05a" stroke="#2f7a3a" stroke-width="2.5" transform="rotate(-34 144 178)"/>'
  },
  // 벨라르 경: 여관 ★5 에 5일차 저녁에 찾아오는 왕도의 귀족 미식가. 뒤로 넘긴 검은 머리, 외눈 안경, 자줏빛 코트와 흰 장식 스카프
  noble: {
    hair: ['#6a5a7e', '#3e3256', '#1a1230'], iris: ['#6a2a5a', '#e0a0d0'], brow: '#2a2040', pupil: '#1a0820',
    back: 'M126,226 C116,140 160,104 200,104 C240,104 284,140 274,226Z',
    ears() { return `<ellipse cx="134" cy="248" rx="10" ry="15" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/><ellipse cx="266" cy="248" rx="10" ry="15" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/>`; },
    front: 'M128,238 C122,160 150,126 204,122 C256,126 280,160 272,238 C268,206 256,184 238,172 C210,186 170,186 150,176 C138,192 130,212 128,238Z',
    strands: '', hl: 'M156,146 C176,130 226,130 246,146',
    outfit() {
      return ROBE('#6a1f3a', '#3a0f20') + `<path d="M150,386 L200,520 L250,386 L232,384 L200,470 L168,384Z" fill="#fff6ee"/>` +
        `<path d="M168,384 C176,414 190,426 200,426 C210,426 224,414 232,384 L250,386 C246,430 226,452 200,456 C174,452 154,430 150,386Z" fill="#f4ecff" stroke="#c9b8e8" stroke-width="3"/>` +
        `<circle cx="200" cy="448" r="9" fill="#e1b84a" stroke="#9c7f2a" stroke-width="2.5"/>` +
        `<path d="M88,470 H140 M260,470 H312" stroke="#e1b84a" stroke-width="5" opacity=".8"/>` +
        `<circle cx="150" cy="520" r="7" fill="#e1b84a" stroke="#9c7f2a" stroke-width="2.5"/><circle cx="250" cy="520" r="7" fill="#e1b84a" stroke="#9c7f2a" stroke-width="2.5"/>` +
        `<path d="M170,300 C180,292 192,294 200,300 C208,294 220,292 230,300 C224,312 212,310 200,306 C188,310 176,312 170,300Z" fill="#2a2040" stroke="#150f26" stroke-width="2.5" stroke-linejoin="round"/>`;
    },
    defs: '',
    acc: // 외눈 안경 (오른쪽 눈)
      '<circle cx="235" cy="264" r="33" fill="#cfe8ff" fill-opacity=".18" stroke="#e1b84a" stroke-width="5"/><path d="M262,284 C274,320 270,360 262,400" stroke="#e1b84a" stroke-width="3" fill="none" stroke-linecap="round"/>'
  },
  // 촌장님: 마을 촌장. 대머리에 긴 흰 수염, 녹색 로브
  chief: {
    hair: ['#ffffff', '#e4e4ea', '#9a9aae'], iris: ['#4a5a3a', '#a8c088'], brow: '#c9c9d6', pupil: '#14200a',
    back: 'M134,236 C128,190 146,172 160,168 C150,196 150,216 154,236Z M266,236 C272,190 254,172 240,168 C250,196 250,216 246,236Z',
    ears() { return `<ellipse cx="134" cy="248" rx="10" ry="16" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/><ellipse cx="266" cy="248" rx="10" ry="16" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/>`; },
    front: '', strands: '', hl: 'M168,166 C184,156 218,156 234,166',
    outfit() {
      return ROBE('#3a6a4a', '#1e3e2a') + `<path d="M150,386 L200,520 L250,386 L232,384 L200,470 L168,384Z" fill="#e8e0c8"/>` + COLLAR('#d8b84a') +
        `<path d="M70,520 H330" stroke="#d8b84a" stroke-width="5" opacity=".7"/>` +
        `<path d="M170,296 C176,288 190,290 200,298 C210,290 224,288 230,296 C222,314 210,310 200,306 C190,310 178,314 170,296Z" fill="#fafafc" stroke="#aaaabe" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M150,330 C154,382 174,420 200,440 C226,420 246,382 250,330 C238,352 220,350 200,346 C180,350 162,352 150,330Z" fill="#fafafc" stroke="#aaaabe" stroke-width="3" stroke-linejoin="round"/>`;
    },
    defs: '',
    acc: ''
  },
  // 사절단장 이졸데: 7일 중 5일차에 찾아오는 왕도 학술원 봉인 조사단장. 보랏빛 쪽머리, 둥근 안경, 남색 코트와 은빛 사자 문장
  envoy: {
    hair: ['#b3a8e8', '#7a6cc0', '#3a2e78'], iris: ['#5a3a9a', '#cdb4ff'], brow: '#3a2e78', pupil: '#1c1048',
    back: 'M122,226 C108,142 150,106 200,106 C250,106 292,142 278,226 L286,330 C290,356 276,372 258,368 L142,368 C124,372 110,356 114,330Z',
    ears() { return ''; },
    front: 'M126,242 C118,164 150,124 200,122 C250,124 282,164 274,242 C268,212 254,192 236,182 C220,202 204,204 192,200 C172,204 156,198 144,188 C134,204 128,222 126,242Z',
    strands: 'M126,242 C122,278 122,310 128,340 C136,310 142,278 150,256Z M274,242 C278,278 278,310 272,340 C264,310 258,278 250,256Z', hl: 'M156,148 C176,132 226,132 246,148',
    outfit() {
      return ROBE('#2c3f7a', '#18244e') + `<path d="M150,386 L200,520 L250,386 L232,384 L200,470 L168,384Z" fill="#f4f1ff"/>` + COLLAR('#dfe6ff') +
        `<path d="M92,470 H150 M250,470 H308" stroke="#cfd8e6" stroke-width="5" opacity=".85"/>` +
        `<circle cx="200" cy="470" r="22" fill="#e8eef8" stroke="#8a96b0" stroke-width="3"/><path d="M200,452 L206,466 L220,468 L210,478 L213,492 L200,485 L187,492 L190,478 L180,468 L194,466Z" fill="#7a6cc0"/>` +
        `<path d="M122,520 H278" stroke="#cfd8e6" stroke-width="3" opacity=".6"/>`;
    },
    defs: '',
    acc: '<circle cx="165" cy="264" r="31" fill="#dfe8ff" fill-opacity=".16" stroke="#3a2e78" stroke-width="4"/><circle cx="235" cy="264" r="31" fill="#dfe8ff" fill-opacity=".16" stroke="#3a2e78" stroke-width="4"/><path d="M196,262 C199,258 201,258 204,262" stroke="#3a2e78" stroke-width="4" fill="none"/>'
  },
  // 시험관 하이덴 경: 왕국 기사단 시험관. 회색 단발, 뺨의 오래된 흉터, 강철 갑옷 위 청색 겉옷
  examiner: {
    hair: ['#d4d6de', '#a2a6b4', '#5a5e6e'], iris: ['#34506a', '#9cc0e0'], brow: '#5a5e6e', pupil: '#0e1c2c',
    back: SHORT_BACK,
    ears() { return `<ellipse cx="134" cy="248" rx="10" ry="15" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/><ellipse cx="266" cy="248" rx="10" ry="15" fill="${SKIN}" stroke="${SHADE}" stroke-width="3"/>`; },
    front: 'M126,238 C120,160 152,124 204,122 C254,124 282,160 274,238 C270,208 258,190 242,180 C226,196 182,196 164,182 C148,192 132,212 126,238Z',
    strands: '', hl: 'M158,148 C178,132 226,132 246,148',
    outfit() {
      return ROBE('#7a8696', '#434d5c') + `<path d="M160,386 L240,386 L262,600 L138,600Z" fill="#2f4f9a" stroke="#1a2f66" stroke-width="3"/>` +
        `<ellipse cx="104" cy="440" rx="52" ry="38" fill="#a8b2c2" stroke="#434d5c" stroke-width="3"/><ellipse cx="296" cy="440" rx="52" ry="38" fill="#a8b2c2" stroke="#434d5c" stroke-width="3"/>` +
        `<path d="M72,434 Q104,406 136,434 M264,434 Q296,406 328,434" stroke="#e8eef8" stroke-width="4" fill="none" opacity=".6"/>` +
        `<circle cx="200" cy="480" r="21" fill="#e8eef8" stroke="#8a96b0" stroke-width="3"/><path d="M190,490 L200,466 L210,490 M194,482 H206" stroke="#2f4f9a" stroke-width="4" fill="none" stroke-linecap="round"/>` + COLLAR('#cfd8e6');
    },
    defs: '',
    acc: '<path d="M248,258 L266,302" stroke="#b86a6a" stroke-width="4" stroke-linecap="round"/><path d="M250,272 L264,268 M256,286 L270,282" stroke="#b86a6a" stroke-width="2.5" stroke-linecap="round"/>'
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
Object.assign(HEROINES, CUSTOMERS); // build() 는 같은 구조를 읽으므로 손님도 한 테이블에 합친다
// 인자로 id 를 주면 그 캐릭터만 만든다 (예: node tools/gen-chars.js rosa noble envoy examiner). 히로인은 WebP 일러스트를 쓰므로 보통 손님만 다시 만들면 된다.
const only = process.argv.slice(2);
Object.keys(HEROINES).filter((id) => !only.length || only.includes(id)).forEach((id) => {
  fs.mkdirSync(path.join(OUT, id), { recursive: true });
  Object.keys(EXPR).forEach((name) => { fs.writeFileSync(path.join(OUT, id, name + '.svg'), build(id, name)); n++; });
});
console.log(`캐릭터 SVG ${n}개 생성`);
