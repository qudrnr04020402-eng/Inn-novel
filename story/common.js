// ============================================================
//  공통 설정 + 공용 씬 — 은빛 여우관 (5일간의 연애 시뮬레이션)
//  - 시작 변수, 히로인 목록, 낮 "누구와 시간을 보낼까" 메뉴, 일차 연결 씬이 여기에 있습니다.
//  - 일차별 이야기는 day1.js ~ day5.js, 엔딩은 endings.js 입니다. (README 참고)
// ============================================================
window.STORY = {
  title: '은빛 여우관',
  subtitle: '변두리 마을 여관, 5일간의 이야기',
  start: 'd1_open',                          // 새 게임 시작 씬
  loveLine: 24,                              // 고백(개별) 엔딩 기준 호감도. 하트 6칸이 이 값에 해당 (엔진이 하트 칸 계산에 사용)
  cast: ['erion', 'kaela', 'miho', 'lia'],   // 타이틀 화면에 소개할 히로인 (왼쪽부터)
  init: {                                    // 시작 변수
    gold: 80, rep: 0, day: 1, time: '아침',
    aff: { erion: 0, kaela: 0, miho: 0, lia: 0 },   // 호감도
    ev: { erion: 0, kaela: 0, miho: 0, lia: 0 },    // 각 히로인과 낮 이벤트를 본 횟수
    flag: {}
  },
  scenes: {}
};

// ---------- 히로인 목록 / 조건식 도우미 (코드를 몰라도 그대로 쓰면 됩니다) ----------
window.HEROINES = ['erion', 'kaela', 'miho', 'lia'];
window.LOVE = STORY.loveLine;

// WIN('erion', 6) -> "호감도가 6 이상이고, 다른 히로인보다 높거나 같다(동점이면 목록 앞쪽 우선)"
window.WIN = function (id, min) {
  var i = HEROINES.indexOf(id), c = ['aff.' + id + '>=' + min];
  HEROINES.forEach(function (o, j) {
    if (o !== id) c.push('aff.' + id + (j < i ? '>' : '>=') + 'aff.' + o);
  });
  return c.join(' && ');
};

Object.assign(STORY.scenes, {

  // ---------- 낮: 누구와 시간을 보낼까 ----------
  // 각 히로인을 "N번째로 고를 때" dayN.js 의 이벤트 N 이 열립니다. (매일 같은 사람을 고르면 1~4일차 이벤트가 순서대로)
  // 옵션 글은 "다음에 볼 이벤트"를 미리 보여 주는 한 줄입니다.
  pick: [
    { choice: [
      // ----- 에리온 -----
      { who: 'erion', if: 'ev.erion==0', text: '마당 구석 벤치에서 푸른 책을 펼쳐 놓고 먼 산을 보고 있다.', goto: 'erion_1' },
      { who: 'erion', if: 'ev.erion==1', text: '주방 앞을 서성인다. 달콤한 냄새가 나는 쪽을 자꾸 흘끔거린다.', goto: 'erion_2' },
      { who: 'erion', if: 'ev.erion==2', text: '손에 붕대를 감은 채 동굴 쪽으로 걸어가고 있다.', goto: 'erion_3' },
      { who: 'erion', if: 'ev.erion>=3', text: '지붕 위에서 책을 안고 가만히 앉아 있다.', goto: 'erion_4' },
      // ----- 카엘라 -----
      { who: 'kaela', if: 'ev.kaela==0', text: '마당에서 대검을 휘두르고 있다. 폼이 요란하다. 빨랫줄이 위험하다.', goto: 'kaela_1' },
      { who: 'kaela', if: 'ev.kaela==1', text: '마을 아이들에게 둘러싸여 무용담을 늘어놓는 중이다.', goto: 'kaela_2' },
      { who: 'kaela', if: 'ev.kaela==2', text: '창고 구석에서 혼자 갑옷을 닦고 있다. 어쩐지 기운이 없다.', goto: 'kaela_3' },
      { who: 'kaela', if: 'ev.kaela>=3', text: '"동굴 주변을 정찰하겠다!" 하며 이미 문 앞에 서 있다.', goto: 'kaela_4' },
      // ----- 미호 -----
      { who: 'miho', if: 'ev.miho==0', text: '카운터 앞을 어슬렁거린다. 눈이 손님 지갑을 따라다닌다.', goto: 'miho_1' },
      { who: 'miho', if: 'ev.miho==1', text: '식료품 창고 구석에서 장부 같은 걸 펴 놓고 동전을 세고 있다.', goto: 'miho_2' },
      { who: 'miho', if: 'ev.miho==2', text: '뒷마당 우물가에 걸터앉아 편지를 읽고 있다. 평소답지 않게 조용하다.', goto: 'miho_3' },
      { who: 'miho', if: 'ev.miho>=3', text: '귀를 쫑긋 세운 채 동굴 쪽을 바라보고 있다.', goto: 'miho_4' },
      // ----- 리아 -----
      { who: 'lia', if: 'ev.lia==0', text: '양동이와 걸레를 들고 복도를 닦고 있다. 콧노래가 들린다.', goto: 'lia_1' },
      { who: 'lia', if: 'ev.lia==1', text: '물동이를 이고 우물에서 돌아오는 길이다. 어쩐지 위태위태하다.', goto: 'lia_2' },
      { who: 'lia', if: 'ev.lia==2', text: '창가에 앉아 말없이 바깥을 보고 있다. 표정이 평소와 조금 다르다.', goto: 'lia_3' },
      { who: 'lia', if: 'ev.lia>=3', text: '신전 앞 계단에 앉아 있다. 손에 낡은 부적을 쥐고 있다.', goto: 'lia_4' },
      // ----- 여관 일 -----
      { text: '아무하고도 안 놀고 여관 일에 집중한다', tag: '골드 +20 · 평판 +1', goto: 'work_day' }
    ] }
  ],

  work_day: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '오늘은 다른 일을 제쳐 두고 여관 일에 집중하기로 했다. 시트를 갈고, 지붕의 새는 곳을 막고, 밀린 장부를 정리했다.' },
    { narr: '복도에서 손님들끼리 속닥이는 소리가 들렸다. "여기, 의외로 깔끔하네."' },
    { set: { gold: 20, rep: 1 } },
    { narr: '몸은 고단하지만 금고가 조금 두둑해졌다. 이것도 여관 주인의 보람이다.' },
    { goto: 'after_pick' }
  ],

  // ---------- 밤이 끝난 뒤: 여관 업그레이드 (하루 1번, 1~4일차 밤 다음) ----------
  // {upgrades:true} 는 업그레이드 구입 화면을 띄우고, "다음 날로" 를 누르면 다음 명령으로 넘어갑니다.
  d1_upgrade: [{ time: '밤' }, { upgrades: true }, { goto: 'd2_open' }],
  d2_upgrade: [{ time: '밤' }, { upgrades: true }, { goto: 'd3_open' }],
  d3_upgrade: [{ time: '밤' }, { upgrades: true }, { goto: 'd4_open' }],
  d4_upgrade: [{ time: '밤' }, { upgrades: true }, { goto: 'd5_open' }],

  // 낮 이벤트가 끝나면 날짜에 맞는 저녁으로 이동
  after_pick: [
    { if: 'day==1', goto: 'd1_evening' },
    { if: 'day==2', goto: 'd2_evening' },
    { if: 'day==3', goto: 'd3_evening' },
    { goto: 'd4_evening' }
  ]
});
