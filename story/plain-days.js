// ============================================================
//  평범한 하루 — 한 히로인의 낮 이벤트(1~4번째, 깊은 이야기)를 다 본 뒤에도 그 사람을 고르면 나오는 짧은 장면
//  (히로인당 2개: <id>_plain1, <id>_plain2). 호감도 +1, 끝나면 after_pick 으로 돌아갑니다.
// ============================================================
Object.assign(STORY.scenes, {
  erion_plain1: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '벤치 옆자리에 말없이 앉았다. 에리온은 한참 만에 찻잔을 내밀었다.' },
    { say: 'erion', text: '…식기 전에 마셔. 오늘은 책 말고 이 차가 더 좋아서.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '이런 하루도 나쁘지 않네. 아무 일도 안 일어나는 하루.' },
    { set: { 'aff.erion': 1, 'ev.erion': 1 } },
    { goto: 'after_pick' }
  ],
  erion_plain2: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'erion', face: 'shy', pos: 'center' },
    { narr: '리아가 빨래를 너는 모습을 에리온이 창가에서 멀찍이 보고 있었다.' },
    { say: 'erion', text: '…보고 있던 거 아니야. 그냥, 바람에 시트가 펄럭이는 게 신기해서.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '사장님도 같이 보자. 아무 말 안 해도 되니까.' },
    { set: { 'aff.erion': 1, 'ev.erion': 1 } },
    { goto: 'after_pick' }
  ],
  kaela_plain1: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { narr: '마당 한가운데서 카엘라가 크게 기지개를 켜고 있었다. 오늘은 대검을 눕혀 두었다.' },
    { say: 'kaela', text: '주인장! 오늘은 수련을 쉬는 날이다. 쉬는 것도 수련이라고 누가 그랬거든!' },
    { say: 'kaela', text: '…그런데 쉬는 법을 몰라서 곤란하다. 같이 일광욕이나 하겠나?' },
    { narr: '나란히 앉아 햇볕을 쬐었다. 카엘라는 오 분도 못 가 코를 골았다.' },
    { set: { 'aff.kaela': 1, 'ev.kaela': 1 } },
    { goto: 'after_pick' }
  ],
  kaela_plain2: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'angry', pos: 'center' },
    { narr: '닭장 앞에서 카엘라가 닭 한 마리와 눈싸움을 하고 있었다.' },
    { say: 'kaela', text: '이 녀석, 사흘째 눈을 안 피한다. 보통 놈이 아니야!' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…아, 졌다. 주인장이 와서 시선을 뺏긴 것뿐이다. 무효다, 무효!' },
    { set: { 'aff.kaela': 1, 'ev.kaela': 1 } },
    { goto: 'after_pick' }
  ],
  miho_plain1: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { narr: '카운터에 턱을 괸 미호가 하품을 삼켰다. 장부는 이미 다 정리된 것 같다.' },
    { say: 'miho', text: '사장님, 손님 없을 땐 돈 안 되는 일 하면 손해예요. …그러니까 이건 서비스예요, 말동무 서비스.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '오늘은 무료예요. 아주 특별히.' },
    { set: { 'aff.miho': 1, 'ev.miho': 1 } },
    { goto: 'after_pick' }
  ],
  miho_plain2: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'miho', face: 'shy', pos: 'center' },
    { narr: '볕 좋은 오후, 미호가 마당 의자에서 꼬리를 정성껏 빗질하고 있었다.' },
    { say: 'miho', text: '…꼬리 손질은 영업 비밀이에요. 뒤에서 몰래 보지 말라고요.' },
    { say: 'miho', text: '그래도 사장님이니까 한 번만. 빗 잡아 줄래요? 아, 너무 세게는 말고요!' },
    { set: { 'aff.miho': 1, 'ev.miho': 1 } },
    { goto: 'after_pick' }
  ],
  lia_plain1: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { narr: '리아가 시트를 빨랫줄 가득 널고 있었다. 하얀 천이 파도처럼 펄럭인다.' },
    { say: 'lia', text: '날씨 좋을 때 말려야 해! 거들어 줄래? 그쪽 끝을 잡아 줘.' },
    { narr: '둘이 시트 양 끝을 맞잡고 털었다. 햇볕 냄새가 얼굴을 스쳤다.' },
    { say: 'lia', text: '…이런 하루, 오래 기억할 것 같아.' },
    { set: { 'aff.lia': 1, 'ev.lia': 1 } },
    { goto: 'after_pick' }
  ],
  lia_plain2: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { narr: '마당 꽃밭에 물을 주는 리아 옆에 쪼그려 앉았다. 화분이 어제보다 하나 늘었다.' },
    { say: 'lia', text: '신전 정원에서 한 포기 얻어 왔어. 이 꽃은 여관 앞에 놓으면 손님들이 좋아할 것 같아서.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '네 이름을 붙여도 돼? …농담이야, 반쯤.' },
    { set: { 'aff.lia': 1, 'ev.lia': 1 } },
    { goto: 'after_pick' }
  ]
});
