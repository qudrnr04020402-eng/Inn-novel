// 선물 아이콘(SVG) 생성기: node tools/gen-gifts.js
// - assets/gifts/<선물id>.svg (64x64) 8개를 만든다. PNG 로 바꾸려면 story/gifts.js 의 icon 경로만 고치면 된다.
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'assets', 'gifts');
fs.mkdirSync(OUT, { recursive: true });
const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${body}</svg>`;
const S = 'stroke-linejoin="round" stroke-linecap="round"';
const petal = (cx, cy, r, ang, fill, st) => `<ellipse cx="${cx + Math.cos(ang) * r}" cy="${cy + Math.sin(ang) * r}" rx="6.5" ry="5" transform="rotate(${ang * 180 / Math.PI} ${cx + Math.cos(ang) * r} ${cy + Math.sin(ang) * r})" fill="${fill}" stroke="${st}" stroke-width="2" ${S}/>`;
const bloom = (cx, cy, fill, st, mid) => [0, 1, 2, 3, 4].map((i) => petal(cx, cy, 6.5, i * 1.2566 - 1.57, fill, st)).join('') + `<circle cx="${cx}" cy="${cy}" r="4" fill="${mid}" stroke="${st}" stroke-width="1.5"/>`;
const ICONS = {
  // 꽃다발: 분홍/노랑 꽃 + 리본
  flower: wrap(`<path d="M32,60 L22,34 M32,60 L42,34 M32,60 L32,30" stroke="#3a8a4a" stroke-width="3.5" fill="none" ${S}/>` +
    `<path d="M26,44 C14,42 12,34 16,30 C22,32 26,38 26,44Z M38,44 C50,42 52,34 48,30 C42,32 38,38 38,44Z" fill="#62c05e" stroke="#2f7a3a" stroke-width="2" ${S}/>` +
    bloom(20, 26, '#ff9ec7', '#c4628c', '#ffe27a') + bloom(44, 26, '#fff3a8', '#c9a017', '#ff9a6a') + bloom(32, 17, '#ffffff', '#b8a8c8', '#ffd24a') +
    `<path d="M24,50 L32,56 L40,50 L36,60 L32,57 L28,60Z" fill="#e0553a" stroke="#9c2f1c" stroke-width="2" ${S}/>`),
  // 달콤한 과자: 꿀과자 (동그란 쿠키 + 꿀 방울)
  sweets: wrap(`<circle cx="30" cy="34" r="22" fill="#e8b25a" stroke="#8a5a1a" stroke-width="3"/>` +
    `<circle cx="30" cy="34" r="16" fill="#f4cd7a" opacity=".7"/>` +
    `<circle cx="22" cy="28" r="3.5" fill="#8a5a1a"/><circle cx="34" cy="24" r="3" fill="#8a5a1a"/><circle cx="38" cy="38" r="3.5" fill="#8a5a1a"/><circle cx="24" cy="42" r="3" fill="#8a5a1a"/>` +
    `<path d="M44,14 C40,22 38,26 41,30 C46,30 48,25 44,14Z" fill="#ffc83a" stroke="#8a5a0a" stroke-width="2" ${S}/>` +
    `<path d="M14,18 C16,14 20,12 24,13" stroke="#fff" stroke-width="3" opacity=".6" fill="none" ${S}/>` +
    `<path d="M48,44 L58,50 L52,58 Z" fill="#ff9ec7" stroke="#c4628c" stroke-width="2" ${S}/>`),
  // 마법 잉크: 별 박힌 잉크병 + 깃펜
  ink: wrap(`<path d="M20,26 H40 L44,36 V54 Q44,58 40,58 H20 Q16,58 16,54 V36Z" fill="#3a3aa8" stroke="#1a1a60" stroke-width="3" ${S}/>` +
    `<rect x="23" y="18" width="14" height="9" rx="2.5" fill="#b5763a" stroke="#6a3e12" stroke-width="2.5"/>` +
    `<path d="M22,40 H38 V54 H22Z" fill="#6a68e8" opacity=".5"/>` +
    `<path d="M30,40 L32,45 L37,46 L32,47 L30,52 L28,47 L23,46 L28,45Z" fill="#fff3a8" stroke="#c9a017" stroke-width="1.5" ${S}/>` +
    `<path d="M52,6 C44,12 40,22 40,30 C46,26 52,16 52,6Z" fill="#f4f1ea" stroke="#8a8aa8" stroke-width="2.5" ${S}/><path d="M52,6 L38,32" stroke="#8a8aa8" stroke-width="2" ${S}/>`),
  // 숫돌: 직사각 숫돌 + 칼날
  whetstone: wrap(`<path d="M6,38 L44,26 L58,38 L58,50 L20,58 L6,50Z" fill="#a8a8b4" stroke="#4a4a58" stroke-width="3" ${S}/>` +
    `<path d="M6,38 L20,46 L58,38 M20,46 L20,58" fill="none" stroke="#4a4a58" stroke-width="2.5" ${S}/>` +
    `<path d="M20,46 L58,38 L58,50 L20,58Z" fill="#8a8a98"/>` +
    `<path d="M10,40 L20,45 M26,38 L40,34" stroke="#d6d6e0" stroke-width="2.5" opacity=".7" ${S}/>` +
    `<path d="M12,22 L50,10 L52,16 L16,28Z" fill="#e8eef8" stroke="#5a6a8a" stroke-width="2.5" ${S}/>` +
    `<path d="M18,22 L46,13" stroke="#fff" stroke-width="2" opacity=".8" ${S}/>`),
  // 반짝이 장신구: 보석 박힌 머리핀
  trinket: wrap(`<defs><radialGradient id="tg"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#7ad8ff" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="32" cy="30" r="28" fill="url(#tg)" opacity=".6"/>` +
    `<path d="M8,52 L48,18" stroke="#e1b84a" stroke-width="6" ${S}/><path d="M8,52 L48,18" stroke="#fff0b0" stroke-width="2" opacity=".8" ${S}/>` +
    `<path d="M32,8 L48,12 L56,28 L44,46 L24,46 L12,28 L18,12Z" transform="translate(0 -2) scale(.85) translate(6 4)" fill="#4ab8f0" stroke="#1a5a90" stroke-width="3" ${S}/>` +
    `<path d="M22,16 L34,22 L40,34 M34,22 L28,34" stroke="#d8f4ff" stroke-width="2.5" opacity=".8" fill="none" ${S}/>` +
    `<path d="M50,6 L52,12 L58,14 L52,16 L50,22 L48,16 L42,14 L48,12Z" fill="#fff3a8" stroke="#c9a017" stroke-width="1.5" ${S}/>`),
  // 고서: 낡은 가죽 책
  oldbook: wrap(`<path d="M10,10 H46 Q52,10 52,16 V52 Q52,58 46,58 H10Z" fill="#8a4a2a" stroke="#4a2410" stroke-width="3" ${S}/>` +
    `<path d="M10,10 Q4,10 4,16 V52 Q4,58 10,58" fill="#6a3418" stroke="#4a2410" stroke-width="3" ${S}/>` +
    `<path d="M52,16 V52 Q52,56 48,56 H12" fill="none"/><rect x="14" y="52" width="36" height="4" fill="#f4e8c8" stroke="#a89868" stroke-width="1.5"/>` +
    `<rect x="16" y="16" width="30" height="22" rx="3" fill="none" stroke="#e1c15e" stroke-width="2.5"/>` +
    `<path d="M31,20 L33,26 L40,28 L33,30 L31,36 L29,30 L22,28 L29,26Z" fill="#e1c15e" stroke="#9c7f2a" stroke-width="1.5" ${S}/>` +
    `<path d="M16,44 H44" stroke="#e1c15e" stroke-width="2.5" opacity=".7" ${S}/>`),
  // 털목도리: 줄무늬 목도리
  scarf: wrap(`<path d="M10,22 C10,12 54,12 54,22 L54,30 C54,38 10,38 10,30Z" fill="#d84a4a" stroke="#7a1a1a" stroke-width="3" ${S}/>` +
    `<path d="M20,17 V35 M30,16 V37 M40,16 V37 M49,18 V35" stroke="#f4e8c8" stroke-width="4" opacity=".85"/>` +
    `<path d="M40,34 L46,58 L58,56 L52,32Z" fill="#d84a4a" stroke="#7a1a1a" stroke-width="3" ${S}/>` +
    `<path d="M42,44 L54,42 M44,52 L56,50" stroke="#f4e8c8" stroke-width="4" opacity=".85"/>` +
    `<path d="M46,58 V63 M50,57 V63 M54,57 V62 M58,56 V61" stroke="#f4e8c8" stroke-width="2.5" ${S}/>`),
  // 고급 꿀술: 금빛 라벨의 병
  honeywine: wrap(`<path d="M27,4 H37 V18 C44,22 48,28 48,38 V54 Q48,60 42,60 H22 Q16,60 16,54 V38 C16,28 20,22 27,18Z" fill="#d98a1a" stroke="#6a3e08" stroke-width="3" ${S}/>` +
    `<rect x="26" y="2" width="12" height="8" rx="2" fill="#a8a8b4" stroke="#4a4a58" stroke-width="2.5"/>` +
    `<path d="M20,40 H44 V54 Q44,56 42,56 H22 Q20,56 20,54Z" fill="#ffc83a" opacity=".5"/>` +
    `<rect x="21" y="34" width="22" height="16" rx="3" fill="#fff3d0" stroke="#a37a0a" stroke-width="2"/>` +
    `<path d="M32,36 L34,41 L39,42 L34,43 L32,48 L30,43 L25,42 L30,41Z" fill="#e1b84a" stroke="#9c7f2a" stroke-width="1.2" ${S}/>` +
    `<path d="M22,30 Q22,24 26,22" stroke="#fff" stroke-width="3" opacity=".55" fill="none" ${S}/>`)
};
Object.keys(ICONS).forEach((id) => fs.writeFileSync(path.join(OUT, id + '.svg'), ICONS[id]));
console.log(`선물 아이콘 ${Object.keys(ICONS).length}개 생성 -> assets/gifts/`);
