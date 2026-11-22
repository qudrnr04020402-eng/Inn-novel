// ============================================================
//  4일차 — 봉인의 진실
//  아침(평판에 따라 달라지는 마을 분위기) -> 낮(히로인 이벤트 4) -> 저녁(작전 회의 + 선물) -> 밤(전야 방문)
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 아침 =================
  d4_open: [
    { bgm: 'inn_day' },
    { day: 4, time: '아침', tip: '내일이 마지막 날이에요.\n오늘 밤 이후에는 마음을 정해야 해요.' },
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '동이 트기 전부터 뒷산에서 푸른 안개가 흘러내리고 있다. 동굴 입구에서 올라오는 빛은 어젯밤보다 한층 짙어졌다.' },
    { narr: '마을 길에는 짐수레가 줄지어 섰다. 불안해진 사람들이 하나둘 마을을 떠나기 시작한 것이다.' },
    { if: 'rep>=2', goto: 'd4_open_trust' },
    { if: 'rep<=-1', goto: 'd4_open_cold' },
    { goto: 'd4_open_plain' }
  ],
  d4_open_trust: [
    { narr: '그런데 몇몇 이웃이 여관 문 앞에 모여들었다. 어느새 얼굴이 익은 마을 사람들이다.' },
    { narr: '"주인장, 이럴 때일수록 은빛 여우관에 모여 있는 게 안전하다고들 하더군. 우리 좀 쉬게 해 주겠나?" 꿀빵을 사 가던 아주머니가 먼저 입을 뗐다.' },
    { set: { gold: 20, rep: 1 } },
    { narr: '쌓아 온 신뢰 덕분에 여관은 대피소가 되었고, 사람들이 내놓은 식재료와 사례가 금고를 채웠다.' },
    { goto: 'd4_pick' }
  ],
  d4_open_cold: [
    { narr: '여관 앞을 지나던 사람들은 눈을 마주치지 않으려는 듯 고개를 돌렸다. "저 여관 주인, 이번에도 돈 생각만 하더니…" 하는 속삭임이 귀에 박혔다.' },
    { narr: '투숙하던 손님 몇이 방값 환불을 요구하며 짐을 쌌다. 어쩔 수 없이 돌려주었다.' },
    { set: { gold: -15 } },
    { narr: '금고가 얄팍해졌다. 신뢰를 쌓는 일은 오래 걸리지만 잃는 건 순식간이라는 걸 새삼 느꼈다.' },
    { goto: 'd4_pick' }
  ],
  d4_open_plain: [
    { narr: '여관은 조용하다. 떠나는 손님도, 새로 오는 손님도 없다. 모두가 다음에 벌어질 일을 기다리며 숨을 죽이고 있다.' },
    { goto: 'd4_pick' }
  ],

  // ================= 낮 =================
  // 아침 랜덤 사건 (story/random-events.js): 확률로 짧은 돌발 사건을 거친 뒤 낮으로 이어진다
  d4_pick: [{ rand: 'morning', then: 'd4_pick_day' }],
  d4_pick_day: [
    { time: '낮' }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '오늘이 사실상 마지막으로 마음 편히 시간을 보낼 수 있는 날이다. 누구와 함께할까?' },
    { goto: 'pick' }
  ],

  // ----- 에리온 4: 지붕 위 -----
  erion_4: [
    { set: { 'ev.erion': 1 } }, { bg: 'roof_night' }, { hide: 'all' },
    { narr: '구름이 낮게 깔려 낮인데도 해 질 녘처럼 어둑하다. 지붕 위에서 에리온이 푸른 책을 가슴에 안고 가만히 앉아 있었다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…올라오지 마. 아니, 이미 올라왔네. 포기했어.' },
    { say: 'erion', face: 'sad', text: '이 책은 봉인의 열쇠야. 스승님이 맡기셨지. 스승님은 삼백 년 전, 저 동굴 안의 것을 혼자 봉인하셨어.' },
    { say: 'erion', text: '봉인을 다시 맺으려면 대가가 필요해. 봉인지기의 이름과 기억. 스승님은 그걸 내놓았고, 그래서 나는 스승님의 이름을… 이제 떠올릴 수 없어.' },
    { narr: '에리온의 손끝이 책 표지를 천천히 쓸었다. 그것이 기억을 대신하는 유일한 물건이라는 듯.' },
    { say: 'erion', face: 'normal', text: '내일, 내가 똑같이 할 거야. 그걸 말해 주려고 한 건 아니고… 아니, 맞아. 누군가에게는 말하고 싶었어. 왜 너인지는 묻지 마.' },
    { say: 'erion', text: '…너는 왜 이렇게까지 해? 손님일 뿐인 나한테. 이유가 뭐야?' },
    { choice: [
      { text: '"네가 걱정돼서요. 손님이 아니라, 그냥 에리온이."', set: { 'aff.erion': 2, 'flag.erion_told': true }, goto: 'erion_4_worry' },
      { text: '"내가 같이 할게요. 무슨 일이 있어도."', set: { 'aff.erion': 2, 'flag.erion_told': true }, goto: 'erion_4_together' },
      { text: '"네가 사라지면 곤란해요. 방값 밀렸잖아요."', set: { 'aff.erion': 1, 'flag.erion_told': true }, goto: 'erion_4_joke' },
      { text: '"여관 손님이니까요. 책임이 있어요."', set: { 'aff.erion': 1, 'flag.erion_told': true }, goto: 'erion_4_duty' }
    ] }
  ],
  erion_4_worry: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…!' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…바보 같아. 정말로. 그런 말은 사람을 약하게 만든다고.' },
    { narr: '에리온은 고개를 푹 숙였다. 어깨가 조금 떨렸다. 책에서 번지는 푸른 빛이 평소보다 한결 부드러웠다.' },
    { say: 'erion', face: 'smile', text: '…하지만 이상하게, 싫지 않아. 고마워. 처음으로 한 번만, 그렇게 말할게.' },
    { goto: 'after_pick' }
  ],
  erion_4_together: [
    { show: 'erion', face: 'angry' },
    { say: 'erion', text: '안 돼! 이건 내가 짊어질 일이야. 네가 같이 하면…!' },
    { narr: '목소리가 갈라졌다. 화난 얼굴이었지만 눈가는 젖어 있었다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…정말로 같이 해 줄 거야? 사라지는 건 이름뿐이 아닐지도 모르는데. 그래도?' },
    { narr: '고개를 끄덕이자, 에리온은 얼굴을 가린 채 아주 작게 말했다. \'…바보\'.' },
    { goto: 'after_pick' }
  ],
  erion_4_joke: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…푸핫.' },
    { narr: '처음으로 에리온이 소리 내어 웃었다. 입가를 가렸지만 어깨가 들썩이는 건 숨길 수 없었다.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '방값이라니. 이 상황에서. …좋아, 방값은 꼭 낼게. 그러니까 내가 돌아오는 걸 기다려도 돼.' },
    { goto: 'after_pick' }
  ],
  erion_4_duty: [
    { say: 'erion', face: 'normal', text: '…책임이라. 인간답네. 하지만 그것도 나쁘지 않아.' },
    { narr: '에리온은 옅게 미소를 짓고는 다시 먼 곳을 바라보았다. 거리가 조금 가까워진 것 같으면서도, 아직은 한 걸음쯤 남았다.' },
    { goto: 'after_pick' }
  ],

  // ----- 카엘라 4: 동굴 정찰 -----
  kaela_4: [
    { set: { 'ev.kaela': 1 } }, { bg: 'cave_front' }, { hide: 'all' },
    { narr: '카엘라와 함께 동굴 근처 숲길을 살폈다. 안개가 짙어서 몇 걸음 앞도 잘 보이지 않는다.' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '걱정 마라, 주인장! 이 몸이 앞장서면 어떤 괴물도 겁먹고 도망친다!' },
    { narr: '바로 그때, 안개 속에서 낮은 으르렁 소리가 났다. 그림자 같은 늑대가 눈을 붉게 빛내며 모습을 드러냈다.' },
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…!' },
    { narr: '카엘라의 손이 대검을 쥐고도 떨리고 있다. 처음 마주한 진짜 적. 그녀의 발이 땅에 붙은 듯 움직이지 못한다.' },
    { choice: [
      { text: '"무서운 건 부끄러운 게 아니에요. 같이 있을게요." (손을 잡는다)', set: { 'aff.kaela': 2 }, goto: 'kaela_4_hand' },
      { text: '"뒤는 제가 볼게요. 앞은 맡길게요."', set: { 'aff.kaela': 1 }, goto: 'kaela_4_trust' },
      { text: '"…떨고 있잖아요."', set: { 'aff.kaela': -1 }, goto: 'kaela_4_shake' },
      { text: '"물러서요! 제가 앞에 설게요!"', set: { 'aff.kaela': 1 }, goto: 'kaela_4_front' }
    ] }
  ],
  kaela_4_hand: [
    { narr: '카엘라의 떨리는 손을 꽉 잡았다. 그녀가 흠칫 놀라 이쪽을 보았다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…주인장.' },
    { show: 'kaela', face: 'normal' },
    { say: 'kaela', text: '…좋아. 이제 괜찮다. 무섭지 않은 게 아니라, 지켜야 할 게 있으면 달라질 뿐이다. 배웠다.' },
    { fx: 'shake' },
    { narr: '카엘라의 대검이 번개처럼 휘둘러졌다. 그림자 늑대가 갈라져 연기처럼 흩어졌다. 처음으로 나온, 헛되지 않은 일격이었다.' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…했다! 해냈다! 봤나, 주인장! 진짜다! 이번에는 진짜다!' },
    { goto: 'after_pick' }
  ],
  kaela_4_trust: [
    { show: 'kaela', face: 'normal' },
    { say: 'kaela', text: '…알았다. 등 뒤는 맡기겠다!' },
    { fx: 'shake' },
    { narr: '카엘라가 이를 악물고 대검을 휘둘렀다. 서투르지만 단단한 일격. 늑대가 허무하게 흩어졌다. 그녀는 숨을 몰아쉬며 씩 웃었다.' },
    { say: 'kaela', face: 'smile', text: '…해냈군. 영웅의 첫 진짜 승리다. 기억해 두도록!' },
    { goto: 'after_pick' }
  ],
  kaela_4_shake: [
    { show: 'kaela', face: 'angry' },
    { say: 'kaela', text: '떨고 있지 않다! 이건 무사의 떨림이다!' },
    { fx: 'shake' },
    { narr: '카엘라가 허둥지둥 대검을 휘둘렀다. 늑대는 겨우 물리쳤지만, 어쩐지 그녀의 표정은 분한 듯 굳어 있었다.' },
    { goto: 'after_pick' }
  ],
  kaela_4_front: [
    { show: 'kaela', face: 'angry' },
    { say: 'kaela', text: '아니다! 앞에 서는 건 내 역할이다! 영웅이… 되고 싶으니까!' },
    { fx: 'shake' },
    { narr: '카엘라가 나를 밀어내고 앞으로 뛰쳐나가 늑대를 베었다. 그리고 숨을 헐떡이며 돌아봤다. 어딘가 개운한 표정이다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…걱정해 줘서 고맙다. 그래도 이번 건 내가 하고 싶었다.' },
    { goto: 'after_pick' }
  ],

  // ----- 미호 4: 행운의 동전 -----
  miho_4: [
    { set: { 'ev.miho': 1 } }, { bg: 'cave_front' }, { hide: 'all' },
    { narr: '미호가 동굴 근처 바위 위에서 귀를 쫑긋 세운 채 안개를 바라보고 있다. 평소의 장난기는 어디에도 없다.' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { say: 'miho', text: '…사장님. 저 동굴 말이에요. 처음엔 안에 보물이 있을 거라고 생각했어요. 그걸 팔면 아이들이 몇 년은 먹고살 테니까요.' },
    { say: 'miho', face: 'sad', text: '근데 그게 아니었네요. 저 안에는 돈으로 못 사는 게 있나 봐요. 소리가 무서워요. 귀가 그렇게 말해요.' },
    { narr: '미호가 품에서 낡은 금화 한 닢을 꺼냈다. 한쪽 면에 여우 문양이 새겨져 있다.' },
    { say: 'miho', face: 'normal', text: '이건 할머니가 물려주신 행운의 동전이에요. 이 여관 이름이 새겨져 있죠. 할머니가 젊은 시절 다쳤을 때, 이 여관 주인이 숨겨 주셨대요. 사장님 아버님이 아닐까 싶어요.' },
    { narr: '그러고 보니 아버지의 낡은 장부 첫 장에 여우 그림이 그려져 있던 것이 기억났다.' },
    { say: 'miho', face: 'smile', text: '그래서 사장님한테 이걸 맡기고 싶어요. 팔 수 없는 돈이라 가치가 제로인데… 이상하죠?' },
    { choice: [
      { text: '"소중한 물건이잖아요. 받을 수 없어요."', set: { 'aff.miho': 2 }, goto: 'miho_4_refuse' },
      { text: '"고마워요. 대신 빌리는 거예요. 꼭 돌려주러 올게요."', set: { 'aff.miho': 2, 'flag.fox_coin': true }, goto: 'miho_4_borrow' },
      { text: '"이거 얼마쯤 해요?" 하고 농담을 던진다', set: { 'aff.miho': 1 }, goto: 'miho_4_joke' }
    ] }
  ],
  miho_4_refuse: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '…진짜 받을 거라고 생각하셨어요? 사장님은 정말.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '그렇게 말해 줄 줄 알았어요. 그래서 맡기고 싶었던 거예요. 도적이 마음을 훔칠 줄 알고 있는 거죠. 헤헤.' },
    { narr: '미호는 동전을 다시 품에 넣고, 대신 내 소매를 꼬리로 말아 쥐었다.' },
    { goto: 'after_pick' }
  ],
  miho_4_borrow: [
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…빌리는 거라고요? 이자, 비쌀 텐데요. 평생 갚아야 할지도 몰라요.' },
    { narr: '미호가 내 손바닥에 동전을 올려 주었다. 따뜻했다. 그녀의 체온이 남아 있었다.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '약속이에요. 안 돌려주면 영원히 쫓아다니면서 이자를 받을 거예요, 사장님.' },
    { goto: 'after_pick' }
  ],
  miho_4_joke: [
    { show: 'miho', face: 'angry' },
    { say: 'miho', text: '이건 비매품이에요! 아니, 얼마를 부르든 안 팔아요!' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '…푸하하, 사장님 정말. 이런 분위기에서 가격 얘기를 하다니. 저랑 좀 닮았는데요?' },
    { goto: 'after_pick' }
  ],

  // ----- 리아 4: 낡은 부적 -----
  lia_4: [
    { set: { 'ev.lia': 1 } }, { bg: 'square_day' }, { hide: 'all' },
    { narr: '신전 앞 계단. 리아가 손에 낡은 부적을 쥐고 앉아 있다. 가장자리가 헤진 오래된 물건이다.' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { say: 'lia', text: '…왔네. 올 줄 알았어. 이거 기억나? 어릴 때 네가 내게 준 부적. 여관 앞 도랑에서 주운 돌에 이름을 쓴 거였지.' },
    { say: 'lia', face: 'smile', text: '웃기지? 이것 때문에 신전에 들어간 거야. 이 부적이 진짜 힘이 있는지 알고 싶어서. 그리고, 다음에 만날 때 당당하게 말하고 싶어서.' },
    { say: 'lia', face: 'sad', text: '…내일, 위험한 일을 하러 가는 거지? 말 안 해도 알아. 네 얼굴에 다 쓰여 있어.' },
    { narr: '리아의 손이 내 소매 끝을 꼭 쥐었다. 힘이 너무 세서 조금 아팠다.' },
    { cg: 'lia_charm' },
    { say: 'lia', text: '약속해 줘. 꼭 돌아오겠다고. 그것만 약속해 줘.' },
    { cg: 'hide' },
    { choice: [
      { text: '"약속할게. 반드시 돌아와서, 네 곁에 있을게."', set: { 'aff.lia': 2 }, goto: 'lia_4_promise' },
      { text: '(부적을 받아 목에 걸고, 리아의 머리를 쓰다듬는다)', set: { 'aff.lia': 2 }, goto: 'lia_4_charm' },
      { text: '"걱정 마. 별일 없을 거야."', set: { 'aff.lia': 1 }, goto: 'lia_4_lie' },
      { text: '"넌 신전으로 대피해 있어. 위험하니까."', set: { 'aff.lia': -1 }, goto: 'lia_4_away' }
    ] }
  ],
  lia_4_promise: [
    { show: 'lia', face: 'surprised' },
    { say: 'lia', text: '…응.' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '그렇게 곧바로 말해 주면, 나… 울어 버릴 것 같잖아.' },
    { narr: '리아가 부적을 내 손에 쥐여 주고, 이마를 내 어깨에 살짝 기댔다. 오래, 말없이.' },
    { goto: 'after_pick' }
  ],
  lia_4_charm: [
    { narr: '낡은 부적이 가슴 위에서 따뜻하게 흔들렸다. 리아의 분홍빛 머리카락이 손가락 사이로 부드럽게 흘렀다.' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…이상하다. 이럴 때는 내가 위로해 줘야 하는 건데.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '그래도 좋아. 가만히 있을게. 조금만 더, 이대로.' },
    { goto: 'after_pick' }
  ],
  lia_4_lie: [
    { show: 'lia', face: 'sad' },
    { say: 'lia', text: '…거짓말. 너 거짓말할 때 코 밑을 만지는 버릇 있는 거 알아?' },
    { narr: '손이 코 밑에 가 있었다. 리아는 웃으려다 실패한 얼굴로 고개를 숙였다.' },
    { say: 'lia', face: 'normal', text: '…그래도 고마워. 거짓말이라도, 안심시켜 주려고 한 거니까.' },
    { goto: 'after_pick' }
  ],
  lia_4_away: [
    { show: 'lia', face: 'angry' },
    { say: 'lia', text: '대피? 나더러 도망치라는 거야? 난 신전 사람이야. 이런 때 사람을 지키라고 있는 거라고!' },
    { show: 'lia', face: 'sad' },
    { say: 'lia', text: '…그리고 너 혼자 보내는 게 제일 무서운 일이야. 그걸 모르겠어?' },
    { narr: '리아가 소매를 놓고 신전 안으로 들어가 버렸다. 문이 닫히는 소리가 이상하게 크게 울렸다.' },
    { goto: 'after_pick' }
  ],

  // ================= 저녁: 마지막 평화로운 영업 -> 작전 회의 =================
  // 저녁 영업(story/tavern.js 의 day4) 뒤, 가게 문을 닫고 모두가 모여 작전 회의를 한다
  d4_evening: [
    { bgm: 'tavern' },
    { time: '저녁' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '짐을 싸던 마을 사람들도 해가 지자 한 잔 마시러 하나둘 들른다. 어쩌면 이 식당에서 보내는 마지막 평범한 저녁일지도 모른다.' },
    { tavern: 'day4' },
    { goto: 'd4_ev_meeting' }
  ],
  d4_ev_meeting: [
    { bgm: 'tension' },
    { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '영업이 끝나고, 식당에 모두가 모였다. 문은 닫혀 있고, 창문 너머로 푸른 안개가 흘러들고 있다.' },
    { show: 'kaela', face: 'normal', pos: 'left' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { show: 'miho', face: 'normal', pos: 'right' },
    { say: 'erion', text: '…이제 말해야겠지. 내가 왜 이 마을에 왔는지.' },
    { say: 'erion', text: '동굴 안에는 삼백 년 전 스승님이 봉인한 \'어둠의 문지기\'가 있어. 봉인이 풀리면 문지기는 마을을 삼키고, 다음은 인간 영토 전체야.' },
    { say: 'erion', text: '이 책은 봉인의 열쇠. 다시 봉인하려면 봉인지기가 이름과 기억을 바쳐야 해. 내일 해 질 녘, 봉인은 완전히 풀려. 그 전에 내가 한다.' },
    { if: 'flag.erion_told', goto: 'd4_ev_told' },
    { goto: 'd4_ev_untold' }
  ],
  d4_ev_told: [
    { narr: '에리온이 잠깐 내 쪽을 흘끔 보았다. 이미 알고 있는 사람에게는 눈이 그렇게 말하고 있었다. \'…모두에게 말하게 해 줘서 고마워.\'' },
    { goto: 'd4_ev_react' }
  ],
  d4_ev_untold: [
    { narr: '식당 안이 쥐 죽은 듯 조용해졌다. 에리온의 이야기는 모두에게 처음이었다.' },
    { goto: 'd4_ev_react' }
  ],
  d4_ev_react: [
    { show: 'kaela', face: 'angry' },
    { say: 'kaela', text: '이름과 기억을 바친다고!? 그게 무슨 소리냐! 그런 건 영웅의 방식이 아니다! 영웅은 모두를 살리고 자기도 살아 돌아온다!' },
    { show: 'miho', face: 'sad' },
    { say: 'miho', text: '…솔직히 이름 팔아서 사는 건 저도 해 본 적 없어요. 근데 에리온 씨는 그걸 그냥 하겠다는 거잖아요. 공짜로.' },
    { hide: 'miho' },
    { show: 'lia', face: 'sad', pos: 'right' },
    { say: 'lia', text: '신께서도 그런 희생을 바라지는 않으실 거예요. 분명히. 다른 방법이 있을 거예요.' },
    { show: 'erion', face: 'angry' },
    { say: 'erion', text: '다른 방법은 없어! 있었다면 삼백 년 동안 스승님이 찾았을 거야!' },
    { narr: '다툼이 번지고 식당 공기가 서늘해졌다. 모두의 시선이 나를 향한다. 여관 주인이 결정해야 한다. 이 마을에서 가장 많은 사람을 지켜보고 있는 사람은 바로 나니까.' },
    { choice: [
      { text: '"에리온 혼자 보낼 순 없어요. 모두 함께 갑니다. 방법은 같이 찾아요."', set: { 'aff.erion': 1, 'aff.kaela': 1, 'aff.miho': 1, 'aff.lia': 1, rep: 1, 'flag.plan_team': true }, goto: 'd4_ev_team' },
      { text: '"에리온의 계획을 믿겠어요. 대신 우리가 끝까지 곁에서 지킬게요."', set: { 'aff.erion': 2, 'flag.plan_trust': true }, goto: 'd4_ev_trust' },
      { text: '"…마을 사람들을 데리고 일단 도망치죠. 목숨이 우선이에요."', set: { 'aff.erion': -1, 'aff.kaela': -1, 'aff.miho': -1, 'aff.lia': -1, rep: -3, 'flag.plan_run': true }, goto: 'd4_ev_run' }
    ] }
  ],
  d4_ev_team: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…함께? 그런 말을 해 준 사람은 스승님 이후로 처음이야.' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '하하! 역시 주인장이다! 영웅단 결성이군! 이름은 \'은빛 여우 기사단\'으로 하자!' },
    { hide: 'lia' },
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'miho', text: '보수는 후불인 거죠? 그럼 계약 성립! 도적단 부업 시작입니다!' },
    { hide: 'miho' },
    { show: 'lia', face: 'smile', pos: 'right' },
    { say: 'lia', text: '신께서 지켜보고 계실 거야. 내일, 모두 같이 돌아오자.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…바보들. 정말로.' },
    { goto: 'd4_ev_gift' }
  ],
  d4_ev_trust: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…믿는다고? 나를?' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…그래. 그럼 나도, 한 번만 믿어 볼게. 모두를.' },
    { show: 'kaela', face: 'sad' },
    { say: 'kaela', text: '…어쩐지 납득이 안 간다. 하지만 주인장의 판단이라면 따르겠다.' },
    { goto: 'd4_ev_gift' }
  ],
  d4_ev_run: [
    { show: 'kaela', face: 'angry' },
    { say: 'kaela', text: '…도망? 주인장, 진심이냐?' },
    { hide: 'miho' },
    { show: 'lia', face: 'sad', pos: 'right' },
    { say: 'lia', text: '…그건 안 돼. 마을은 어떡하고…' },
    { narr: '차가운 침묵이 식당을 짓눌렀다. 다들 실망한 얼굴이다. 나 역시 입 밖으로 낸 말이 마음에 걸렸다.' },
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…좋아. 그럼 나 혼자 가겠어. 인간의 마을은 인간이 지키는 거라고 생각한 내가 바보였지.' },
    { narr: '하룻밤을 더 생각해 보기로 했다. 정말로 이게 옳은 걸까.' },
    { goto: 'd4_ev_gift' }
  ],

  // ----- 전야의 선물 -----
  d4_ev_gift: [
    { bgm: 'romance' },
    { hide: 'all' },
    { narr: '회의가 끝나고 각자 흩어졌다. 내일을 위한 마지막 준비 시간이다. 가진 돈으로 누군가에게 도움이 될 물건을 마련할 수 있다.' },
    // 이 선물도 "하루에 한 사람당 선물 1개" 한도를 씁니다 (gift.given.<id> = 4). 낮에 이미 선물한 사람은 선택지에서 빠집니다.
    { choice: [
      { who: 'erion', if: 'gift.given.erion!=4', put: { 'gift.given.erion': 4 }, text: '마력 회복 물약을 준비해 준다. "무리하지 마요."', cost: 15, set: { 'aff.erion': 2 }, goto: 'd4_gift_erion' },
      { who: 'kaela', if: 'gift.given.kaela!=4', put: { 'gift.given.kaela': 4 }, text: '갑옷을 새로 수리해 주고 가격표를 떼어 준다', cost: 15, set: { 'aff.kaela': 2 }, goto: 'd4_gift_kaela' },
      { who: 'miho', if: 'gift.given.miho!=4', put: { 'gift.given.miho': 4 }, text: '튼튼한 로프와 도구 세트를 사 준다', cost: 15, set: { 'aff.miho': 2 }, goto: 'd4_gift_miho' },
      { who: 'lia', if: 'gift.given.lia!=4', put: { 'gift.given.lia': 4 }, text: '신전에서 성수를 사 와서 건넨다', cost: 15, set: { 'aff.lia': 2 }, goto: 'd4_gift_lia' },
      { text: '모두에게 따뜻한 야식을 나눠 준다 (무료)', set: { rep: 1 }, goto: 'd4_gift_all' }
    ] }
  ],
  d4_gift_erion: [
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '…내가 부탁한 적도 없는데. 이런 건 비싸잖아.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…받을게. 하지만 쓰지 않아도 되도록 노력할게. 그게 네가 원하는 거잖아.' },
    { goto: 'd4_night' }
  ],
  d4_gift_kaela: [
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { say: 'kaela', text: '갑옷이… 반짝반짝하다! 아니, 가격표가 없다!' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…이제 진짜 내 갑옷 같다. 고맙다, 주인장. 이건 평생 소중히 입겠다.' },
    { goto: 'd4_night' }
  ],
  d4_gift_miho: [
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '이거 최신형 갈고리 로프잖아요! 가격이 얼마… 아니, 아니에요! 받을게요!' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '이거 쓰고 살아서 돌아오면 이자 포함해서 갚을게요. 아, 이자는 제가 정하는 거죠?' },
    { goto: 'd4_night' }
  ],
  d4_gift_lia: [
    { show: 'lia', face: 'surprised', pos: 'center' },
    { say: 'lia', text: '이거 성수 아니야? 신전에서도 구하기 힘든 건데…' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '고마워. 이거, 네가 위험할 때 대신 쓸게. 약속이야.' },
    { goto: 'd4_night' }
  ],
  d4_gift_all: [
    { show: 'kaela', face: 'smile', pos: 'left' },
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'kaela', text: '야식이다! 전투 전에는 든든히 먹어야지!' },
    { say: 'miho', text: '사장님, 오늘만은 공짜죠? 그렇게 알고 먹을게요!' },
    { narr: '다 같이 둘러앉아 먹는 야식은 소박했지만 따뜻했다. 모두의 얼굴이 조금 풀렸다.' },
    { goto: 'd4_night' }
  ],

  // ================= 밤 (전야) =================
  d4_night: [
    { bgm: 'inn_night' },
    { time: '밤' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '마지막 밤이다. 모두가 각자 방으로 돌아가고 여관이 조용해졌다. 내일 일을 생각하며 천장을 보고 있는데, 방문이 조용히 열렸다.' },
    { if: WIN('erion', 11), goto: 'd4_night_erion' },
    { if: WIN('kaela', 11), goto: 'd4_night_kaela' },
    { if: WIN('miho', 11), goto: 'd4_night_miho' },
    { if: WIN('lia', 11), goto: 'd4_night_lia' },
    { goto: 'd4_night_none' }
  ],
  d4_night_none: [
    { narr: '…아무도 오지 않았다. 바람이 문을 흔든 것 같다. 복도 끝에서 에리온이 책 읽는 소리, 카엘라의 코 고는 소리, 미호가 동전을 세는 소리, 리아의 기도 소리가 조금씩 들린다.' },
    { narr: '이 여관에 사람이 가득 찬 게 얼마 만일까. 내일, 반드시 모두 무사히 돌아오게 하겠다고 다짐하며 눈을 감았다.' },
    { goto: 'd4_upgrade' }
  ],
  d4_night_erion: [
    { bgm: 'romance' },
    { bg: 'roof_night' },
    { show: 'erion', face: 'shy', pos: 'center' },
    { say: 'erion', text: '…자? 안 잤지. 지붕 위로 와 줄래. 잠깐이면 돼.' },
    { narr: '달빛 아래 에리온의 은빛 머리카락이 부드럽게 빛났다. 그녀는 책을 품에 안고 한참을 말없이 앉아 있다가 입을 열었다.' },
    { say: 'erion', face: 'normal', text: '…만약 내일, 내가 네 이름을 잊어버린다면. 그래도 나를 다시 불러 줄 수 있어? 몇 번이고. 내가 기억할 때까지.' },
    { say: 'erion', face: 'shy', text: '…이상하지. 이름을 잃는 게 무섭다고 생각한 건 처음이야. 지금까지는 그저 의무라고만 생각했는데.' },
    { set: { 'aff.erion': 1 } },
    { narr: '그녀의 어깨가 내 어깨에 조용히 기댔다. 떨고 있는 게 느껴졌다. 나는 말없이 곁을 지켰다.' },
    { goto: 'd4_upgrade' }
  ],
  d4_night_kaela: [
    { bgm: 'romance' },
    { show: 'kaela', face: 'shy', pos: 'center' },
    { say: 'kaela', text: '주, 주인장. 자고 있었나? 아니, 이 시간에 불쑥 오다니 영웅의 체면이 말이 아니군.' },
    { narr: '카엘라는 갑옷을 입지 않은 평상복 차림이었다. 처음 보는 모습이다. 붉은 머리를 풀어 내린 채 문 앞에 서 있다.' },
    { say: 'kaela', face: 'normal', text: '내일이 두렵다. 하지만, 그것보다 더 두려운 건 내일 이후에 주인장을 못 보게 되는 것이다. …이게 무슨 감정인지는 잘 모르겠지만.' },
    { say: 'kaela', face: 'smile', text: '그러니까 맹세하겠다. 내 검은, 주인장과 이 여관을 지키는 데 쓰겠다고. 정식 기사가 아니어도 상관없다. 나만의 기사도다!' },
    { set: { 'aff.kaela': 1 } },
    { narr: '카엘라는 대검 대신 손바닥을 내 앞에 내밀었다. 악수하자는 뜻이다. 그 손은 아주 따뜻했다.' },
    { goto: 'd4_upgrade' }
  ],
  d4_night_miho: [
    { bgm: 'romance' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { say: 'miho', text: '사장님. 안 자는 거 알아요. 귀가 좋거든요. 한숨 소리가 다 들려요.' },
    { narr: '미호가 침대 모서리에 걸터앉았다. 평소의 장난기가 없다. 꼬리가 천천히 내 다리 위로 올라온다.' },
    { say: 'miho', face: 'shy', text: '저, 내일 무서워요. 도망치는 건 전문인데, 이번엔 도망치고 싶지 않아요. 이유는 사장님이 알잖아요.' },
    { say: 'miho', face: 'smile', text: '…돌아오면, 이자 대신 부탁 하나만 들어줘요. 아직 말 안 할래요. 비밀이니까.' },
    { set: { 'aff.miho': 1 } },
    { narr: '미호가 내 귓가에 작게 속삭이고는 도망치듯 방을 나갔다. 방에는 여우 귀 같은 따뜻한 온기만 남았다.' },
    { goto: 'd4_upgrade' }
  ],
  d4_night_lia: [
    { bgm: 'romance' },
    { show: 'lia', face: 'shy', pos: 'center' },
    { say: 'lia', text: '…자? 안 자지? 나도 못 자겠어서.' },
    { narr: '리아가 숄을 두른 채 조심스럽게 들어왔다. 침대 곁 의자에 앉아 무릎을 끌어안는다. 어릴 때 천둥 치는 밤에 그랬던 것처럼.' },
    { say: 'lia', face: 'normal', text: '있잖아. 아까 낮에 말한 거, 약속 지켜 줄 거지? …난 내일이 어떻게 되든 이 여관이 좋아. 그리고, 이 여관에 있는 네가 제일 좋아.' },
    { say: 'lia', face: 'shy', text: '…아, 이상한 뜻 아니야! 아니, 이상한 뜻이긴 한데! 내일 이후에, 제대로 말해도 될까?' },
    { set: { 'aff.lia': 1 } },
    { narr: '리아가 내 손을 살며시 잡았다가 놓았다. 그 손끝이 조금 떨렸다.' },
    { goto: 'd4_upgrade' }
  ]
});
