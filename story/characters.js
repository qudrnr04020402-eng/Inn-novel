// 캐릭터 정의 파일
// - name   : 대사창에 표시되는 이름
// - color  : 이름표 색
// - affinity: true 이면 결과/일차 카드에 호감도가 표시됨 (변수 이름은 aff.<id>)
// - tag    : 한 줄 소개 (타이틀 이름 위에 마우스를 올렸을 때 등에 사용)
// - faces  : 표정 이름 -> 이미지 경로 (확장자 포함).
// - icon   : (선택) 얼굴 동그라미용 정사각 썸네일 경로. 없으면 faces.normal 을 CSS 로 잘라 씀.
//            히로인은 WebP(투명 배경, tools/process-sprites.py 로 생성), 손님은 tools/gen-chars.js 의 SVG.
function faces(id, ext) {
  var f = {};
  ['normal', 'smile', 'angry', 'shy', 'surprised', 'sad'].forEach(function (k) { f[k] = 'assets/char/' + id + '/' + k + '.' + (ext || 'svg'); });
  return f;
}
function heroine(id) { return faces(id, 'webp'); }
function heroineIcon(id) { return 'assets/char/' + id + '/face.webp'; }
window.CHARACTERS = {
  erion: { name: '에리온', color: '#9fb4ff', affinity: true, tag: '엘프 마법사 / 츤데레 · 푸른 책의 비밀', faces: heroine('erion'), icon: heroineIcon('erion') },
  kaela: { name: '카엘라', color: '#ff8a65', affinity: true, tag: '여기사 / 허세 · 허당 · 밝음',            faces: heroine('kaela'), icon: heroineIcon('kaela') },
  miho:  { name: '미호',   color: '#ffc857', affinity: true, tag: '여우 수인 도적 / 장난꾸러기 · 돈 밝힘',      faces: heroine('miho'), icon: heroineIcon('miho') },
  lia:   { name: '리아',   color: '#ff9ec7', affinity: true, tag: '수습 성직자 · 소꿉친구 / 다정 · 질투',       faces: heroine('lia'), icon: heroineIcon('lia') },

  // ----- 저녁 영업 단골 손님 (affinity 없음: 호감도 대신 영업 반응으로 만나는 사람들. 반응 대사는 story/tavern.js) -----
  baron: { name: '바론 영감',   color: '#d8d0b0', tag: '양치기 노인 / 단골 · 으슬으슬',   faces: faces('baron') },
  tobi:  { name: '토비',        color: '#7fd0a8', tag: '떠돌이 행상인 / 수다 · 계산',     faces: faces('tobi') },
  greta: { name: '그레타',      color: '#d6a07a', tag: '은퇴한 용병 / 호탕 · 독한 술',    faces: faces('greta') },
  marta: { name: '마르타',      color: '#ffb08a', tag: '꿀빵 아주머니 / 다정 · 수다',     faces: faces('marta') },
  fin:   { name: '핀',          color: '#9cc4ff', tag: '청년단원 / 어리숙 · 성실',        faces: faces('fin') },
  chief: { name: '촌장님',      color: '#9fd8a8', tag: '마을 촌장 / 인자 · 걱정',         faces: faces('chief') },

  // ----- 여관 등급으로 찾아오는 손님 (story/inn-rank.js) -----
  rosa:  { name: '로사',        color: '#a8e08a', tag: '떠돌이 약초 상인 / 느긋 · 향기 (여관 ★2 단골)', faces: faces('rosa') },
  noble: { name: '벨라르 경',   color: '#d0a0e8', tag: '왕도의 귀족 미식가 / 까다로움 (여관 ★5 특별 손님)', faces: faces('noble') }
};
