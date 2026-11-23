// ============================================================
//  주차 메인 사건 중 새로 쓴 장면 — 1주차 토요일(첫 지진), 4주차 수요일(불길한 징조)
//  - 일정은 story/calendar.js 의 main 입니다. 옛 1일차 저녁의 첫 지진(d1_ev_quake ...)은 6일차(1주차 토요일)로 옮겼습니다.
//  - 이 날들도 낮에는 평소처럼 행동을 고릅니다 (pick). 저녁은 일상일 영업(routine) 뒤에 사건이 이어집니다.
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 6일차 (1주차 토요일): 첫 지진 =================
  w1_open: [
    { bgm: 'inn_day' },
    { day: 'next', time: '아침', tip: '토요일, 장이 서는 날이에요. 손님이 가장 많은 날이에요.\n{flav.morning}' },
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '토요일 아침. 장이 서는 날이라 마을이 벌써부터 북적인다. 여관에도 짐을 든 손님이 늘었다.' },
    { rand: 'morning', then: 'w1_pick_day' }
  ],
  w1_pick_day: [{ time: '낮' }, { bg: 'inn_day' }, { hide: 'all' }, { goto: 'pick' }],
  w1_evening: [
    { bgm: 'tavern' },
    { time: '저녁' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '장날 저녁이라 식당이 일찍부터 가득 찼다. 한 주 동안 익힌 솜씨를 보여 줄 때다.' },
    { tavern: 'routine' },
    { goto: 'w1_ev_close' }
  ],
  // 영업 직후: 모두가 식당에 남아 있는 상태에서 지진으로 이어진다 (d1_ev_quake: story/day1.js)
  w1_ev_close: [
    { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '마지막 잔이 비워질 즈음, 식당은 웃음소리로 가득했다. 한 주 만에 은빛 여우관이 이렇게 북적이게 될 줄은 몰랐다.' },
    { show: 'kaela', face: 'smile', pos: 'left' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { show: 'lia', face: 'smile', pos: 'right' },
    { say: 'kaela', text: '주인장! 이번 주 영웅의 식사는 만족스러웠다! 다음 주에는 고기를 더 준비하도록!' },
    { say: 'lia', text: '정리는 내가 도울게. 한 주 동안 정말 잘했어.' },
    { narr: '그때였다. 식탁 위의 컵이 달그락달그락 떨리기 시작했다.' },
    { goto: 'd1_ev_quake' }
  ],

  // ================= 24일차 (4주차 수요일): 불길한 징조 =================
  w4_open: [
    { bgm: 'tension' },
    { day: 'next', time: '아침', tip: '봉인이 깨질 날까지 닷새.\n징조가 하나둘 나타나요.' },
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '아침부터 마을이 이상했다. 우물물이 푸르스름하게 빛나고, 마당의 닭들은 한 마리도 알을 낳지 않았다.' },
    { show: 'erion', face: 'sad', pos: 'center' },
    { say: 'erion', text: '…징조가 빨라졌어. 책이 밤새 한 번도 조용하지 않았어.' },
    { say: 'erion', text: '앞으로 닷새. 그 안에 준비를 마쳐야 해. 마을 사람들이 도망칠 수 있게, 아니면 싸울 수 있게.' },
    { narr: '에리온의 목소리는 낮고 단단했다. 그녀가 이렇게 정확하게 날짜를 말한 건 처음이다.' },
    { choice: [
      { text: '"마을 사람들에게도 사정을 알려야겠어요."', set: { 'aff.erion': 1, rep: 1 }, goto: 'w4_open_tell' },
      { text: '"여관을 대피소로 쓸 수 있게 준비해 둘게요." (20G)', cost: 20, set: { rep: 2, 'flag.shelter_prep': true }, goto: 'w4_open_prep' },
      { text: '"일단 평소처럼 장사하면서 상황을 지켜봐요."', set: { gold: 10 }, goto: 'w4_open_calm' }
    ] }
  ],
  w4_open_tell: [
    { say: 'erion', face: 'normal', text: '…정직하네. 겁먹는 사람이 생길 텐데, 모르고 당하는 것보다는 나아.' },
    { narr: '촌장님을 찾아가 사정을 털어놓았다. 촌장님은 한참 침묵하다가 묵직하게 고개를 끄덕였다. "이 마을을 지키는 건 우리 몫이기도 하지."' },
    { goto: 'w4_pick' }
  ],
  w4_open_prep: [
    { say: 'erion', face: 'surprised', text: '…대피소? 정말 그렇게까지 할 거야?' },
    { narr: '다락방부터 지하 저장고까지 바닥을 쓸고 담요를 쌓았다. 수고스러운 일이었지만, 여관이 이렇게 믿음직하게 보인 건 처음이다.' },
    { goto: 'w4_pick' }
  ],
  w4_open_calm: [
    { say: 'erion', face: 'normal', text: '…그것도 방법이야. 평소와 다름없는 얼굴이 사람들을 안심시키기도 하니까.' },
    { narr: '평소와 다름없이 앞치마를 둘렀다. 그래도 손이 조금 떨렸다는 건 나만 알고 있다.' },
    { goto: 'w4_pick' }
  ],
  w4_pick: [{ rand: 'morning', then: 'w4_pick_day' }],
  w4_pick_day: [{ time: '낮' }, { bg: 'inn_day' }, { hide: 'all' }, { goto: 'pick' }],
  w4_evening: [
    { bgm: 'tavern' },
    { time: '저녁' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '식당 손님들의 대화는 온통 뒷산 이야기였다. 평범한 주문을 받는 일이 오늘따라 고맙다.' },
    { tavern: 'routine' },
    { goto: 'rt_night' }
  ]
});
