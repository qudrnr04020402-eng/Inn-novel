// ============================================================
//  저녁 영업 데이터 — 재료 / 레시피 / 손님 / 일차별 손님 목록 / 여관 업그레이드
//  이 파일만 고치면 영업 내용을 바꿀 수 있습니다. (코드를 몰라도 글자와 숫자만 바꾸면 됩니다)
//  - 스토리에서 영업을 시작하는 명령은 {tavern:'day1'} 한 줄입니다. (README "저녁 영업 데이터 작성법" 참고)
//  - 판정 로직은 js/tavern-core.js, 화면은 js/engine.js 에 있습니다.
// ============================================================
window.TAVERN = {

  // ---------- 규칙 수치 (밸런스는 여기서) ----------
  rules: {
    pay:   { perfect: 1, good: 0.7, fail: 0.3, mystery: 0 },   // 결과별 요리 값 비율 (레시피 price 에 곱함)
    tipRate: 0.2,                                              // 대성공 팁 = 요리 값 x 이 비율 (최소 1G)
    favTip: 1,                                                 // 히로인 최애 메뉴를 냈을 때 팁 추가
    barrelTip: 2,                                              // '좋은 술통' 업그레이드: 팁 배수
    stoveBonus: 3,                                             // '난로' 업그레이드: 따뜻함 주문을 대성공/보통으로 맞히면 팁 +G
    rep:   { perfect: 1, good: 0, fail: -1, mystery: 0, skip: -1 },   // 손님 한 명당 평판 변화 (skip = 정중히 거절)
    repDay: [-3, 2],                                           // 하루 영업 전체의 평판 변화 한계 [최소, 최대]
    love:  { perfect: 2, good: 1, fail: -1, mystery: 0, hate: -2 },   // 히로인 손님 호감도 변화
    favLove: 4,                                                // 히로인 최애 메뉴를 처음 냈을 때 호감도
    favLoveRepeat: 2                                           // 두 번째부터
  },

  skipLine: '아쉽지만… 다음에 다시 올게요.',     // 손님을 정중히 거절했을 때 손님이 하는 말

  // ---------- 시작 상태 ----------
  start: {
    stock: { ale: 2, mead: 2, herb: 2, meat: 2, bread: 2, mushroom: 2, moonberry: 2, milk: 2 }   // 첫 영업 전 재고
  },

  // ---------- 주문 말 풀이 (메뉴판에 표시) ----------
  tags: {
    '따뜻함': { color: '#ff9a6a', words: '몸이 녹는 · 속이 풀리는 · 뜨끈한' },
    '달콤함': { color: '#ff8fb8', words: '달달한 · 입이 즐거운 · 디저트 같은' },
    '든든함': { color: '#d6a35a', words: '배를 채우는 · 힘이 나는 · 묵직한' },
    '독함':   { color: '#b07ae8', words: '술 · 목구멍이 타는 · 한 잔 걸치는' },
    '상쾌함': { color: '#6fd6c8', words: '개운한 · 머리가 맑아지는 · 산뜻한' },
    '마법':   { color: '#7fa8ff', words: '마력이 도는 · 신비로운 · 별빛 같은' }
  },

  // ---------- 재료 8종 (price = 장보기 가격, note = 재료를 눌렀을 때 나오는 한 줄) ----------
  ingredients: {
    ale:       { name: '에일',     price: 4, icon: 'assets/tavern/ale.svg',       note: '씁쓸하고 거품이 풍성한 보리술.' },
    mead:      { name: '꿀술',     price: 5, icon: 'assets/tavern/mead.svg',      note: '꿀로 빚은 술. 끓이면 술기운은 날아가고 단맛만 남는다.' },
    herb:      { name: '허브',     price: 2, icon: 'assets/tavern/herb.svg',      note: '향긋하고 시원한 잎. 입안이 개운해진다.' },
    meat:      { name: '고기',     price: 5, icon: 'assets/tavern/meat.svg',      note: '묵직한 살코기. 뭐든 든든하게 만든다.' },
    bread:     { name: '빵',       price: 2, icon: 'assets/tavern/bread.svg',     note: '갓 구운 흑빵. 배를 채우는 데는 이만한 게 없다.' },
    mushroom:  { name: '버섯',     price: 3, icon: 'assets/tavern/mushroom.svg',  note: '구수한 산버섯. 끓이면 속이 편해진다.' },
    moonberry: { name: '달빛열매', price: 6, icon: 'assets/tavern/moonberry.svg', note: '달빛 아래서만 익는 열매. 먹으면 마력이 반짝인다.' },
    milk:      { name: '우유',     price: 2, icon: 'assets/tavern/milk.svg',      note: '고소한 우유. 데우면 마음까지 따뜻해진다.' }
  },

  // ---------- 레시피 15종 ----------
  //  ing: 재료 조합(순서 무관), tags: 속성 태그, price: 요리 값, basic: true 면 처음부터 메뉴판에 있음
  //  hint: 메뉴판에서 아직 모르는 레시피 칸에 보이는 힌트
  //  나머지는 대화/이벤트({learn:'id'} 또는 손님의 gain), 향신료 선반 업그레이드, 또는 직접 조합해 보다가 발견합니다.
  recipes: {
    meat_stew:     { name: '고기 스튜',        ing: ['meat', 'mushroom'],           tags: ['따뜻함', '든든함'],          price: 10, basic: true },
    ale_bread:     { name: '에일과 흑빵',      ing: ['ale', 'bread'],               tags: ['든든함', '독함'],            price: 8,  basic: true },
    herb_tea:      { name: '허브 우유차',      ing: ['herb', 'milk'],               tags: ['따뜻함', '상쾌함'],          price: 6,  basic: true },
    honey_bread:   { name: '꿀빵',             ing: ['bread', 'mead'],              tags: ['달콤함', '든든함'],          price: 9,  basic: true },
    herb_ale:      { name: '허브 에일',        ing: ['ale', 'herb'],                tags: ['상쾌함', '독함'],            price: 8,  basic: true },
    herb_roast:    { name: '허브 구이',        ing: ['meat', 'herb'],               tags: ['든든함', '상쾌함'],          price: 9,  hint: '행상인의 장터 비법이라던데…' },
    mushroom_soup: { name: '버섯 크림수프',    ing: ['mushroom', 'milk'],           tags: ['따뜻함', '든든함'],          price: 7,  hint: '할멈이 끓여 주던 수프라고 한다.' },
    fire_water:    { name: '불꽃 꿀술',        ing: ['ale', 'mead'],                tags: ['독함', '달콤함', '따뜻함'],  price: 11, hint: '전장에서 돌던 독한 비법이라고 한다.' },
    moon_ale:      { name: '달빛 에일',        ing: ['moonberry', 'ale'],           tags: ['마법', '독함'],              price: 13, hint: '향신료 선반에 올라 있을 법한 조합.' },
    berry_milk:    { name: '달빛열매 우유',    ing: ['moonberry', 'milk'],          tags: ['마법', '달콤함'],            price: 10, hint: '향신료 선반에 올라 있을 법한 조합.' },
    magic_stew:    { name: '마법 스튜',        ing: ['meat', 'mushroom', 'moonberry'], tags: ['마법', '따뜻함', '든든함'], price: 17, hint: '향신료 선반에 올라 있을 법한 조합.' },
    honey_milk:    { name: '꿀술 우유',        ing: ['milk', 'mead'],               tags: ['따뜻함', '달콤함'],          price: 9,  hint: '누군가의 어린 시절 추억의 맛.' },
    knight_feast:  { name: '기사단의 만찬',    ing: ['meat', 'ale', 'bread'],       tags: ['든든함', '독함', '따뜻함'],  price: 14, hint: '누군가가 왕도 주점에서 먹었던 그 요리.' },
    moon_tea:      { name: '달빛 꿀차',        ing: ['moonberry', 'mead', 'herb'],  tags: ['달콤함', '상쾌함', '마법'],  price: 16, hint: '누군가의 스승님이 만들어 주던 차.' },
    fox_toast:     { name: '꿀버섯 토스트',    ing: ['mushroom', 'mead', 'bread'],  tags: ['달콤함', '든든함', '따뜻함'], price: 13, hint: '누군가의 고향 보육원에서 먹던 겨울 간식.' }
  },

  // ---------- 여관 업그레이드 (밤에 구매. 효과는 id 로 엔진/규칙이 처리) ----------
  upgrades: [
    { id: 'barrel', name: '좋은 술통',   price: 30, desc: '숙성이 잘 된 술통을 들인다. 대성공 팁이 2배가 된다.' },
    { id: 'shelf',  name: '향신료 선반', price: 45, desc: '희귀한 향신료와 열매 요리법이 적힌 선반. 레시피 3개가 메뉴판에 추가된다.', learn: ['moon_ale', 'berry_milk', 'magic_stew'] },
    { id: 'stove',  name: '난로',        price: 25, desc: '화덕을 새로 단다. 따뜻함을 주문한 손님에게 맞는 요리를 내면 팁 +3G.' },
    { id: 'sign',   name: '새 간판',     price: 40, desc: '번쩍이는 은빛 여우 간판. 매일 저녁 손님이 한 명 더 찾아온다.' }
  ],

  // ---------- 손님 정의 ----------
  //  react: 결과별 반응 대사 (문자열 또는 {text, face}). 여러 개면 그중 하나가 무작위로 나옵니다. {dish} = 낸 요리 이름
  //  히로인(heroine:true)은 fav(최애 레시피 id), dislike(싫어하는 레시피 id 목록)와 react.fav / react.hate (이 대사는 전부 순서대로 나옴)가 더 있습니다.
  customers: {
    baron: { react: {
      perfect: [{ text: '오오, 이거야 이거! 오십 년 마신 것 중에 손꼽겠구먼!', face: 'smile' }, { text: '허허, 주인 솜씨가 아버지를 닮아 가는구먼.', face: 'smile' }],
      good:    [{ text: '음… 나쁘진 않네. 내 입엔 조금 어긋나지만 말이야.', face: 'normal' }, { text: '허, 뭐 마실 만하구먼.', face: 'normal' }],
      fail:    [{ text: '…이 늙은이 이빨이 시험받는 줄 알았네.', face: 'sad' }, { text: '에잉, 주문한 게 이게 아닌데…', face: 'angry' }],
      mystery: [{ text: '이건… 양 먹이인가? 아니, 양도 안 먹겠는데?', face: 'surprised' }, { text: '{dish}라…? 이름부터 수상쩍구먼. 일단 마셔 보지. …씹히는 게 있는데?', face: 'surprised' }, { text: '허허, 도통 무슨 맛인지 모르겠구먼. 신기해서 오히려 좋네!', face: 'smile' }]
    } },
    tobi: { react: {
      perfect: [{ text: '이건 대박입니다! 장터에서 팔면 열 배는 받겠어요!', face: 'smile' }, { text: '완벽! 계산이 딱 맞습니다! 제 혀는 속이는 법이 없죠!', face: 'smile' }],
      good:    [{ text: '흠, 합격선. 원가 대비 만족도는 보통이네요.', face: 'normal' }, { text: '나쁘지 않아요. 별 다섯 중 셋.', face: 'normal' }],
      fail:    [{ text: '이건 반품… 아니, 환불 불가죠? 알겠습니다, 마시죠.', face: 'sad' }, { text: '손해 본 기분입니다. 수치로 말하자면 마이너스 오!', face: 'angry' }],
      mystery: [{ text: '이게 뭡니까? 상품명 {dish}? 특허는 있습니까?', face: 'surprised' }, { text: '…색이 이상합니다. 팔 수 있을지 계산해 보게 되는군요.', face: 'surprised' }, { text: '흥미롭네요! 수상쩍은데 중독성이 있어서 더 수상합니다.', face: 'smile' }]
    } },
    greta: { react: {
      perfect: [{ text: '크하! 이거지! 전장의 맛이 나는군!', face: 'smile' }, { text: '좋아. 이 한 잔이면 오우거도 맨손으로 잡겠어.', face: 'smile' }],
      good:    [{ text: '음, 쓸 만해. 군대 급식보단 낫군.', face: 'normal' }, { text: '나쁘지 않아. 한 잔 더 시킬지는 모르겠지만.', face: 'normal' }],
      fail:    [{ text: '…이거 적군 보급품 아니냐?', face: 'angry' }, { text: '젊은 주인, 수련이 필요하겠어.', face: 'sad' }],
      mystery: [{ text: '이건 처음 본 것도 같고… 전쟁터에서 먹던 것 같기도 하고.', face: 'surprised' }, { text: '{dish}? 마시고 죽으면 너를 원망하마. …꿀꺽. 살아 있군.', face: 'surprised' }, { text: '으하하하! 이런 건 20년 용병 생활에도 못 먹어 봤어!', face: 'smile' }]
    } },
    marta: { react: {
      perfect: [{ text: '어머나, 입안에서 봄이 오는 것 같네!', face: 'smile' }, { text: '아유, 우리 집 양반한테도 싸 가고 싶어요.', face: 'smile' }],
      good:    [{ text: '그래, 괜찮네요. 따뜻하게 먹었으니 됐지 뭐.', face: 'normal' }, { text: '맛있게 먹었어요, 고마워요.', face: 'smile' }],
      fail:    [{ text: '…어머, 이건 내가 시킨 게 아닌 것 같은데.', face: 'sad' }, { text: '허허, 젊은 사람이 바쁘다 보면 그럴 수도 있지. 괜찮아요.', face: 'sad' }],
      mystery: [{ text: '이게 뭐람? 색깔이 신기하네요. 약이라고 하면 믿겠어요.', face: 'surprised' }, { text: '{dish}…? 이름도 이상한데 냄새는 또 구수하네.', face: 'surprised' }, { text: '어머, 먹다 보니 정이 드네. 이상한 건 이상한 건데!', face: 'smile' }]
    } },
    fin: { react: {
      perfect: [{ text: '우와! 힘이 불끈 솟아요! 오늘 밤 경계도 문제없어요!', face: 'smile' }, { text: '이거 먹고 나니 오우거도 무섭지 않아요!', face: 'smile' }],
      good:    [{ text: '어, 맛있네요! …아마도요.', face: 'normal' }, { text: '괜찮은 것 같습니다, 사장님!', face: 'smile' }],
      fail:    [{ text: '으윽… 초소에서 먹던 것보다 어렵네요…', face: 'sad' }, { text: '아, 아니에요! 맛있… 으… 맛있습니다!', face: 'surprised' }],
      mystery: [{ text: '이게… 음료수… 맞죠? 움직이진 않죠?', face: 'surprised' }, { text: '{dish}…? 대장님께 보고드려도 될까요?', face: 'surprised' }, { text: '신기해요! 몸이 반짝반짝하는 기분이 들어요!', face: 'smile' }]
    } },
    chief: { react: {
      perfect: [{ text: '음… 이 마을에서 마신 것 중 가장 훌륭하네. 고맙네.', face: 'smile' }, { text: '이런 날 이런 한 잔이라니. 자네는 마을의 보물이야.', face: 'smile' }],
      good:    [{ text: '음, 고맙게 마시겠네. 마음이 조금 놓이는군.', face: 'normal' }, { text: '따뜻하군. 그거면 됐네.', face: 'normal' }],
      fail:    [{ text: '…허허, 오늘만은 맛을 따질 때가 아니지.', face: 'sad' }, { text: '괜찮네, 괜찮아. 이 마을은 더한 것도 견뎠으니.', face: 'sad' }],
      mystery: [{ text: '{dish}라… 이 늙은이도 처음 보는 이름이네.', face: 'surprised' }, { text: '이건 약인가, 술인가, 독인가? …일단 마셔 보겠네.', face: 'surprised' }, { text: '허허허, 긴장이 풀리는구먼! 맛은 모르겠지만 웃음이 나네!', face: 'smile' }]
    } },

    // ----- 히로인 -----
    erion: { heroine: true, fav: 'moon_tea', dislike: ['meat_stew', 'knight_feast'], react: {
      perfect: [{ text: '…나쁘지 않아. 아니, 딱 맞아. 어떻게 알았지?', face: 'shy' }, { text: '…마음에 들어. 다음에도 이걸로 줘. …아니, 다른 거라도 괜찮고.', face: 'shy' }],
      good:    [{ text: '…마실 만해. 평범하지만.', face: 'normal' }, { text: '…그럭저럭이네. 불평은 안 할게.', face: 'normal' }],
      fail:    [{ text: '…내가 말한 건 이게 아니었어.', face: 'angry' }, { text: '…다음엔 주문을 제대로 들어.', face: 'angry' }],
      mystery: [{ text: '…뭘 넣었어? 마력 반응이 이상한데. …마시고는 있지만.', face: 'surprised' }, { text: '{dish}? 이름을 짓는 건 자유지만, 마력 계통이 어긋났어. …흥미롭긴 해.', face: 'surprised' }, { text: '…쓰다 달다 시다 다 해. 어떻게 만든 거야, 이거.', face: 'surprised' }],
      fav: [{ text: '…!', face: 'surprised' }, { text: '이 맛… 스승님이 만들어 주시던… 어떻게 알았어?', face: 'surprised' }, { text: '…달고, 시원하고. 한 방울도 안 남길 거야. 이건 비밀로 해 줘.', face: 'shy' }, { text: '…고마워. 정말로.', face: 'smile' }],
      hate: [{ text: '…고기 냄새. 치워.', face: 'angry' }, { text: '엘프에게 고기를 먹이다니. 일부러지?', face: 'angry' }]
    } },
    kaela: { heroine: true, fav: 'knight_feast', dislike: ['herb_tea', 'mushroom_soup'], react: {
      perfect: [{ text: '하하하! 영웅의 입맛에 딱이다! 일류 주점 요리사 감이다, 주인장!', face: 'smile' }, { text: '이거면 오우거 세 마리는 더 벨 수 있겠다! …일단 두 마리 정도?', face: 'smile' }],
      good:    [{ text: '음, 괜찮군! 영웅은 음식을 가리지 않는다!', face: 'smile' }, { text: '나쁘지 않다! …조금 더 많았으면 더 좋았겠지만!', face: 'normal' }],
      fail:    [{ text: '으, 으음… 영웅은 이 정도로 쓰러지지 않는다…!', face: 'sad' }, { text: '이, 이건 적의 독인가!? …주인장의 요리였군.', face: 'surprised' }],
      mystery: [{ text: '이 정체불명의 맛… 새로운 강적이군!', face: 'surprised' }, { text: '{dish}? 이름만 들어도 강해 보인다! …맛은 약해 보이지만.', face: 'surprised' }, { text: '으음…? 이 몸이 모르는 맛이 있다니! 마시자!', face: 'smile' }],
      fav: [{ text: '…!! 이, 이 냄새는! 왕도 주점에서 먹은 그…!', face: 'surprised' }, { text: '시험에 떨어지고 울면서 먹었던 그 맛이다. 그때 처음으로 \'다음엔 붙자\'고 생각했었지.', face: 'shy' }, { text: '주인장… 고맙다. 오늘 일은 평생 잊지 않겠다!', face: 'smile' }],
      hate: [{ text: '으, 이, 이 풀 맛은…! 영웅은 쓴 풀과는 상극이다!', face: 'surprised' }, { text: '…농담이지, 주인장? 이건 약이지 요리가 아니지 않느냐!', face: 'sad' }]
    } },
    miho: { heroine: true, fav: 'fox_toast', dislike: ['herb_ale', 'herb_roast'], react: {
      perfect: [{ text: '우와, 이거 돈 받아도 되는 맛인데요? 아, 이미 받고 있었지!', face: 'smile' }, { text: '사장님, 이 메뉴 팔아요! 제가 영업할게요! 수수료는 3할!', face: 'smile' }],
      good:    [{ text: '음~ 가성비는 보통? 팁은 보통만 드릴게요.', face: 'normal' }, { text: '먹을 만해요! 남기진 않을게요, 아까우니까!', face: 'smile' }],
      fail:    [{ text: '이게 이 가격이라고요? 가성비 최악이에요!', face: 'angry' }, { text: '으으, 돈 아까워… 그래도 남기진 않을 거예요.', face: 'sad' }],
      mystery: [{ text: '이거 어디서 훔쳐… 아니, 어디서 구해 온 거예요? 처음 보는 맛인데요.', face: 'surprised' }, { text: '{dish}…? 이름 붙이면 비싸게 팔 수 있겠는데요? 일단 한 모금!', face: 'smile' }, { text: '윽, 이상해요! …근데 이상해서 또 마시고 싶어요!', face: 'surprised' }],
      fav: [{ text: '……어?', face: 'surprised' }, { text: '이거… 보육원에서 겨울마다 아이들이랑 나눠 먹던 그… 꿀버섯 빵이잖아요…', face: 'sad' }, { text: '…돈 안 받아도 되겠다, 이건. 제가 돈 얘기 안 하는 거 처음 보죠? 헤헤… 고마워요, 사장님.', face: 'shy' }],
      hate: [{ text: '윽, 쓴 맛! 돈 내고 쓴 걸 마시라고요?!', face: 'angry' }, { text: '사장님, 이건 사기예요! 저보다 악질이에요!', face: 'angry' }]
    } },
    lia: { heroine: true, fav: 'honey_milk', dislike: ['ale_bread', 'fire_water'], react: {
      perfect: [{ text: '우와, 딱 내가 원하던 거야! 어떻게 알았어?', face: 'smile' }, { text: '…역시 너는 나를 잘 알아. 다행이다.', face: 'shy' }],
      good:    [{ text: '응, 맛있어! 고마워.', face: 'smile' }, { text: '조금 아쉽지만 정성이 느껴져서 좋아.', face: 'normal' }],
      fail:    [{ text: '…아, 응. 괜찮아. 맛있어. …괜찮아.', face: 'sad' }, { text: '…다음엔 내 말 좀 더 잘 들어 줘. 으응, 삐진 건 아니고.', face: 'sad' }],
      mystery: [{ text: '이, 이건 뭐야? 성수보다 위험한 냄새가 나는데…', face: 'surprised' }, { text: '{dish}? 기도해야 하나…? 일단 신께 감사부터!', face: 'surprised' }, { text: '…독은 아니지? 그치? 믿을게…!', face: 'surprised' }],
      fav: [{ text: '……이거…', face: 'surprised' }, { text: '어릴 때 아버님이 몰래 끓여 주시던 그 꿀술 우유야. 내가 울 때마다…', face: 'shy' }, { text: '…기억해 준 거야? 바보… 눈물 날 것 같잖아.', face: 'smile' }],
      hate: [{ text: '이, 이건 술이잖아! 수습 성직자가 이런 걸 마시면 큰일 나!', face: 'surprised' }, { text: '…술 냄새. 나, 이건 못 마셔. 알면서…', face: 'sad' }]
    } }
  },

  // ---------- 일차별 손님 목록 ----------
  //  who      : 손님 id (story/characters.js 의 캐릭터 id, 위 customers 에 정의)
  //  say      : 등장 대사. 문자열(= 손님이 말함) / {text, face, who} / 명령 객체({narr:'...'} 등)
  //  order    : 주문. text(손님이 하는 말), want(원하는 태그 전부), avoid(싫어하는 태그)
  //  perfect / good / fail / mystery : 이 손님만의 반응 대사 (없으면 customers 의 기본 반응). 문자열 또는 배열
  //  after    : 반응 뒤에 이어 붙는 대사 (줄거리 전달용)
  //  gain     : { learn:'레시피id', on:['perfect','good'], lines:[...] } 결과가 on 에 들면 레시피 해금 + 대사
  //  if       : 조건식을 만족할 때만 등장 (예: 'tavern.upg.sign' = 간판 업그레이드가 있을 때만)
  days: {

    // ---------- 1일차: 손님 셋과 영업 첫날 ----------
    day1: { bg: 'inn_evening', customers: [
      { who: 'baron',
        say: [{ text: '어이, 주인장. 아버님 대신 가게를 지킨다더니, 소문이 사실이었구먼.', face: 'smile' }, '양 몰이를 마치고 오는 길인데, 이 늙은 몸이 오늘따라 으슬으슬하네.'],
        order: { text: '속이 풀리는 따뜻한 걸로 한 잔 주게나.', want: ['따뜻함'] },
        after: [{ text: '그나저나 요즘 뒷산 쪽에서 밤마다 푸른 빛이 보이더구먼. …양이 세 마리나 사라졌지 뭔가.', face: 'sad' }] },
      { who: 'kaela',
        say: [{ text: '주인장! 영웅이 왔다! 첫 영업이라고 들었다. 이 몸이 첫 손님이 되어 주마!', face: 'smile' }, { text: '왕도에 갔을 때 먹은 요리가 아직도 잊히지 않는다. 든든하고, 독하고, 뜨거웠지! …이름은 모르겠다!', face: 'normal' }],
        order: { text: '오늘은 배가 터지도록 든든한 걸로! 술도 곁들여서 말이다!', want: ['든든함', '독함'] } },
      { who: 'erion',
        say: [{ text: '…방이 시끄러워서 내려왔어. 저녁은 먹어야 하니까.', face: 'normal' }, { text: '고기 냄새는 질색이야. 숲의 것이 아니면 입에 안 대.', face: 'angry' }],
        order: { text: '…따뜻한 걸로. 달지 않은 걸로. 향이 너무 진하면 안 마셔.', want: ['따뜻함'], avoid: ['달콤함'] } },
      { who: 'miho',
        say: [{ text: '사장님~ 저 오늘은 손님이에요! 계산은… 나중에요! 아니, 농담이고요!', face: 'smile' }, { text: '아, 쓴 건 안 마셔요. 돈 내고 쓴 걸 왜 마셔요, 인생이 쓴데!', face: 'normal' }],
        order: { text: '달달하고 배도 든든히 채우는 걸로요! 제일 남는 장사 되는 걸로!', want: ['달콤함', '든든함'] } },
      { who: 'fin', if: 'tavern.upg.sign',
        say: [{ text: '저, 저기… 청년단 순찰 중인데요. 목이 말라서요!', face: 'surprised' }],
        order: { text: '입안이 개운해지는 걸로 주세요!', want: ['상쾌함'] } }
    ] },

    // ---------- 2일차: 저장고 습격 전의 저녁 ----------
    day2: { bg: 'inn_evening', customers: [
      { who: 'tobi',
        say: [{ text: '어이쿠, 여기가 소문의 은빛 여우관! 저는 행상인 토비라고 합니다. 이 마을은 처음이죠.', face: 'smile' }, { text: '동굴 근처엔 촌장님이 접근 금지령을 내릴 모양이던데요. 장사에는 최악이지만, 정보에는 최고입니다!', face: 'normal' }],
        order: { text: '정신이 번쩍 들면서 입안이 개운한 걸로! 술은 약하게 취할 만큼만요.', want: ['독함', '상쾌함'] },
        gain: { learn: 'herb_roast', on: ['perfect', 'good'], lines: [{ text: '비법 하나 알려 드리죠. 고기에 허브를 문질러 구우면 든든한데 개운합니다. 장터에서도 잘 팔리는 메뉴죠.', face: 'smile' }] } },
      { who: 'baron',
        say: [{ text: '어제 그 푸른 빛 때문에 우물이 마르고 말이야. 양들이 놀라서 날뛰고, 노인네는 잠도 못 자네.', face: 'sad' }],
        order: { text: '든든하게 속을 데워 주는 걸로. 오늘은 좀 많이 먹겠네.', want: ['따뜻함', '든든함'] },
        gain: { learn: 'mushroom_soup', on: ['perfect', 'good'], lines: [{ text: '이건 우리 할멈이 끓여 주던 건데… 버섯을 우유에 푹 끓이면 속이 편해지지. 자네한테 알려 주겠네.', face: 'smile' }] } },
      { who: 'lia',
        say: [{ text: '저, 저도 손님이야! 오늘만 특별히 앞치마 벗고! …근데 어쩐지 어색하네.', face: 'shy' }, { text: '어릴 때부터 몸이 차가울 때마다 마시던 게 있어. 따뜻하고 달콤한 거… 이름은 비밀!', face: 'smile' }],
        order: { text: '속이 편하고 따뜻한 걸로. 술은 안 돼!', want: ['따뜻함'], avoid: ['독함'] } },
      { who: 'kaela',
        say: [{ text: '하하! 오늘 아침에 뒷산을 정찰하다가 길을 잃었다! …전략적 우회였다!', face: 'smile' }, { text: '아, 풀 냄새 나는 차는 안 마신다. 영웅의 코는 풀과 상극이다!', face: 'angry' }],
        order: { text: '정찰 뒤에는 독한 한 잔이다! 기운 나는 걸로 부탁한다!', want: ['독함'] } },
      { who: 'erion',
        say: [{ text: '…저장고 쪽 기운이 이상해. 오늘 밤은 조심해.', face: 'normal' }, { text: '…달고, 시원하고, 마시면 마력이 도는 맛. 그런 게 옛날에 있었어. …아무것도 아니야. 혼잣말이야.', face: 'sad' }],
        order: { text: '…머리가 맑아지는 걸로. 술은 빼고.', want: ['상쾌함'], avoid: ['독함'] } },
      { who: 'marta', if: 'tavern.upg.sign',
        say: ['어머나, 저녁 장사를 한다고 해서 와 봤어요. 꿀빵 같은 건 없나요?'],
        order: { text: '달콤한 걸로 한 잔 주세요. 아기자기하게요.', want: ['달콤함'] } }
    ] },

    // ---------- 3일차: 달맞이 장터 노점 ----------
    day3: { bg: 'square_festival', customers: [
      { who: 'greta',
        say: [{ text: '이봐, 젊은 주인. 장터 노점에서 이런 가게를 하는 건 처음 봤네. 간판이 마음에 들어.', face: 'smile' }, { text: '20년 용병 밥을 먹었지만, 이 마을 분위기는 오랜만이야. 전쟁 전의 고요함 같달까.', face: 'normal' }],
        order: { text: '목구멍이 타는 독한 한 잔에 배를 채울 걸로!', want: ['독함', '든든함'] },
        gain: { learn: 'fire_water', on: ['perfect', 'good'], lines: [{ text: '답례로 용병 비법을 하나 알려 주지. 에일에 꿀술을 섞어 데우면 몸이 달아오르지. 전투 전에 마시면 딱이야.', face: 'smile' }] } },
      { who: 'marta',
        say: ['달맞이 장터는 일 년에 한 번인데, 올해는 어째 분위기가 가라앉았지 뭐예요.', '그래도 꿀빵 냄새가 나니 반가워서요. 아이들이 줄 서 있는 거 봤어요?'],
        order: { text: '달콤하고 든든한 꿀빵 같은 거 있어요?', want: ['달콤함', '든든함'] } },
      { who: 'kaela',
        say: [{ text: '과녁 맞히기에서 주인 아저씨 모자를 날렸다! 사과하러 가기 전에 든든히 먹어 둬야겠다!', face: 'smile' }],
        order: { text: '든든하고 뜨끈한 걸로! 사과는 그다음이다!', want: ['든든함', '따뜻함'] } },
      { who: 'miho',
        say: [{ text: '사장님! 장터 정찰 결과 보고드립니다. 우리 노점이 제일 싸요! …아, 그건 좋은 건가?', face: 'smile' }, { text: '고향 생각이 나네요. 겨울에 아이들이랑 먹던 거… 달고 든든하고 따끈한 거요. 이름은 잊었지만요.', face: 'sad' }],
        order: { text: '달달한 거요! 단, 술은 안 돼요. 돈 아까워요!', want: ['달콤함'], avoid: ['독함'] } },
      { who: 'lia',
        say: [{ text: '장터 노점이라니, 너무 설레! 앞치마 입고 있는 모습이 어릴 때 소꿉놀이 같아.', face: 'smile' }],
        order: { text: '축제니까 달콤하고 따뜻한 걸로! 술은 안 돼!', want: ['달콤함', '따뜻함'], avoid: ['독함'] } },
      { who: 'baron', if: 'tavern.upg.sign',
        say: ['달맞이 장터구먼. 이 노인네도 한 잔 하지.'],
        order: { text: '따뜻한 걸로 한 잔 주게.', want: ['따뜻함'] } }
    ] },

    // ---------- 4일차: 마지막 평화로운 저녁 ----------
    day4: { bg: 'inn_evening', customers: [
      { who: 'greta',
        say: [{ text: '마을 사람들이 짐을 싸고 있더군. 나는 반대로 오늘 칼을 갈았네. 이 마을이 마음에 들어서.', face: 'normal' }],
        order: { text: '싸움 전의 한 잔이야. 독하고, 속을 데워 주는 걸로.', want: ['독함', '따뜻함'] } },
      { who: 'fin',
        say: [{ text: '사장님, 청년단은 오늘 밤 동굴 앞 경계를 섭니다! 무섭지만… 마을을 지켜야죠!', face: 'normal' }],
        order: { text: '든든하게 배를 채우고 싶은데, 야간 경계라 술은 안 됩니다!', want: ['든든함'], avoid: ['독함'] } },
      { who: 'erion',
        say: [{ text: '…이번이 마지막 평범한 저녁일지도 몰라. 평범한 걸 마셔 두고 싶어서 내려왔어.', face: 'sad' }],
        order: { text: '…마력이 맑아지는 걸로. 달아도, 달지 않아도 상관없어.', want: ['마법', '상쾌함'] } },
      { who: 'miho',
        say: [{ text: '사장님, 오늘은 장사 접고 도망칠 준비 안 해요? …농담이에요. 이번엔 도망 안 가요.', face: 'smile' }],
        order: { text: '배불리! 몸이 확 달아오르는 걸로요!', want: ['든든함', '따뜻함'] } },
      { who: 'lia',
        say: [{ text: '…오늘은 계속 네 얼굴만 보게 돼. 내일이 무서워서 그런가 봐.', face: 'sad' }],
        order: { text: '…마음이 따뜻해지는 걸로. 술은 빼고.', want: ['따뜻함'], avoid: ['독함'] } },
      { who: 'tobi', if: 'tavern.upg.sign',
        say: [{ text: '장사꾼은 위기에 더 눈이 밝습니다. 오늘 여기 들른 게 제 최고의 투자였죠!', face: 'smile' }],
        order: { text: '든든한데 입안은 개운한 걸로요! 계산은 확실하게!', want: ['든든함', '상쾌함'] } }
    ] },

    // ---------- 5일차: 출정 전 마지막 영업 ----------
    day5: { bg: 'inn_evening', customers: [
      { who: 'chief',
        say: [{ text: '자네가 마을 사람들을 이렇게까지 돌봐 줄 줄은 몰랐네. 고맙네.', face: 'smile' }],
        order: { text: '마음이 놓이는 따뜻하고 든든한 걸로. 오늘만은 호사를 부리고 싶구먼.', want: ['따뜻함', '든든함'] } },
      { who: 'erion',
        say: [{ text: '…책이 계속 울어. 해 질 녘이야. …마지막으로, 맛있는 걸 마시고 싶어.', face: 'sad' }],
        order: { text: '…달고 시원한 걸로. 마지막이니까, 달아도 돼.', want: ['달콤함', '상쾌함'] } },
      { who: 'kaela',
        say: [{ text: '결전 전에는 든든히 먹는 법이다! 영웅의 철칙이다!', face: 'smile' }],
        order: { text: '든든하고 독하고 뜨거운 걸로! 이 몸의 마지막 만찬… 아니, 결전 전 만찬이다!', want: ['든든함', '독함'] } },
      { who: 'miho',
        say: [{ text: '사장님, 외상은 이번이 마지막이에요. …돌아오면 이자 포함해서 갚을게요.', face: 'smile' }],
        order: { text: '달고 든든한 걸로요. 기운 나는 걸로!', want: ['달콤함', '든든함'] } },
      { who: 'lia',
        say: [{ text: '…떨려. 오늘 무슨 일이 있어도 네 곁에 있을 거야.', face: 'shy' }],
        order: { text: '따뜻하고 달콤한 걸로. 마음이 놓이게.', want: ['따뜻함', '달콤함'], avoid: ['독함'] } },
      { who: 'marta', if: 'tavern.upg.sign',
        say: ['모두가 큰일을 앞두고 있네요. 나도 한 잔 보태러 왔어요.'],
        order: { text: '따뜻한 걸로 한 잔 주세요.', want: ['따뜻함'] } }
    ] }
  }
};

// 시작 변수에 영업 상태를 넣는다 (STORY.init 은 story/common.js 에 있고, 이 파일이 그 뒤에 로드됨)
//  tavern.perfect / good / fail / mystery = 지금까지 낸 요리 결과 횟수 (스토리 조건식에서 쓸 수 있음. 예: 'tavern.perfect>=4')
//  tavern.t.perfect ... = 가장 최근 영업의 결과 횟수, tavern.fav.<히로인id> = 최애 메뉴를 낸 횟수
//  tavern.known.<레시피id> = 아는 레시피, tavern.upg.<업그레이드id> = 구매한 업그레이드, tavern.stock.<재료id> = 재고
STORY.init.tavern = {
  perfect: 0, good: 0, fail: 0, mystery: 0, served: 0, skipped: 0, sales: 0, tips: 0,
  t: { perfect: 0, good: 0, fail: 0, mystery: 0 },
  stock: JSON.parse(JSON.stringify(TAVERN.start.stock)),
  known: (function () { var k = {}; Object.keys(TAVERN.recipes).forEach(function (id) { if (TAVERN.recipes[id].basic) k[id] = true; }); return k; })(),
  upg: {}, fav: {}, days: {}
};
