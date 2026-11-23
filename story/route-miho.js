// ============================================================
//  미호 루트 (21일 고백의 밤에 미호에게 고백 -> 4주차 루트 이벤트 3개 -> 결전 다음 날 새벽 에필로그 -> end_miho)
//  - 장면 id 약속: route_miho_confess(고백) / route_miho_1~3(22·24·26일) / route_miho_epi(에필로그)
//  - 루트 이벤트 장면은 {set:{'ev.r_miho':1}} 로 시작하고 {goto:'after_pick'} 로 끝납니다. (순서대로 하나씩 열림: js/cal-core.js)
//  - 말투: 존댓말 · "사장님" · 돈 이야기로 부끄러움을 감춥니다. 연인이 된 뒤에도 수수료·이자 얘기가 사랑 표현이 됩니다.
//  - 사용 배경은 story/backgrounds.js 에 있는 것만. 표정은 normal/smile/shy/angry/surprised/sad.
// ============================================================
window.ROUTE_EVENTS = window.ROUTE_EVENTS || {};
ROUTE_EVENTS.miho = [
  { id: 'route_miho_1', scene: 'route_miho_1', minDay: 22, tag: '미호 루트', text: '카운터 뒤에서 새 장부를 펴 놓고 귀 끝이 빨개진 채 펜을 굴리고 있다.' },
  { id: 'route_miho_2', scene: 'route_miho_2', minDay: 24, tag: '미호 루트', text: '여관 지붕 위에서 혼자 꼬리를 끌어안고 하늘을 올려다보고 있다.' },
  { id: 'route_miho_3', scene: 'route_miho_3', minDay: 26, tag: '미호 루트', text: '우물가에서 두루마리 한 장을 펴 놓고 지웠다 썼다 하고 있다. 꼬리가 느리게 흔들린다.' }
];

Object.assign(STORY.scenes, {

  // ================= 고백 (21일 밤 또는 이벤트 10 직후의 늦은 고백) =================
  route_miho_confess: [
    { set: { 'flag.route': true, 'flag.route_miho': true } },
    { if: 'flag.cf_night', goto: 'route_miho_cfbg' },
    { goto: 'route_miho_cf' }
  ],
  route_miho_cfbg: [{ bg: 'inn_night' }, { goto: 'route_miho_cf' }],
  route_miho_cf: [
    { hide: 'all' },
    { narr: '여관 식당에 남은 건 촛불 하나와 동전 굴러가는 소리뿐이었다. 미호가 카운터 뒤에서 동전을 세다가, 내가 다가오는 걸 알아채고 손을 멈췄다. 꼬리가 의자 뒤에서 먼저 반응했다.' },
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '사, 사장님? 이 시간에 웬일이세요. 정산은 아직 안 끝났는데요. 아니, 끝났는데, 끝났다고 하기엔…' },
    { narr: '미호는 장부를 덮었다가 다시 폈다. 뭘 하고 있는지 본인도 모르는 눈치였다.' },
    { say: 'miho', face: 'normal', text: '…표정이 진지하네요. 이런 얼굴로 오는 손님은 보통 외상을 부탁하거나, 아니면 진짜 중요한 얘기를 하거든요.' },
    { say: 'miho', text: '외상은 안 받아요. 그러니까… 중요한 얘기, 맞죠?' },
    { narr: '촛불이 흔들렸다. 미호의 귀가 이쪽으로 완전히 돌아와 있었다. 도망치지 않고 기다리는 중이다. 이 여우가 도망치지 않는 건 정말로 드문 일이다.' },
    { choice: [
      { text: '"미호가 좋아요. 계산 같은 거 하나도 안 하고, 그냥 좋아해요."', set: { 'aff.miho': 3 }, goto: 'route_miho_cf_a' },
      { text: '"평생 계약서의 빈 칸, 제가 채우고 싶어요. 갑과 을 말고, 둘이서요."', set: { 'aff.miho': 3 }, goto: 'route_miho_cf_b' },
      { text: '"…마음을 훔쳐 갔으니까, 배상은 제 곁에서 하세요."', set: { 'aff.miho': 2 }, goto: 'route_miho_cf_c' }
    ] }
  ],
  route_miho_cf_a: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '계산을… 안 한다고요? 그건 장사꾼한테는 거의 욕이에요. 사장님은 정말…' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…저도 해 봤어요, 계산. 이 마음이 얼마나 손해일지. 몇 번을 튕겨도 답이 이상하게 나와서, 주판은 서랍에 넣어 놨어요.' },
    { goto: 'route_miho_cf_end' }
  ],
  route_miho_cf_b: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '…그 칸은 제일 비싼 문장이 들어갈 자리인데요. 아무한테나 안 맡겨요. 알고 하시는 거죠?' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…알고 하시는 거네요. 눈이 그래요. 바보 같은 눈이에요. 좋은 쪽으로요.' },
    { goto: 'route_miho_cf_end' }
  ],
  route_miho_cf_c: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '마, 마음을 훔쳤다니요! 증거 있어요? 도적은 증거를 안 남겨요! …아, 잠깐, 이쪽이 도둑이면 이 말이 자백이잖아요!' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…네. 훔쳤어요. 제가 먼저 훔쳤고, 사장님이 먼저 훔쳐 갔어요. 서로 장물이에요.' },
    { goto: 'route_miho_cf_end' }
  ],
  route_miho_cf_end: [
    { narr: '미호가 카운터를 돌아 나와 내 앞에 섰다. 키 차이 때문에 올려다보는 눈이 촛불을 담아 반짝였다. 한 번 숨을 들이쉬고, 두 손으로 내 한 손을 감쌌다. 도적의 손인데도 떨리고 있었다.' },
    { say: 'miho', face: 'smile', text: '…좋아요. 거래 성립이에요. 이 계약은 해지 불가, 갱신 자동, 수수료는 없고, 이자는… 제가 평생 낼게요.' },
    { say: 'miho', face: 'shy', text: '이 얘기는 아이들한테 편지로 쓸 거예요. 첫 줄은 "언니는 비싼 걸 얻었어"로 시작할래요. …그러니까 지금은 손, 놓지 마세요. 꼬리는 안 되고요.' },
    { narr: '꼬리가 이미 내 손목을 한 바퀴 돌고 있었다. 우리는 웃음을 참느라 한참 말이 없었다.' },
    { if: 'flag.cf_night', goto: 'cf_after' },
    { goto: 'after_pick' }
  ],

  // ================= 루트 1 (22일): 새 장부 =================
  route_miho_1: [
    { set: { 'ev.r_miho': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '아침 식당에 들어서자 손님들의 시선이 일제히 쏟아졌다. 마르타 아주머니가 꿀빵 바구니를 든 채 윙크를 날렸다. "어머, 소문 다 났어요. 은빛 여우관 사장님이 여우를 잡았다고."' },
    { show: 'miho', face: 'shy', pos: 'center' },
    { say: 'miho', text: '…제가 퍼뜨린 거 아니에요! 정말로요! 어젯밤에 우물가에서 혼잣말을 조금 했을 뿐인데, 그 시각에 마을 사람 절반이 우물 근처에 있었다는 게 문제죠!' },
    { narr: '카운터에는 새 장부가 놓여 있었다. 표지에 단정한 글씨로 "연애 관련 지출 및 수익". 미호가 나보다 먼저 그 장부를 등 뒤로 감췄지만 꼬리가 이미 가리고 있지 못했다.' },
    { say: 'miho', face: 'normal', text: '…보셨죠. 어쩔 수 없네요. 설명할게요. 이건 투자 계획서예요. 데이트 비용, 선물비, 간식비… 수익 칸은 아직 비어 있지만요.' },
    { say: 'miho', text: '그런데 쓰다 보니 수익 칸에 쓸 게 하나도 없는 거예요. 돈으로 환산이 안 되는 것만 생겨서요. 그래서 열한 번이나 다시 썼어요.' },
    { narr: '장부 첫 장에는 줄이 그어진 항목이 가득했다. "손잡기: 가격 미정", "같이 밥 먹기: 가격 미정", "이름 불러 주기: 가격 미정". 마지막 줄만 지워지지 않게 꾹꾹 눌러 쓴 글씨였다. "행복: 측정 불가."' },
    { say: 'miho', face: 'smile', text: '아이들한테도 편지를 보냈어요. 일곱 명이 한 번에 답장을 보내면 우체부 아저씨가 쓰러질 것 같지만요. 로이는 "그 사람 괜찮아?"라고 물을 것 같고, 세나는 분명 "계약서는 읽어 봤어?"라고 하겠죠.' },
    { choice: [
      { text: '장부를 같이 들여다보며 "측정 불가" 옆에 이름을 나란히 적는다.', set: { 'aff.miho': 3 }, goto: 'route_miho_1_sign' },
      { text: '"데이트 비용은 제가 낼게요. 오늘 장터에서 간식 어때요?" (6G)', cost: 6, set: { 'aff.miho': 2, rep: 1 }, goto: 'route_miho_1_treat' },
      { text: '"수익 칸은 비워 두세요. 나중에 한꺼번에 정산하죠."', set: { 'aff.miho': 2 }, goto: 'route_miho_1_blank' }
    ] }
  ],
  route_miho_1_sign: [
    { narr: '"측정 불가" 옆에 내 이름을 쓰자 미호가 그 옆에 자기 이름을 썼다. 두 이름이 한 줄에 나란히 놓이자 미호가 장부를 가슴에 끌어안았다.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…이 장부는 이제 감사 불가 장부예요. 누구에게도 안 보여 줄 거예요. 세나가 와도요. 세나는 특히요.' },
    { narr: '미호의 귀가 하루 종일 위로 서 있었다. 손님이 팁을 놓고 갈 때마다 꼬리가 박자에 맞춰 흔들렸다.' },
    { goto: 'after_pick' }
  ],
  route_miho_1_treat: [
    { narr: '해가 기울기 전에 둘이 장터를 한 바퀴 돌았다. 미호는 꿀과자 가게 앞에서 가격표를 보더니 "이건 원가의 세 배예요" 하고 속삭이며 정확히 한 개를 골랐다. 그리고 반으로 쪼갰다.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '반반이에요. 이게 제일 공정한 분배거든요. …솔직히 말하면, 두 개를 사도 되는데 하나를 나눠 먹는 쪽이 이상하게 더 달아요.' },
    { goto: 'after_pick' }
  ],
  route_miho_1_blank: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '한꺼번에 정산이요? 그건 위험한데요. 이자가 쌓이니까요. …아, 이자는 제가 내는 쪽이던가. 그럼 괜찮네요.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '좋아요. 비워 둘게요. 정산일은 봉인이 끝나는 날로 해요. 그날까지 사라지지 마세요. 장부는 채무자가 없으면 쓸모가 없으니까요.' },
    { goto: 'after_pick' }
  ],

  // ================= 루트 2 (24일): 지붕 위의 두려움 =================
  route_miho_2: [
    { set: { 'ev.r_miho': 1 } }, { bg: 'roof_night' }, { hide: 'all' },
    { narr: '하늘이 이상하게 낮은 날이었다. 마을 개들이 해 질 녘부터 짖기 시작했고, 신전 종탑이 바람도 없이 한 번 울렸다. 저녁 설거지를 끝내고 올려다본 지붕 위에 낯익은 꼬리가 보였다.' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { say: 'miho', text: '…사장님이요? 올라오셨어요? 사다리 위험한데. 아, 저도 안 위험한 건 아니고요. 도적은 높은 데가 편하니까요.' },
    { narr: '나란히 앉자 미호는 무릎을 모으고 꼬리로 발을 감쌌다. 한참 동안 별만 보았다. 평소엔 말이 끊이지 않는 사람이라 이 침묵이 더 크게 들렸다.' },
    { say: 'miho', face: 'sad', text: '…무서워요. 처음이에요. 길드에서 쫓길 때도, 보육원 겨울이 추웠을 때도 무섭다는 말은 안 나왔는데요.' },
    { say: 'miho', text: '잃을 게 없는 사람은 겁이 없어요. 저는 이제 잃을 게 생겼잖아요. 이 여관, 간판, 아이들 몫의 방, 그리고…' },
    { narr: '미호가 말을 삼켰다. 대신 내 소매 끝을 아주 조금 잡았다. 손가락이 차가웠다.' },
    { say: 'miho', face: 'normal', text: '그래서 요 며칠, 숫자만 세고 있었어요. 폭풍 날 곡물 몇 포대, 동굴까지 몇 걸음, 우리 쪽 사람 몇 명. 숫자를 세면 안 무서운 척할 수 있거든요.' },
    { say: 'miho', text: '그런데 있잖아요, 사장님 몫은 숫자로 안 세어져요. 하나인데 제일 커서요. 이럴 땐 어떻게 해야 해요?' },
    { choice: [
      { text: '"무서우면 무섭다고 해요. 오늘은 계산 말고 별을 세요."', set: { 'aff.miho': 3 }, goto: 'route_miho_2_stars' },
      { text: '"미호가 먼저 도망쳐도 좋아요. 아이들과 같이 안전한 곳으로." 진심으로 말한다.', set: { 'aff.miho': 2 }, goto: 'route_miho_2_run' },
      { text: '손을 겹쳐 잡는다. "같이 돌아오는 계산을 해요. 답은 이미 나왔어요."', set: { 'aff.miho': 3, 'flag.miho_vow': true }, goto: 'route_miho_2_vow' }
    ] }
  ],
  route_miho_2_stars: [
    { narr: '둘이 별을 세기 시작했다. 미호는 열둘에서 틀렸고, 나는 서른에서 틀렸다. 서로 상대 숫자가 틀렸다고 우기다가 어느새 둘 다 웃고 있었다.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '…이상하다. 별은 공짜인데 오늘은 제일 비싸게 느껴져요. 이 자리에 같이 앉아 있는 값이 붙어서 그런가 봐요.' },
    { goto: 'after_pick' }
  ],
  route_miho_2_run: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '…먼저 도망가라고요? 저는 도적이에요. 도망은 제 전문인데요. 그런 걸 허락해 주는 사람은 사장님이 처음이에요.' },
    { show: 'miho', face: 'angry' },
    { say: 'miho', text: '…그래서 안 가요! 허락받고 도망치는 건 도망이 아니라 외출이잖아요! 외출은 안 해요. 여기가 제 집인데요!' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…고마워요. 그렇게까지 생각해 줘서. 그 마음, 반만 받을게요. 나머지 반은 사장님이 쓰세요, 위험할 때 쓰시게요.' },
    { goto: 'after_pick' }
  ],
  route_miho_2_vow: [
    { narr: '겹친 손 위로 미호가 꼬리 끝을 얹었다. 따뜻하고 푹신했다. 미호가 눈을 감고 작게 웃었다.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '…답이 나왔다고요? 어떤 답이요. 아, 말하지 마세요. 소리 내서 말하면 진짜 수수료가 붙을 것 같아요.' },
    { say: 'miho', face: 'shy', text: '좋아요, 계약할게요. 둘 다 돌아온다. 한 명이라도 안 돌아오면 계약 무효, 그러면 쫓아가서 환불받을 거예요. 저승까지라도요.' },
    { goto: 'after_pick' }
  ],

  // ================= 루트 3 (26일): 마지막 조항 =================
  route_miho_3: [
    { set: { 'ev.r_miho': 1 } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '폭풍이 이틀 앞으로 다가온 오후였다. 마을 사람들이 창에 판자를 대는 망치 소리가 사방에서 들렸다. 뒷마당 우물가에서 미호가 두루마리를 무릎에 펴 놓고 펜 끝을 깨물고 있었다.' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { say: 'miho', text: '아, 왔네요. 때마침 잘 오셨어요. 제 평생 계약서, 마지막 조항 때문에요. 사장님이 쓰기로 했던 칸인데, 제가 먼저 연습해 봤어요.' },
    { narr: '두루마리 여백에 지워진 문장이 열 개쯤 있었다. "갑은 을의 곁을 지킨다"는 너무 딱딱하다고 지워져 있었고, "사랑한다"는 줄은 세 번이나 고쳐 쓴 흔적이 있었다.' },
    { say: 'miho', face: 'shy', text: '…웃지 마세요. 장사 문서는 잘 쓰는데 이건 이상하게 안 써져요. 계약서에 마음을 쓰려니까 글자가 자꾸 도망가서요.' },
    { say: 'miho', text: '그리고 하나 더 말할 게 있어요. 결전 다음 날, 아이들이 와요. 일곱 명 다요. 마차를 미리 불러 놨어요. 허락은… 사실 아직 안 받았는데, 받을 거라고 믿고 불렀어요.' },
    { narr: '미호는 고개를 숙인 채 귀를 접었다. 우물 속에서 두레박이 달그락거리는 소리가 났다.' },
    { say: 'miho', face: 'normal', text: '이 여관에서 계속 살아도 되냐는 얘기, 전에 정찰하면서 반은 농담이라고 했죠. 반은 진심이었어요. 이제는 진심이 전부예요.' },
    { choice: [
      { text: '"아이들 방은 벌써 정해 놨어요. 이층 동쪽 끝 방, 일곱이 쓰기엔 좁겠지만요."', set: { 'aff.miho': 3, 'flag.miho_kids': true }, goto: 'route_miho_3_kids' },
      { text: '"마지막 조항은 같이 써요. 한 글자씩 번갈아서."', set: { 'aff.miho': 3 }, goto: 'route_miho_3_clause' },
      { text: '"미호가 돌아와 줘서 내가 얼마나 든든한지, 값으로 매길 수가 없어요."', set: { 'aff.miho': 2 }, goto: 'route_miho_3_thanks' }
    ] }
  ],
  route_miho_3_kids: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '…벌써요? 아직 허락도 안 받았는데? 이층 동쪽 끝이면 창문이 큰 방이잖아요. 일곱이 이불 펴면 꼭 붙어서 자야 할 텐데…' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '…그러면 되겠네요. 쌍둥이는 반대로만 자니까 한 명은 머리를 문 쪽으로 두겠고요. 파이는 간식 때문에 한밤중에 일어날 테고. 아, 상상만 했는데 시끄러워요. 너무 좋아서요.' },
    { narr: '미호는 소매로 눈가를 문질렀다. 그리고 들키지 않으려고 두레박을 끌어올리는 척했다. 두레박은 비어 있었다.' },
    { goto: 'after_pick' }
  ],
  route_miho_3_clause: [
    { narr: '둘이 펜을 번갈아 쥐고 한 글자씩 이어 썼다. "우리는" "서로의" "곁에서" "…"까지 쓰다가 서로 다음 글자를 미루다가 웃음이 터졌다. 미호가 마지막 글자를 쓰려다 펜을 내려놓았다.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '…남은 글자는 결전 다음 날 아침에 마저 써요. 그날 해가 뜨면 이 글자가 얼마짜리인지 알게 될 테니까요. 그때까지 두루마리는 비매품이에요.' },
    { goto: 'after_pick' }
  ],
  route_miho_3_thanks: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '값으로 못 매긴다고 하면 저는 오히려 곤란해요. 장사꾼은 값 없는 걸 받으면 어디에 쌓아야 할지 몰라서요.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…가슴에요. 거기에 쌓을게요. 창고가 모자라면 꼬리 끝까지 쌓아야겠네요.' },
    { narr: '미호가 내 어깨에 이마를 짧게 기댔다. 폭풍 전의 바람이 우물 위로 지나갔다. 그 순간만큼은 바람 소리도 작게 들렸다.' },
    { goto: 'after_pick' }
  ],

  // ================= 에필로그 (결전 다음 날 새벽, end_miho 직전) =================
  route_miho_epi: [
    { time: '새벽' }, { bg: 'inn_dawn' }, { hide: 'all' },
    { narr: '동굴에서 돌아온 밤은 짧았다. 모두가 쓰러지듯 잠든 뒤, 여관 앞 계단에서 인기척이 났다. 새벽 안개 속에 꼬리 하나가 둥글게 말려 있었다.' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { say: 'miho', text: '…주무시지 그랬어요. 아니, 저도 못 잤어요. 눈을 감으면 동굴이 보이고, 눈을 뜨면 사장님이 여기 있는지 확인하고 싶어서요.' },
    { narr: '미호가 옆자리를 손으로 두드렸다. 앉자마자 꼬리가 무릎 위로 올라왔다. 흙먼지와 약초 냄새가 났다.' },
    { if: 'ev.r_miho>=3', goto: 'route_miho_epi_3' },
    { if: 'ev.r_miho>=2', goto: 'route_miho_epi_2' },
    { goto: 'route_miho_epi_1' }
  ],
  route_miho_epi_3: [
    { say: 'miho', face: 'smile', text: '약속했잖아요. 둘 다 돌아온다. 환불 쫓아가는 일 안 생겨서 다행이에요. 저승까지 쫓아가는 거, 의외로 비용이 많이 들거든요.' },
    { goto: 'route_miho_epi_main' }
  ],
  route_miho_epi_2: [
    { say: 'miho', face: 'smile', text: '지붕 위에서 했던 얘기요, 기억나요? 무섭다고. 오늘 아침엔 조금 덜 무서워요. 겪고 나니까 숫자가 작아졌어요.' },
    { goto: 'route_miho_epi_main' }
  ],
  route_miho_epi_1: [
    { say: 'miho', face: 'smile', text: '장부 첫 장에 아직 한 줄이 비어 있어요. 오늘 쓸 수 있을 것 같아요. 무사 귀환, 수익 칸에요.' },
    { goto: 'route_miho_epi_main' }
  ],
  route_miho_epi_main: [
    { if: 'flag.miho_eve', goto: 'route_miho_epi_clause' },
    { say: 'miho', face: 'normal', text: '…계약서 마지막 칸은 아직 비어 있어요. 오늘 안에 채울 거예요. 사장님도 같이요. 해가 완전히 뜨기 전에 쓰고 싶어요.' },
    { goto: 'route_miho_epi_end' }
  ],
  route_miho_epi_clause: [
    { narr: '미호가 품에서 두루마리를 꺼내 아주 천천히 펼쳤다. 마지막 칸에 적힌 글씨를 소리 없이 읽는 동안 귀가 끝까지 붉어졌다. 읽고 나서 두루마리를 얼굴 앞에 세웠다. 눈만 그 위로 나왔다.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…읽었어요. 서른여덟 번째 조항. 이건 오늘 안에 값을 매길 거예요. 아니, 안 매길래요. 매길 수가 없어서요.' },
    { goto: 'route_miho_epi_end' }
  ],
  route_miho_epi_end: [
    { show: 'miho', face: 'normal' },
    { say: 'miho', text: '그리고요. 한 가지 고백할게요. 낮에 마차가 도착해요. 아이들 일곱이 한꺼번에요. 정신없을 거예요. 소리 지르고, 뛰고, 간판 올려다보고, 팁 항아리 흔들고.' },
    { say: 'miho', face: 'smile', text: '그러니까 지금 이 조용한 새벽이, 우리 둘만 있는 마지막 아침일지도 몰라요. 그래서 안 자고 기다렸어요. 이상한 이유죠?' },
    { narr: '동쪽 하늘이 연한 금빛으로 물들기 시작했다. 미호는 손을 내밀었다. 손바닥이 위로 향해 있었다. 거래를 청하는 손이 아니라, 잡아 달라는 손이었다.' },
    { narr: '말없이 그 손을 잡았다. 새벽바람이 간판 위로 지나갔고, 은빛 여우가 아침 빛에 천천히 반짝이기 시작했다.' },
    { goto: 'end_miho' }
  ]
});
