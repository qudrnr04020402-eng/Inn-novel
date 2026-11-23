// ============================================================
//  19일차(3주 금) — 왕도 사절단 방문
//  아침(사절단 도착: 사절단장 이졸데, 시험관 하이덴 경) -> 낮(히로인 이벤트 5번째 기회, 깊은 이야기 가능)
//  -> 저녁(사절단이 단골로 끼는 영업) -> 사절단 만찬 -> 밤(짧은 장면)
//  플래그: flag.envoy_vip(특실 대접), flag.kaela_defended(카엘라 편을 들었다), flag.envoy_deal(사절단과 거래)
//  특별 손님: story/tavern.js 의 day5, 숙박 손님: story/lodging.js 의 special.day5
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 아침 =================
  d5_open: [
    { bgm: 'tension' },
    { day: 'next', time: '아침', tip: '왕도 사절단이 여관에 묵어요.\n특별 손님이 저녁 장사에 나오고, 객실은 특실 수요가 높아요.' },
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '이른 아침, 마을 어귀에서 말발굽 소리가 울렸다. 곧 흰 마차 두 대가 여관 앞에 멈춰 섰다. 은빛 여우 간판 아래로 남색 외투를 입은 사람들이 내렸다.' },
    { show: 'envoy', face: 'normal', pos: 'center' },
    { say: 'envoy', text: '왕립 학술원 봉인 조사 사절단장 이졸데입니다. 이 마을에서 가장 믿을 만한 여관이 이곳이라고 들었는데, 방이 있겠습니까?' },
    { hide: 'envoy' },
    { show: 'examiner', face: 'normal', pos: 'right' },
    { say: 'examiner', text: '호위를 맡은 기사단의 하이덴이오. …이 여관에, 붉은 갑옷의 소녀가 지내고 있다고 들었는데.' },
    { narr: '여관 안쪽에서 대검이 바닥에 떨어지는 소리가 났다. 카엘라다.' },
    { show: 'kaela', face: 'surprised', pos: 'left' },
    { say: 'kaela', text: '…하, 하이덴 경. 오랜만입니다. 그 시험 이후로는…' },
    { say: 'examiner', text: '세 번째 시험이었지. 검은 훌륭했네. 다만 판단이 늦었어. 그것은 지금도 고쳐지지 않았는가?' },
    { narr: '카엘라의 어깨가 움찔했다. 이졸데가 차분히 끼어들었다. 눈은 여전히 안경 너머에서 아무것도 읽히지 않았다.' },
    { goto: 'd5_greet' }
  ],
  d5_greet: [
    { hide: 'all' }, { bg: 'inn_day' },
    { narr: '사절단은 일곱 명. 방도, 식사도, 짐 놓을 곳도 필요하다. 어떻게 맞이할까?' },
    { choice: [
      { tag: '평판 +2 · 특실 손님', text: '"가장 좋은 방을 내어 드리겠습니다. 환영합니다." (15G)', cost: 15, set: { rep: 2, 'flag.envoy_vip': true }, goto: 'd5_greet_vip' },
      { tag: '평판 +1', text: '"방은 충분합니다. 평소 손님과 똑같이 모시겠습니다."', set: { rep: 1 }, goto: 'd5_greet_plain' },
      { tag: '골드 +25 · 평판 -2', text: '"왕도 손님이시니 요금은 두 배입니다."', set: { gold: 25, rep: -2 }, goto: 'd5_greet_greedy' }
    ] }
  ],
  d5_greet_vip: [
    { show: 'envoy', face: 'smile', pos: 'center' },
    { say: 'envoy', text: '감사합니다. 격식보다 청결과 정성이 마음에 듭니다. 이 마을이 왜 이 여관을 믿는지 알 것 같군요.' },
    { narr: '리아가 시트를 안고 계단을 오르내리고, 미호가 열쇠 꾸러미를 정신없이 챙겼다. 여관이 오랜만에 활기로 가득했다.' },
    { goto: 'd5_kaela' }
  ],
  d5_greet_plain: [
    { show: 'envoy', face: 'normal', pos: 'center' },
    { say: 'envoy', text: '합리적입니다. 불필요한 환대는 오히려 부담이니까요.' },
    { narr: '이졸데는 만족한 듯 고개를 끄덕이고 짐을 풀기 시작했다.' },
    { goto: 'd5_kaela' }
  ],
  d5_greet_greedy: [
    { show: 'envoy', face: 'angry', pos: 'center' },
    { say: 'envoy', text: '…두 배라. 기록해 두겠습니다. 이 마을의 인심에 대해서요.' },
    { narr: '금고는 두둑해졌지만 등 뒤의 시선이 싸늘했다. 하이덴 경은 말없이 수첩에 무언가를 적었다.' },
    { goto: 'd5_kaela' }
  ],
  d5_kaela: [
    { hide: 'all' }, { bg: 'inn_front' },
    { narr: '짐을 옮기던 중, 하이덴 경이 다시 카엘라에게 다가갔다.' },
    { show: 'examiner', face: 'normal', pos: 'right' },
    { show: 'kaela', face: 'sad', pos: 'left' },
    { say: 'examiner', text: '봉인 사태에 정식 기사가 필요하다. 지금이라도 기사단 복귀 시험을 다시 보겠나? 다만 이 마을에서 물러나는 것이 조건이다.' },
    { say: 'kaela', text: '…마을에서, 물러난다고요. 그건…' },
    { narr: '카엘라가 이쪽을 힐끗 보았다. 대답을 구하는 눈이 아니었다. 대답을 기다리지 않으려는 눈이었다.' },
    { choice: [
      { tag: '카엘라 호감 +2 · 평판 -1', text: '"카엘라는 이 여관의 사람입니다. 시험이 아니라 본인이 정할 일이에요."', set: { 'aff.kaela': 2, rep: -1, 'flag.kaela_defended': true }, goto: 'd5_kaela_defend' },
      { tag: '카엘라 호감 +1', text: '"…카엘라가 원한다면 막지 않겠습니다. 다만 지금은 여기가 급해요."', set: { 'aff.kaela': 1 }, goto: 'd5_kaela_mid' },
      { tag: '평판 +1', text: '"기사단이 돌아와 주면 든든하죠. 카엘라도 생각해 보세요."', set: { rep: 1, 'aff.kaela': -1 }, goto: 'd5_kaela_push' }
    ] }
  ],
  d5_kaela_defend: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '주인장…!' },
    { say: 'examiner', text: '…그렇군. 이 여관의 주인이 그리 말한다면, 오늘은 거두겠네. 다만 마음이 바뀌면 언제든 말하게.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…고, 고맙다. 이 몸이 직접 말해야 했는데. 다음에는 꼭 내 입으로 말하겠다.' },
    { goto: 'd5_erion' }
  ],
  d5_kaela_mid: [
    { show: 'kaela', face: 'normal' },
    { say: 'kaela', text: '…알겠다. 이 일이 끝나고 다시 이야기하자. 그때는 내가 먼저 대답하겠다.' },
    { say: 'examiner', text: '좋소. 시간은 충분하지 않지만, 대답은 서두르지 않겠소.' },
    { goto: 'd5_erion' }
  ],
  d5_kaela_push: [
    { show: 'kaela', face: 'sad' },
    { say: 'kaela', text: '…그렇군. 주인장에게는 이 몸이 그런 정도였나. …아니, 괜찮다. 방 정리하러 가겠다.' },
    { narr: '카엘라는 붉은 갑옷 소리를 죽이며 걸어갔다. 평소답지 않게 발소리가 작았다.' },
    { goto: 'd5_erion' }
  ],
  d5_erion: [
    { hide: 'all' }, { bg: 'inn_day' },
    { narr: '이졸데가 식당 구석에 앉아 손에 든 문서를 한참 넘겨 보았다. 에리온이 책장 사이로 가만히 그쪽을 노려보고 있다.' },
    { show: 'erion', face: 'angry', pos: 'center' },
    { say: 'erion', text: '…학술원의 문장이야. 저 사람들, 봉인이 아니라 우리 일족이 남긴 기록을 찾아온 거야. 사장님, 저들 앞에서 내 이름 함부로 말하지 마.' },
    { narr: '에리온의 말투는 낮았고, 손끝은 책 모서리를 꽉 쥐고 있었다.' },
    { choice: [
      { tag: '에리온 호감 +1', text: '"알겠어요. 에리온이 말하기 전에는 아무한테도 말하지 않을게요."', set: { 'aff.erion': 1 }, goto: 'd5_erion_keep' },
      { tag: '평판 +1', text: '"사절단은 손님이에요. 적이 아니라 협력할 수도 있잖아요."', set: { rep: 1, 'aff.erion': -1 }, goto: 'd5_erion_coop' }
    ] }
  ],
  d5_erion_keep: [
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…고마워. 그런 말, 오랜만에 들어. 부탁이 하나 더 있어. 저들이 방에서 나오면 내 책은 건드리지 마.' },
    { goto: 'd5_pick' }
  ],
  d5_erion_coop: [
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…그럴지도 모르지. 하지만 난 아직 확신이 없어. 그러니까 지켜볼 거야. 사장님도, 저들도.' },
    { goto: 'd5_pick' }
  ],

  // ================= 낮 =================
  d5_pick: [{ rand: 'morning', then: 'd5_pick_day' }],
  d5_pick_day: [
    { time: '낮' }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '사절단이 마을 곳곳으로 조사하러 나간 낮, 여관은 모처럼 고요하다. 누구와 시간을 보낼까?' },
    { goto: 'pick' }
  ],

  // ================= 저녁: 사절단이 손님으로 =================
  d5_evening: [
    { bgm: 'tavern' },
    { rankcheck: true },
    { time: '저녁' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '해 질 녘, 사절단이 조사를 마치고 돌아왔다. 식당이 갑자기 말쑥한 외투들로 가득 찼다. 평소 손님들도 호기심 어린 눈으로 이쪽을 흘끔거린다.' },
    { narr: '오늘 저녁은 사절단장 이졸데와 시험관 하이덴 경이 직접 주문을 한다. 입맛이 까다로울 것이다.' },
    { tavern: 'day5' },
    { goto: 'd5_feast' }
  ],
  d5_feast: [
    { bgm: 'inn_night' },
    { bg: 'inn_evening' }, { hide: 'all' },
    { cg: 'envoy_feast' },
    { narr: '손님이 빠져나간 뒤, 이졸데가 뜻밖의 제안을 했다. "오늘 식사에 대한 답례로, 사절단 전원이 한 상에 앉아 식사를 하고 싶습니다. 여관 분들도 함께요."' },
    { narr: '긴 식탁에 에리온, 카엘라, 미호, 리아가 어색하게 둘러앉았다. 하이덴 경은 카엘라와 마주 앉았고, 이졸데는 에리온 옆자리를 골랐다.' },
    { say: 'envoy', text: '학술원은 봉인을 지키기 위해 존재합니다. 그러나 마을 사람들이 먼저 선택한 방법이 있다면, 그 방법도 기록하겠습니다.' },
    { say: 'examiner', text: '…이 여관의 식사는 나쁘지 않군. 기사단 식당보다 낫다.' },
    { narr: '조용한 웃음이 식탁을 한 바퀴 돌았다. 서로 경계하던 사람들이 잠시 같은 상을 나눈 저녁이었다.' },
    { cg: 'hide' },
    { if: 'flag.envoy_vip', goto: 'd5_feast_vip' },
    { goto: 'd5_night' }
  ],
  d5_feast_vip: [
    { show: 'envoy', face: 'smile', pos: 'center' },
    { say: 'envoy', text: '특실 값어치는 충분했습니다. 이 마을의 보고서에 이 여관 이름을 적어 두겠습니다.' },
    { set: { rep: 1 } },
    { goto: 'd5_night' }
  ],

  // ================= 밤 =================
  d5_night: [
    { bgm: 'inn_night' },
    { time: '밤' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '다들 방으로 돌아간 늦은 밤, 이졸데가 조용히 카운터 앞에 섰다.' },
    { show: 'envoy', face: 'normal', pos: 'center' },
    { say: 'envoy', text: '내일 새벽, 사절단은 신전으로 거처를 옮깁니다. 이 마을에서 봉인 조사는 더 이상 안전하지 않다는 판단입니다. 괜찮다면 사장님도 마차 자리를 하나 드리겠습니다. 왕도로 가는 길입니다.' },
    { narr: '진심 어린 제안이었다. 이 여관을 떠나면 적어도 위험은 없을 것이다.' },
    { choice: [
      { tag: '평판 +1', text: '"감사하지만, 이 여관이 제가 있어야 할 곳입니다."', set: { rep: 1 }, goto: 'd5_night_stay' },
      { text: '"…생각해 보겠습니다."', goto: 'd5_night_think' }
    ] }
  ],
  d5_night_stay: [
    { say: 'envoy', text: '예상한 대답입니다. 이 마을은 좋은 주인을 만났군요. …행운을 빕니다.' },
    { goto: 'night_close' }
  ],
  d5_night_think: [
    { say: 'envoy', text: '새벽까지는 문이 열려 있을 겁니다. 신중하게 결정하세요.' },
    { narr: '이졸데가 사라지고 난 뒤에도 한참 동안 마차 소리가 귀에 맴돌았다. 하지만 아침이 오면, 내가 있을 곳은 이 여관일 것이다.' },
    { goto: 'night_close' }
  ]
});
