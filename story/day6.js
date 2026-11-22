// ============================================================
//  6일차 — 폭풍의 밤 (결전 전날)
//  아침(폭풍이 몰아쳐 마을 사람들이 피신, 리아와 미호가 돕는다) -> 낮(히로인 이벤트 6번째 기회) ->
//  저녁(무료 배식 vs 정상 영업을 고르는 영업) -> 정전(호감도가 가장 높은 히로인과 짧은 장면) ->
//  전야: 작전 회의(봉인의 대가) -> 전야의 선물 -> 밤(전야 방문)
//  (옛 4일차의 "전야" 구성을 이 날로 옮겼습니다. 결과 flag.plan_team / plan_trust / plan_run 은 7일차 결전에서 읽습니다)
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 아침 =================
  d6_open: [
    { bgm: 'tension' },
    { day: 6, time: '아침', tip: '폭풍이 몰아쳐요. 마을 사람들이 여관으로 피신해 와요.\n저녁에 "무료 배식"과 "정상 영업" 중 하나를 고르게 돼요.' },
    { bg: 'inn_front' }, { hide: 'all' },
    { fx: 'shake' },
    { narr: '밤새 세찬 바람이 간판을 흔들더니, 동이 트기 전부터 폭풍이 몰아쳤다. 뒷산에서 푸른 안개가 흘러내리고, 그 위로 번개가 쉴 새 없이 갈라진다.' },
    { narr: '빗속을 뚫고 마을 사람들이 하나둘 여관 문을 두드렸다. 아이를 안은 아주머니, 지팡이를 짚은 노인, 비에 흠뻑 젖은 청년단원들. 마을에서 가장 지붕이 튼튼한 곳이 은빛 여우관이기 때문이다.' },
    { narr: '왕도의 사절단은 폭풍이 오기 전에 신전으로 자리를 옮겼다고 한다. 오늘 여관은 온전히 마을 사람들의 것이다.' },
    { goto: 'd6_open_shelter' }
  ],
  d6_open_shelter: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '식당은 젖은 외투와 담요로 가득 찼다. 그 한가운데서 리아와 미호가 정신없이 움직이고 있다.' },
    { show: 'lia', face: 'normal', pos: 'left' },
    { show: 'miho', face: 'normal', pos: 'right' },
    { say: 'lia', text: '아이들은 난로 가까이에! 할아버지는 이쪽 의자로 앉으세요. 담요가 모자라면 말해 주세요, 신전에서 더 가져올게요!' },
    { say: 'miho', face: 'surprised', text: '사장님, 큰일이에요! 식료품 창고 재고를 세어 봤는데 이대로면 사흘도 못 가요. …아니 잠깐, 이 수프 솥 크기면 우리 보육원 아이들 몫까지…' },
    { say: 'lia', face: 'angry', text: '미호! 지금 보육원 얘기가 나와? 지금은 이 사람들 먼저야!' },
    { say: 'miho', face: 'sad', text: '…알아요. 알아서 말한 거예요. 저도 이런 날 굶는 게 어떤 건지 아니까요.' },
    { narr: '두 사람이 나를 동시에 쳐다보았다. 오늘 피난민 돌봄의 역할 분담은 내가 정해야 한다.' },
    { choice: [
      { who: 'lia', text: '"리아, 아이들과 노인들을 돌봐 줘요. 신전 사람이 곁에 있으면 마음이 놓이니까."', set: { 'aff.lia': 2, rep: 1 }, goto: 'd6_open_lia' },
      { who: 'miho', text: '"미호, 식량 재고를 정리하고 배급 계획을 짜 줘요. 숫자는 미호가 최고니까."', set: { 'aff.miho': 2, rep: 1 }, goto: 'd6_open_miho' },
      { text: '"둘이 같이 해 줘요. 리아는 사람, 미호는 식량. 서로 부족한 데를 채워요."', set: { 'aff.lia': 1, 'aff.miho': 1, rep: 1 }, goto: 'd6_open_both' }
    ] }
  ],
  d6_open_lia: [
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '응! 맡겨 줘. 아이들한테는 자장가를 불러 줄게. 어릴 때 네가 무서워하던 천둥 소리, 이제 내가 대신 달래 줄 차례네.' },
    { show: 'miho', face: 'normal' },
    { say: 'miho', text: '…치, 소꿉친구 점수 깎아 먹기. 저는 창고에서 숫자나 세고 있을게요. 사장님이 하라면 하는 거예요.' },
    { goto: 'd6_pick' }
  ],
  d6_open_miho: [
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '맡겨 주세요! 하루치, 이틀치, 사흘치 — 전부 계산해서 한 사람도 굶기지 않게 나눠 볼게요. 이자는 안 받을게요. …이번만!' },
    { show: 'lia', face: 'normal' },
    { say: 'lia', text: '…미호, 그 말 진심이지? 그럼 나도 도울게. 큰 솥은 내가 저을 테니까 간은 네가 맞춰.' },
    { goto: 'd6_pick' }
  ],
  d6_open_both: [
    { show: 'lia', face: 'surprised' },
    { say: 'lia', text: '…둘이서? 미호랑? 알았어, 해 볼게. 대신 미호, 솥에서 동전 냄새 나는 건 금지야.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '어머, 동전은 냄새가 없어요. …있어도 오늘은 안 맡을게요. 이 팀워크, 값으로 치면 꽤 나가겠는데요?' },
    { narr: '투닥거리면서도 두 사람의 손발이 척척 맞았다. 식당 안의 웅성거림이 조금씩 가라앉았다.' },
    { goto: 'd6_pick' }
  ],

  // ================= 낮 =================
  // 아침 랜덤 사건 (story/random-events.js): 확률로 짧은 돌발 사건을 거친 뒤 낮으로 이어진다
  d6_pick: [{ rand: 'morning', then: 'd6_pick_day' }],
  d6_pick_day: [
    { time: '낮' }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '폭풍이 잠시 약해진 오후. 내일이 마지막 날이다. 오늘만큼은 누구와 함께할지 정해야 한다.' },
    { goto: 'pick' }
  ],

  // ================= 저녁: 무료 배식 vs 정상 영업 =================
  // 영업 데이터: story/tavern.js 의 day6(정상 영업) / day6free(무료 배식: 매출과 팁이 없는 대신 평판과 호감도가 오른다)
  d6_evening: [
    { bgm: 'tavern' },
    { rankcheck: true },
    { time: '저녁' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '저녁이 되자 식당은 피난 온 마을 사람들로 발 디딜 틈이 없었다. 난로 앞에는 아이들이, 창가에는 청년단원들이 모여 앉았다.' },
    { narr: '이 많은 사람들에게 어떻게 저녁을 내야 할까. 장부를 보면 남는 장사는 아니다.' },
    { choice: [
      { tag: '매출 없음 · 평판 +2 · 호감', text: '"오늘은 무료 배식입니다. 값은 받지 않을게요."', set: { rep: 2, 'aff.lia': 1, 'aff.miho': 1, 'flag.storm_free': true }, goto: 'd6_ev_free' },
      { tag: '정상 영업', text: '"정상 영업으로 내겠습니다. 대신 정성껏, 넉넉하게요."', goto: 'd6_ev_paid' }
    ] }
  ],
  d6_ev_free: [
    { show: 'lia', face: 'smile', pos: 'left' },
    { show: 'miho', face: 'shy', pos: 'right' },
    { say: 'lia', text: '…고마워. 그 말을 기다렸어. 오늘은 신께서 기뻐하실 거야.' },
    { say: 'miho', text: '그, 그러니까 오늘 수입은 전부 장부에서 지운다는 거죠? …사장님은 정말 바보 같아요. 그런데 이상하게 가슴이 뜨뜻해요.' },
    { narr: '촌장님이 눈시울을 붉히며 고개를 숙였다. "이 은혜는 잊지 않겠네." 식당에 따뜻한 수프 냄새가 퍼졌다.' },
    { tavern: 'day6free' },
    { goto: 'd6_dark' }
  ],
  d6_ev_paid: [
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'miho', text: '역시 사장님! 이럴 때일수록 장부는 제대로 써야죠. 사람들도 외상 말고 값을 치르는 편이 마음이 편한 법이에요!' },
    { show: 'lia', face: 'sad', pos: 'left' },
    { say: 'lia', text: '…그럴 수도 있지. 하지만 값을 못 내는 사람이 생기면, 그땐 네가 알아서 해 줘. 약속이야.' },
    { narr: '대피한 사람들은 대부분 주머니를 털어 값을 치렀다. 지금은 모두에게 따뜻한 한 끼가 필요하다.' },
    { tavern: 'day6' },
    { goto: 'd6_dark' }
  ],

  // ================= 정전: 호감도가 가장 높은 히로인과 짧은 장면 =================
  d6_dark: [
    { bgm: 'inn_night' },
    { bg: 'inn_night' }, { hide: 'all' },
    { narr: '마지막 손님이 잠든 직후, 번개가 식당 바로 위에 떨어졌다.' },
    { fx: 'flash' }, { fx: 'shake' },
    { narr: '순간 모든 불이 꺼졌다. 정전이다. 어둠 속에서 누군가 숨을 삼키고, 아이 하나가 훌쩍였다. 곧 리아가 초를 켰다. 작은 불꽃 하나에 네 사람의 얼굴이 모였다.' },
    { cg: 'storm_inn' },
    { narr: '바깥에서는 비바람이 창을 두드리고, 안에서는 촛불이 살랑였다. 누구 하나 말하지 않고 한참을 그렇게 앉아 있었다.' },
    { cg: 'hide' },
    { narr: '이윽고 다른 사람들이 하나둘 자리를 옮기고, 촛불 곁에는 한 사람이 남았다.' },
    { if: WIN('erion', 0), goto: 'd6_dark_erion' },
    { if: WIN('kaela', 0), goto: 'd6_dark_kaela' },
    { if: WIN('miho', 0), goto: 'd6_dark_miho' },
    { goto: 'd6_dark_lia' }
  ],
  d6_dark_erion: [
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…불빛이 흔들리네. 책이 조용해. 폭풍 때문에 마력이 눌려 있나 봐.' },
    { say: 'erion', face: 'shy', text: '…있잖아. 어둠은 싫지 않아. 어릴 때 스승님이 이런 밤에 이야기를 들려주셨거든. 이름이 기억나지 않아도, 목소리만은 남아 있어.' },
    { narr: '에리온이 책을 무릎에 올리고 촛불 쪽으로 몸을 기울였다. 푸른 빛과 촛불의 노란 빛이 겹쳐 손끝이 따뜻한 색으로 물들었다.' },
    { say: 'erion', face: 'smile', text: '…오늘은 네가 곁에 있어서 조금 덜 무섭네. 이건 비밀이야. 아니, 잊어도 돼. 어차피 책이 기억할 테니까.' },
    { set: { 'aff.erion': 1 } },
    { goto: 'd6_dark_end' }
  ],
  d6_dark_kaela: [
    { show: 'kaela', face: 'normal', pos: 'center' },
    { say: 'kaela', text: '으음, 불이 꺼져도 이 몸은 두렵지 않다! 아니, 사실 좀 어둡긴 하다. …문틀이 어디였지?' },
    { fx: 'shake' },
    { narr: '쿵, 하는 소리와 함께 카엘라가 이마를 문틀에 박았다. 리아가 촛불을 쳐들고 달려오려다가 말고, 우리 둘 사이에 놓인 초만 지켜보았다.' },
    { say: 'kaela', face: 'shy', text: '…본 건 아니겠지, 주인장? 아니, 봤어도 괜찮다. 어둠 속에서는 영웅도 이마가 아프다.' },
    { say: 'kaela', face: 'smile', text: '그래도 이 어둠 속에서 주인장이 곁에 있다고 생각하니 든든하다. 내일 결전, 앞은 이 몸이 맡을 테니까!' },
    { set: { 'aff.kaela': 1 } },
    { goto: 'd6_dark_end' }
  ],
  d6_dark_miho: [
    { show: 'miho', face: 'normal', pos: 'center' },
    { say: 'miho', text: '사장님, 정전이면 장부를 못 써요. 장부를 못 쓰면 계산을 못 해요. 계산을 못 하면…' },
    { say: 'miho', face: 'shy', text: '…무서워요. 사실은요. 이런 밤에 보육원 지붕이 샜던 게 기억나서요. 아이들이 담요 하나를 돌려쓰던 거요.' },
    { narr: '미호의 꼬리가 촛불 아래서 천천히 내 팔을 감았다. 꼬리 끝이 조금 떨렸다. 평소의 장난기는 어디에도 없다.' },
    { say: 'miho', face: 'smile', text: '…오늘 무료 배식 해 줘서 고마워요. 그 값은 이자 없이 평생 갚을게요. 아니, 이건 장부에 안 적을래요.' },
    { set: { 'aff.miho': 1 } },
    { goto: 'd6_dark_end' }
  ],
  d6_dark_lia: [
    { show: 'lia', face: 'normal', pos: 'center' },
    { say: 'lia', text: '어릴 때 이런 밤이면 네가 내 방 창문을 두드렸지. 천둥이 무서우니까 같이 있어 달라고.' },
    { say: 'lia', face: 'shy', text: '사실은 내가 더 무서웠는데, 네가 먼저 말해 준 게 다행이었어. …이제는 내가 먼저 말할 차례인가.' },
    { narr: '리아가 숄을 어깨에 두르고 촛불 곁에 바싹 앉았다. 어깨가 닿을 듯 말 듯한 거리에서 빗소리가 한동안 이어졌다.' },
    { say: 'lia', face: 'smile', text: '무서운 건 무서운 거야. 그래도 이렇게 곁에 있으면 괜찮아. …내일도, 그다음도.' },
    { set: { 'aff.lia': 1 } },
    { goto: 'd6_dark_end' }
  ],
  d6_dark_end: [
    { hide: 'all' },
    { narr: '얼마 뒤 불이 돌아왔다. 폭풍 소리는 여전했지만, 식당 안은 이상하게 고요하고 따뜻했다.' },
    { narr: '그리고 문득, 모두 약속이나 한 것처럼 한곳에 모이기 시작했다. 이제 해야 할 이야기가 있다. 내일 해 질 녘에 대한 이야기가.' },
    { goto: 'd6_ev_meeting' }
  ],

  // ================= 전야: 작전 회의 -> 선물 -> 밤 =================
  d6_ev_meeting: [
    { bgm: 'tension' },
    { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '피신해 온 마을 사람들이 곳곳에서 잠든 뒤, 식당에는 우리만 남았다. 창밖의 폭풍은 잦아들었지만, 그 틈으로 푸른 안개가 흘러들고 있다.' },
    { show: 'kaela', face: 'normal', pos: 'left' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { show: 'miho', face: 'normal', pos: 'right' },
    { say: 'erion', text: '…이제 말해야겠지. 내가 왜 이 마을에 왔는지.' },
    { say: 'erion', text: '동굴 안에는 삼백 년 전 스승님이 봉인한 \'어둠의 문지기\'가 있어. 봉인이 풀리면 문지기는 마을을 삼키고, 다음은 인간 영토 전체야.' },
    { say: 'erion', text: '이 책은 봉인의 열쇠. 다시 봉인하려면 봉인지기가 이름과 기억을 바쳐야 해. 내일 해 질 녘, 봉인은 완전히 풀려. 그 전에 내가 한다.' },
    { narr: '사절단장 이졸데도 같은 결론을 내렸다고 한다. 하지만 왕도의 기사단이 오려면 열흘은 걸린다는 말도 함께 전해졌다. 지금 이 마을을 지킬 사람은 우리뿐이다.' },
    { if: 'flag.erion_told', goto: 'd6_ev_told' },
    { goto: 'd6_ev_untold' }
  ],
  d6_ev_told: [
    { narr: '에리온이 잠깐 내 쪽을 흘끔 보았다. 이미 알고 있는 사람에게는 눈이 그렇게 말하고 있었다. \'…모두에게 말하게 해 줘서 고마워.\'' },
    { goto: 'd6_ev_react' }
  ],
  d6_ev_untold: [
    { narr: '식당 안이 쥐 죽은 듯 조용해졌다. 에리온의 이야기는 모두에게 처음이었다.' },
    { goto: 'd6_ev_react' }
  ],
  d6_ev_react: [
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
      { text: '"에리온 혼자 보낼 순 없어요. 모두 함께 갑니다. 방법은 같이 찾아요."', set: { 'aff.erion': 1, 'aff.kaela': 1, 'aff.miho': 1, 'aff.lia': 1, rep: 1, 'flag.plan_team': true }, goto: 'd6_ev_team' },
      { text: '"에리온의 계획을 믿겠어요. 대신 우리가 끝까지 곁에서 지킬게요."', set: { 'aff.erion': 2, 'flag.plan_trust': true }, goto: 'd6_ev_trust' },
      { text: '"…마을 사람들을 데리고 일단 도망치죠. 목숨이 우선이에요."', set: { 'aff.erion': -1, 'aff.kaela': -1, 'aff.miho': -1, 'aff.lia': -1, rep: -3, 'flag.plan_run': true }, goto: 'd6_ev_run' }
    ] }
  ],
  d6_ev_team: [
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
    { goto: 'd6_ev_gift' }
  ],
  d6_ev_trust: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…믿는다고? 나를?' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…그래. 그럼 나도, 한 번만 믿어 볼게. 모두를.' },
    { show: 'kaela', face: 'sad' },
    { say: 'kaela', text: '…어쩐지 납득이 안 간다. 하지만 주인장의 판단이라면 따르겠다.' },
    { goto: 'd6_ev_gift' }
  ],
  d6_ev_run: [
    { show: 'kaela', face: 'angry' },
    { say: 'kaela', text: '…도망? 주인장, 진심이냐?' },
    { hide: 'miho' },
    { show: 'lia', face: 'sad', pos: 'right' },
    { say: 'lia', text: '…그건 안 돼. 마을은 어떡하고…' },
    { narr: '차가운 침묵이 식당을 짓눌렀다. 다들 실망한 얼굴이다. 나 역시 입 밖으로 낸 말이 마음에 걸렸다.' },
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…좋아. 그럼 나 혼자 가겠어. 인간의 마을은 인간이 지키는 거라고 생각한 내가 바보였지.' },
    { narr: '하룻밤을 더 생각해 보기로 했다. 정말로 이게 옳은 걸까.' },
    { goto: 'd6_ev_gift' }
  ],

  // ----- 전야의 선물 -----
  d6_ev_gift: [
    { bgm: 'romance' },
    { hide: 'all' },
    { narr: '회의가 끝나고 각자 흩어졌다. 내일을 위한 마지막 준비 시간이다. 가진 돈으로 누군가에게 도움이 될 물건을 마련할 수 있다.' },
    // 이 선물도 "하루에 한 사람당 선물 1개" 한도를 씁니다 (gift.given.<id> = 6). 낮에 이미 선물한 사람은 선택지에서 빠집니다.
    { choice: [
      { who: 'erion', if: 'gift.given.erion!=6', put: { 'gift.given.erion': 6 }, text: '마력 회복 물약을 준비해 준다. "무리하지 마요."', cost: 15, set: { 'aff.erion': 2 }, goto: 'd6_gift_erion' },
      { who: 'kaela', if: 'gift.given.kaela!=6', put: { 'gift.given.kaela': 6 }, text: '갑옷을 새로 수리해 주고 가격표를 떼어 준다', cost: 15, set: { 'aff.kaela': 2 }, goto: 'd6_gift_kaela' },
      { who: 'miho', if: 'gift.given.miho!=6', put: { 'gift.given.miho': 6 }, text: '튼튼한 로프와 도구 세트를 사 준다', cost: 15, set: { 'aff.miho': 2 }, goto: 'd6_gift_miho' },
      { who: 'lia', if: 'gift.given.lia!=6', put: { 'gift.given.lia': 6 }, text: '신전에서 성수를 사 와서 건넨다', cost: 15, set: { 'aff.lia': 2 }, goto: 'd6_gift_lia' },
      { text: '모두에게 따뜻한 야식을 나눠 준다 (무료)', set: { rep: 1 }, goto: 'd6_gift_all' }
    ] }
  ],
  d6_gift_erion: [
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '…내가 부탁한 적도 없는데. 이런 건 비싸잖아.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…받을게. 하지만 쓰지 않아도 되도록 노력할게. 그게 네가 원하는 거잖아.' },
    { goto: 'd6_night' }
  ],
  d6_gift_kaela: [
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { say: 'kaela', text: '갑옷이… 반짝반짝하다! 아니, 가격표가 없다!' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…이제 진짜 내 갑옷 같다. 고맙다, 주인장. 이건 평생 소중히 입겠다.' },
    { goto: 'd6_night' }
  ],
  d6_gift_miho: [
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '이거 최신형 갈고리 로프잖아요! 가격이 얼마… 아니, 아니에요! 받을게요!' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '이거 쓰고 살아서 돌아오면 이자 포함해서 갚을게요. 아, 이자는 제가 정하는 거죠?' },
    { goto: 'd6_night' }
  ],
  d6_gift_lia: [
    { show: 'lia', face: 'surprised', pos: 'center' },
    { say: 'lia', text: '이거 성수 아니야? 신전에서도 구하기 힘든 건데…' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '고마워. 이거, 네가 위험할 때 대신 쓸게. 약속이야.' },
    { goto: 'd6_night' }
  ],
  d6_gift_all: [
    { show: 'kaela', face: 'smile', pos: 'left' },
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'kaela', text: '야식이다! 전투 전에는 든든히 먹어야지!' },
    { say: 'miho', text: '사장님, 오늘만은 공짜죠? 그렇게 알고 먹을게요!' },
    { narr: '다 같이 둘러앉아 먹는 야식은 소박했지만 따뜻했다. 모두의 얼굴이 조금 풀렸다.' },
    { goto: 'd6_night' }
  ],

  // ================= 밤 (전야) =================
  d6_night: [
    { bgm: 'inn_night' },
    { time: '밤' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '마지막 밤이다. 모두가 각자 방으로 돌아가고 여관이 조용해졌다. 내일 일을 생각하며 천장을 보고 있는데, 방문이 조용히 열렸다.' },
    { if: WIN('erion', HEART(3)), goto: 'd6_night_erion' },
    { if: WIN('kaela', HEART(3)), goto: 'd6_night_kaela' },
    { if: WIN('miho', HEART(3)), goto: 'd6_night_miho' },
    { if: WIN('lia', HEART(3)), goto: 'd6_night_lia' },
    { goto: 'd6_night_none' }
  ],
  d6_night_none: [
    { narr: '…아무도 오지 않았다. 바람이 문을 흔든 것 같다. 복도 끝에서 에리온이 책 읽는 소리, 카엘라의 코 고는 소리, 미호가 동전을 세는 소리, 리아의 기도 소리가 조금씩 들린다.' },
    { narr: '이 여관에 사람이 가득 찬 게 얼마 만일까. 내일, 반드시 모두 무사히 돌아오게 하겠다고 다짐하며 눈을 감았다.' },
    { goto: 'd6_upgrade' }
  ],
  d6_night_erion: [
    { bgm: 'romance' },
    { bg: 'roof_night' },
    { show: 'erion', face: 'shy', pos: 'center' },
    { say: 'erion', text: '…자? 안 잤지. 지붕 위로 와 줄래. 잠깐이면 돼.' },
    { narr: '달빛 아래 에리온의 은빛 머리카락이 부드럽게 빛났다. 그녀는 책을 품에 안고 한참을 말없이 앉아 있다가 입을 열었다.' },
    { say: 'erion', face: 'normal', text: '…만약 내일, 내가 네 이름을 잊어버린다면. 그래도 나를 다시 불러 줄 수 있어? 몇 번이고. 내가 기억할 때까지.' },
    { say: 'erion', face: 'shy', text: '…이상하지. 이름을 잃는 게 무섭다고 생각한 건 처음이야. 지금까지는 그저 의무라고만 생각했는데.' },
    { set: { 'aff.erion': 1 } },
    { narr: '그녀의 어깨가 내 어깨에 조용히 기댔다. 떨고 있는 게 느껴졌다. 나는 말없이 곁을 지켰다.' },
    { goto: 'd6_upgrade' }
  ],
  d6_night_kaela: [
    { bgm: 'romance' },
    { show: 'kaela', face: 'shy', pos: 'center' },
    { say: 'kaela', text: '주, 주인장. 자고 있었나? 아니, 이 시간에 불쑥 오다니 영웅의 체면이 말이 아니군.' },
    { narr: '카엘라는 갑옷을 입지 않은 평상복 차림이었다. 처음 보는 모습이다. 붉은 머리를 풀어 내린 채 문 앞에 서 있다.' },
    { say: 'kaela', face: 'normal', text: '내일이 두렵다. 하지만, 그것보다 더 두려운 건 내일 이후에 주인장을 못 보게 되는 것이다. …이게 무슨 감정인지는 잘 모르겠지만.' },
    { say: 'kaela', face: 'smile', text: '그러니까 맹세하겠다. 내 검은, 주인장과 이 여관을 지키는 데 쓰겠다고. 정식 기사가 아니어도 상관없다. 나만의 기사도다!' },
    { set: { 'aff.kaela': 1 } },
    { narr: '카엘라는 대검 대신 손바닥을 내 앞에 내밀었다. 악수하자는 뜻이다. 그 손은 아주 따뜻했다.' },
    { goto: 'd6_upgrade' }
  ],
  d6_night_miho: [
    { bgm: 'romance' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { say: 'miho', text: '사장님. 안 자는 거 알아요. 귀가 좋거든요. 한숨 소리가 다 들려요.' },
    { narr: '미호가 침대 모서리에 걸터앉았다. 평소의 장난기가 없다. 꼬리가 천천히 내 다리 위로 올라온다.' },
    { say: 'miho', face: 'shy', text: '저, 내일 무서워요. 도망치는 건 전문인데, 이번엔 도망치고 싶지 않아요. 이유는 사장님이 알잖아요.' },
    { say: 'miho', face: 'smile', text: '…돌아오면, 이자 대신 부탁 하나만 들어줘요. 아직 말 안 할래요. 비밀이니까.' },
    { set: { 'aff.miho': 1 } },
    { narr: '미호가 내 귓가에 작게 속삭이고는 도망치듯 방을 나갔다. 방에는 여우 귀 같은 따뜻한 온기만 남았다.' },
    { goto: 'd6_upgrade' }
  ],
  d6_night_lia: [
    { bgm: 'romance' },
    { show: 'lia', face: 'shy', pos: 'center' },
    { say: 'lia', text: '…자? 안 자지? 나도 못 자겠어서.' },
    { narr: '리아가 숄을 두른 채 조심스럽게 들어왔다. 침대 곁 의자에 앉아 무릎을 끌어안는다. 어릴 때 천둥 치는 밤에 그랬던 것처럼.' },
    { say: 'lia', face: 'normal', text: '있잖아. 아까 낮에 말한 거, 약속 지켜 줄 거지? …난 내일이 어떻게 되든 이 여관이 좋아. 그리고, 이 여관에 있는 네가 제일 좋아.' },
    { say: 'lia', face: 'shy', text: '…아, 이상한 뜻 아니야! 아니, 이상한 뜻이긴 한데! 내일 이후에, 제대로 말해도 될까?' },
    { set: { 'aff.lia': 1 } },
    { narr: '리아가 내 손을 살며시 잡았다가 놓았다. 그 손끝이 조금 떨렸다.' },
    { goto: 'd6_upgrade' }
  ]
});
