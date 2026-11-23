// ============================================================
//  공통 설정 + 공용 씬 — 은빛 여우관 (30일간의 연애 시뮬레이션)
//  - 시작 변수, 히로인 목록, 낮 "누구와 시간을 보낼까" 메뉴, 일차 연결 씬이 여기에 있습니다.
//  - 메인 이야기는 day1.js ~ day7.js, 일상일은 routine.js, 일정표는 calendar.js, 엔딩은 endings.js 입니다. (README 참고)
// ============================================================
window.STORY = {
  title: '은빛 여우관',
  subtitle: '변두리 마을 여관, 30일간의 이야기',
  start: 'd1_open',                          // 새 게임 시작 씬
  loveLine: 60,                              // 고백(개별) 엔딩 기준 호감도. 하트 6칸이 이 값에 해당 (엔진이 하트 칸 계산에 사용)
  cast: ['erion', 'kaela', 'miho', 'lia'],   // 타이틀 화면에 소개할 히로인 (왼쪽부터)
  init: {                                    // 시작 변수
    gold: 80, rep: 0, day: 1, time: '아침',
    aff: { erion: 0, kaela: 0, miho: 0, lia: 0 },   // 호감도
    ev: { erion: 0, kaela: 0, miho: 0, lia: 0 },    // 각 히로인과 낮 이벤트를 본 횟수
    flag: {},
    fat: 0,                                          // 주인의 피로 0~100 (영업/숙박으로 쌓이고 휴식/휴일/잠으로 회복. js/cal-core.js)
    cal: { week: 1, dow: 0, roll: 0, log: {}, act: {}, fl: {} },   // 달력 상태: 주차/요일/오늘의 난수(0~99)/일차별 결과 기록/한 일/문구 중복 방지
    pl: { erion: 0, kaela: 0, miho: 0, lia: 0 },     // 각 히로인의 "평범한 하루" 본 횟수 (장면 돌려쓰기)
    evdone: {},                                      // 본 조건 이벤트(kind:'extra') / 주간 이벤트 id
    today: { cust: 0, price: 0, tip: 0, note: '' },   // 오늘의 영업 보정 (아침 랜덤 사건: story/random-events.js, 새 일차마다 초기화)
    llm: { day: 0, used: {}, gain: {}, loss: {}, last: '', met: [] }   // 자유 대화(로컬 LLM) 하루 사용량 (story/llm-persona.js)
  },
  scenes: {}
};

// ---------- 히로인 목록 / 조건식 도우미 (코드를 몰라도 그대로 쓰면 됩니다) ----------
window.HEROINES = ['erion', 'kaela', 'miho', 'lia'];
window.LOVE = STORY.loveLine;
// HEART(n) -> 하트 n칸에 해당하는 호감도 (6칸 = loveLine). 조건식에 'aff.erion>=' + HEART(4) 처럼 씁니다.
window.HEART = function (n) { return Math.ceil(LOVE * n / 6); };

// WIN('erion', 6) -> "호감도가 6 이상이고, 다른 히로인보다 높거나 같다(동점이면 목록 앞쪽 우선)"
window.WIN = function (id, min) {
  var i = HEROINES.indexOf(id), c = ['aff.' + id + '>=' + min];
  HEROINES.forEach(function (o, j) {
    if (o !== id) c.push('aff.' + id + (j < i ? '>' : '>=') + 'aff.' + o);
  });
  return c.join(' && ');
};

// 진 엔딩 조건(모두 하트 4칸 이상 + 여관 5성) / 명가 엔딩 조건(여관 5성, 또는 4성에 골드 넉넉) — endings.js, day7.js 가 사용
window.TRUE_COND = HEROINES.map(function (h) { return 'aff.' + h + '>=' + HEART(4); }).join(' && ') + ' && inn.rank>=5';
window.MASTER_COND = 'inn.rank>=5 && rep>=50';

Object.assign(STORY.scenes, {

  // ---------- 낮: 무엇을 할까 ----------
  // 선택지는 엔진이 데이터로 만듭니다 (dynamic:'pick'): 히로인별 이벤트 = story/heroine-events.js, 평범한 하루 = story/plain-days.js,
  // 행동(휴식/장보기/손보기/여관 일) = story/routine.js 의 DAY_ACTIONS. 아래 choice 는 검사기/최후의 보루용 기본값입니다.
  pick: [
    { talkpick: true, dynamic: 'pick', choice: [
      { text: '아무하고도 안 놀고 여관 일에 집중한다', tag: '골드 +30 · 평판 +1 · 피로', goto: 'act_work' }
    ] }
  ],

  // ---------- 밤이 끝난 뒤: 숙박 접수 -> 밤 사건(확률) -> 여관 등급 검사 -> 여관 손보기 -> 다음 날 ----------
  //  {lodging:true}  숙박 접수 화면 (story/lodging.js)         {nightev:true}  확률로 밤 사건 장면 (끝나면 {nightret:true} 로 여기 다음 줄로 복귀)
  //  {rankcheck:true} 여관 등급이 올랐으면 축하 화면 (story/inn-rank.js)   {upgrades:true} 여관 손보기 (업그레이드 + 객실 개조)
  //  {cal:'next'}    다음 날 아침 장면으로 (story/calendar.js 의 일정표)
  night_close: [{ time: '밤' }, { lodging: true }, { nightev: true }, { rankcheck: true }, { upgrades: true }, { goto: 'cal_next' }],
  cal_next: [{ cal: 'next' }],

  // 낮 이벤트가 끝나면: CG 걷기 -> (자유 대화 제안) -> (선물 제안) -> (히로인 신경전) -> 그날의 저녁으로
  after_pick: [
    { cg: 'hide' },       // 낮 이벤트의 CG 는 여기서 확실히 걷는다
    { talkoffer: true },   // PC 서버 + 로컬 LLM 이 있을 때만 "조금 더 이야기하기" 제안 (없으면 그냥 지나감)
    { giftoffer: true },   // 보관함에 선물이 있고 오늘 아직 안 줬다면 "선물을 건넨다" 제안 (없으면 그냥 지나감)
    { rivalry: true },     // 두 히로인 호감도가 둘 다 높으면 짧은 신경전 장면 (끝나면 다음 줄로 복귀)
    { goto: 'after_pick2' }
  ],
  // 저녁 장면은 story/calendar.js 의 main[일차].evening (없으면 일상일 저녁 rt_evening)
  after_pick2: [{ cal: 'evening' }]
});
