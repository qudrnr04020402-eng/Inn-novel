// ============================================================
//  18일차(3주 목) — 술렁이는 마을
//  아침(평판에 따라 달라지는 마을 분위기) -> 낮(히로인 이벤트) -> 저녁 영업 -> 왕도 사절단이 온다는 소식 -> 밤(짧은 방문)
//  (옛 4일차의 작전 회의/전야의 선물/전야 방문은 6일차(story/day6.js)로 옮겼습니다)
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 아침 =================
  d4_open: [
    { bgm: 'inn_day' },
    { day: 'next', time: '아침', tip: '마을이 술렁이기 시작했어요.\n평판에 따라 이웃의 반응이 달라져요.' },
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '동이 트기 전부터 뒷산에서 푸른 안개가 흘러내리고 있다. 동굴 입구에서 올라오는 빛은 어젯밤보다 한층 짙어졌다.' },
    { narr: '마을 길에서는 불안한 얼굴로 수군거리는 사람들이 눈에 띄게 늘었다. 몇몇은 벌써 친척 집으로 짐을 옮기기 시작했다.' },
    { if: 'rep>=2', goto: 'd4_open_trust' },
    { if: 'rep<=-1', goto: 'd4_open_cold' },
    { goto: 'd4_open_plain' }
  ],
  d4_open_trust: [
    { narr: '그런데 몇몇 이웃이 여관 문 앞에 모여들었다. 어느새 얼굴이 익은 마을 사람들이다.' },
    { narr: '"주인장, 이럴 때일수록 은빛 여우관이 중심을 잡아 줘야지. 우리가 일손을 거들 테니 걱정 말게나." 꿀빵을 사 가던 아주머니가 먼저 입을 뗐다.' },
    { set: { gold: 12, rep: 1 } },
    { narr: '쌓아 온 신뢰 덕분에 이웃들이 식재료와 일손을 보태 주었다. 금고가 조금 두둑해졌다.' },
    { goto: 'd4_pick' }
  ],
  d4_open_cold: [
    { narr: '여관 앞을 지나던 사람들은 눈을 마주치지 않으려는 듯 고개를 돌렸다. "저 여관 주인, 이번에도 돈 생각만 하더니…" 하는 속삭임이 귀에 박혔다.' },
    { narr: '투숙하던 손님 몇이 방값 환불을 요구하며 짐을 쌌다. 어쩔 수 없이 돌려주었다.' },
    { set: { gold: -10 } },
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
    { narr: '마을 분위기가 점점 무거워지고 있다. 그래도 오늘 하루는 내 몫이다. 누구와 함께할까?' },
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
    { say: 'erion', face: 'normal', text: '그때가 오면, 나도 똑같이 할 거야. 그걸 말해 주려고 한 건 아니고… 아니, 맞아. 누군가에게는 말하고 싶었어. 왜 너인지는 묻지 마.' },
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
    { say: 'lia', face: 'sad', text: '…곧, 위험한 일을 하러 가는 거지? 말 안 해도 알아. 네 얼굴에 다 쓰여 있어.' },
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

  // ================= 저녁: 영업 -> 왕도 사절단 소식 =================
  d4_evening: [
    { bgm: 'tavern' },
    { time: '저녁' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '술렁이는 마을에서도 저녁이 되면 사람들은 한 잔 마시러 하나둘 들른다. 걱정은 걱정이고, 배는 고픈 법이다.' },
    { tavern: 'day4' },
    { goto: 'd4_ev_end' }
  ],
  d4_ev_end: [
    { bgm: 'inn_night' },
    { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '마지막 손님을 배웅하고 식기를 정리하는데, 문이 벌컥 열렸다. 청년단 핀이 숨을 헐떡이며 뛰어 들어왔다.' },
    { show: 'fin', face: 'surprised', pos: 'center' },
    { say: 'fin', text: '사, 사장님! 큰일… 아니, 좋은 소식이에요! 촌장님이 왕도에 보낸 급사가 돌아왔어요. 내일 왕립 학술원 봉인 조사 사절단이 이 마을에 도착한대요!' },
    { hide: 'fin' },
    { show: 'erion', face: 'angry', pos: 'center' },
    { say: 'erion', text: '…학술원? 하필 지금. 그쪽 사람들은 봉인이 아니라 책에만 관심이 있을 텐데.' },
    { show: 'kaela', face: 'surprised', pos: 'left' },
    { say: 'kaela', text: '왕도의 사절단…! 기사단 사람도 같이 오는 건가? 그, 그렇다면 이 몸도 의관을 정제해야…' },
    { show: 'kaela', face: 'sad' },
    { narr: '카엘라의 목소리가 이상하게 작아졌다. 왕도라는 말이 나온 순간 표정이 굳은 것 같다.' },
    { narr: '손님이 올 것이다. 여관 주인으로서 어떻게 맞이할까?' },
    { choice: [
      { text: '"여관을 정돈하고 정중히 맞이합시다." (10G)', cost: 10, set: { rep: 1, 'flag.envoy_prep': true }, goto: 'd4_ev_prep' },
      { text: '"평소처럼 맞이하면 되죠. 우리다운 여관이니까요."', goto: 'd4_ev_plain' }
    ] }
  ],
  d4_ev_prep: [
    { show: 'lia', face: 'smile', pos: 'right' },
    { say: 'lia', text: '그럼 시트부터 다 갈아야겠네! 내가 복도랑 객실을 맡을게. 다락방은 먼지가 많으니까 오늘 밤에 환기부터 해 두자.' },
    { narr: '다 같이 밤늦게까지 객실을 쓸고 닦았다. 내일은 왕도의 손님이 올 것이다.' },
    { goto: 'd4_night' }
  ],
  d4_ev_plain: [
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'miho', text: '왕도 손님이면 팁도 클 텐데… 아, 아니에요. 그래도 사장님 말이 맞아요. 꾸미면 금방 들켜요.' },
    { narr: '평소처럼 장부를 정리하고 불을 껐다. 내일은 낯선 얼굴들이 여관을 찾아올 것이다.' },
    { goto: 'd4_night' }
  ],

  // ================= 밤 =================
  d4_night: [
    { bgm: 'inn_night' },
    { time: '밤' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '긴 하루를 마치고 방에 누웠는데, 조용히 문 두드리는 소리가 났다.' },
    { if: WIN('erion', HEART(3)), goto: 'd4_night_erion' },
    { if: WIN('kaela', HEART(3)), goto: 'd4_night_kaela' },
    { if: WIN('miho', HEART(3)), goto: 'd4_night_miho' },
    { if: WIN('lia', HEART(3)), goto: 'd4_night_lia' },
    { goto: 'd4_night_none' }
  ],
  d4_night_none: [
    { narr: '문을 열어 봐도 복도에는 아무도 없었다. 창밖에는 푸른 안개가 낮게 깔려 있다.' },
    { narr: '내일은 왕도에서 손님이 온다. 마음을 다잡고 눈을 감았다.' },
    { goto: 'night_close' }
  ],
  d4_night_erion: [
    { bgm: 'romance' },
    { show: 'erion', face: 'shy', pos: 'center' },
    { say: 'erion', text: '…잠깐만. 학술원 사람들이 오면, 나는 한동안 방에서 안 나올 거야. 그러니까 미리 말해 두는 건데.' },
    { say: 'erion', face: 'normal', text: '…내가 책을 빼앗기면 그건 네 탓이 아니야. 그냥, 알고 있으라고.' },
    { set: { 'aff.erion': 1 } },
    { narr: '에리온은 그 말만 남기고 복도 어둠 속으로 사라졌다. 문 앞에 작은 별꽃 사탕 하나가 놓여 있었다.' },
    { goto: 'night_close' }
  ],
  d4_night_kaela: [
    { bgm: 'romance' },
    { show: 'kaela', face: 'shy', pos: 'center' },
    { say: 'kaela', text: '주, 주인장. 아직 안 잤나? …내일 올 사절단 말이다. 기사단 사람이 올지도 모른다는 얘기를 들었다.' },
    { say: 'kaela', face: 'sad', text: '이 몸은 그 사람들 앞에서 영웅이어야 한다. …하지만 사실은 조금 무섭다. 한 번도 합격하지 못했으니까.' },
    { set: { 'aff.kaela': 1 } },
    { narr: '카엘라는 억지로 웃어 보이고는 문을 닫았다. 문틀에 부딪히는 소리가 나지 않은 건 오늘이 처음이었다.' },
    { goto: 'night_close' }
  ],
  d4_night_miho: [
    { bgm: 'romance' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '사장님, 사절단이 오면 객실이 꽉 찬다는 거 알죠? 특실 수요가 엄청나요. 다락 개조할 돈이 있으면 지금이 타이밍이에요!' },
    { say: 'miho', face: 'shy', text: '…물론 그건 핑계고요. 사실은 오늘 하루 종일 사장님 얼굴을 못 봐서 와 본 거예요. 비밀이에요, 아시죠?' },
    { set: { 'aff.miho': 1 } },
    { narr: '미호는 꼬리를 한 번 흔들고 도망치듯 사라졌다. 어쩐지 방 안이 한층 따뜻해졌다.' },
    { goto: 'night_close' }
  ],
  d4_night_lia: [
    { bgm: 'romance' },
    { show: 'lia', face: 'shy', pos: 'center' },
    { say: 'lia', text: '자, 자고 있었어? …내일 손님들 맞을 준비 때문에 잠이 안 와서. 시트도 다 갈았는데 괜히 불안해.' },
    { say: 'lia', face: 'smile', text: '그래도 네가 옆에 있으니까 괜찮아. 어릴 때부터 그랬어. 네가 괜찮다고 하면 정말 괜찮았거든.' },
    { set: { 'aff.lia': 1 } },
    { narr: '리아가 문 앞에 서서 한참 인사를 하고 갔다. 복도에 따뜻한 빵 냄새가 남았다.' },
    { goto: 'night_close' }
  ]
});
