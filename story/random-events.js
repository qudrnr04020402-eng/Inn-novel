// ============================================================
//  아침 랜덤 사건 — 2~5일차 아침 장면이 끝난 뒤, 낮 시간으로 넘어가기 전에 끼어드는 짧은 돌발 사건
//  - 확률(chance)로 하루 최대 1개. 같은 회차에서 같은 사건은 두 번 나오지 않습니다.
//  - 난수는 세이브에 저장된 시드로 정해지므로 저장/불러오기로 다시 뽑을 수 없습니다. (js/event-core.js)
//  - 사건 장면은 STORY.scenes 의 'rev_<id>' 씬입니다. 마지막은 {randret:true} (아침 장면으로 복귀).
//  - 영업 보정(오늘 하루만 적용, 새 일차가 시작되면 초기화): set 으로 더합니다.
//      'today.cust'  : 일반 손님 수 증감 (-1 = 한 명 줄어듦(히로인/특별 주문/레시피 전수 손님은 안 줄음), +1 = 단골 한 명 더)
//      'today.price' : 장보기 재료 값 증감 % (-25 = 25% 할인)
//      'today.tip'   : 대성공 팁/단골 보너스 팁 증가 % (+50 = 1.5배, 올림)
//      'today.note'  : 장보기 화면에 보이는 오늘의 안내 문구 (문자열 대입)
//  - 검사: node tools/check-story.js (데이터 무결성 + 시뮬레이션에 포함)
// ============================================================
window.RANDOM_EVENTS = {
  chance: 0.6,          // 사건이 일어날 확률 (하루 한 번 굴림)
  days: [2, 3, 4, 5],   // 사건이 일어날 수 있는 일차
  events: {
    //  title: 이름(알림에 표시) / days: 나올 수 있는 일차 / weight: 상대 확률 / if: 조건식(생략 가능)
    lost_purse:      { title: '분실물 주인 찾기',   days: [2, 3, 4, 5], weight: 1 },
    rowdy_guest:     { title: '진상 손님',          days: [2, 3, 4, 5], weight: 1 },
    rainy_day:       { title: '비 오는 날',         days: [3, 4, 5],    weight: 1 },
    bard:            { title: '떠돌이 음유시인',    days: [2, 3, 4, 5], weight: 1 },
    rats:            { title: '쥐 소동',            days: [2, 3, 4],    weight: 1 },
    merchant_sale:   { title: '재료 상인 떨이',     days: [2, 3, 4, 5], weight: 1 },
    errand_child:    { title: '아이의 심부름',      days: [2, 3, 4, 5], weight: 1 },
    strange_letter:  { title: '수상한 편지',        days: [2, 3, 4],    weight: 1 },
    heroine_meet:    { title: '뜻밖의 마주침',      days: [2, 3, 4, 5], weight: 1.4, if: 'aff.erion>=2 || aff.kaela>=2 || aff.miho>=2 || aff.lia>=2' },
    hungry_traveler: { title: '배고픈 나그네',      days: [2, 3, 4, 5], weight: 1 }
  }
};

// 일반 손님을 늘리는 사건(today.cust > 0)에서 오늘 영업에 더 찾아오는 손님 후보 (이미 오늘 올 손님은 제외, 일차에 따라 돌려 가며 고름)
TAVERN.extras = [
  { who: 'marta', say: ['어머, 노랫소리가 들려서 와 봤어요. 오늘은 여관이 활기차네요.'],
    order: { text: '달콤한 걸로 한 잔 주세요. 노래 듣기 좋게요.', want: ['달콤함'] } },
  { who: 'baron', say: ['여관에서 노랫소리가 나길래 이 노인네도 슬쩍 들어왔구먼.'],
    order: { text: '따뜻한 걸로 한 잔 주게나.', want: ['따뜻함'] } },
  { who: 'tobi', say: [{ text: '여관에 공연이 있다고 들었습니다! 장사꾼은 사람 모이는 곳을 놓치지 않죠!', face: 'smile' }],
    order: { text: '입안이 개운해지는 걸로요! 노래엔 맑은 목이 어울리죠.', want: ['상쾌함'] } },
  { who: 'greta', say: [{ text: '노래라… 오랜만이군. 한 잔 걸치면서 들어 볼까.', face: 'normal' }],
    order: { text: '독한 걸로 한 잔. 노래가 끝나기 전에 비워야겠어.', want: ['독함'] } },
  { who: 'fin', say: [{ text: '순찰 중에 노랫소리가 들려서요! 잠깐만 들르려고요!', face: 'surprised' }],
    order: { text: '든든한 걸로 주세요! 술은 안 됩니다, 근무 중이라서요!', want: ['든든함'], avoid: ['독함'] } },
  { who: 'chief', say: [{ text: '이 마을에 노랫소리가 다시 울리다니. 기쁜 일이야.', face: 'smile' }],
    order: { text: '마음이 놓이는 따뜻한 걸로 주게나. 술은 빼고.', want: ['따뜻함'], avoid: ['독함'] } }
];

Object.assign(STORY.scenes, {

  // ---------- 분실물 주인 찾기 ----------
  rev_lost_purse: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '아침 청소를 하다가 식탁 밑에서 묵직한 지갑을 주웠다. 안에는 은화 몇 닢과 장터 도장이 찍힌 쪽지가 들어 있다.' },
    { choice: [
      { text: '쪽지를 단서로 주인을 찾아 돌려준다', set: { rep: 1 }, goto: 'rev_lost_purse_return' },
      { text: '일단 금고에 넣어 둔다. 주인이 오면 돌려주면 되겠지', set: { gold: 8, rep: -1 }, goto: 'rev_lost_purse_keep' }
    ] }
  ],
  rev_lost_purse_return: [
    { narr: '장터를 한 바퀴 돌자 울상이 된 행상인이 보였다. 지갑을 내밀자 그는 몇 번이나 고개를 숙이더니 사례로 은화 한 닢을 쥐여 주었다.' },
    { set: { gold: 4 } },
    { goto: 'rev_end' }
  ],
  rev_lost_purse_keep: [
    { narr: '금고에 넣어 둔 지갑은 결국 주인이 나타나지 않았다. 아니, 나타나긴 했는데 이미 마을에는 "여관에서 지갑을 안 돌려준다"는 소문이 돌고 있었다.' },
    { goto: 'rev_end' }
  ],

  // ---------- 진상 손님 ----------
  rev_rowdy_guest: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '아침 식당 한가운데서 큰 소리가 났다. 낯선 손님이 수프를 가리키며 "이게 사람 먹는 거냐"고 소리치고 있다. 다른 손님들이 눈치를 보고 있다.' },
    { choice: [
      { text: '정중히 사과하고 새 수프를 내준다 (3G 손해)', cost: 3, set: { rep: 1 }, goto: 'rev_rowdy_calm' },
      { text: '"다른 손님께 폐가 됩니다." 단호하게 돌려보낸다', goto: 'rev_rowdy_firm' },
      { text: '카엘라를 부른다. "영웅이 나설 차례다!"', if: 'aff.kaela>=3', set: { 'aff.kaela': 1, rep: 1 }, goto: 'rev_rowdy_kaela' },
      { text: '못 본 척하고 주방으로 숨는다', set: { rep: -1 }, goto: 'rev_rowdy_hide' }
    ] }
  ],
  rev_rowdy_calm: [
    { narr: '새 수프를 앞에 놓자 손님은 머쓱한 표정으로 한 숟갈 떴다. 잠시 뒤 조용히 빈 그릇을 내밀며 "…맛은 괜찮군" 하고 중얼거렸다.' },
    { goto: 'rev_end' }
  ],
  rev_rowdy_firm: [
    { narr: '손님은 투덜거리며 나갔다. 식당이 잠깐 조용해졌지만, 곧 다른 손님들이 다시 수저를 들었다. 시끄러운 일은 이렇게 끝났다.' },
    { goto: 'rev_end' }
  ],
  rev_rowdy_kaela: [
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '식당의 평화는 붉은 사자가 지킨다! 손님, 이쪽에서 조용히 이야기하자!' },
    { narr: '카엘라가 어깨에 손을 올리자 손님은 얼어붙어 얌전히 자리에 앉았다. 칼은 뽑지도 않았는데 효과는 확실했다.' },
    { goto: 'rev_end' }
  ],
  rev_rowdy_hide: [
    { narr: '소란은 한참 더 이어졌다. 다른 손님들의 시선이 따갑다. "주인이 저렇게 숨어서야…" 하는 속삭임이 들렸다.' },
    { goto: 'rev_end' }
  ],

  // ---------- 비 오는 날: 손님 -1, 팁 +50% ----------
  rev_rainy_day: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '아침부터 굵은 비가 쏟아진다. 처마 끝에서 빗물이 줄줄 떨어지고, 길에는 사람 그림자도 드물다.' },
    { narr: '오늘은 저녁 손님이 줄 것 같다. 대신 빗속을 뚫고 온 손님은 따뜻한 한 잔에 후하게 인심을 쓸지도 모른다.' },
    { set: { 'today.cust': -1, 'today.tip': 50, 'today.note': '비가 와서 손님이 한 명 줄지만, 팁이 후하다 (팁 +50%)' } },
    { choice: [
      { text: '처마 밑 의자에 따뜻한 차를 내놓는다 (3G)', cost: 3, set: { rep: 1 }, goto: 'rev_rainy_tea' },
      { text: '문을 닫고 영업 준비에 집중한다', goto: 'rev_rainy_prep' }
    ] }
  ],
  rev_rainy_tea: [
    { narr: '비를 피하던 길손들이 차를 한 잔씩 받아 들고 고개를 끄덕였다. "저녁에 다시 들러야겠네." 그 말이 빈말이 아니길 바란다.' },
    { goto: 'rev_end' }
  ],
  rev_rainy_prep: [
    { narr: '빗소리를 들으며 식기를 닦고 장작을 쌓았다. 조용한 아침이다. 오늘 저녁은 한가롭게 요리에 집중할 수 있을 것 같다.' },
    { goto: 'rev_end' }
  ],

  // ---------- 떠돌이 음유시인 ----------
  rev_bard: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '문간에서 류트 소리가 들렸다. 낡은 외투를 걸친 떠돌이 음유시인이 모자를 벗어 들고 서 있다. "노래 한 곡에 따뜻한 아침 한 끼, 어떻습니까?"' },
    { choice: [
      { text: '저녁 식당에서 공연해 달라고 부탁한다 (5G 사례)', cost: 5, set: { rep: 1, 'today.cust': 1, 'today.note': '음유시인의 소문을 듣고 단골이 한 명 더 찾아온다' }, goto: 'rev_bard_stage' },
      { text: '아침 한 끼만 내주고 보낸다', goto: 'rev_bard_meal' },
      { text: '"죄송합니다, 오늘은 바빠서." 정중히 사양한다', goto: 'rev_bard_no' }
    ] }
  ],
  rev_bard_stage: [
    { narr: '음유시인은 활짝 웃으며 류트를 고쳐 잡았다. 소문이 퍼지면 저녁에는 노랫소리를 들으러 누군가 더 찾아올지도 모른다.' },
    { goto: 'rev_end' }
  ],
  rev_bard_meal: [
    { narr: '시인은 수프를 맛있게 비우고 짧은 노래를 한 소절 불러 주었다. 가사에는 은빛 여우가 나왔다. 어쩐지 쑥스럽다.' },
    { goto: 'rev_end' }
  ],
  rev_bard_no: [
    { narr: '시인은 어깨를 으쓱하고 모자를 다시 썼다. "그럼 다음 마을에서 뵙지요." 류트 소리가 골목 너머로 멀어졌다.' },
    { goto: 'rev_end' }
  ],

  // ---------- 쥐 소동 ----------
  rev_rats: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '식료품 창고 쪽에서 쿵쾅 소리가 났다. 문을 열자 쥐 한 마리가 곡식 자루 위에서 태연히 이쪽을 노려보고 있었다.' },
    { choice: [
      { text: '빗자루를 들고 직접 쫓는다 (곡식을 버려서 오늘 장보기가 조금 비싸진다)', set: { 'today.price': 15, 'today.note': '쥐 소동으로 곡식을 버려서 오늘 장보기가 15% 비싸다' }, goto: 'rev_rats_chase' },
      { text: '이웃집 고양이를 빌려 온다 (생선 값 2G)', cost: 2, set: { rep: 1 }, goto: 'rev_rats_cat' },
      { text: '리아에게 부탁한다. "쥐도 생명이니까… 살살 부탁해."', if: 'aff.lia>=3', set: { 'aff.lia': 1 }, goto: 'rev_rats_lia' }
    ] }
  ],
  rev_rats_chase: [
    { narr: '한바탕 소동 끝에 쥐는 쥐구멍으로 사라졌다. 바닥에 쏟아진 곡식은 먼지투성이라 못 쓰게 됐다. 오늘 저녁 장을 서둘러 봐야겠다.' },
    { goto: 'rev_end' }
  ],
  rev_rats_cat: [
    { narr: '고양이는 생선을 한 입 물고 창고로 들어가더니 한참 뒤에 느긋하게 걸어 나왔다. 쥐는 보이지 않는다. 역시 전문가는 다르다.' },
    { goto: 'rev_end' }
  ],
  rev_rats_lia: [
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '자, 이쪽으로 와. 여기보다 들판이 더 좋아. 응? 착하지.' },
    { narr: '리아가 빵부스러기를 뿌리며 뒷문을 열자 쥐는 정말로 얌전히 걸어 나갔다. 신관 수업에 이런 것도 있는 걸까.' },
    { goto: 'rev_end' }
  ],

  // ---------- 재료 상인 떨이: 오늘 장보기 가격 인하 ----------
  rev_merchant_sale: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '문 앞에 짐수레를 세운 상인이 손짓을 한다. "다음 마을로 떠나야 해서 재고를 싸게 넘기려고요. 오늘 하루만입니다!"' },
    { choice: [
      { text: '정가보다 싸게 사는 걸로 만족한다', set: { 'today.price': -25, 'today.note': '재료 상인의 떨이로 오늘 장보기가 25% 싸다' }, goto: 'rev_sale_ok' },
      { text: '미호에게 흥정을 맡긴다. "수수료는 나중에 의논하죠."', if: 'aff.miho>=2', set: { 'aff.miho': 1, 'today.price': -40, 'today.note': '미호의 흥정 덕분에 오늘 장보기가 40% 싸다' }, goto: 'rev_sale_miho' },
      { text: '바가지 같아서 거절한다', goto: 'rev_sale_no' }
    ] }
  ],
  rev_sale_ok: [
    { narr: '상인은 만족스럽게 동전을 세었다. 오늘 저녁 장보기는 평소보다 훨씬 가벼운 주머니로 할 수 있을 것 같다.' },
    { goto: 'rev_end' }
  ],
  rev_sale_miho: [
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '이 가격표는 제 눈엔 낙서예요. 자, 처음부터 다시 얘기해 볼까요, 아저씨?' },
    { narr: '십 분 뒤 상인은 눈물을 글썽이며 수레의 절반을 헐값에 넘겼다. 미호는 영수증 뒷면에 무언가를 열심히 적고 있다. 수수료 계산인 듯하다.' },
    { goto: 'rev_end' }
  ],
  rev_sale_no: [
    { narr: '상인은 "아쉽네요" 하며 수레를 끌고 떠났다. 값을 따져 보니 거절하길 잘한 건지 잘 모르겠다. 어쨌든 오늘 장보기는 평소대로다.' },
    { goto: 'rev_end' }
  ],

  // ---------- 아이의 심부름 ----------
  rev_errand_child: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '카운터 앞에 작은 아이가 까치발로 서 있다. 동전 한 닢을 두 손으로 꼭 쥐고 있다. "엄마가 감기 걸렸어요. 따뜻하고 달콤한 거 주세요."' },
    { narr: '한 닢으로는 한 접시 값에 한참 모자란다.' },
    { choice: [
      { text: '"돈은 괜찮아." 꿀빵을 싸서 쥐여 준다 (3G)', cost: 3, set: { rep: 1 }, goto: 'rev_errand_gift' },
      { text: '동전을 받고 작은 꿀빵 하나를 내준다', set: { gold: 1 }, goto: 'rev_errand_fair' }
    ] }
  ],
  rev_errand_gift: [
    { narr: '아이는 눈을 크게 뜨더니 꾸벅 인사하고 꿀빵을 품에 안고 달려 나갔다. 문 앞에서 한 번 더 돌아보며 손을 흔들었다.' },
    { goto: 'rev_end' }
  ],
  rev_errand_fair: [
    { narr: '아이는 작은 꿀빵을 소중히 받아 들고 신나게 뛰어갔다. 엄마 감기가 얼른 나았으면 좋겠다.' },
    { goto: 'rev_end' }
  ],

  // ---------- 수상한 편지 ----------
  rev_strange_letter: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '문틈에 봉투가 끼어 있었다. 겉에는 아무 글씨도 없고, 안쪽에서 희미하게 향초 냄새가 난다.' },
    { choice: [
      { text: '촌장님께 가져가 함께 열어 본다', set: { rep: 1 }, goto: 'rev_letter_chief' },
      { text: '그 자리에서 열어 본다', set: { gold: 6 }, goto: 'rev_letter_open' },
      { text: '장난이겠거니 하고 난로에 넣는다', goto: 'rev_letter_burn' }
    ] }
  ],
  rev_letter_chief: [
    { narr: '촌장님은 편지를 읽더니 웃으며 고개를 끄덕였다. 마을 어귀 밭주인이 보낸 감사 편지였다. "자네가 지난번 빗길에 짐을 날라 준 걸 잊지 않았다는군."' },
    { goto: 'rev_end' }
  ],
  rev_letter_open: [
    { narr: '편지 안에는 은화 몇 닢과 쪽지가 들어 있었다. \'지난번 숙박비를 깜빡 덜 냈소. 미안하오.\' 수상한 건 향초 냄새뿐이었다.' },
    { goto: 'rev_end' }
  ],
  rev_letter_burn: [
    { narr: '편지는 난로 속에서 파랗게 타올랐다가 금세 재가 되었다. 이상하게도 향초 냄새만은 한참 동안 방에 남아 있었다. …뭐였을까.' },
    { goto: 'rev_end' }
  ],

  // ---------- 히로인 우연 마주침: 호감도가 가장 높은 히로인 ----------
  rev_heroine_meet: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '복도 모퉁이를 돌다가 누군가와 쾅 부딪힐 뻔했다.' },
    { if: WIN('erion', 2), goto: 'rev_meet_erion' },
    { if: WIN('kaela', 2), goto: 'rev_meet_kaela' },
    { if: WIN('miho', 2), goto: 'rev_meet_miho' },
    { goto: 'rev_meet_lia' }
  ],
  rev_meet_erion: [
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '…앞 좀 보고 다녀. 책이 젖을 뻔했잖아. …다친 데는 없어?' },
    { choice: [
      { text: '"미안해요. 그런데 에리온, 아침부터 어디 가요?"', set: { 'aff.erion': 2 }, goto: 'rev_meet_erion_a' },
      { text: '"괜찮아요. 먼저 가세요."', goto: 'rev_meet_erion_b' }
    ] }
  ],
  rev_meet_erion_a: [
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…그냥 산책. 아침 공기가 마력을 맑게 해 주거든. 같이 가자는 말은 아니야. 아니, 가도 되지만.' },
    { goto: 'rev_end' }
  ],
  rev_meet_erion_b: [
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…그래. 그럼.' },
    { narr: '에리온은 책을 품에 안고 조용히 지나갔다. 귀 끝이 아주 살짝 붉었던 것 같기도 하다.' },
    { goto: 'rev_end' }
  ],
  rev_meet_kaela: [
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { say: 'kaela', text: '으앗, 주인장! 기습인 줄 알았다! …기습은 아니군. 다행이다!' },
    { choice: [
      { text: '"아침 훈련 중이었어요? 같이 해도 돼요?"', set: { 'aff.kaela': 2 }, goto: 'rev_meet_kaela_a' },
      { text: '"복도에서 대검은 위험해요."', goto: 'rev_meet_kaela_b' }
    ] }
  ],
  rev_meet_kaela_a: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '하하! 그 마음가짐, 마음에 든다! 자세는 내가 알려 주마. 우선 대검 말고 빗자루부터 시작하자!' },
    { goto: 'rev_end' }
  ],
  rev_meet_kaela_b: [
    { show: 'kaela', face: 'sad' },
    { say: 'kaela', text: '…면목 없다. 복도에서는 칼집을 씌우겠다. 진짜로.' },
    { goto: 'rev_end' }
  ],
  rev_meet_miho: [
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '앗, 사장님! 아, 아무것도 안 훔쳤어요! …아직은요! 헤헤.' },
    { choice: [
      { text: '"팁 항아리 뒤졌죠? 말해 봐요."', set: { 'aff.miho': 2 }, goto: 'rev_meet_miho_a' },
      { text: '"그래요, 바쁘니까 나중에 얘기해요."', goto: 'rev_meet_miho_b' }
    ] }
  ],
  rev_meet_miho_a: [
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '들켰네요? 사실은 항아리 손잡이가 헐거워서 고쳐 두려고 했어요. 진짜예요. 수리비는 후불로 받을게요!' },
    { goto: 'rev_end' }
  ],
  rev_meet_miho_b: [
    { show: 'miho', face: 'normal' },
    { say: 'miho', text: '네~ 나중에요. 그럼 저는 이만! …뭘 들켰는지는 비밀로 할게요.' },
    { goto: 'rev_end' }
  ],
  rev_meet_lia: [
    { show: 'lia', face: 'surprised', pos: 'center' },
    { say: 'lia', text: '앗! 미, 미안! 걸레 양동이를 들고 있었는데… 괜찮아? 안 젖었지?' },
    { choice: [
      { text: '"괜찮아. 같이 닦을까? 어릴 때처럼."', set: { 'aff.lia': 2 }, goto: 'rev_meet_lia_a' },
      { text: '"괜찮아. 조심해서 다녀."', goto: 'rev_meet_lia_b' }
    ] }
  ],
  rev_meet_lia_a: [
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '응! …아, 근데 오늘은 나 혼자서도 할 수 있어. 그래도 옆에 있어 주면 더 빨리 끝날 것 같아.' },
    { goto: 'rev_end' }
  ],
  rev_meet_lia_b: [
    { show: 'lia', face: 'normal' },
    { say: 'lia', text: '응, 고마워. 너도 조심해. 아침부터 바쁘잖아.' },
    { goto: 'rev_end' }
  ],

  // ---------- 배고픈 나그네 ----------
  rev_hungry_traveler: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '여관 앞 계단에 낯선 나그네가 주저앉아 있다. 배에서 꼬르륵 소리가 여기까지 들린다. 주머니는 텅 비어 보인다.' },
    { choice: [
      { text: '빵과 수프를 나눠 준다 (3G)', cost: 3, set: { rep: 1 }, goto: 'rev_traveler_meal' },
      { text: '"장작을 패 주면 한 끼 드릴게요."', set: { gold: 3 }, goto: 'rev_traveler_work' },
      { text: '"죄송하지만 여기는 식당이라서요." 돌려보낸다', set: { rep: -1 }, goto: 'rev_traveler_no' }
    ] }
  ],
  rev_traveler_meal: [
    { narr: '나그네는 수프를 말없이 비우더니 눈가를 훔쳤다. "이 마을 사람들은 따뜻하구려." 그는 몇 번이나 뒤를 돌아보며 길을 떠났다.' },
    { goto: 'rev_end' }
  ],
  rev_traveler_work: [
    { narr: '나그네는 팔을 걷어붙이고 장작을 산더미처럼 팼다. 덕분에 한동안 땔감 걱정은 없겠다. 한 끼 값으로는 꽤 남는 장사다.' },
    { goto: 'rev_end' }
  ],
  rev_traveler_no: [
    { narr: '나그네는 말없이 일어나 길을 떠났다. 지켜보던 마을 사람이 혀를 찼다. "여관 주인이 쯧쯧…" 마음이 조금 무겁다.' },
    { goto: 'rev_end' }
  ],

  // ---------- 공통: 사건이 끝나면 아침 장면으로 복귀 ----------
  rev_end: [{ hide: 'all' }, { randret: true }]
});
