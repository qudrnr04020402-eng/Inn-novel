// ============================================================
//  히로인별 "5번째 낮 이벤트" (깊은 이벤트) — 속마음을 듣는 진지한 이야기
//  - 해당 히로인 호감도가 하트 4칸 상당(HEART(4)) 이상이고, 5~6일차 낮일 때만 선택지에 나타납니다.
//    (선택지는 story/common.js 의 pick 에 있습니다.)
//  - 한 히로인당 1번만. 보고 나면 flag.deep_<id> 가 켜지고, CG 한 장(cg.js 의 <id>_deep)이 갤러리에 기록됩니다.
//  - 선택지는 2개: 어느 쪽이든 호감도가 오르고, 이야기에 맞는 쪽이 더 많이 오릅니다.
//  - 끝은 항상 {goto:'after_pick'} 입니다. (저녁으로 가는 길은 common.js 의 after_pick2 가 일차에 맞춰 이어 줍니다)
// ============================================================
Object.assign(STORY.scenes, {

  // ---------- 에리온: 이름이 지워진 책장 ----------
  erion_5: [
    { set: { 'flag.deep_erion': true } }, { bg: 'roof_night' }, { hide: 'all' },
    { narr: '밤도 아닌데 지붕 위에는 낮은 달빛 같은 푸른 빛이 번지고 있었다. 에리온이 푸른 책의 맨 뒷장을 펼쳐 둔 채 앉아 있다.' },
    { cg: 'erion_deep' },
    { say: 'erion', text: '…이 페이지, 봐. 비어 있지? 원래는 스승님의 이름이 적혀 있던 자리야.' },
    { say: 'erion', text: '이름이 지워진 순간을 기억해. 글자가 흩어지는 게 아니라 처음부터 없었던 것처럼 조용히 사라져. 그게 제일 무서웠어.' },
    { narr: '에리온은 손끝으로 빈 종이를 천천히 쓸었다. 오래 같은 동작을 반복해 온 사람의 손짓이었다.' },
    { say: 'erion', text: '그래서 매일 이 책에 뭔가를 적어. 오늘 먹은 것, 오늘 들은 말. 잊어버려도 책이 기억해 주니까.' },
    { say: 'erion', text: '…오늘은 네 이름을 적을까 말까 고민 중이야. 적어도 될까? 아니면, 적지 않는 게 좋을까?' },
    { cg: 'hide' },
    { choice: [
      { text: '"적어 줘요. 그리고 가끔은 나한테 읽어 줘요."', set: { 'aff.erion': 3 }, goto: 'erion_5_write' },
      { text: '"적지 않아도 돼요. 제가 대신 기억할게요."', set: { 'aff.erion': 2 }, goto: 'erion_5_remember' }
    ] }
  ],
  erion_5_write: [
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '…읽어 달라고? 내가?' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…좋아. 틀리면 웃지 마. 아니, 웃어도 돼. 그게 기억에 남는 방법이기도 하니까.' },
    { narr: '에리온이 빈 페이지의 맨 윗줄에 천천히 첫 글자를 썼다. 푸른 빛이 잠깐 따뜻한 색으로 깜박였다.' },
    { goto: 'after_pick' }
  ],
  erion_5_remember: [
    { show: 'erion', face: 'shy', pos: 'center' },
    { say: 'erion', text: '…그런 말을 하면 책을 덮을 수가 없잖아. 약속은 무거운 거라고.' },
    { say: 'erion', face: 'normal', text: '하지만 알았어. 둘 중 하나는 잊어도, 다른 하나는 기억하겠지. 고마워.' },
    { narr: '에리온은 책을 덮고 가슴에 안았다. 표지의 푸른 빛이 한동안 꺼지지 않았다.' },
    { goto: 'after_pick' }
  ],

  // ---------- 카엘라: 세 번째 불합격 통지서 ----------
  kaela_5: [
    { set: { 'flag.deep_kaela': true } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '이른 오후, 여관 앞 계단. 카엘라가 구겨졌다 펴진 흔적이 가득한 종이 한 장을 무릎 위에 올려 두고 있었다.' },
    { cg: 'kaela_deep' },
    { say: 'kaela', face: 'normal', text: '…웃지 마라. 이건 왕국 기사단 시험 불합격 통지서다. 세 번째.' },
    { say: 'kaela', face: 'sad', text: '검술은 늘 합격선이었어. 떨어진 건 "팀워크" 항목. 혼자 앞으로 뛰어나가는 버릇이 문제라더군. 내가 지키려는 사람들이 뒤에 있으니까 앞에 서는 건데!' },
    { say: 'kaela', text: '그래서 큰 소리로 용사 흉내를 내는 거다. 작아지면 정말로 아무것도 아닌 사람이 될 것 같아서.' },
    { narr: '카엘라는 종이를 접었다 폈다 했다. 언제나 곧던 어깨가 오늘따라 둥글게 보였다.' },
    { say: 'kaela', text: '…주인장, 솔직히 말해 줘. 나는 앞에 서도 되는 사람이냐, 아니면 누군가의 옆에 서야 하는 사람이냐?' },
    { cg: 'hide' },
    { choice: [
      { text: '"옆에 서 줘요. 앞은 우리가 같이 서요."', set: { 'aff.kaela': 3 }, goto: 'kaela_5_side' },
      { text: '"앞에 서요. 대신 뒤는 제가 지킬게요."', set: { 'aff.kaela': 2 }, goto: 'kaela_5_front' }
    ] }
  ],
  kaela_5_side: [
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { say: 'kaela', text: '…같이? 내 옆에?' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '그런 건 시험에서 한 번도 못 들어 봤다. …해 보지. 이번에는 둘이서 하는 걸로.' },
    { narr: '카엘라가 통지서를 반으로 접어 갑옷 안쪽에 넣었다. 이제는 구겨진 종이가 아니라 부적처럼 보였다.' },
    { goto: 'after_pick' }
  ],
  kaela_5_front: [
    { show: 'kaela', face: 'shy', pos: 'center' },
    { say: 'kaela', text: '…뒤를 맡는다고? 내 뒤가 비어도 되는 날이 오다니.' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '좋아! 그럼 나는 마음 놓고 앞에 서겠다! …단, 가끔은 뒤돌아볼 테니까 거기 있어라!' },
    { narr: '카엘라는 평소처럼 큰 소리로 웃었지만, 목소리 끝이 아주 조금 떨렸다.' },
    { goto: 'after_pick' }
  ],

  // ---------- 미호: 보육원에서 온 편지 ----------
  miho_5: [
    { set: { 'flag.deep_miho': true } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '여관이 한가한 오후. 미호가 카운터 뒤에서 낡은 편지 뭉치를 꺼내 놓고 아무 말 없이 동전을 가지런히 세고 있었다.' },
    { cg: 'miho_deep' },
    { say: 'miho', face: 'normal', text: '…아, 사장님. 보셨어요? 괜찮아요, 별 거 아니에요. 그냥 정산 중이에요.' },
    { say: 'miho', face: 'sad', text: '매달 이만큼을 보육원에 보내요. 제가 자란 곳이에요. 거기 아이들이 따뜻한 겨울을 보내려면 이 정도가 필요하거든요.' },
    { say: 'miho', text: '"돈에 밝다"는 말, 맞아요. 그런데 이유를 말하면 다들 불쌍하게 보니까, 그냥 욕심쟁이인 척하는 게 편해요.' },
    { narr: '미호의 귀가 반쯤 접혀 있었다. 편지 맨 위에는 삐뚤삐뚤한 글씨로 "미호 언니 보고 싶어요"라고 적혀 있었다.' },
    { say: 'miho', text: '이번 달에는 조금 모자라요. …이런 말을 하려던 건 아니었는데. 사장님이라면 어떻게 하실 거예요?' },
    { cg: 'hide' },
    { choice: [
      { text: '"모자라는 만큼 같이 채워요. 여관 수입에서 따로 떼어 놓을게요."', cost: 10, set: { 'aff.miho': 3 }, goto: 'miho_5_help' },
      { text: '"좋은 방법을 같이 찾아봐요. 손님이 늘면 되잖아요."', set: { 'aff.miho': 2 }, goto: 'miho_5_plan' }
    ] }
  ],
  miho_5_help: [
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '…공짜로요? 아니, 아니에요. 이건 "투자"로 할게요. 이자는… 제가 정하는 거죠?' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…이자는 평생 갚아도 되는 걸로 할게요. 그렇게 생각하면 편하니까.' },
    { narr: '미호는 웃으면서 눈가를 소매로 훔쳤다. 꼬리가 천천히, 아주 느리게 흔들렸다.' },
    { goto: 'after_pick' }
  ],
  miho_5_plan: [
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '손님이 늘면… 맞아요! 그렇죠, 사장님은 장사꾼이었지!' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…같이 한다고 말해 준 사람은 사장님이 처음이에요. 돈 얘기가 아닌 걸로는.' },
    { narr: '미호는 편지 뭉치를 소중하게 품에 안았다. 돌아서는 뒷모습이 조금 가벼워 보였다.' },
    { goto: 'after_pick' }
  ],

  // ---------- 리아: 신전의 문 앞에서 ----------
  lia_5: [
    { set: { 'flag.deep_lia': true } }, { bg: 'square_day' }, { hide: 'all' },
    { narr: '마을 신전 앞. 낮은 종소리가 울리는데도 리아는 닫힌 문 앞에서 한참 서 있기만 했다.' },
    { cg: 'lia_deep' },
    { say: 'lia', face: 'normal', text: '…여기가 내가 자란 곳이야. 어릴 적에 부모님이 날 맡기고 간 곳. 사제님은 좋은 분이셨지만, 문을 열 때마다 생각했어. 나는 여기에 있어도 되는 아이일까?' },
    { say: 'lia', face: 'sad', text: '그래서 일 잘하는 아이가 되기로 했어. 쓸고, 닦고, 웃고. 쓸모 있으면 쫓겨나지 않을 테니까.' },
    { say: 'lia', text: '여관에 와서 처음으로 "쉬어도 된다"는 말을 들었을 때 어쩔 줄 몰랐어. 쉬는 법을 몰라서, 더 열심히 청소만 했지.' },
    { narr: '리아는 손에 쥔 낡은 부적을 만지작거렸다. 오랜 세월에 실밥이 닳아 있었다.' },
    { say: 'lia', text: '…언제 마지막이 될지 모르잖아. 그래서 묻고 싶어. 나, 여기 있어도 돼? 일을 못 해도?' },
    { cg: 'hide' },
    { choice: [
      { text: '"일이 아니라 리아라서 있어 주는 거예요."', set: { 'aff.lia': 3 }, goto: 'lia_5_stay' },
      { text: '"그럼 오늘은 아무것도 하지 말고 같이 쉬어요."', set: { 'aff.lia': 2 }, goto: 'lia_5_rest' }
    ] }
  ],
  lia_5_stay: [
    { show: 'lia', face: 'surprised', pos: 'center' },
    { say: 'lia', text: '…나라서?' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '그런 말은 처음 들었어. 이상해, 청소할 때보다 가슴이 더 바쁘게 뛰어.' },
    { narr: '리아는 부적을 쥔 손에 힘을 주었다가, 천천히 풀었다. 이제는 놓아도 괜찮다는 듯이.' },
    { goto: 'after_pick' }
  ],
  lia_5_rest: [
    { show: 'lia', face: 'surprised', pos: 'center' },
    { say: 'lia', text: '아무것도 안 하고? 그래도 돼? 걸레도 안 들고?' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '…그럼 신전 계단에 앉아 있자. 해 지는 거 보는 거, 오랜만이야.' },
    { narr: '둘은 신전 계단에 나란히 앉아 한참 아무 말도 하지 않았다. 리아의 어깨가 천천히 내려앉았다.' },
    { goto: 'after_pick' }
  ]
});
