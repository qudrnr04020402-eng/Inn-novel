// ============================================================
//  달력 / 챕터 / 메인 고정일 데이터 — 은빛 여우관 (30일 구성)
//  - 30일 = 4주(1~7, 8~14, 15~21, 22~28) + 종장(29~30일). 1일차 = 월요일, 일요일은 휴일(영업 없음).
//  - 메인 줄거리는 주마다 2일 안팎만 대본이 있고(main), 나머지 날은 "일상일"(story/routine.js)로 굴러갑니다.
//  - 글자와 숫자만 바꿔도 됩니다. 새 메인 사건을 넣으려면 main 에 일차를 추가하고 그 씬을 만들면 됩니다. (README "달력과 일정")
//  - 계산(주차/요일/피로)은 js/cal-core.js, 화면은 js/engine.js 에 있습니다.
// ============================================================
window.CALENDAR = {
  total: 30,                 // 총 일수 (마지막 날 이후에는 엔딩 판정)
  weeks: 4,                  // 4주 = 28일까지가 "주차". 그 뒤 29~30일은 종장(5번째 구간)
  startDow: 0,               // 1일차의 요일 (0=월 … 6=일)
  dow: ['월', '화', '수', '목', '금', '토', '일'],
  holidayDow: 6,             // 이 요일은 휴일 (영업/숙박 없음, 주간 이벤트 슬롯 — story/weekly-events.js)

  // ---------- 챕터 (주 시작 때 타이틀 카드가 나옵니다) ----------
  chapters: [
    { id: 1, label: '1장', title: '새 주인',     days: [1, 7],   blurb: '아버지에게 물려받은 여관에\n낯선 손님들이 한꺼번에 들이닥쳤다.' },
    { id: 2, label: '2장', title: '달맞이',      days: [8, 14],  blurb: '마을이 술렁인다.\n일 년에 한 번, 달맞이 장터가 열린다.' },
    { id: 3, label: '3장', title: '왕도의 손님', days: [15, 21], blurb: '소문은 왕도까지 닿았다.\n높은 분들의 발길이 여관 문턱을 넘는다.' },
    { id: 4, label: '4장', title: '폭풍 전야',   days: [22, 28], blurb: '하늘이 낮게 가라앉는다.\n봉인이 풀릴 날이 코앞이다.' },
    { id: 5, label: '종장', title: '봉인',       days: [29, 30], blurb: '모든 것이 정해지는 이틀.\n그리고, 그 뒤의 이야기.' }
  ],

  // ---------- 메인 고정일 ----------
  //  scene   : 그날 아침 장면 (이 씬이 {day:'next'} 로 시작해야 합니다)
  //  evening : 낮 행동이 끝난 뒤 이어질 저녁 씬 (생략하면 일상일 저녁 rt_evening)
  //  title   : 달력에 보이는 이름 / mark: 달력 칸의 기호 / show: 이 일차 이후부터 달력에 미리 보임 (생략하면 지나간 뒤에만)
  main: {
    1:  { scene: 'd1_open', evening: 'd1_evening', title: '도착',           mark: '★' },
    6:  { scene: 'w1_open', evening: 'w1_evening', title: '첫 지진',        mark: '!' },
    10: { scene: 'd2_open', evening: 'd2_evening', title: '저장고 습격',    mark: '!', show: 10 },
    12: { scene: 'w2c_open', evening: 'w2c_evening', title: '흔들리는 소문',  mark: '!', show: 10 },
    13: { scene: 'd3_open', evening: 'd3_evening', title: '달맞이 장터',    mark: '☾', show: 8 },
    18: { scene: 'd4_open', evening: 'd4_evening', title: '술렁이는 마을',  mark: '!' },
    19: { scene: 'd5_open', evening: 'd5_evening', title: '왕도 사절단',    mark: '✉', show: 18 },
    24: { scene: 'w4_open', evening: 'w4_evening', title: '불길한 징조',    mark: '!' },
    28: { scene: 'd6_open', evening: 'd6_evening', title: '폭풍의 밤',      mark: '☁' },
    29: { scene: 'd7_open', evening: 'd7_tavern',  title: '동굴 결전',      mark: '✦', show: 10 },
    30: { title: '새벽 (엔딩)',                                              mark: '✦', show: 10 }   // 결전(29일)의 다음 날 새벽 카드 -> 엔딩 판정 (scene 없음: day7.js 의 d7_win 이 이어 줌)
  },

  // ---------- 표시 전용 달력 표식 ----------
  //  main 과 달리 그날의 흐름(휴일 등)은 바꾸지 않고 달력 칸에만 mark/title 을 보여 줍니다. (show: 이 일차부터 미리 보임)
  //  21일(3주차 일요일)은 휴일 그대로, 밤에 story/route-core.js 의 cf_open(고백의 밤)이 끼어듭니다. (story/routine.js hol_night)
  marks: {
    21: { title: '고백의 밤', mark: '♥', show: 14 }
  },

  // 일상일 / 휴일 아침 씬 (story/routine.js)
  routineScene: 'rt_open',
  holidayScene: 'hol_open',
  routineEvening: 'rt_evening',

  // ---------- 영업 물가 (주차별 재료 값 증가 %) ----------
  price: { 1: 0, 2: 8, 3: 16, 4: 24, 5: 30 },

  // ---------- 피로 (주인의 체력, 0~100) ----------
  fatigue: {
    max: 100,
    sleep: -14,       // 매일 밤 자고 일어나면 회복
    business: 16,     // 저녁 영업을 마치면
    lodging: 5,       // 숙박 접수를 마치면
    holiday: -50,     // 휴일 아침 (영업 없음)
    tired: 60,        // 이 이상이면 "피곤": 영업 팁 감소
    exhausted: 85,    // 이 이상이면 "과로": 팁 크게 감소 + 가끔 손이 미끄러짐(대성공 -> 보통)
    tipMult: { tired: 0.75, exhausted: 0.5 },
    slip: 0.25        // 과로 상태에서 대성공이 미끄러질 확률
  },

  // 퍼소나(자유 대화)가 쓰는 "이야기 단계": 이 일차부터 옛 7일 구성의 n일차 정보를 쓴다 (story/llm-persona.js 의 days / reveal 키)
  stages: [1, 10, 13, 18, 19, 28, 29]
};
