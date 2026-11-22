// ============================================================
//  이벤트 CG 정의 — 스크립트의 {cg:'id'} 로 전체 화면 일러스트를 띄우고 {cg:'hide'} 로 걷습니다.
//  CG_DEFS: id -> { title, file, hint, (임시 화면용) bg / who / face / tone }
//   - title : 갤러리에 표시되는 이름
//   - file  : 'assets/cg/<id>.webp' (세로 일러스트) 또는 null.
//             null 이면 "임시 CG"로 보입니다: 배경 + 해당 히로인 스탠딩 확대 + 비네트/빛 효과. (이미지 요청 없음)
//   - hint  : 아직 못 본 CG 칸에 보이는 힌트
//   - bg    : 임시 CG 배경 (story/backgrounds.js 의 id)    who : 임시 CG 에 나오는 캐릭터 id 배열
//   - face  : 임시 CG 표정 (기본 smile)                     tone: 임시 CG 빛 색 (기본: 첫 번째 캐릭터의 이름색)
//  그림을 넣는 법은 README "CG 넣는 법" 참고. 갤러리 순서는 아래 정의 순서입니다.
// ============================================================
window.CG_DEFS = {
  // ----- 에리온 -----
  erion_cave:     { title: '동굴 앞의 붕대',       file: null, hint: '에리온의 3번째 낮 이벤트를 본다.',                 bg: 'cave_front',      who: ['erion'], face: 'normal', tone: '#7fa8ff' },
  erion_lantern:  { title: '푸른 책과 소원 등불',  file: null, hint: '3일차 저녁, 에리온과 소원 등불을 띄운다.',         bg: 'square_festival', who: ['erion'], face: 'shy' },
  erion_deep:     { title: '이름이 지워진 책장',   file: null, hint: '에리온의 마음을 깊이 얻은 뒤, 4~5일차 낮에 속마음을 듣는다.', bg: 'roof_night',      who: ['erion'], face: 'sad',    tone: '#7fa8ff' },
  erion_end:      { title: '책에 적은 이름',       file: null, hint: '에리온의 개별 엔딩을 본다.',                       bg: 'roof_night',      who: ['erion'], face: 'smile', tone: '#9fb4ff' },
  // ----- 카엘라 -----
  kaela_tag:      { title: '가격표가 달린 갑옷',   file: null, hint: '카엘라의 3번째 낮 이벤트를 본다.',                 bg: 'inn_day',         who: ['kaela'], face: 'sad' },
  kaela_lantern:  { title: '사자 인형과 소원 등불', file: null, hint: '3일차 저녁, 카엘라와 소원 등불을 띄운다.',        bg: 'square_festival', who: ['kaela'], face: 'shy' },
  kaela_deep:     { title: '세 번째 불합격 통지서', file: null, hint: '카엘라의 마음을 깊이 얻은 뒤, 4~5일차 낮에 속마음을 듣는다.', bg: 'inn_front',       who: ['kaela'], face: 'sad' },
  kaela_end:      { title: '붉은 사자의 맹세',     file: null, hint: '카엘라의 개별 엔딩을 본다.',                       bg: 'inn_front',       who: ['kaela'], face: 'smile' },
  // ----- 미호 -----
  miho_letter:    { title: '우물가의 편지',        file: null, hint: '미호의 3번째 낮 이벤트를 본다.',                   bg: 'inn_front',       who: ['miho'],  face: 'sad' },
  miho_lantern:   { title: '꼬리가 감긴 소원 등불', file: null, hint: '3일차 저녁, 미호와 소원 등불을 띄운다.',          bg: 'square_festival', who: ['miho'],  face: 'shy' },
  miho_deep:      { title: '보육원에서 온 편지',   file: null, hint: '미호의 마음을 깊이 얻은 뒤, 4~5일차 낮에 속마음을 듣는다.', bg: 'inn_day',         who: ['miho'],  face: 'shy' },
  miho_end:       { title: '새벽의 은빛 여우관',   file: null, hint: '미호의 개별 엔딩을 본다.',                         bg: 'inn_dawn',        who: ['miho'],  face: 'shy' },
  // ----- 리아 -----
  lia_charm:      { title: '신전 계단의 낡은 부적', file: null, hint: '리아의 4번째 낮 이벤트를 본다.',                  bg: 'square_day',      who: ['lia'],   face: 'sad' },
  lia_lantern:    { title: '맞잡은 소원 등불',     file: null, hint: '3일차 저녁, 리아와 소원 등불을 띄운다.',           bg: 'square_festival', who: ['lia'],   face: 'shy' },
  lia_deep:       { title: '신전의 문 앞에서',     file: null, hint: '리아의 마음을 깊이 얻은 뒤, 4~5일차 낮에 속마음을 듣는다.', bg: 'square_day',      who: ['lia'],   face: 'sad' },
  lia_end:        { title: '오래된 마음의 아침',   file: null, hint: '리아의 개별 엔딩을 본다.',                         bg: 'inn_front',       who: ['lia'],   face: 'smile' },
  // ----- 공용 -----
  cave_seal:      { title: '동굴 결전, 봉인의 빛', file: null, hint: '5일차 동굴 결전에서 봉인을 맺는다.',               bg: 'cave_inside',     who: ['kaela', 'erion', 'lia', 'miho'], face: 'smile', tone: '#8fb8ff' },
  festival_all:   { title: '달맞이 장터의 밤',     file: null, hint: '3일차 저녁, 다 같이 장터를 거닐며 축제를 즐긴다.', bg: 'square_festival', who: ['kaela', 'lia', 'erion', 'miho'], face: 'smile', tone: '#ffc27a' }
};
