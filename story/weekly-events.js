// ============================================================
//  주간 이벤트 (일요일 휴일의 낮) — 확장 지점
//  - 휴일 낮 선택 화면(story/routine.js 의 hol_menu)은 이 표로 자동 만들어집니다 (js/cal-core.js 의 holidayOptions).
//  - events : 주간 이벤트. 조건에 맞고 아직 안 본 것이 휴일 선택지 맨 위에 나옵니다. 한 번 보면 사라집니다(evdone.<id>).
//      { id, week(주차 하나 또는 배열, 생략하면 모든 주), text(버튼 글), tag, scene(장면 id), minAff(아무 히로인이나 이 호감도 이상일 때만), if(조건식) }
//      장면의 마지막은 {goto:'hol_end'} 입니다. 주차별 휴일은 1~3주차(7, 14, 21일). 4주차 일요일(28일)은 폭풍의 밤이 대신합니다.
//  - walks  : 기본 휴일의 "히로인과 산책"(항상 나옴). 새 산책을 늘리려면 장면을 더 만들고 scene 에 연결하세요.
//  - extras : 항상 있는 기본 선택지(푹 쉬기 등). 장면 마지막은 {goto:'hol_end'}.
//  - 2단계 작업자: events 에 한 줄 + 장면만 추가하면 됩니다. (README "주간 이벤트 추가법")
// ============================================================
window.WEEKLY_EVENTS = {
  events: [
    // 예시 1개 (1주차 휴일). 2단계에서 주차별 내용으로 교체/추가하세요.
    { id: 'wk1_picnic', week: 1, text: '일요일이다. 모두를 불러 마당에서 작은 소풍을 열어 볼까?', tag: '1주차 휴일', scene: 'wk1_picnic' }
  ],
  walks: {
    erion: { text: '에리온에게 산책을 청한다. 집 뒤편 숲길이 조용하다.', scene: 'hol_walk_erion' },
    kaela: { text: '카엘라와 마을 한 바퀴를 돈다. "순찰이다!" 라고 한다.', scene: 'hol_walk_kaela' },
    miho:  { text: '미호와 장터 구경을 간다. 어디서 뭐가 싼지 꿰고 있다.', scene: 'hol_walk_miho' },
    lia:   { text: '리아와 신전 정원을 걷는다. 꽃밭이 한창이다.', scene: 'hol_walk_lia' }
  },
  extras: [
    { id: 'rest', text: '집에서 푹 쉰다', tag: '피로 추가 회복', scene: 'hol_rest' }
  ]
};

Object.assign(STORY.scenes, {

  // ----- 기본 휴일: 히로인과 산책 (호감도 +3) -----
  hol_walk_erion: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '집 뒤편 숲길은 이른 가을 햇살로 얼룩덜룩했다. 에리온은 말없이 앞서 걷다가 이따금 걸음을 늦췄다. 내가 따라올 만큼만.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…이 나무는 내가 아는 숲의 나무랑 닮았어. 잎 모양도, 껍질 냄새도.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '고향 얘기는 잘 안 하는데. …오늘은 조금만 해 볼까. 쉬는 날이니까.' },
    { narr: '에리온은 돌아오는 길 내내 숲의 이름들을 하나씩 알려 주었다. 처음 듣는 말이었지만, 어쩐지 오래 기억하고 싶은 소리였다.' },
    { set: { 'aff.erion': 3, fat: -5 } },
    { goto: 'hol_end' }
  ],
  hol_walk_kaela: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '카엘라는 "휴일 순찰"이라며 마을 골목을 구석구석 돌았다. 아이들이 줄줄이 따라붙었다. 완전히 행렬이다.' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '보라, 주인장! 영웅은 쉬는 날에도 마을을 지킨다! …저기 빵집 들러도 되나? 순찰의 일부다!' },
    { narr: '빵집 앞에서 카엘라는 갓 구운 빵을 두 개 샀다. 하나는 내 손에 쥐여 주고, 하나는 걸어가며 먹어 치웠다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…이런 순찰은 처음이다. 혼자 걸을 때보다 길이 짧게 느껴져. 이유는 모르겠다.' },
    { set: { 'aff.kaela': 3, fat: -5 } },
    { goto: 'hol_end' }
  ],
  hol_walk_miho: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '일요일 장터는 사람들로 북적였다. 미호는 노점마다 멈춰 서서 가격표를 눈으로 훑더니 입속으로 계산을 시작했다.' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '사장님, 저 집 순무는 오늘 사면 손해예요. 내일 아침이면 반값이 돼요. 이건 장사꾼의 감이에요!' },
    { narr: '미호는 진짜로 흥정에 성공해 꿀과자를 덤으로 얻어 왔다. 반을 뚝 잘라 내 입에 넣어 준다.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…돈 안 내고 먹는 건 오늘만이에요. 아니, 이건 공짜가 아니라 선물이에요. 선물이요!' },
    { set: { 'aff.miho': 3, fat: -5 } },
    { goto: 'hol_end' }
  ],
  hol_walk_lia: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '신전 정원은 가을꽃이 한창이었다. 리아는 꽃밭 사이를 걸으며 꽃 이름을 하나씩 짚었다. 어릴 때처럼.' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '이 보라색 꽃 기억나? 어릴 때 네가 이걸 먹어 보겠다고 우겨서 내가 얼마나 놀랐는지.' },
    { say: 'lia', face: 'shy', text: '…그때 약속했잖아. 여관이 망하지 않게 평생 도와주겠다고. 나는 아직 그 약속, 하나도 잊지 않았어.' },
    { narr: '리아가 작은 꽃 한 송이를 내 옷깃에 꽂아 주었다. 꽃잎에서 햇볕 냄새가 났다.' },
    { set: { 'aff.lia': 3, fat: -5 } },
    { goto: 'hol_end' }
  ],

  // ----- 주간 이벤트 예시 (1주차 휴일) -----
  wk1_picnic: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마당 감나무 아래에 돗자리를 펴고 도시락을 늘어놓았다. 소풍이라기엔 소박하지만, 모두를 부르니 순식간에 시끌벅적해졌다.' },
    { show: 'kaela', face: 'smile', pos: 'left' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { show: 'lia', face: 'smile', pos: 'right' },
    { say: 'kaela', text: '야외 식사는 전장의 기본이다! 이 몸이 불침번을 서겠다! …먼저 한 입만 먹고!' },
    { say: 'erion', text: '…햇볕은 별로야. 그래도 나무 그늘은 괜찮네. 앉을게.' },
    { say: 'lia', text: '미호는? 또 어딘가 장부 들여다보고 있는 거 아니야?' },
    { narr: '그때 감나무 위에서 꼬리가 쏙 내려왔다. 미호가 가지 위에 걸터앉아 있었다.' },
    { say: 'miho', text: '높은 데서 보면 도시락이 어느 쪽이 큰지 한눈에 보이거든요. 저는 저쪽 거로 할게요!' },
    { narr: '네 사람이 도시락 하나를 두고 소란을 피우는 걸 보면서, 나는 처음으로 이 여관이 정말 내 집 같다고 생각했다.' },
    { set: { 'aff.erion': 1, 'aff.kaela': 1, 'aff.miho': 1, 'aff.lia': 1, rep: 1, fat: -5 } },
    { goto: 'hol_end' }
  ]
});
