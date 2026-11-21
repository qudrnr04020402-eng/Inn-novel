// ============================================================
//  2일차 — 저장고에서 스며 나온 그림자
//  아침(마을 소문 + 경영 선택) -> 낮(히로인 이벤트 2) -> 저녁(지하 저장고 습격) -> 밤(호감도 높은 히로인 방문)
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 아침 =================
  d2_open: [
    { day: 2, time: '아침', tip: '호감도가 높아지면\n밤에 몰래 찾아오는 사람이 생길지도 몰라요.' },
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '어젯밤의 진동은 마을 전체를 술렁이게 했다. 식당은 아침부터 사람들로 북적인다. 손님 셋은 이미 자리에 앉아 있다.' },
    { show: 'kaela', face: 'smile', pos: 'left' },
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'miho', text: '사장님 사장님, 들었어요? 어젯밤 진동 때문에 마을 우물이 말랐다는 집도 있고, 닭이 알을 안 낳는대요. 뭐, 후자는 제 알 바 아니지만요.' },
    { say: 'kaela', text: '흠! 수상한 기운이다! 이 몸이 직접 조사에 나서겠다. 마을의 평화는 붉은 사자가 지킨다!' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { say: 'lia', text: '그, 그러기 전에 촌장님께 먼저 허락을 받아야지. 동굴 쪽은 신전에서도 함부로 가지 말라고 하는 곳이야.' },
    { narr: '어느새 에리온은 보이지 않았다. 식탁 위에는 비운 찻잔과, 은화 한 닢이 놓여 있었다. 찻값치고는 너무 많다.' },
    { choice: [
      { text: '"카엘라가 앞장서 주면 든든하죠. 촌장님께는 제가 말씀드려 볼게요."', set: { 'aff.kaela': 1, rep: 1 }, goto: 'd2_open_kaela' },
      { text: '"위험하니 먼저 정보부터 모아 봐요. 미호, 부탁해도 될까요?"', set: { 'aff.miho': 1 }, goto: 'd2_open_miho' },
      { text: '"신전 쪽 기록이 있을지도 몰라요. 리아, 같이 찾아봐 줄래요?"', set: { 'aff.lia': 1 }, goto: 'd2_open_lia' }
    ] }
  ],
  d2_open_kaela: [
    { say: 'kaela', face: 'smile', text: '하하! 역시 말이 통하는군, 주인장! 조사대 대장 카엘라, 출동이다!' },
    { say: 'lia', face: 'normal', text: '…대장은 촌장님이 정하시는 건데.' },
    { goto: 'd2_open_meal' }
  ],
  d2_open_miho: [
    { say: 'miho', face: 'surprised', text: '제가 부탁받다니, 이거 처음이에요. …정보 수수료는 사장님 특별 할인 가격으로 해 드릴게요. 무료는 아니고요.' },
    { goto: 'd2_open_meal' }
  ],
  d2_open_lia: [
    { say: 'lia', face: 'smile', text: '응! 신전 서고에 오래된 지도가 있었을 거야. 나중에 찾아볼게. 너랑 같이 책 뒤지는 것도 오랜만이다.' },
    { goto: 'd2_open_meal' }
  ],
  d2_open_meal: [
    { narr: '북적이는 식당을 둘러보니 손님이 평소보다 많다. 소문을 듣고 마을 사람들이 정보를 얻으러 들른 모양이다. 이럴 때 어떻게 하느냐에 따라 여관의 평판이 달라질 것이다.' },
    { choice: [
      { text: '마을 사람들에게도 따뜻한 수프를 내놓는다 (15G)', cost: 15, set: { rep: 2 }, goto: 'd2_meal_free' },
      { text: '평소처럼 장사한다. 오늘은 매출이 짭짤하다', set: { gold: 12 }, goto: 'd2_meal_normal' },
      { text: '"불안할 때 먹는 수프는 특별합니다." 값을 두 배로 받는다', set: { gold: 25, rep: -1 }, goto: 'd2_meal_greedy' }
    ] }
  ],
  d2_meal_free: [
    { narr: '"여관 주인이 인심이 좋네." 수프를 받아 든 마을 사람들의 표정이 풀렸다. 은빛 여우관의 이름이 조금씩 입에 오르내린다.' },
    { goto: 'd2_pick' }
  ],
  d2_meal_normal: [
    { narr: '평소의 아침 장사. 금고에 동전이 조금 쌓였다. 무난한 하루의 시작이다.' },
    { goto: 'd2_pick' }
  ],
  d2_meal_greedy: [
    { narr: '금고는 두둑해졌지만, 구석에서 "저 여관 주인 너무하네" 하는 속삭임이 들렸다. 미호가 엄지를 척 들어 올린다. 칭찬이 아니라 동업자의 인정이다.' },
    { goto: 'd2_pick' }
  ],

  // ================= 낮 =================
  d2_pick: [
    { time: '낮' }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '아침 장사가 끝나고 잠깐 틈이 났다. 오늘 오후는 누구와 시간을 보낼까?' },
    { goto: 'pick' }
  ],

  // ----- 에리온 2: 꿀케이크 -----
  erion_2: [
    { set: { 'ev.erion': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '식당 한쪽, 에리온이 주방 앞을 서성인다. 오늘의 후식은 갓 구운 꿀케이크. 그녀의 시선은 케이크 접시에 못 박혀 있다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…뭘 봐. 난 단 거 안 좋아해.' },
    { narr: '말하는 동안에도 시선은 케이크 위에 있다. 침 삼키는 소리가 났다. 아마도.' },
    { choice: [
      { text: '꿀케이크 한 조각을 말없이 앞에 놓아 준다', set: { 'aff.erion': 1 }, goto: 'erion_2_give' },
      { text: '"단 거 싫어하시죠? 그럼 제가 다 먹을게요."', set: { 'aff.erion': 2 }, goto: 'erion_2_tease' },
      { text: '특제 꿀시럽을 듬뿍 얹은 케이크를 내민다 (8G)', cost: 8, set: { 'aff.erion': 2 }, goto: 'erion_2_syrup' },
      { text: '"어떤 단 걸 좋아해요?" 하고 물어본다', set: { 'aff.erion': 1 }, goto: 'erion_2_ask' }
    ] }
  ],
  erion_2_give: [
    { say: 'erion', face: 'shy', text: '…주는 거니까 받는 거야. 예의상.' },
    { narr: '포크가 케이크를 한 입 크게 떴다. 그리고 그녀는 아주 잠깐, 얼굴이 풀어지게 웃었다. 곧 정색했지만 이미 봤다.' },
    { goto: 'after_pick' }
  ],
  erion_2_tease: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…잠깐.' },
    { show: 'erion', face: 'angry' },
    { say: 'erion', text: '누가 안 먹는대! 그건 내 거야!' },
    { narr: '손이 번개처럼 나와 접시를 가로챘다. 그리고 에리온은 자기가 한 말에 놀라 귀 끝까지 새빨개졌다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…잊어. 지금 일은 전부 잊어. 안 잊으면 얼려 버릴 거야.' },
    { goto: 'after_pick' }
  ],
  erion_2_syrup: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '이, 이 윤기… 별꽃 꿀이잖아? 이런 걸 어디서…' },
    { narr: '한 입 먹은 에리온의 어깨가 파르르 떨렸다. 눈가가 조금 촉촉해 보이는 건 기분 탓일까.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…숲의 맛이 나. 오랜만이야. 정말 오랜만이야.' },
    { goto: 'after_pick' }
  ],
  erion_2_ask: [
    { say: 'erion', face: 'normal', text: '…별꽃 꿀. 엘프의 숲에서만 나는 건데, 달고, 약간 시원한 맛이 나. 옛날에는 스승님이 만들어 주셨어.' },
    { show: 'erion', face: 'sad' },
    { say: 'erion', text: '…이제는 먹을 수 없지만. 아니, 뭐. 딱히 그립다는 건 아니야.' },
    { narr: '말끝이 조금 흔들렸다. 그것이 오래된 이야기라는 것만은 알 수 있었다.' },
    { goto: 'after_pick' }
  ],

  // ----- 카엘라 2: 아이들과 무용담 -----
  kaela_2: [
    { set: { 'ev.kaela': 1 } }, { bg: 'square_day' }, { hide: 'all' },
    { narr: '마을 광장 분수 앞. 아이들 한 무더기가 카엘라를 빙 둘러싸고 있다.' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '그때 오우거의 방망이가 내 머리 위로 떨어졌다! 나는 한 치의 두려움도 없이 이 대검으로…!' },
    { narr: '아이 한 명이 손을 번쩍 들었다. "누나, 오늘 아침에도 여관 문에 이마 부딪혔잖아!"' },
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '그, 그건 문이 적이었던 거다! 아니, 문이 낮았던 거다!' },
    { choice: [
      { text: '(곁에서 "그다음엔요?" 하고 진심으로 귀를 기울인다)', set: { 'aff.kaela': 2 }, goto: 'kaela_2_listen' },
      { text: '"얘들아, 간식 먹을 시간이야!" 하고 사탕을 나눠 준다 (5G)', cost: 5, set: { 'aff.kaela': 1, rep: 1 }, goto: 'kaela_2_candy' },
      { text: '"맞아, 오늘 아침에도 문틀에 이마를 부딪혔지." 하고 맞장구친다', set: { 'aff.kaela': -1 }, goto: 'kaela_2_expose' }
    ] }
  ],
  kaela_2_listen: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…다음? 다음 말이냐?' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '으음, 좋다! 그다음엔 말이다, 어둠 속에서 오우거의 눈이 붉게 빛나는데…' },
    { narr: '이야기는 점점 과장됐지만, 카엘라의 목소리는 어느새 아까보다 훨씬 신나 있었다. 아이들도 눈이 반짝였다.' },
    { say: 'kaela', face: 'shy', text: '…주인장, 고맙다. 이렇게 끝까지 들어 준 건 처음이다. 아이들 말고는.' },
    { goto: 'after_pick' }
  ],
  kaela_2_candy: [
    { narr: '아이들이 환호하며 사탕으로 몰려들었다. 카엘라의 무용담은 갑자기 인기가 뚝 떨어졌다.' },
    { show: 'kaela', face: 'sad' },
    { say: 'kaela', text: '…내 이야기보다 사탕이 낫다는 건가. 억울하군. 하지만 아이들이 웃으니 됐다!' },
    { goto: 'after_pick' }
  ],
  kaela_2_expose: [
    { narr: '아이들이 까르르 웃음을 터뜨렸다. 카엘라의 얼굴이 순식간에 붉어졌다.' },
    { show: 'kaela', face: 'angry' },
    { say: 'kaela', text: '주, 주인장! 영웅의 체면을 이렇게 깎다니! 오늘 밤 식사에서 고기 한 점 줄 거다!' },
    { narr: '진짜로 화난 건 아닌 것 같은데, 눈가가 조금 젖어 있었다. 아차 싶었다.' },
    { goto: 'after_pick' }
  ],

  // ----- 미호 2: 창고 장부 -----
  miho_2: [
    { set: { 'ev.miho': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '식료품 창고 구석에서 미호가 장부에 무언가를 적고 있다. 동전을 쌓고 세는 손놀림이 눈으로 따라가기 힘들 만큼 빠르다.' },
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '꺄악! 사장님, 노크! …창고에 노크하는 사람이 어딨냐고요? 아무튼요!' },
    { narr: '미호가 장부를 등 뒤로 감췄다. 꼬리가 비밀을 모조리 불고 있다. 부풀어서 사방으로 뻗쳐 있다.' },
    { say: 'miho', face: 'smile', text: '이건 그냥 재고 관리! 도둑질 안 했다는 증거예요!' },
    { choice: [
      { text: '"무슨 장부인데요?" 하고 가볍게 묻는다', set: { 'aff.miho': 1 }, goto: 'miho_2_ask' },
      { text: '(몰래 장부를 훔쳐본다)', set: { 'aff.miho': -1, 'flag.miho_peeked': true }, goto: 'miho_2_peek' },
      { text: '"일하는 만큼 수당 줄게요." 5골드를 쥐어 준다', cost: 5, set: { 'aff.miho': 2 }, goto: 'miho_2_pay' },
      { text: '"세는 속도가 대단하네요. 여관 장부 정리 좀 도와줄래요?"', set: { 'aff.miho': 2, gold: 8 }, goto: 'miho_2_help' }
    ] }
  ],
  miho_2_ask: [
    { say: 'miho', face: 'normal', text: '…비밀이에요. 아직은요.' },
    { say: 'miho', face: 'smile', text: '하지만 사장님이라면 나중에 알려 드릴게요. …어쩌면요. 그때까지는 이 정보값 비싸니까 조심하세요!' },
    { goto: 'after_pick' }
  ],
  miho_2_peek: [
    { say: 'miho', face: 'angry', text: '지금 뭐 하는 거예요!? 남의 장부를 훔쳐보는 건 도둑이나 하는 짓이거든요!' },
    { narr: '미호가 장부를 홱 낚아채 갔다. 아주 잠깐 보인 페이지에는 숫자가 빼곡했고, 맨 위에 서툰 글씨로 \'아이들 몫\'이라고 적혀 있었다.' },
    { say: 'miho', face: 'sad', text: '…못 본 걸로 해 줘요. 부탁이에요.' },
    { goto: 'after_pick' }
  ],
  miho_2_pay: [
    { say: 'miho', face: 'surprised', text: '5골드! 현금! 선불! 사장님 지금 저한테 반한 거죠? …농담이에요. 반은 진심이지만.' },
    { say: 'miho', face: 'smile', text: '좋아요, 오늘은 특별 서비스로 창고 정리 싹 해 드릴게요. 아, 소매에 들어가는 건 보너스로 치겠습니다. …농담이라니까요?' },
    { goto: 'after_pick' }
  ],
  miho_2_help: [
    { narr: '미호는 여관 장부를 후다닥 훑더니 안경이라도 쓴 것처럼 눈을 반짝였다.' },
    { say: 'miho', face: 'surprised', text: '사장님, 여기 계산이 틀렸어요. 지난달 매출이 8골드나 덜 적혀 있어요! 그리고 이 거래처, 매번 돈을 조금씩 덜 내고 있고요.' },
    { narr: '정말이었다. 장부가 단숨에 바로잡혔고 못 받은 8골드도 돌려받게 되었다. 도둑이 아니라 회계사를 했어야 할 아이다.' },
    { say: 'miho', face: 'smile', text: '헤헤, 이런 건 자신 있거든요. 사장님이 칭찬해 주니까 기분 좋네요.' },
    { goto: 'after_pick' }
  ],

  // ----- 리아 2: 물동이 -----
  lia_2: [
    { set: { 'ev.lia': 1 } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '우물에서 돌아오는 리아. 머리에 인 물동이가 너무 커서 걸음이 영 위태롭다.' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '괜찮아, 괜찮아! 이 정도는 신전에서 매일 하는… 어, 어어어?' },
    { fx: 'shake' },
    { narr: '돌부리에 발이 걸렸다. 나는 반사적으로 달려가 리아를 받아냈다. 물동이는 허공을 날아 둘 위로 쏟아졌다.' },
    { show: 'lia', face: 'surprised' },
    { narr: '…철퍼덕. 물을 뒤집어쓴 채 우리는 마당에 겹쳐 쓰러져 있었다. 눈앞 한 뼘 거리에 리아의 얼굴이 있다.' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '아…… 어…… 그, 그게……' },
    { choice: [
      { text: '"다친 데 없어? 물동이는 내가 들게."', set: { 'aff.lia': 1 }, goto: 'lia_2_care' },
      { text: '"…일단 일어나자. 너 지금 내 위에 있어."', set: { 'aff.lia': 1 }, goto: 'lia_2_up' },
      { text: '손을 잡아 일으켜 주며 "젖었네. 감기 걸리기 전에 불 쬐자."', set: { 'aff.lia': 2 }, goto: 'lia_2_warm' },
      { text: '"신전에서 매일 하던 거 맞아?" 하고 놀린다', set: { 'aff.lia': -1 }, goto: 'lia_2_tease' }
    ] }
  ],
  lia_2_care: [
    { say: 'lia', face: 'smile', text: '응, 나는 괜찮아. 넌? 어깨 다치지 않았어? 아까 꽤 세게 부딪혔잖아.' },
    { narr: '리아는 자기 걱정보다 내 걱정이 먼저다. 옛날부터 그랬다.' },
    { goto: 'after_pick' }
  ],
  lia_2_up: [
    { say: 'lia', face: 'shy', text: '미, 미안! 잠깐만, 지금 일어날게! 일어나려고 하는데 치마가 젖어서 무거워서…!' },
    { narr: '두 번쯤 허둥대다가 겨우 일어난 리아는 귀까지 빨개져 있었다. 나도 마찬가지였을 것이다.' },
    { goto: 'after_pick' }
  ],
  lia_2_warm: [
    { show: 'lia', face: 'surprised' },
    { say: 'lia', text: '……응.' },
    { narr: '리아의 손은 작고 따뜻했다. 부엌 화로 앞에 나란히 앉아 젖은 소매를 말리는 동안, 우리는 말없이 불꽃만 바라봤다.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '있잖아. 이렇게 같이 있으면, 어릴 때로 돌아간 것 같아. 하지만… 어릴 때보다 지금이 더 좋아.' },
    { goto: 'after_pick' }
  ],
  lia_2_tease: [
    { say: 'lia', face: 'angry', text: '놀리지 마! 이, 이건 사고였단 말이야!' },
    { narr: '리아가 물에 젖은 소매로 내 팔을 퍽 때렸다. 아팠다. 나는 그만 바보 같은 소리를 한 것을 후회했다.' },
    { goto: 'after_pick' }
  ],

  // ================= 저녁: 지하 저장고 =================
  d2_evening: [
    { time: '저녁' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '저녁 영업이 한창일 때였다. 부엌에서 접시를 닦던 리아가 하얗게 질린 얼굴로 뛰쳐나왔다.' },
    { show: 'lia', face: 'surprised', pos: 'center' },
    { say: 'lia', text: '저, 저장고에서 이상한 소리가 나! 사람 목소리도 아니고, 쥐도 아니야! 뭔가 질척거리는 소리야!' },
    { hide: 'all' },
    { bg: 'inn_night' },
    { narr: '손님들을 이끌고 지하 저장고로 내려갔다. 등불을 들이밀자 벽 한쪽이 쩍 갈라져 있었다. 그 틈에서 새까만 무언가가 꾸물꾸물 흘러나오는 중이다.' },
    { show: 'kaela', face: 'surprised', pos: 'left' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { show: 'miho', face: 'surprised', pos: 'right' },
    { say: 'miho', text: '으엑, 저게 뭐예요!? 끈적끈적한 그림자 덩어리가 움직여요!' },
    { say: 'erion', text: '…그림자 점액. 봉인 틈에서 스며 나오는 찌꺼기야.' },
    { say: 'kaela', face: 'smile', text: '적이다! 드디어 나의 진가를 보일 때가 왔군! 주인장, 누구에게 앞장을 맡길 거지!' },
    { narr: '그림자들이 몸을 부풀리며 서서히 다가온다. 시간이 없다. 누구에게 맡길까?' },
    { choice: [
      { who: 'kaela', text: '"카엘라, 앞장서 줘요!" 대검의 힘을 믿어 본다.', set: { 'aff.kaela': 2 }, goto: 'd2_ev_kaela' },
      { who: 'erion', text: '"에리온, 마법으로 처리해 줄 수 있어요?"', set: { 'aff.erion': 2 }, goto: 'd2_ev_erion' },
      { who: 'miho', text: '"미호, 뒤로 돌아가서 틈을 찾아봐요!"', set: { 'aff.miho': 2 }, goto: 'd2_ev_miho' },
      { who: 'lia', text: '"리아, 기도로 빛을 부탁해요. 눈을 뜨기 힘들게요."', set: { 'aff.lia': 2 }, goto: 'd2_ev_lia' }
    ] }
  ],
  d2_ev_kaela: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '맡겨라! 붉은 사자의 포효를 받아라!' },
    { fx: 'shake' },
    { narr: '카엘라가 대검을 휘두르자 그림자가 쩍 갈라졌다. 의외로 위력이 대단하다. …다만 휘두른 반동으로 옆에 있던 술통이 와르르 쓰러졌다.' },
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '으앗! 술통 속에 끼었다! 나가야 한다! 빼 줘라, 주인장!' },
    { narr: '술통에 몸이 끼어 허둥대는 카엘라와 그 옆에서 박수치는 미호. …그래도 그림자는 모두 없어졌다.' },
    { goto: 'd2_ev_after' }
  ],
  d2_ev_erion: [
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…비켜. 휘말리고 싶지 않으면.' },
    { narr: '에리온이 책을 펼치자 푸른 빛이 번졌다. 그녀의 손끝에서 흘러나온 서리의 선이 그림자를 단숨에 얼려 부쉈다.' },
    { say: 'erion', face: 'angry', text: '…이 정도 잔챙이는 문제가 안 돼. 문제는, 이게 끝이 아니라는 거지.' },
    { goto: 'd2_ev_after' }
  ],
  d2_ev_miho: [
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '맡겨 주세요, 사장님! 숨바꼭질은 제 전문이라고요!' },
    { narr: '미호는 그림자들 사이를 바람처럼 스쳐 벽 뒤로 돌아갔다. 곧 단검 자루 끝으로 갈라진 틈의 가장자리를 탁탁 두들기는 소리가 났다.' },
    { say: 'miho', face: 'surprised', text: '찾았다! 틈 안쪽에 오래된 돌 문양이 있어요! 이거, 비싸 보이는데요…?' },
    { say: 'erion', face: 'surprised', text: '…건드리지 마! 그건 봉인의 가장자리야!' },
    { goto: 'd2_ev_after' }
  ],
  d2_ev_lia: [
    { show: 'lia', face: 'normal' },
    { say: 'lia', text: '알았어! 모두 눈 감아! …빛이여, 어둠을 물리쳐 주세요!' },
    { fx: 'flash' },
    { narr: '눈부신 빛이 저장고를 가득 채웠다. 그림자들은 비명 같은 소리를 지르며 연기처럼 흩어졌다. 리아의 목소리가 이렇게 단단하게 울리는 건 처음 들었다.' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…어, 되, 됐어? 나 해낸 거야? 다리가 후들거려…' },
    { goto: 'd2_ev_after' }
  ],
  d2_ev_after: [
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…이제 말해 줘야겠네. 이 벽 너머는 오래전에 봉인된 곳이야. 그 봉인이 약해지고 있어.' },
    { say: 'erion', text: '이 상태로 가면 길어야 사흘. 사흘 뒤에는 틈이 완전히 열릴 거야.' },
    { narr: '사흘. 다시 말해, 5일차다. 모두가 숨을 죽였다.' },
    { narr: '당장 눈앞의 균열을 어떻게든 해야 한다. 이 여관은 내 집이고, 저장고는 여관의 심장이다.' },
    { choice: [
      { text: '석공을 불러 응급 보수를 한다 (20G)', cost: 20, set: { rep: 1 }, goto: 'd2_ev_mason' },
      { text: '"에리온, 임시로 봉인해 줄 수 있어요?"', set: { 'aff.erion': 1, 'flag.seal_patch': true }, goto: 'd2_ev_patch' },
      { text: '술통을 쌓아서 일단 틈을 막아 둔다', set: { rep: -1 }, goto: 'd2_ev_barrel' }
    ] }
  ],
  d2_ev_mason: [
    { narr: '급히 부른 석공이 밤새 벽을 메웠다. 돈은 들었지만 일단 안심이다. 마을 사람들 사이에서도 "그 여관, 일처리 확실하다"는 말이 돌았다.' },
    { goto: 'd2_ev_rumor' }
  ],
  d2_ev_patch: [
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…임시일 뿐이야. 하루도 못 버틸 수 있어. 하지만 네가 부탁한다면.' },
    { narr: '에리온이 손바닥을 벽에 대자 푸른 문양이 번졌다. 틈이 닫혔다. 그녀는 이마의 땀을 훔쳤다. 어딘가 힘들어 보인다.' },
    { goto: 'd2_ev_rumor' }
  ],
  d2_ev_barrel: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '술통 방어선이다! 이 몸의 지휘 아래 완벽한 방어 태세를 갖추었다!' },
    { narr: '솔직히 불안하기 짝이 없다. 하지만 지금 당장은 이게 최선이다. 손님 몇이 \'저장고에서 괴물이 나왔다더라\' 하며 방을 빼겠다고 한다.' },
    { goto: 'd2_ev_rumor' }
  ],
  d2_ev_rumor: [
    { hide: 'all' },
    { narr: '이번 일은 곧 마을에 알려질 것이다. 숨길 것인가, 알릴 것인가.' },
    { choice: [
      { text: '촌장님께 솔직하게 알린다', set: { rep: 1 }, goto: 'd2_ev_tell' },
      { text: '불안해할 테니 일단 조용히 덮어 둔다', set: { rep: -1, gold: 10 }, goto: 'd2_ev_hide' }
    ] }
  ],
  d2_ev_tell: [
    { narr: '촌장님은 놀라면서도 "사실대로 말해 줘서 고맙네" 하고 내 어깨를 두드렸다. 마을은 동굴 접근을 금지하고, 청년단이 경계를 서기로 했다.' },
    { goto: 'd2_night' }
  ],
  d2_ev_hide: [
    { narr: '숙박객 몇이 수상하다는 눈치를 줬지만 어떻게든 넘겼다. 대신 입막음 삼아 방값을 올려 받았다. 마음 한구석이 찜찜하다.' },
    { goto: 'd2_night' }
  ],

  // ================= 밤 =================
  d2_night: [
    { time: '밤' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '길고 긴 하루가 끝났다. 방 불을 끄려는데, 누군가 조용히 문을 두드렸다.' },
    { if: WIN('erion', 5), goto: 'd2_night_erion' },
    { if: WIN('kaela', 5), goto: 'd2_night_kaela' },
    { if: WIN('miho', 5), goto: 'd2_night_miho' },
    { if: WIN('lia', 5), goto: 'd2_night_lia' },
    { goto: 'd2_night_none' }
  ],
  d2_night_none: [
    { narr: '…바람 소리였던 모양이다. 문을 열어 봐도 복도에는 아무도 없었다.' },
    { narr: '이불 속에서 내일은 누구와 더 가까워질 수 있을까 생각하다가, 어느새 잠들었다.' },
    { goto: 'd3_open' }
  ],
  d2_night_erion: [
    { show: 'erion', face: 'shy', pos: 'center' },
    { say: 'erion', text: '…찻잔 돌려주러 왔어. 그뿐이야. 늦은 시간인 건 알아.' },
    { narr: '손에는 깨끗이 씻은 찻잔이 들려 있었다. 그런데 어쩐지 돌아갈 생각이 없어 보인다.' },
    { say: 'erion', text: '…오늘 일, 고마웠어. 나 혼자였다면 저장고를 지키지 못했을 거야. 내일도 같은 차, 부탁해.' },
    { set: { 'aff.erion': 1 } },
    { narr: '그녀가 돌아간 뒤에도 방에는 은은한 허브 향이 남았다.' },
    { goto: 'd3_open' }
  ],
  d2_night_kaela: [
    { show: 'kaela', face: 'shy', pos: 'center' },
    { say: 'kaela', text: '자, 자고 있었나, 주인장? 아니, 그, 영웅은 원래 밤에 수련하는 법이라…' },
    { say: 'kaela', face: 'sad', text: '…솔직히 말하면, 아까 저장고에서 조금 무서웠다. 영웅이 무서워하면 안 되는데. 잠이 안 와서 와 봤다.' },
    { narr: '대검을 안고 문 앞에 쭈그려 앉은 모습이 평소의 호탕함과 너무 달라서, 나도 모르게 따뜻한 우유를 한 잔 건넸다.' },
    { set: { 'aff.kaela': 1 } },
    { say: 'kaela', face: 'smile', text: '…고맙다. 이건 비밀이다. 알았지, 주인장?' },
    { goto: 'd3_open' }
  ],
  d2_night_miho: [
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '사장님~ 자요? 안 자죠? 불 켜져 있던데요.' },
    { narr: '미호가 문틈으로 얼굴만 쏙 내밀었다. 손에는 작은 주머니가 들려 있다.' },
    { say: 'miho', face: 'normal', text: '오늘 장부 정리해 준 수고비예요. 제 몫에서 3골드 떼 왔어요. …공짜 아니고 빚이에요, 빚. 나중에 이자 붙여서 받을 거예요.' },
    { set: { 'aff.miho': 1, gold: 3 } },
    { say: 'miho', face: 'shy', text: '…누가 이런 거 해 준 적 없어서요. 그냥 그렇다고요. 잘 자요!' },
    { goto: 'd3_open' }
  ],
  d2_night_lia: [
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '아직 안 자지? 따뜻한 우유 가져왔어. 오늘 많이 놀랐으니까 푹 자야 해.' },
    { narr: '리아는 잠옷 위에 숄을 걸친 채 쟁반을 들고 서 있었다. 어릴 때처럼 맨발로 올라온 모양이다.' },
    { say: 'lia', face: 'normal', text: '저장고에서 네가 앞에 서서 모두를 챙기는 거 봤어. …멋있었어. 아, 이상한 뜻 아니고!' },
    { set: { 'aff.lia': 1 } },
    { say: 'lia', face: 'shy', text: '잘 자. 그리고, 무리하지 마. 네가 쓰러지면 내가 곤란하니까.' },
    { goto: 'd3_open' }
  ]
});
