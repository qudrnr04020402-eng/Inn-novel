// 저녁 영업 재료 아이콘(SVG) 생성기: node tools/gen-tavern-art.js
// - assets/tavern/<재료id>.svg (64x64) 8개를 만든다. PNG 로 바꾸려면 story/tavern.js 의 icon 경로만 고치면 된다.
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'assets', 'tavern');
fs.mkdirSync(OUT, { recursive: true });
const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${body}</svg>`;
const S = 'stroke-linejoin="round" stroke-linecap="round"';
const ICONS = {
  // 에일: 거품이 넘치는 나무 잔
  ale: wrap(`<path d="M14,22 H42 L40,54 Q40,58 36,58 H20 Q16,58 16,54Z" fill="#e8a53a" stroke="#7a4a12" stroke-width="3" ${S}/>` +
    `<path d="M42,28 H48 Q54,28 54,35 Q54,44 44,44" fill="none" stroke="#7a4a12" stroke-width="4" ${S}/>` +
    `<path d="M20,30 V52 M27,30 V52 M34,30 V52" stroke="#fff3c4" stroke-width="2" opacity=".5"/>` +
    `<circle cx="18" cy="20" r="7" fill="#fffaf0" stroke="#c9b48a" stroke-width="2.5"/><circle cx="27" cy="16" r="8" fill="#fffaf0" stroke="#c9b48a" stroke-width="2.5"/><circle cx="37" cy="19" r="7" fill="#fffaf0" stroke="#c9b48a" stroke-width="2.5"/>`),
  // 꿀술: 꿀이 흐르는 호박빛 병
  mead: wrap(`<path d="M26,8 H38 V18 Q46,24 46,36 V52 Q46,58 40,58 H24 Q18,58 18,52 V36 Q18,24 26,18Z" fill="#ffc83a" stroke="#8a5a0a" stroke-width="3" ${S}/>` +
    `<rect x="25" y="5" width="14" height="8" rx="2" fill="#b5763a" stroke="#6a3e12" stroke-width="2.5"/>` +
    `<path d="M22,38 H42 V52 Q42,54 40,54 H24 Q22,54 22,52Z" fill="#ffe27a" opacity=".6"/>` +
    `<path d="M24,30 Q24,36 28,36" fill="none" stroke="#fff" stroke-width="3" opacity=".6" ${S}/>` +
    `<path d="M45,14 C42,20 40,22 42,25 C45,25 47,22 45,14Z" fill="#ffc83a" stroke="#8a5a0a" stroke-width="2"/>`),
  // 허브: 푸른 잎 줄기
  herb: wrap(`<path d="M32,58 C32,40 32,26 32,8" stroke="#2f7a3a" stroke-width="4" fill="none" ${S}/>` +
    [[32, 16, -1], [32, 26, 1], [32, 36, -1], [32, 46, 1]].map(([x, y, d]) => `<path d="M${x},${y} C${x + d * 6},${y - 12} ${x + d * 20},${y - 10} ${x + d * 22},${y - 2} C${x + d * 16},${y + 6} ${x + d * 6},${y + 4} ${x},${y}Z" fill="#5cc05a" stroke="#2f7a3a" stroke-width="2.5" ${S}/><path d="M${x + d * 2},${y} L${x + d * 16},${y - 4}" stroke="#2f7a3a" stroke-width="1.8" opacity=".7"/>`).join('') +
    `<path d="M32,8 C28,4 30,0 34,2 C36,4 36,6 32,8Z" fill="#7be07a" stroke="#2f7a3a" stroke-width="2"/>`),
  // 고기: 뼈다리 고기
  meat: wrap(`<path d="M44,40 L56,52 Q58,56 54,58 Q50,60 48,56 L46,54 Q44,58 40,56 Q38,52 40,50Z" fill="#fff3dc" stroke="#a88a5a" stroke-width="2.5" ${S}/>` +
    `<path d="M10,26 C10,10 30,6 42,16 C52,24 46,42 34,46 C22,50 10,42 10,26Z" fill="#c4562f" stroke="#6a2a12" stroke-width="3" ${S}/>` +
    `<path d="M16,24 C18,16 28,13 36,17" fill="none" stroke="#ff9a6a" stroke-width="4" opacity=".7" ${S}/>` +
    `<path d="M20,34 C26,40 34,40 38,34" fill="none" stroke="#8a3418" stroke-width="2.5" opacity=".7" ${S}/>`),
  // 빵: 칼집 낸 둥근 빵
  bread: wrap(`<path d="M6,38 C6,18 22,10 32,10 C42,10 58,18 58,38 C58,48 52,54 44,54 H20 C12,54 6,48 6,38Z" fill="#d89a4a" stroke="#7a4a1a" stroke-width="3" ${S}/>` +
    `<path d="M12,34 C14,22 24,16 32,16 C40,16 50,22 52,34" fill="none" stroke="#f4c878" stroke-width="4" opacity=".7" ${S}/>` +
    `<path d="M22,22 L28,34 M32,20 L36,34 M42,22 L44,34" stroke="#7a4a1a" stroke-width="3" ${S}/>` +
    `<path d="M10,44 H54" stroke="#b5762c" stroke-width="2.5" opacity=".6"/>`),
  // 버섯: 갈색 갓에 흰 점
  mushroom: wrap(`<path d="M22,34 C20,48 22,58 32,58 C42,58 44,48 42,34Z" fill="#fff0d8" stroke="#a88a5a" stroke-width="3" ${S}/>` +
    `<path d="M4,34 C4,14 18,6 32,6 C46,6 60,14 60,34 C60,38 56,40 52,40 H12 C8,40 4,38 4,34Z" fill="#c4563a" stroke="#6a2412" stroke-width="3" ${S}/>` +
    `<circle cx="18" cy="24" r="5" fill="#fff6e8"/><circle cx="34" cy="16" r="5.5" fill="#fff6e8"/><circle cx="46" cy="28" r="4.5" fill="#fff6e8"/><circle cx="28" cy="31" r="3" fill="#fff6e8"/>`),
  // 달빛열매: 푸른 보랏빛 열매와 초승달 빛
  moonberry: wrap(`<defs><radialGradient id="mg"><stop offset="0" stop-color="#e8f4ff"/><stop offset="1" stop-color="#7a8cff" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="32" cy="34" r="30" fill="url(#mg)" opacity=".7"/>` +
    `<path d="M32,14 C30,8 34,4 40,6" fill="none" stroke="#3a7a4a" stroke-width="3.5" ${S}/>` +
    `<path d="M36,10 C42,6 48,8 50,12 C44,14 40,14 36,10Z" fill="#5cc05a" stroke="#2f7a3a" stroke-width="2" ${S}/>` +
    `<circle cx="22" cy="40" r="14" fill="#6a68e8" stroke="#2a2a90" stroke-width="3"/><circle cx="42" cy="38" r="13" fill="#8a78f0" stroke="#2a2a90" stroke-width="3"/><circle cx="32" cy="26" r="12" fill="#7a88ff" stroke="#2a2a90" stroke-width="3"/>` +
    `<path d="M26,22 C30,18 36,20 36,26" fill="none" stroke="#fff" stroke-width="3" opacity=".7" ${S}/><path d="M16,36 C18,32 22,32 24,34" fill="none" stroke="#fff" stroke-width="3" opacity=".6" ${S}/>` +
    `<path d="M52,8 A8,8 0 1 0 58,20 A6.5,6.5 0 1 1 52,8Z" fill="#fff3a8" stroke="#c9a017" stroke-width="2"/>`),
  // 우유: 흰 우유병
  milk: wrap(`<path d="M24,6 H40 V16 L46,26 V54 Q46,58 42,58 H22 Q18,58 18,54 V26 L24,16Z" fill="#f8fbff" stroke="#6a7a9a" stroke-width="3" ${S}/>` +
    `<path d="M18,32 H46 V54 Q46,58 42,58 H22 Q18,58 18,54Z" fill="#dce8ff"/>` +
    `<rect x="22" y="3" width="20" height="8" rx="3" fill="#6a9ae8" stroke="#2a4a8a" stroke-width="2.5"/>` +
    `<rect x="23" y="36" width="18" height="12" rx="3" fill="#fff" stroke="#6a7a9a" stroke-width="2"/><path d="M27,42 H37" stroke="#6a9ae8" stroke-width="3" ${S}/>` +
    `<path d="M22,24 L22,50" stroke="#fff" stroke-width="3" opacity=".7" ${S}/>`)
};
Object.keys(ICONS).forEach((id) => fs.writeFileSync(path.join(OUT, id + '.svg'), ICONS[id]));
console.log(`재료 아이콘 ${Object.keys(ICONS).length}개 생성 -> assets/tavern/`);
