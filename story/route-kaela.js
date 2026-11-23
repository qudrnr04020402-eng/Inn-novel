// ============================================================
//  카엘라 루트 — 21일 '고백의 밤'에 고백을 받아 준 뒤의 이야기
//  - route_kaela_confess : 고백 장면 (루트 확정)
//  - route_kaela_1~3     : 4주차 루트 전용 이벤트 (22일 / 24일 / 26일). ROUTE_EVENTS.kaela 에 등록
//  - route_kaela_epi     : 결전 다음 날 새벽 에필로그 -> end_kaela
//  - 말투: "~다!" "이 몸" "주인장!" 허세 + 허당. 진지해지면 문장이 짧아짐.
//    고백을 먼저 받은 카엘라는 말문이 막혀 "정식 대답은 결전 뒤에"로 미루고, 그 정식 대답이 end_kaela 의 맹세와 고백이 된다.
// ============================================================
window.ROUTE_EVENTS = window.ROUTE_EVENTS || {};
ROUTE_EVENTS.kaela = [
  { id: 'route_kaela_1', scene: 'route_kaela_1', minDay: 22, text: '마당을 순찰하듯 빙빙 돌면서 자꾸 이쪽을 곁눈질한다. 오른손과 오른발이 같이 나가고 있다.' },
  { id: 'route_kaela_2', scene: 'route_kaela_2', minDay: 24, text: '청년단 앞에서 대검을 세워 든 채 서 있다. 오늘따라 호령이 평소보다 낮다.' },
  { id: 'route_kaela_3', scene: 'route_kaela_3', minDay: 26, text: '갑옷 가게 앞에서 주머니를 거꾸로 털고 있다. 팁이 전부 이 주머니에 들어 있었던 모양이다.' }
];

Object.assign(STORY.scenes, {

  // ================= 고백: 별을 보는 밤 =================
  route_kaela_confess: [
    { bg: 'inn_night' }, { hide: 'all' },
    { narr: '마을이 별 보는 밤으로 들썩이는 동안, 여관 앞마당은 조용했다. 카엘라가 대검을 어깨에 걸치고 같은 자리를 세 바퀴째 돌고 있었다. 순찰이라는 이름의 서성임이다.' },
    { show: 'kaela', face: 'normal', pos: 'center' },
    { say: 'kaela', text: '주인장! 이상 없다! 마당은 안전하다! …세 번 확인했다!' },
    { narr: '그녀가 돌아서려다 발이 빨랫줄 받침대에 걸렸다. 휘청하는 팔을 붙잡아 주었다. 카엘라의 눈이 크게 뜨였다. 손을 놓지 않은 채로, 숨을 한 번 들이쉬었다.' },
    { say: 'kaela', face: 'surprised', text: '…주, 주인장? 왜 그렇게 진지한 얼굴이냐. 적이 나타났나? 이 몸이 앞에 서겠다!' },
    { choice: [
      { text: '"카엘라, 좋아해요. 기사든 아니든, 넘어질 때마다 웃는 카엘라가요."', set: { 'aff.kaela': 3 }, goto: 'route_kaela_confess_a' },
      { text: '"앞에 서는 건 카엘라가 해요. 뒤를 지키는 건 제가 하고요. 평생."', set: { 'aff.kaela': 2 }, goto: 'route_kaela_confess_b' },
      { text: '"이 마당에서 같이 빨래 널고 싶은 사람은 카엘라 한 명뿐이에요."', set: { 'aff.kaela': 2 }, goto: 'route_kaela_confess_c' }
    ] }
  ],
  route_kaela_confess_a: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…웃는다고? 이 몸이 넘어질 때 웃는다고? 그건 비웃음이 아니라 이 몸의 전술이다! …아니, 아니군.' },
    { narr: '말이 길게 이어지다가 끊겼다. 카엘라의 얼굴이 뺨부터 귀 끝까지 한꺼번에 붉어졌다. 대검이 어깨에서 미끄러졌고, 이번에는 내가 받아 주었다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…좋아한다고, 말했나. 이 몸에게. 틀림없이?' },
    { goto: 'route_kaela_confess_end' }
  ],
  route_kaela_confess_b: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…뒤를. 주인장이.' },
    { narr: '카엘라는 대검을 땅에 꽂고 두 손으로 자루를 잡았다. 그래야 서 있을 수 있다는 듯이. 목소리가 평소보다 한 톤 낮아졌다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…시험관들이 말했다. 앞에만 서는 사람은 기사가 아니라고. 뒤를 맡아 주겠다는 사람이 생길 줄은, 정말, 몰랐다.' },
    { goto: 'route_kaela_confess_end' }
  ],
  route_kaela_confess_c: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '빨래! …빨래는 난이도가 높다! 시트가 기습을 하니까! 하지만 같이 하면…' },
    { narr: '카엘라가 입을 벌린 채 굳었다. 머릿속에서 팀워크 특훈이 한 장면씩 지나가는 얼굴이었다. 시트에 감겨 굴렀던 마당, 같이 숫자를 세던 오후.' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…같이 하면 되는군. 시트도, 청년단도, 그것도. 이 몸은 이제야 알아들었다.' },
    { goto: 'route_kaela_confess_end' }
  ],
  route_kaela_confess_end: [
    { narr: '카엘라는 한참 입을 열었다 닫았다 하다가, 갑자기 차렷 자세를 하고 거수경례를 붙였다. 손이 이마가 아니라 투구 위에 정확히 착지했다. 투구를 쓰고 있지도 않은데.' },
    { say: 'kaela', face: 'shy', text: '…대, 대답을 하겠다! 하겠다만! 이 몸은 지금 머리가 하얗다! 하얘서 아무 말도 나오지 않는다!' },
    { say: 'kaela', face: 'normal', text: '…그러니 정식 답변은 결전을 끝낸 뒤에 하겠다. 이런 말은 갑옷 입고 검 앞에 서서 해야 한다. 기사답게. 제대로.' },
    { say: 'kaela', text: '다만 이것만 먼저 말해 두겠다. …싫지 않다. 아니, 그 반대다. 반대의 반대의 반대… 아무튼 기쁘다!' },
    { narr: '말이 엉켜 풀리지 않는 것이 어쩐지 가장 확실한 대답처럼 들렸다. 손을 내밀자 카엘라는 두 손으로 덥석 잡았다가, 너무 세게 쥔 것을 깨닫고 허둥지둥 힘을 풀었다.' },
    { say: 'kaela', face: 'smile', text: '…따뜻하군. 이 몸의 손바닥은 땀이 나는데. 미안하다. …놓지는 않겠다!' },
    { set: { 'flag.route': true, 'flag.route_kaela': true } },
    { hide: 'all' },
    { if: 'flag.cf_night', goto: 'cf_after' },
    { goto: 'after_pick' }
  ],

  // ================= 루트 1 (22일): 연인의 첫 순찰 =================
  route_kaela_1: [
    { set: { 'ev.r_kaela': 1 } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '카엘라가 마당을 순찰하고 있었다. 평소와 다른 점은 순찰 코스가 이상하게 내 근처만 맴돈다는 것. 그리고 걸음이 이상하다. 오른손과 오른발이 같이 나간다.' },
    { show: 'kaela', face: 'normal', pos: 'center' },
    { say: 'kaela', text: '주인장! 아니, 그, 이제 뭐라고 불러야 하지. 이름을 부르는 것이 맞나? 전례가 없다! 시험 과목에도 없었다!' },
    { narr: '카엘라는 팔짱을 끼고 진지하게 고민하더니 가죽 수첩을 꺼냈다. 첫 장에 "연인으로서의 마음가짐"이라고 쓰여 있었는데, 그 아래는 전부 빈칸이었다.' },
    { say: 'kaela', face: 'sad', text: '…어젯밤에 계획을 세우려고 했다. 그런데 한 줄도 못 썼다. 검 쓰는 법은 천 가지를 아는데, 이건 한 가지도 모르겠군.' },
    { say: 'kaela', face: 'shy', text: '…그래서 일단 훈련부터 하려고 한다. 손을 잡는 훈련. 실전은 위험하니까, 먼저 모의 훈련!' },
    { narr: '카엘라가 오른손을 쭉 내밀었다. 손바닥을 위로 펴고, 마치 검을 받는 자세로. 얌전히 손을 올리자 그녀의 어깨가 움찔했다.' },
    { say: 'kaela', face: 'surprised', text: '…잡았다! 아니, 잡혔다! 어느 쪽이 맞지!? 공방 중이냐!?' },
    { narr: '그때 담장 너머에서 핀이 빼꼼 고개를 내밀었다. "대장님, 훈련 시간인데… 어, 방해했나요?" 카엘라가 손을 놓고 벼락같이 돌아섰다.' },
    { say: 'kaela', face: 'angry', text: '핀! 지, 지금은 지휘 회의 중이다! 열 바퀴! …아니, 한 바퀴! 아니, 간식 먹고 가라!' },
    { narr: '핀이 영문도 모른 채 간식을 받아 갔다. 카엘라는 다시 천천히 돌아서서, 귀까지 빨개진 채로 방금 놓은 손을 슬쩍 쳐다보았다.' },
    { choice: [
      { text: '"한 번 더 훈련해요. 이번엔 걸으면서요."', set: { 'aff.kaela': 3, 'flag.kaela_walk': true }, goto: 'route_kaela_1_walk' },
      { text: '"제가 먼저 말할게요. 이름 불러 줘요. 편하게."', set: { 'aff.kaela': 2 }, goto: 'route_kaela_1_name' },
      { text: '"수첩의 첫 줄은 제가 써 줄게요."', set: { 'aff.kaela': 2 }, goto: 'route_kaela_1_note' }
    ] }
  ],
  route_kaela_1_walk: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '걸으면서!? 그건 상급 과정이다! …하겠다. 도전한다!' },
    { narr: '손을 잡은 채 마당을 한 바퀴 걸었다. 카엘라는 보폭을 의식하느라 로봇처럼 걷다가, 두 바퀴째에 문득 자연스럽게 발이 맞았다. 그녀가 걸음을 멈췄다.' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…이거다. 팀워크 시험에서 요구한 건. 같은 속도로 걷는 것. …이 몸은 이제야 통과한 것 같다.' },
    { goto: 'after_pick' }
  ],
  route_kaela_1_name: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '이름을… 부르라고…' },
    { narr: '카엘라는 입을 열었다가 닫았다가 열었다. 세 번째에 겨우 소리가 나왔다. 그것은 호령이 아닌 아주 작고 조심스러운 목소리였다. 내 이름이 그렇게 불린 건 처음이었다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…됐나. 지금 이 몸의 심장이 전투 중이다. 다음에는 더 크게 부르겠다. 천천히 연습하겠다!' },
    { goto: 'after_pick' }
  ],
  route_kaela_1_note: [
    { narr: '수첩을 받아 첫 줄에 이렇게 적었다. "넘어져도 괜찮음. 일어나면 됨. 옆에 있음." 카엘라는 한참 그 줄을 읽더니 무릎을 꿇고 수첩을 가슴에 안았다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…이건 삼가 받겠다. 갑옷 안쪽 주머니에 넣고 다니겠다. 불합격 통지서 옆에. …이제 그 옆자리가 외롭지 않겠군.' },
    { goto: 'after_pick' }
  ],

  // ================= 루트 2 (24일): 불길한 징조, 함께 서는 훈련 =================
  route_kaela_2: [
    { set: { 'ev.r_kaela': 1 } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '불길한 징조가 마을을 훑고 지나간 날. 우물물이 푸르게 번쩍였고 개들이 뒷산을 향해 짖었다. 마당에는 청년단원 여섯 명이 모여 있었는데, 평소와 달리 아무도 장난을 치지 않았다.' },
    { show: 'kaela', face: 'normal', pos: 'center' },
    { say: 'kaela', text: '…다들 들었다. 폭풍이 오고, 그다음에는 봉인이 깨질 거다. 이 몸은 거짓말을 못 하니 사실대로 말하겠다. 무서운 일이 올 것이다.' },
    { narr: '핀의 얼굴이 하얗게 질렸다. 카엘라는 그것을 보고 잠시 말을 멈췄다. 대검 자루를 쥔 손에 힘이 들어갔다가 빠졌다.' },
    { say: 'kaela', text: '그러니 오늘 가르칠 것은 하나뿐이다. 앞에 서는 법이 아니다. 같이 서는 법이다. …주인장, 시범을 도와주겠나?' },
    { narr: '카엘라가 내 옆에 서서 대검을 비스듬히 세웠다. 어깨가 맞닿을 만큼 가까운 거리에서, 그녀는 단원들을 향해 방패 대형을 설명했다. 어쩐지 목소리가 전보다 작고 단단했다.' },
    { say: 'kaela', face: 'normal', text: '내가 한 걸음 나가면 너는 반 걸음. 내가 멈추면 너도 멈춘다. 서로 눈을 보지 않아도 알 수 있을 때까지 한다.' },
    { narr: '둘이 나란히 앞으로, 뒤로, 옆으로 움직였다. 처음에는 서로 발을 밟았지만, 열 번째 반복에서 숨소리가 같아졌다. 단원들이 입을 벌린 채 구경하고 있다.' },
    { say: 'kaela', face: 'smile', text: '…봤나! 이게 팀워크다! 이 몸 혼자서는 못 보여 줬을 거다!' },
    { narr: '훈련이 끝나고 단원들이 돌아간 뒤, 카엘라는 마당 계단에 털썩 앉았다. 큰 소리로 웃던 얼굴이 천천히 가라앉았다.' },
    { say: 'kaela', face: 'sad', text: '…솔직히 말하겠다. 어제 꿈을 꿨다. 동굴 속에서 내가 혼자 앞으로 뛰어나갔는데, 아무도 따라오지 않았다. 돌아보니 주인장이 없었다.' },
    { say: 'kaela', text: '…이 몸은 앞에 서는 걸 겁내 본 적이 없다. 그런데 뒤에 아무도 없는 건 이렇게 무서운 거였군.' },
    { choice: [
      { text: '"그 꿈은 틀렸어요. 제가 바로 뒤에, 아니 바로 옆에 있어요."', set: { 'aff.kaela': 3, 'flag.kaela_beside': true }, goto: 'route_kaela_2_beside' },
      { text: '"그럼 신호를 정해요. 돌아봤을 때 제가 손을 흔들게요."', set: { 'aff.kaela': 3, 'flag.kaela_beside': true }, goto: 'route_kaela_2_signal' },
      { text: '"무서운 건 저도 같아요. 같이 무서워하면 덜 무서워요."', set: { 'aff.kaela': 2 }, goto: 'route_kaela_2_fear' }
    ] }
  ],
  route_kaela_2_beside: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…옆. 그렇군. 꿈속의 이 몸은 앞만 보고 있었다. 옆을 봤어야 했나.' },
    { narr: '카엘라가 옆을 돌아보았다. 정말로 가까운 곳에서 눈이 마주쳤다. 그녀는 눈을 피하지 않았다. 천천히 어깨의 힘이 풀렸다.' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…있군. 진짜로. 꿈과 다르군. 이 몸의 오늘 최고의 전과다!' },
    { goto: 'route_kaela_2_end' }
  ],
  route_kaela_2_signal: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '신호! 그거 좋다! 군대식 신호는 필수다! …어떤 신호로 할까. 휘파람은 어떻지?' },
    { narr: '카엘라가 휘파람을 불려고 입술을 모았지만 바람 소리만 났다. 열 번쯤 시도했을 때 마침내 짧은 소리가 났다. 둘이 동시에 웃음을 터뜨렸다.' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…이 소리가 들리면 돌아보겠다. 내가 돌아봤는데 주인장이 손을 흔들면, 이 몸은 몇 배로 강해진다. 확실하다!' },
    { goto: 'route_kaela_2_end' }
  ],
  route_kaela_2_fear: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…주인장도, 무섭나? 이 몸 앞에서 약한 소리를 한 사람은 처음이다. 다들 이 몸에게 용감한 척을 해 달라고만 했으니까.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…이게 이상하게 더 힘이 나는군. 같이 무서워하면 덜 무섭다. 그 말, 기억하겠다. 아주 오래.' },
    { goto: 'route_kaela_2_end' }
  ],
  route_kaela_2_end: [
    { narr: '해 질 녘이 되자 카엘라는 먼저 일어나 손을 내밀었다. 이번에는 망설임 없이. 일으켜 세우는 손이 크고 단단했다. 서로 맞잡은 채, 그녀가 마당 너머 뒷산을 한 번 올려다보았다.' },
    { show: 'kaela', face: 'normal' },
    { say: 'kaela', text: '…내일은 장비를 점검하겠다. 칼집도 좀 낡았다. …주인장, 같이 가 주지 않겠나? 필요한 물건을 살 때, 곁에 누가 있어 줬으면 한다.' },
    { goto: 'after_pick' }
  ],

  // ================= 루트 3 (26일): 새 칼집과 가격표 =================
  route_kaela_3: [
    { set: { 'ev.r_kaela': 1 } }, { bg: 'square_day' }, { hide: 'all' },
    { narr: '이틀 뒤면 폭풍이 온다. 마을 광장은 덧문과 판자를 나르는 사람들로 북적였다. 그 한복판 갑옷 가게 앞에서 카엘라가 주머니를 거꾸로 털고 있었다. 동전 몇 닢이 또르르 굴러떨어졌다.' },
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { say: 'kaela', text: '주인장! 마침 왔군! 비상이다! 칼집을 새로 맞췄는데 값이 이 몸의 한 달 팁보다 비싸다!' },
    { narr: '가게 주인이 진열대 위에 칼집을 올려놓았다. 대검에 꼭 맞는 짙은 가죽 칼집이었다. 끝에 작은 은빛 장식이 달려 있다. 칼집 옆구리에 가격표가 매달려 있다. 열세 은화.' },
    { say: 'kaela', face: 'normal', text: '…낡은 칼집으로 동굴에 들어가면 중요한 순간에 검이 걸릴 수 있다. 그건 이 몸의 기사도가 용납하지 않는다.' },
    { say: 'kaela', face: 'shy', text: '…그리고 이 칼집은 오래 쓰고 싶다. 결전 뒤에도. 그러니 제값을 치르고 싶다. 외상이 아니라… 할부로!' },
    { narr: '가게 주인이 이마를 짚었다. "그건 외상의 다른 이름이잖소." 카엘라가 즉시 반박했다. "달라! 할부에는 계획이 있다!" 둘의 논쟁이 일 분쯤 이어졌다.' },
    { if: 'flag.kaela_paid', goto: 'route_kaela_3_paid' },
    { goto: 'route_kaela_3_ask' }
  ],
  // 7번 이벤트에서 부족한 돈을 대 준 경우의 덤
  route_kaela_3_paid: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…참고로 이 몸은 지난번에 빌린 금화 두 닢도 아직 기억하고 있다! 장부에 적지 말라고 했지만, 이 몸의 장부에는 있다! 그것도 포함해서, 이번에는 이자까지 쳐서 갚겠다!' },
    { goto: 'route_kaela_3_ask' }
  ],
  route_kaela_3_ask: [
    { narr: '주머니의 동전을 세어 보니 칼집값의 절반이 조금 안 됐다. 카엘라가 입술을 깨물고 나를 돌아보았다. 도움을 청하는 눈이었지만 입은 끝까지 도움이라는 말을 꺼내지 않았다.' },
    { choice: [
      { text: '남은 값의 절반을 내 몫으로 낸다. "공동 소유로 해요."', cost: 6, set: { 'aff.kaela': 3, 'flag.kaela_scabbard': true }, goto: 'route_kaela_3_half' },
      { text: '"할부 보증인이 되어 줄게요. 매달 한 번 같이 와서 갚아요."', set: { 'aff.kaela': 3, 'flag.kaela_scabbard': true }, goto: 'route_kaela_3_guarantor' },
      { text: '"일단 손님 몇 명 불러올게요. 칼집 공연으로요."', set: { 'aff.kaela': 2, rep: 1 }, goto: 'route_kaela_3_show' }
    ] }
  ],
  route_kaela_3_half: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '공동 소유…? 칼집을 둘이서? 검집에는 칼이 하나인데 어떻게…' },
    { narr: '카엘라가 중얼거리다가 말을 멈췄다. 서서히 뜻이 이해되는 얼굴이었다. 뺨이 붉어지고, 입꼬리가 올라가고, 마침내 가게가 떠나가라 큰 소리로 웃었다.' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '하하하! 좋다! 공동 소유다! 칼은 이 몸이 쓰고, 칼집은 둘이서 갚는다! 이보다 든든한 계약은 없다!' },
    { goto: 'route_kaela_3_end' }
  ],
  route_kaela_3_guarantor: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…보증인. 보증인이란, 이 몸이 도망가면 대신 갚는 사람이라는 건데.' },
    { show: 'kaela', face: 'normal' },
    { say: 'kaela', text: '…도망 안 간다. 이 몸의 사전에 도망은 없다. 그러니 이 보증은 영원히 쓰일 일이 없을 거다. …그런데도 서 준다니. …고맙다.' },
    { narr: '증서에 도장을 찍는 카엘라의 손이 약간 떨렸다. 이름 옆에 내 이름이 나란히 적히는 것을 한참 내려다보았다.' },
    { goto: 'route_kaela_3_end' }
  ],
  route_kaela_3_show: [
    { narr: '광장에서 "칼집 값 모금 공연"이 벌어졌다. 카엘라가 대검을 뽑았다가 꽂는 시범을 보였는데, 세 번째에 칼끝이 걸려서 지나가던 행상의 모자를 날려 버렸다. 구경꾼들이 박수를 쳤다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…실수가 아니라 연출이다. 모자를 날리는 건 클라이맥스다. …돈이 모였군. 이게 되는군. 이 몸은 여태 광대로 서는 걸 부끄러워했는데.' },
    { narr: '모인 동전으로 남은 값을 거의 채웠다. 마지막 한 닢은 구경하던 가게 주인이 직접 보태 주었다. "공연 값이오."' },
    { goto: 'route_kaela_3_end' }
  ],
  route_kaela_3_end: [
    { narr: '새 칼집은 대검에 정확히 맞았다. 찰칵, 소리가 광장에 울렸다. 카엘라는 그 소리가 마음에 들었는지 세 번 꽂았다 뺐다.' },
    { show: 'kaela', face: 'normal' },
    { say: 'kaela', text: '…주인장. 이거, 떼겠다. 칼집의 가격표.' },
    { narr: '카엘라가 가격표의 끈을 단검으로 끊었다. 딱, 소리가 났다. 이번에는 그녀의 손이 떨리지 않았다. 열세 은화짜리 종이가 손바닥 위에 가볍게 놓였다.' },
    { say: 'kaela', face: 'smile', text: '이 몸은 이제 빚을 나눠 지는 법을 알았다. 그리고 가격표를 떼는 날은… 무서운 날이 아니라 이런 날이어야 하는 거군.' },
    { say: 'kaela', face: 'shy', text: '…이건 주인장이 가지고 있어라. 버려도 좋고, 간직해도 좋다. 결전이 끝나면, 이 몸이 제대로 말하겠다. 기사답게. 약속한다!' },
    { narr: '가격표는 주머니 속에서 조그맣게 바스락거렸다. 햇살이 새 칼집의 은빛 장식 위에서 반짝였다.' },
    { goto: 'after_pick' }
  ],

  // ================= 에필로그: 결전 다음 날 새벽 =================
  route_kaela_epi: [
    { bgm: 'ending_good' },
    { bg: 'inn_dawn' }, { hide: 'all' },
    { narr: '결전 다음 날, 새벽. 동굴에서 돌아온 몸이 천근같아 눈을 붙인 것은 두어 시간. 마당에서 쿵, 쿵, 쿵, 하고 일정한 소리가 났다. 창문을 열자 어슴푸레한 마당 한가운데 갑옷 입은 그림자가 서 있었다.' },
    { show: 'kaela', face: 'normal', pos: 'center' },
    { say: 'kaela', text: '…일곱! …아니, 여덟! "나, 붉은 사자 카엘라는" … 음, 이게 아니군. 처음부터 다시.' },
    { narr: '카엘라는 허공을 향해 맹세문을 연습하고 있었다. 한 줄 읽을 때마다 무릎을 꿇었다 일어서기를 반복하는 중이다. 갑옷 소리가 새벽의 정적을 계속 깨뜨렸다.' },
    { say: 'kaela', face: 'surprised', text: '주, 주인장!? 벌써 일어났나! 아직 해가 안 떴다! 이, 이건 준비 중이다! 보면 안 된다!' },
    { narr: '카엘라가 대검 뒤로 몸을 숨기려다 대검이 너무 가늘어서 숨지 못했다. 갑옷 틈새로 잠을 못 잔 눈이 반짝였다. 눈 밑이 거뭇했지만 입꼬리는 올라가 있었다.' },
    { say: 'kaela', face: 'normal', text: '…살아남았군. 우리 모두. 동굴 속에서는 뒤를 돌아볼 틈도 없었는데, 돌아보니 항상 거기 있더군. 휘파람 신호도 필요 없었다.' },
    { if: 'ev.r_kaela>=3', goto: 'route_kaela_epi_3' },
    { if: 'ev.r_kaela>=1', goto: 'route_kaela_epi_1' },
    { goto: 'route_kaela_epi_end' }
  ],
  route_kaela_epi_3: [
    { say: 'kaela', face: 'smile', text: '새 칼집도 제 몫을 했다! 한 번도 걸리지 않았다! …이 몸의 할부는 아직 열두 회차가 남았다. 평생 걸려서라도 갚을 생각이다. 보증인도 있으니까!' },
    { goto: 'route_kaela_epi_end' }
  ],
  route_kaela_epi_1: [
    { say: 'kaela', face: 'smile', text: '수첩에는 아직 첫 줄뿐이다. 그래도 그 줄이 있어서 어제 동굴에서도 무서울 때마다 떠올렸다. …옆에 있음. 그 석 자를.' },
    { goto: 'route_kaela_epi_end' }
  ],
  route_kaela_epi_end: [
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…약속했지. 정식 대답은 결전 뒤에 하겠다고. 그날 밤 이 몸은 머리가 하얘서 제대로 말을 못 했다.' },
    { say: 'kaela', text: '그러니 해가 뜨면 하겠다. 한쪽 무릎을 꿇고, 칼을 바치고, 전부 격식대로. 지금은 마지막 점검 중이다. …맹세문 제3조가 자꾸 틀린다.' },
    { narr: '카엘라가 내 등을 양손으로 밀어 문 안쪽으로 돌려보냈다. 투구 속 얼굴이 새벽빛에 붉게 보였다. 아니, 해가 뜨기엔 아직 이르다. 그건 그녀의 얼굴 색이었다.' },
    { say: 'kaela', face: 'smile', text: '들어가 있어라! 한 시간 뒤 마당으로 나와라! 반짝이는 갑옷을 입은 이 몸을 보게 될 거다! …넘어지지 않는다는 보장은 못 하지만!' },
    { narr: '문이 닫혔다. 문 너머에서 다시 쿵, 쿵, 하고 무릎 꿇는 소리와 "나, 붉은 사자 카엘라는…" 하는 목소리가 시작되었다. 그 소리를 들으며 천천히 웃음이 났다. 새벽이 정말 아름다웠다.' },
    { goto: 'end_kaela' }
  ]
});
