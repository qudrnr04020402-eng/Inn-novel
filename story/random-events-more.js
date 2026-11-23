// ============================================================
//  아침 랜덤 사건 장면 (추가분) — 연작 3종(음유시인 / 꼬마 요리사 콩이 / 새끼 여우) + 단발 사건 21종
//  - 데이터(주차/조건/가중치)는 story/random-events.js 의 RANDOM_EVENTS.events, 장면은 'rev_<id>' 입니다. 마지막은 {goto:'rev_end'}.
//  - 연작은 첫머리에서 {set:{'ser.<이름>':1}} 로 본 부 수를 올립니다. (사건 안에서 flag 는 못 바꿉니다: 영업/스토리 진행 보호)
//  - 효과는 소폭입니다: 골드 ±15, 평판 ±2, 호감도 0~2 증가, 비용 10G 이하 (check-story 가 검사).
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 연작: 떠돌이 음유시인 (1부는 random-events.js 의 rev_bard) =================
  rev_bard_2: [
    { bg: 'inn_day' }, { hide: 'all' }, { set: { 'ser.bard': 1 } },
    { narr: '아침 문을 열자 낯익은 류트 소리가 먼저 들어왔다. 낡은 외투의 음유시인이 모자를 벗고 서 있다. "기억하십니까? 지난번에 노래를 부른 떠돌이입니다. 새 노래를 지어 왔습니다."' },
    { narr: '가사 첫 줄이 이렇다. "은빛 여우의 간판 아래, 밥 냄새가 길을 가르쳐 주네." 은근히 중독성이 있다. 다만 두 번째 줄의 운율이 맞지 않는다.' },
    { choice: [
      { text: '"두 번째 줄은 이렇게 바꾸면 어때요?" 가사를 함께 고친다.', set: { rep: 1 }, goto: 'rev_bard_2_edit' },
      { text: '아침 한 끼를 대접하며 조용히 듣는다. (2G)', cost: 2, set: { rep: 1 }, goto: 'rev_bard_2_meal' },
      { text: '"바쁜 아침이라… 다음에 들을게요."', goto: 'rev_bard_2_no' }
    ] }
  ],
  rev_bard_2_edit: [
    { narr: '둘이 머리를 맞대고 "밥 냄새"를 "꿀 냄새"로, "가르쳐 주네"를 "불러 주네"로 바꿨다. 시인이 무릎을 탁 쳤다. "이거면 되겠습니다! 다음 마을에서 불러 보죠!"' },
    { goto: 'rev_end' }
  ],
  rev_bard_2_meal: [
    { narr: '시인은 수프를 후루룩 마시고 새 노래를 처음부터 끝까지 불러 주었다. 설거지하던 손님들까지 숟가락을 놓고 박수를 쳤다. "이 집 노래는 이 집 밥 맛입니다."' },
    { goto: 'rev_end' }
  ],
  rev_bard_2_no: [
    { narr: '시인은 어깨를 으쓱하고 모자를 다시 썼다. "그럼 마지막 소절만. 여기까지 와서 한 소절도 못 부르고 가면 서운하니까." 짧은 노래가 아침 마당에 퍼졌다.' },
    { goto: 'rev_end' }
  ],
  rev_bard_3: [
    { bg: 'inn_front' }, { hide: 'all' }, { set: { 'ser.bard': 1 } },
    { narr: '마당에서 류트 줄을 조율하는 소리가 들렸다. 시인이 짐을 꾸린 채 서 있다. 평소의 익살스러운 얼굴이 아니다. 어쩐지 하늘을 자꾸 올려다본다.' },
    { narr: '"이 마을에 올 때마다 하늘이 낮아지더군요. 그래서 마지막 노래를 하나 가져왔습니다. 무서울 때 부르면 마음이 조금 가벼워지는 노래입니다."' },
    { choice: [
      { text: '식당에서 마을 사람들 앞에 부탁한다. (5G 사례)', cost: 5, set: { rep: 1, 'today.tip': 40, 'today.note': '시인의 노래로 마을이 따뜻해져서 팁이 후하다 (팁 +40%)' }, goto: 'rev_bard_3_sing' },
      { text: '가사를 적어 달라고 한다. 아이들에게 가르쳐 주고 싶다.', set: { rep: 1 }, goto: 'rev_bard_3_write' },
      { text: '"조용히 보내 드릴게요. 건강하세요."', goto: 'rev_bard_3_bye' }
    ] }
  ],
  rev_bard_3_sing: [
    { narr: '시인이 류트를 튕기자 식당이 조용해졌다. 느릿한 후렴구에 하나둘 따라 부르는 소리가 겹쳤다. 노래가 끝나자 눈가를 훔치는 사람이 몇 명 보였다. 불안하던 마을 공기가 한결 부드러워졌다.' },
    { goto: 'rev_end' }
  ],
  rev_bard_3_write: [
    { narr: '시인은 낡은 수첩 한 장을 찢어 가사를 또박또박 적어 주었다. 맨 아래에 작게 덧붙였다. "무사히 지나가면 다시 오겠습니다. 그때는 이 여관에서 첫 공연을."' },
    { goto: 'rev_end' }
  ],
  rev_bard_3_bye: [
    { narr: '시인은 모자를 벗어 정중히 인사했다. 마을 어귀로 걸어가는 뒷모습에서 한참 동안 류트 소리가 들렸다. 쓸쓸하면서도 이상하게 힘이 되는 곡이었다.' },
    { goto: 'rev_end' }
  ],

  // ================= 연작: 꼬마 견습 요리사 콩이 =================
  rev_cookkid_1: [
    { bg: 'inn_front' }, { hide: 'all' }, { set: { 'ser.cookkid': 1 } },
    { narr: '여관 문 앞에 국자보다 키가 작은 아이가 서 있다. 앞치마가 바닥에 끌린다. "저는 콩이예요! 견습 요리사 시켜 주세요! 소금 정도는 안 틀려요!"' },
    { narr: '시험 삼아 주방에 들여보냈더니 설탕 통과 소금 통을 정확히 반대로 들었다. 아이의 눈에 눈물이 맺혔다.' },
    { choice: [
      { text: '"처음엔 다 그래." 맛 보는 법부터 알려 준다. (재료 값 3G)', cost: 3, set: { rep: 1 }, goto: 'rev_cookkid_1_teach' },
      { text: '설거지부터 시킨다. 요리는 그다음이다.', set: { gold: 3 }, goto: 'rev_cookkid_1_dish' },
      { text: '"아직 어려서 안 되겠다. 집에 가서 부모님 도와 드려."', goto: 'rev_cookkid_1_no' }
    ] }
  ],
  rev_cookkid_1_teach: [
    { narr: '작은 숟가락에 소금과 설탕을 한 알씩 올려 맛을 보게 했다. 콩이는 얼굴을 찡그렸다가 눈이 동그래졌다. "이건 짠 맛! 이건 달콤한 맛! 알았어요! 이제 안 틀려요!" 이 아이, 가능성이 있다.' },
    { goto: 'rev_end' }
  ],
  rev_cookkid_1_dish: [
    { narr: '콩이는 의자를 밟고 서서 접시를 박박 닦았다. 거품이 얼굴에 튀어도 신경 쓰지 않았다. 한 시간 만에 접시가 뽀득뽀득해졌다. 생각보다 일을 잘한다.' },
    { goto: 'rev_end' }
  ],
  rev_cookkid_1_no: [
    { narr: '콩이는 입술을 깨물고 고개를 끄덕였다. 돌아서며 작게 말했다. "…그럼 크면 올게요. 약속이에요." 떠나는 작은 등이 오래 눈에 남았다.' },
    { goto: 'rev_end' }
  ],
  rev_cookkid_2: [
    { bg: 'inn_day' }, { hide: 'all' }, { set: { 'ser.cookkid': 1 } },
    { narr: '식당 문이 삐걱 열리고 낯익은 꼬마가 두 손으로 공책을 안고 들어왔다. "사장님! 저, 그동안 연습했어요! 이거 봐 주세요!"' },
    { narr: '공책에는 삐뚤삐뚤한 글씨로 레시피가 빼곡했다. "꿀빵: 빵 한 개 + 꿀 한 숟가락 + 몰래 한 입." 마지막 줄 때문에 웃음이 터졌다.' },
    { choice: [
      { text: '공책 맨 뒤에 내 비법 한 줄을 적어 준다. "불은 약하게."', set: { rep: 1 }, goto: 'rev_cookkid_2_note' },
      { text: '시식해 본다. 콩이가 만든 꿀빵을 한 입.', set: { 'today.price': -10, 'today.note': '콩이가 재료 요령을 알려 줘서 오늘 장보기가 10% 싸다' }, goto: 'rev_cookkid_2_taste' },
      { text: '"좋은 공책이네. 계속 열심히 해." 머리를 쓰다듬는다.', goto: 'rev_cookkid_2_pat' }
    ] }
  ],
  rev_cookkid_2_note: [
    { narr: '"불은 약하게, 마음은 강하게." 이렇게 적었더니 콩이가 눈을 반짝이며 공책을 가슴에 꼭 안았다. "평생 간직할게요!" 이 아이의 평생에 한 줄을 남긴 셈이다.' },
    { goto: 'rev_end' }
  ],
  rev_cookkid_2_taste: [
    { narr: '꿀빵은 의외로 먹을 만했다. 대신 꿀을 아끼는 요령이 인상 깊었다. "꿀은 칼에 묻혀서 얇게 펴요." 장바구니에 담을 꿀이 줄어들 것 같다.' },
    { goto: 'rev_end' }
  ],
  rev_cookkid_2_pat: [
    { narr: '콩이는 머리를 쓰다듬자 으쓱거리며 공책을 흔들었다. "다음엔 제 요리를 가져올게요!" 힘찬 뒷모습이 마당을 가로질러 사라졌다.' },
    { goto: 'rev_end' }
  ],
  rev_cookkid_3: [
    { bg: 'inn_front' }, { hide: 'all' }, { set: { 'ser.cookkid': 1 } },
    { narr: '아침 일찍 콩이가 어른 한 명과 함께 서 있었다. 콩이를 꼭 닮은 눈매의 아주머니가 정중하게 고개를 숙였다. "콩이 엄마예요. 이 아이가 매일 여기 얘기만 해서요."' },
    { narr: '콩이가 두 손으로 접시를 받들어 내밀었다. 접시 위에는 약간 삐뚤어진 오믈렛이 놓여 있다. "제가 처음으로 혼자 만든 거예요! 드셔 주세요!"' },
    { choice: [
      { text: '한 입 먹고 크게 칭찬한다. "맛있다. 이건 진짜야."', set: { rep: 1, 'today.cust': 1, 'today.note': '콩이 엄마가 소문을 내서 단골이 한 명 더 찾아온다' }, goto: 'rev_cookkid_3_praise' },
      { text: '콩이의 이름을 새긴 작은 국자를 선물한다. (4G)', cost: 4, set: { rep: 1 }, goto: 'rev_cookkid_3_gift' },
      { text: '"간이 약간 싱겁네." 솔직하게 말해 준다.', goto: 'rev_cookkid_3_honest' }
    ] }
  ],
  rev_cookkid_3_praise: [
    { narr: '오믈렛은 조금 짰지만 한 입 한 입 정성이 느껴졌다. 콩이 엄마가 눈가를 훔치며 몇 번이나 고개를 숙였다. "이 마을에서 이런 맛을 만났으니 이 아이는 행복한 아이예요."' },
    { goto: 'rev_end' }
  ],
  rev_cookkid_3_gift: [
    { narr: '대장간 아저씨에게 부탁해 둔 작은 국자였다. 자루에 "콩이"라고 새겨져 있다. 콩이는 국자를 높이 들고 마당을 한 바퀴 돌며 외쳤다. "이제 진짜 요리사예요!"' },
    { goto: 'rev_end' }
  ],
  rev_cookkid_3_honest: [
    { narr: '솔직한 말에 콩이가 잠깐 입을 삐죽였다. 그러다 입술을 꼭 다물고 말했다. "…다음엔 간을 맞춰서 올게요. 그때는 꼭 맛있다고 해 주세요!" 좋은 요리사가 될 아이다.' },
    { goto: 'rev_end' }
  ],

  // ================= 연작: 길 잃은 새끼 여우 =================
  rev_fox_1: [
    { bg: 'inn_front' }, { hide: 'all' }, { set: { 'ser.fox': 1 } },
    { narr: '마당 구석 닭장 뒤에서 작은 은빛 털뭉치가 바들바들 떨고 있었다. 새끼 여우다. 꼬리 끝이 하얗고 눈이 호박색이다. 사람을 보자 몸을 웅크렸다.' },
    { choice: [
      { text: '조심스럽게 우유 한 접시를 내려놓는다. (1G)', cost: 1, set: { rep: 1 }, goto: 'rev_fox_1_milk' },
      { text: '곁에 쪼그려 앉아 가만히 기다린다.', goto: 'rev_fox_1_wait' },
      { text: '"닭이 놀라니까 내보내야겠다." 빗자루로 몰아낸다.', set: { rep: -1 }, goto: 'rev_fox_1_shoo' }
    ] }
  ],
  rev_fox_1_milk: [
    { narr: '새끼 여우는 한참 경계하다가 접시에 코를 박고 허겁지겁 핥았다. 다 먹고는 아무 말 없이 이쪽을 한번 보더니 담장 틈으로 쏙 사라졌다. 접시는 깨끗이 비어 있다.' },
    { goto: 'rev_end' }
  ],
  rev_fox_1_wait: [
    { narr: '삼십 분쯤 앉아 있자 새끼 여우가 한 걸음, 두 걸음 다가와 신발 끝을 킁킁거렸다. 그리고 가만히 무릎 옆에 앉았다. 따뜻하고 가벼운 체온이 전해졌다.' },
    { goto: 'rev_end' }
  ],
  rev_fox_1_shoo: [
    { narr: '새끼 여우는 놀라 도망쳤고, 닭들은 평소처럼 꼬꼬댁 울었다. 담장 너머에서 이쪽을 돌아보던 눈이 오래 남았다. 마음이 조금 무겁다.' },
    { goto: 'rev_end' }
  ],
  rev_fox_2: [
    { bg: 'inn_front' }, { hide: 'all' }, { set: { 'ser.fox': 1 } },
    { narr: '아침부터 주방 쪽이 시끄럽다. 달려가 보니 새끼 여우가 밀가루 포대 위에서 하얗게 변해 앉아 있었다. 바닥에는 작은 발자국이 선명하게 찍혀 있다.' },
    { if: 'aff.miho>=' + HEART(2), goto: 'rev_fox_2_miho' },
    { choice: [
      { text: '새끼 여우를 안아 들고 솔로 털어 준다.', set: { rep: 0 }, goto: 'rev_fox_2_brush' },
      { text: '"주방 문 잠그는 걸 깜박했네." 한숨 쉬며 청소한다. (피로)', set: { fat: 5 }, goto: 'rev_fox_2_clean' }
    ] }
  ],
  rev_fox_2_miho: [
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '이 아이, 어디서 데려왔어요!? …아니, 이 털 색깔, 은빛이에요. 이 꼬리 끝, 하얗고 둥근 거. 설마…' },
    { narr: '미호가 새끼 여우를 두 손으로 번쩍 들었다. 새끼 여우가 미호의 코를 앙 하고 물었다. 미호의 귀가 확 서고 꼬리가 폭죽처럼 부풀었다.' },
    { say: 'miho', face: 'smile', text: '…같은 종족 냄새가 나요. 이 아이, 제가 돌봐도 돼요? 밀가루는 제가 치울게요. 수수료 없이요!' },
    { choice: [
      { who: 'miho', text: '"같이 돌봐요. 이름은 뭐라고 할까요?"', set: { 'aff.miho': 2 }, goto: 'rev_end' },
      { text: '"치우는 건 같이 해요."', set: { 'aff.miho': 1 }, goto: 'rev_end' }
    ] }
  ],
  rev_fox_2_brush: [
    { narr: '솔로 쓸어 주자 새끼 여우가 눈을 가늘게 뜨고 목을 길게 늘였다. 하얀 가루가 흩날리고 은빛 털이 드러났다. 이름이라도 지어 줄까 생각했다.' },
    { goto: 'rev_end' }
  ],
  rev_fox_2_clean: [
    { narr: '바닥의 밀가루를 쓸고 닦으며 새끼 여우를 한쪽 눈으로 지켜봤다. 정작 새끼 여우는 청소하는 옆에서 꼬리를 흔들며 방해만 했다. 그래도 밉지 않다.' },
    { goto: 'rev_end' }
  ],
  rev_fox_3: [
    { bg: 'inn_front' }, { hide: 'all' }, { set: { 'ser.fox': 1 } },
    { narr: '이른 아침, 마당 한가운데에 어른 은빛 여우가 서 있었다. 새끼 여우가 그 곁에서 꼬리를 흔들고 있다. 어른 여우는 한참 이쪽을 바라보더니 고개를 천천히 숙였다.' },
    { narr: '둘은 담장 위로 올라가 한 번 돌아본 뒤 숲 쪽으로 사라졌다. 담장 위에는 작은 나뭇잎 한 장이 놓여 있었다. 은빛 털이 한 가닥 묶여 있다.' },
    { choice: [
      { text: '나뭇잎을 간판 뒤에 소중히 끼워 둔다.', set: { rep: 1 }, goto: 'rev_fox_3_keep' },
      { text: '마당에 우유 접시를 하나 더 내놓는다. (1G)', cost: 1, set: { rep: 1 }, goto: 'rev_fox_3_dish' },
      { text: '"잘 가." 손을 흔들고 일상으로 돌아간다.', goto: 'rev_fox_3_wave' }
    ] }
  ],
  rev_fox_3_keep: [
    { narr: '간판 뒷면의 오래된 여우 그림 옆에 나뭇잎과 털 한 가닥을 끼워 두었다. 은빛 여우관의 간판이 오늘따라 더 은빛으로 보인다.' },
    { goto: 'rev_end' }
  ],
  rev_fox_3_dish: [
    { narr: '다음 날 아침 우유 접시는 비어 있었고 그 옆에 작은 열매 몇 알이 놓여 있었다. 답례였다. 이 마을에는 여우도 의리가 있다.' },
    { goto: 'rev_end' }
  ],
  rev_fox_3_wave: [
    { narr: '담장 위의 나뭇잎이 바람에 날아갔다. 조금 쓸쓸했지만, 이게 맞는 이별이다. 여관 주인은 오늘도 앞치마를 두른다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 떠돌이 개 =================
  rev_stray_dog: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마당에 털이 엉킨 큰 개가 눕다시피 앉아 있다. 갈비뼈가 보일 정도로 말랐지만 눈은 순하다. 꼬리를 한 번 흔들어 인사한다.' },
    { choice: [
      { text: '남은 고기 조각을 던져 준다. (2G)', cost: 2, set: { rep: 1 }, goto: 'rev_stray_dog_meat' },
      { who: 'kaela', text: '카엘라를 부른다. "동물과 친해지는 게 특기라고 했죠?"', if: 'aff.kaela>=3', set: { 'aff.kaela': 1, rep: 1 }, goto: 'rev_stray_dog_kaela' },
      { text: '문을 닫고 못 본 척한다.', set: { rep: -1 }, goto: 'rev_stray_dog_ignore' }
    ] }
  ],
  rev_stray_dog_meat: [
    { narr: '개는 고기를 받아먹고 눈을 가늘게 떴다. 그리고 하루 종일 마당 지킴이가 되었다. 오가는 손님마다 꼬리를 흔들어 줬다. 의외로 장사에 도움이 될지도 모른다.' },
    { goto: 'rev_end' }
  ],
  rev_stray_dog_kaela: [
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '이 몸에게 맡겨라! 이름은 "충성"이다! 앉아, 충성! …일어나 있었군. 눕는 건가? 구르는 건가?' },
    { narr: '개는 카엘라의 대검 손잡이를 베개 삼아 누웠다. 카엘라가 그 자세 그대로 한 시간을 움직이지 못했다. 정말로 순한 개다.' },
    { goto: 'rev_end' }
  ],
  rev_stray_dog_ignore: [
    { narr: '문 너머에서 낑낑거리는 소리가 오래 들렸다. 이웃 아주머니가 지나가다 "어머, 불쌍해라" 하며 빵을 던져 주었다. 마을 인심이 부끄럽게 만든다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 낡은 지도 조각 =================
  rev_old_map: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '청소 중에 벽장 뒤에서 누렇게 바랜 지도 조각을 하나 찾았다. 뒷산 쪽에 붉은 점이 찍혀 있고 "봉인지기의 숲길"이라는 글씨가 흐릿하게 남아 있다.' },
    { choice: [
      { text: '촌장님께 가져가 확인을 부탁한다.', set: { rep: 1 }, goto: 'rev_old_map_chief' },
      { text: '골동품 상인에게 보여 준다.', set: { gold: 8 }, goto: 'rev_old_map_sell' },
      { text: '장부 사이에 끼워 두고 잊어버린다.', goto: 'rev_old_map_keep' }
    ] }
  ],
  rev_old_map_chief: [
    { narr: '촌장님이 지도를 한참 들여다보다 눈을 감았다. "삼백 년 전 동굴로 가던 길이군. 이건 마을의 귀중한 기록일세. 고맙네." 지도는 촌장님 서랍 속에 소중히 보관되었다.' },
    { goto: 'rev_end' }
  ],
  rev_old_map_sell: [
    { narr: '상인은 돋보기로 한참 지도를 살피더니 은화 몇 닢을 건넸다. "그림이 예쁘군요. 장식용으로는 괜찮습니다." 값어치는 모르는 모양이다.' },
    { goto: 'rev_end' }
  ],
  rev_old_map_keep: [
    { narr: '지도는 장부 사이에 끼워졌다. 필요한 날이 올지도 모른다. 그날이 오지 않기를 바라면서 서랍을 닫았다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 등불 장수 (달맞이 준비) =================
  rev_festival_vendor: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '달맞이 장터가 코앞이다. 여관 앞에 소원 등불 재료를 가득 실은 수레가 멈췄다. 장수가 목청을 높였다. "올해 등불은 더 환하답니다! 여관 앞에 한 줄 걸어 보세요!"' },
    { choice: [
      { text: '등불 한 줄을 사서 처마에 단다. (6G)', cost: 6, set: { rep: 1, 'today.tip': 30, 'today.note': '처마에 단 등불이 예뻐서 팁이 후하다 (팁 +30%)' }, goto: 'rev_festival_vendor_buy' },
      { text: '종이를 얻어 직접 등불을 만든다.', set: { fat: 4 }, goto: 'rev_festival_vendor_diy' },
      { text: '"올해는 사양할게요."', goto: 'rev_festival_vendor_no' }
    ] }
  ],
  rev_festival_vendor_buy: [
    { narr: '여관 처마에 줄지어 걸린 등불이 아침 햇살에도 은은하게 반짝였다. 지나가던 아이들이 하나씩 손으로 가리켰다. 오늘 저녁이 기대된다.' },
    { goto: 'rev_end' }
  ],
  rev_festival_vendor_diy: [
    { narr: '종이와 풀을 얻어 낑낑거리며 등불을 만들었다. 결과물은 약간 찌그러졌지만 여관 간판처럼 정이 간다. 손가락에 풀이 한가득 묻었다.' },
    { goto: 'rev_end' }
  ],
  rev_festival_vendor_no: [
    { narr: '장수는 어깨를 으쓱하고 수레를 끌고 떠났다. 옆집 간판 위에서 번쩍이는 등불이 조금 부럽다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 굴뚝 불똥 =================
  rev_chimney_fire: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '아침에 굴뚝에서 연기가 평소와 다른 색으로 올라왔다. 지붕에 올라가 보니 굴뚝 안에서 새 둥지가 불똥에 그을려 있다. 불이 번지기 전에 치워야 한다.' },
    { choice: [
      { text: '바로 올라가 둥지를 치우고 굴뚝을 청소한다. (5G)', cost: 5, set: { rep: 1 }, goto: 'rev_chimney_fire_clean' },
      { text: '촌장님네 굴뚝 청소부를 부른다. 오늘은 영업 준비를 못 한다.', set: { 'today.cust': -1, 'today.note': '굴뚝 청소로 오늘은 손님이 조금 줄어요.' }, goto: 'rev_chimney_fire_call' }
    ] }
  ],
  rev_chimney_fire_clean: [
    { narr: '굴뚝에서 시커먼 검댕이 쏟아졌다. 얼굴과 앞치마가 새까매졌지만 불은 무사히 막았다. 새들은 이웃집 지붕에 새로 둥지를 틀 모양이다.' },
    { goto: 'rev_end' }
  ],
  rev_chimney_fire_call: [
    { narr: '청소부가 한 시간 동안 굴뚝을 뚫는 동안 식당 문은 닫아야 했다. 일은 깔끔하게 끝났지만 손님 몇은 발길을 돌렸다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 피로연 문의 =================
  rev_wedding_guests: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '신랑 신부로 보이는 젊은 부부가 쭈뼛거리며 들어왔다. "저희 결혼 피로연을 이웃 마을 친구들과 하려는데, 여관 식당에서 열 수 있을까요?"' },
    { choice: [
      { text: '"기꺼이요!" 오늘 저녁 일부를 내어 준다.', set: { rep: 1, 'today.cust': 1, 'today.note': '피로연 하객 한 명이 먼저 들러 저녁에 손님이 하나 더 온다' }, goto: 'rev_wedding_guests_yes' },
      { text: '"오늘은 어렵지만, 다음 주 일요일이라면."', goto: 'rev_wedding_guests_later' }
    ] }
  ],
  rev_wedding_guests_yes: [
    { narr: '부부는 몇 번이나 고개를 숙였다. 신부가 수줍게 말했다. "여기서 처음 만난 거예요. 저희 둘이." 이 식당에서 이야기가 이어지고 있었다니, 괜히 가슴이 따뜻하다.' },
    { goto: 'rev_end' }
  ],
  rev_wedding_guests_later: [
    { narr: '부부는 아쉬워하면서도 날짜를 적었다. "그럼 다음 주에 꼭요!" 일정표에 동그라미를 쳤다. 그날까지 폭풍이 오지 않기만 바란다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 왕도의 소문 (여관 2성 이상) =================
  rev_royal_rumor: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '왕도에서 온 전령이 말에서 내려 여관 문을 두드렸다. "은빛 여우관의 소문이 왕도에 닿았습니다. 높은 분들이 이곳을 지나갈 때 쉬어 가실 수도 있다고 합니다."' },
    { choice: [
      { text: '"영광입니다. 정성껏 준비하겠습니다." 간판을 새로 닦는다. (3G)', cost: 3, set: { rep: 1, 'today.tip': 30, 'today.note': '왕도 소문 덕에 오늘 팁이 후하다 (팁 +30%)' }, goto: 'rev_royal_rumor_polish' },
      { text: '"손님은 누구든 같은 손님입니다." 평소대로 맞이한다.', goto: 'rev_royal_rumor_same' }
    ] }
  ],
  rev_royal_rumor_polish: [
    { narr: '간판의 은빛 여우가 햇빛을 받아 눈부시게 빛났다. 전령은 만족한 얼굴로 수첩에 무언가를 적었다. "좋은 인상입니다."' },
    { goto: 'rev_end' }
  ],
  rev_royal_rumor_same: [
    { narr: '전령은 의외라는 듯 눈을 깜박였다가 빙긋 웃었다. "그 말씀을 그대로 보고서에 적겠습니다." 말없이 건넨 은화 한 닢이 손바닥에 남았다.' },
    { set: { gold: 3 } },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 학자의 질문 =================
  rev_scholar_visit: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '안경을 코끝에 걸친 학자가 문을 열고 들어와 수첩을 펼쳤다. "뒷산 동굴 근처에서 이상한 마력 파동이 관측되었습니다. 이 마을에서 최근 이상한 일이 있었나요?"' },
    { choice: [
      { text: '아는 대로 솔직하게 이야기한다.', set: { rep: 1 }, goto: 'rev_scholar_visit_tell' },
      { text: '"글쎄요, 잘 모르겠네요." 잘라 말한다.', goto: 'rev_scholar_visit_deny' },
      { who: 'erion', text: '에리온을 슬쩍 가리킨다. "저분께 물어보세요."', if: 'aff.erion>=3', set: { 'aff.erion': 1 }, goto: 'rev_scholar_visit_erion' }
    ] }
  ],
  rev_scholar_visit_tell: [
    { narr: '이야기를 들은 학자는 열심히 필기하다가 한숨을 쉬었다. "예상보다 심각하군요. 협조에 감사드립니다." 떠나는 길에 촌장님 댁에 들르겠다고 했다.' },
    { goto: 'rev_end' }
  ],
  rev_scholar_visit_deny: [
    { narr: '학자는 의심스러운 눈으로 한참 보다가 수첩을 덮었다. "…알겠습니다. 다른 곳을 알아보죠." 이웃들의 시선이 조금 무겁게 느껴졌다.' },
    { goto: 'rev_end' }
  ],
  rev_scholar_visit_erion: [
    { show: 'erion', face: 'angry', pos: 'center' },
    { say: 'erion', text: '…내가 왜 학자 따위를 상대해야 하지. …하지만 손님이 부탁했으니 한 마디만 해 주지.' },
    { narr: '에리온이 학자 귀에 짧게 속삭이자 학자의 얼굴이 새파랗게 질렸다. 안경이 코에서 미끄러졌다. 학자는 수첩을 접고 허둥지둥 나갔다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 밤새 울던 늑대 =================
  rev_wolf_howl: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '간밤에 뒷산에서 늑대 울음이 밤새 이어졌다. 이웃 가축이 불안해하고 아침에는 우리 문이 열려 있는 집도 있었다. 청년단이 순찰을 돌고 있다.' },
    { choice: [
      { text: '순찰대에 수프를 끓여 보낸다. (4G)', cost: 4, set: { rep: 1 }, goto: 'rev_wolf_howl_soup' },
      { who: 'kaela', text: '카엘라와 순찰에 합류한다.', if: 'aff.kaela>=3', set: { 'aff.kaela': 1, fat: 5 }, goto: 'rev_wolf_howl_kaela' },
      { text: '문단속만 철저히 하고 영업 준비를 한다.', goto: 'rev_wolf_howl_lock' }
    ] }
  ],
  rev_wolf_howl_soup: [
    { narr: '따뜻한 수프를 받은 청년단원들이 쑥스럽게 웃었다. 핀이 말했다. "이 맛 때문에 밤샘도 견딜 만해요." 뜨끈한 국물이 불안한 마음도 풀어 주었다.' },
    { goto: 'rev_end' }
  ],
  rev_wolf_howl_kaela: [
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '순찰이다, 주인장! 이번에는 도망치지 않겠다! 앞은 이 몸이, 뒤는… 주인장이 맡는 거다!' },
    { narr: '숲길 어귀까지 둘이 걸었다. 늑대는 보이지 않았다. 대신 땅에 남은 발자국이 모두 산 쪽을 향해 있었다. 카엘라가 발자국을 한참 내려다보았다.' },
    { goto: 'rev_end' }
  ],
  rev_wolf_howl_lock: [
    { narr: '문마다 빗장을 걸고 창문 틈을 막았다. 이상하게 마음이 조금 놓였다. 일상은 이렇게 작은 일로 지켜지는 모양이다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 푸른 빛 목격담 =================
  rev_blue_light: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '우물가에서 아낙들이 수군거렸다. "어젯밤 뒷산에서 푸른 빛이 번쩍 올라왔대." "재앙의 징조라는 사람도 있고." 사람들의 시선이 여관 쪽을 향한다. 에리온이 머무는 곳이라서일지도 모른다.' },
    { choice: [
      { text: '"별일 아니에요. 여관 손님이 연구하는 거예요." 차분하게 설명한다.', set: { rep: 1 }, goto: 'rev_blue_light_calm' },
      { text: '"저도 봤어요. 일단 조심합시다." 솔직하게 말한다.', goto: 'rev_blue_light_honest' },
      { text: '못 들은 척 지나간다.', set: { rep: -1 }, goto: 'rev_blue_light_pass' }
    ] }
  ],
  rev_blue_light_calm: [
    { narr: '아낙들이 서로 눈치를 보더니 슬며시 흩어졌다. 우물가에 남은 건 물소리뿐. 조금 거짓말 같았지만 마음은 놓였다.' },
    { goto: 'rev_end' }
  ],
  rev_blue_light_honest: [
    { narr: '이야기를 들은 이웃들의 표정이 굳었다. 그러다 누군가 말했다. "그럼 우리도 준비를 해야겠네." 불안은 준비로 바뀌는 순간 조금 가벼워진다.' },
    { goto: 'rev_end' }
  ],
  rev_blue_light_pass: [
    { narr: '걸어가는 등 뒤로 수군거림이 따라왔다. 나쁜 소문은 아침 공기보다 빨리 퍼진다. 어쩐지 여관 간판이 어두워 보였다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 아픈 나그네 =================
  rev_sick_traveler: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '여관 앞 길에 나그네 한 명이 벽에 기대 주저앉아 있다. 이마에 열이 있고 입술이 말랐다. 짐을 지고 있지만 눈빛은 흐릿하다.' },
    { choice: [
      { text: '방에 눕히고 따뜻한 물과 죽을 준다. (4G)', cost: 4, set: { rep: 1 }, goto: 'rev_sick_traveler_room' },
      { who: 'lia', text: '리아를 부른다. "신전 약초를 부탁해요."', if: 'aff.lia>=3', set: { 'aff.lia': 1, rep: 1 }, goto: 'rev_sick_traveler_lia' },
      { text: '촌장님께 알려 의원을 부른다.', goto: 'rev_sick_traveler_doctor' }
    ] }
  ],
  rev_sick_traveler_room: [
    { narr: '나그네는 한나절을 푹 자고 일어나 열이 내렸다. "여관 주인의 죽이 명약이었소." 감사 인사와 함께 남기고 간 은화가 두 닢이었다.' },
    { set: { gold: 3 } },
    { goto: 'rev_end' }
  ],
  rev_sick_traveler_lia: [
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '약초는 쓰고 마음은 따뜻하게. 이 두 가지가 한 쌍이야. 조금만 참으세요, 금방 나아요.' },
    { narr: '리아가 나그네의 손을 꼭 잡고 기도문을 읊었다. 나그네의 얼굴에 서서히 핏기가 돌아왔다. 리아의 손끝이 가늘게 반짝였다.' },
    { goto: 'rev_end' }
  ],
  rev_sick_traveler_doctor: [
    { narr: '의원이 한 시간 만에 달려왔다. 나그네는 마을 의원의 집으로 옮겨져 안정을 되찾았다. 한숨을 돌렸다. 이럴 때는 이웃이 있다는 게 든든하다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 촌장네 염소 =================
  rev_lost_goat: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '여관 마당 한가운데 낯선 염소가 서서 빨랫줄의 시트를 씹고 있다. 촌장님네 염소다. 이미 시트 한 장은 반이 사라졌다.' },
    { choice: [
      { text: '시트를 포기하고 염소를 달래서 촌장님께 돌려보낸다.', set: { rep: 1 }, goto: 'rev_lost_goat_return' },
      { text: '염소를 쫓다가 뜀박질 한 판. 피곤하지만 끝까지 쫓는다.', set: { fat: 6 }, goto: 'rev_lost_goat_chase' },
      { text: '"그냥 놔두자. 시트 한 장은 세금이야."', set: { rep: -1 }, goto: 'rev_lost_goat_leave' }
    ] }
  ],
  rev_lost_goat_return: [
    { narr: '당근 한 조각을 들고 졸졸 따라오게 해서 촌장님 댁까지 데려갔다. 촌장님이 허리를 굽혀 사과했다. "또 이 녀석이! 시트값은 꼭 갚겠네." 대신 잼 한 병을 쥐여 주었다.' },
    { goto: 'rev_end' }
  ],
  rev_lost_goat_chase: [
    { narr: '염소는 마당을 세 바퀴 돌고 우물 뒤로 숨고 닭장 위로 올라갔다. 결국 지붕에서 내려오지 않아 촌장님이 직접 올라와 데려갔다. 이 염소는 무적이다.' },
    { goto: 'rev_end' }
  ],
  rev_lost_goat_leave: [
    { narr: '염소는 시트를 다 먹고 나서야 만족한 듯 걸어 나갔다. 빨랫줄에는 시트 반 장이 쓸쓸하게 매달려 있다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 갑자기 찾아온 추위 =================
  rev_cold_wind: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '어제까지 괜찮던 날씨가 하룻밤 사이에 뼈가 시릴 만큼 추워졌다. 북풍이 문틈을 타고 들어온다. 오늘 저녁에는 따뜻한 국물을 찾는 손님이 많을 것이다.' },
    { choice: [
      { text: '난로 장작을 넉넉히 쟁인다. (5G)', cost: 5, set: { 'today.tip': 50, 'today.note': '추운 날씨에 따뜻한 요리가 인기라 팁이 후하다 (팁 +50%)' }, goto: 'rev_cold_wind_wood' },
      { text: '창틈을 천으로 막고 평소처럼 영업 준비를 한다.', goto: 'rev_cold_wind_seal' }
    ] }
  ],
  rev_cold_wind_wood: [
    { narr: '난로에 불이 활활 올랐다. 문을 열고 들어오는 손님마다 "아, 살겠다" 하며 난로 앞으로 모여든다. 오늘 저녁은 다소 비싸도 따뜻함을 파는 날이다.' },
    { goto: 'rev_end' }
  ],
  rev_cold_wind_seal: [
    { narr: '창틈 하나하나에 헝겊을 끼웠다. 바람 소리는 줄었지만 손끝은 얼어붙었다. 그래도 식당 안은 조금 아늑해졌다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 아이들의 여관 놀이 =================
  rev_children_play: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마당에서 아이 대여섯 명이 여관 놀이를 하고 있다. 주인 역은 가장 작은 아이다. 앞치마를 끌며 외친다. "어서 오세요! 오늘의 요리는 진흙 수프입니다!"' },
    { choice: [
      { text: '손님 역으로 놀이에 끼어든다. "진흙 수프, 한 그릇 주세요."', set: { rep: 1, fat: 3 }, goto: 'rev_children_play_join' },
      { text: '"진짜 수프는 저녁에 와서 먹어." 아이들에게 초대 쿠폰을 나눠 준다. (2G)', cost: 2, set: { 'today.cust': 1, 'today.note': '아이들이 부모님을 모셔 와서 저녁에 손님이 하나 더 온다' }, goto: 'rev_children_play_coupon' },
      { text: '조용히 지켜보기만 한다.', goto: 'rev_children_play_watch' }
    ] }
  ],
  rev_children_play_join: [
    { narr: '진흙 수프는 의외로 정성스러웠다. 나뭇잎 접시 위에 꽃이 올라가 있다. 숟가락을 떠먹는 시늉을 하자 아이들이 박수를 쳤다. 평판이 한 단계 오른 기분이다.' },
    { goto: 'rev_end' }
  ],
  rev_children_play_coupon: [
    { narr: '나뭇잎에 직접 "무료 한 그릇"이라고 적어 나눠 주었다. 아이들이 쿠폰을 하늘 높이 흔들며 달려갔다. 저녁에는 보호자 몇 분이 찾아올 것 같다.' },
    { goto: 'rev_end' }
  ],
  rev_children_play_watch: [
    { narr: '울타리에 기대어 놀이를 구경했다. 어린 주인이 "손님 안 와서 슬퍼요"라고 눈물을 훔치는 연기까지 했다. 이 아이는 커서 좋은 여관 주인이 될 것이다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 카엘라의 허수아비 (카엘라 호감 2칸) =================
  rev_kaela_dummy: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마당 한가운데서 요란한 기합 소리가 들렸다. 카엘라가 대검으로 허수아비를 쪼개 놓고는 파편 앞에서 얼어붙어 있다. 허수아비는 이웃 농부의 것이었다.' },
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { say: 'kaela', text: '이, 이건 적의 간첩이었다! …아니, 이웃집 허수아비였다. 주인장, 어떻게 하면 좋겠나!' },
    { choice: [
      { who: 'kaela', text: '"같이 새로 만들어 드리죠." 짚과 막대를 모아 허수아비를 새로 만든다.', set: { 'aff.kaela': 2, fat: 6 }, goto: 'rev_kaela_dummy_make' },
      { text: '"사과하러 같이 가요." 이웃 농부에게 찾아간다. (2G)', cost: 2, set: { 'aff.kaela': 1, rep: 1 }, goto: 'rev_kaela_dummy_sorry' },
      { text: '"이건 제가 모르는 일이에요."', set: { 'aff.kaela': 0, rep: -1 }, goto: 'rev_kaela_dummy_deny' }
    ] }
  ],
  rev_kaela_dummy_make: [
    { narr: '카엘라는 짚을 꼬면서 연신 "미안하다!"를 외쳤다. 완성된 허수아비는 카엘라를 꼭 닮은 붉은 머리띠를 둘렀다. 농부는 그걸 보고 박장대소했다. "이 허수아비가 더 무섭겠는걸!"' },
    { goto: 'rev_end' }
  ],
  rev_kaela_dummy_sorry: [
    { narr: '농부는 사과를 받고 껄껄 웃었다. "대검에 맞은 허수아비라니, 이것도 자랑거리가 되겠네!" 카엘라가 얼굴이 빨개져 고개를 푹 숙였다.' },
    { goto: 'rev_end' }
  ],
  rev_kaela_dummy_deny: [
    { narr: '카엘라가 "…주인장!" 하고 작게 소리쳤지만, 아침 바람이 파편을 쓸어 갔다. 나중에 농부가 허수아비를 찾으러 왔을 때 마을 전체가 이 일을 알게 되었다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 에리온의 찻주전자 (에리온 호감 2칸) =================
  rev_erion_teapot: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '식당 한가운데서 쾅, 하고 작은 폭발음이 났다. 연기 속에서 에리온이 찻주전자를 든 채 눈썹을 찡그리고 서 있다. 주전자 뚜껑은 천장에 박혀 있다.' },
    { show: 'erion', face: 'angry', pos: 'center' },
    { say: 'erion', text: '…내 탓이 아니야. 차가 마력에 반응해서 폭발한 거야. 이 마을 차가 불량인 거라고.' },
    { choice: [
      { who: 'erion', text: '"다친 데는 없죠?" 먼저 안부부터 묻는다.', set: { 'aff.erion': 2 }, goto: 'rev_erion_teapot_care' },
      { text: '"천장에 박힌 뚜껑은 어떻게 하죠?" 장난스럽게 웃는다.', set: { 'aff.erion': 1 }, goto: 'rev_erion_teapot_joke' },
      { text: '"여관 시설은 조심해 주세요." 주의를 준다. (수리비 4G)', cost: 4, set: { 'aff.erion': 0, rep: 0 }, goto: 'rev_erion_teapot_warn' }
    ] }
  ],
  rev_erion_teapot_care: [
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…괜찮아. 다친 데 없어. 오히려 네가 물을 맞았네. 이쪽으로 와, 닦아 줄게.' },
    { narr: '에리온이 수건으로 소매를 닦아 주었다. 귀 끝이 홍시처럼 붉다. 차는 폭발했지만 하루가 이상하게 따뜻해졌다.' },
    { goto: 'rev_end' }
  ],
  rev_erion_teapot_joke: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…웃지 마. 뚜껑은 내가 내릴게. 중력 마법으로. 다만 위치를 정확히 못 맞출 수도 있으니 피해.' },
    { narr: '뚜껑은 내려왔지만 내 머리 위로 떨어졌다. 에리온이 필사적으로 웃음을 참았다. 어깨가 들썩인다.' },
    { goto: 'rev_end' }
  ],
  rev_erion_teapot_warn: [
    { narr: '천장 수리비가 조금 나왔다. 에리온이 고개를 숙였다. "…미안해. 변상할게." 이 말을 한 건 이번이 처음일 것이다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 미호의 청구서 (미호 호감 2칸) =================
  rev_miho_invoice: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '아침 식탁 위에 종이 한 장이 놓여 있다. 맨 위에 "청구서"라고 큼직하게 쓰여 있다. 항목은 아래와 같다. 그저께 장 봐 온 값. 어제 손님 흥정 도움. 오늘 아침의 미소.' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '사장님! 어제 도와드린 흥정, 정식으로 청구할게요. 마지막 항목은 서비스지만 서비스도 원가가 드는 법이에요!' },
    { choice: [
      { who: 'miho', text: '"서비스 항목은 제가 대신 웃음으로 갚을게요." 활짝 웃는다.', set: { 'aff.miho': 2 }, goto: 'rev_miho_invoice_smile' },
      { text: '청구서를 받아들고 8G를 낸다.', cost: 8, set: { 'aff.miho': 1, rep: 1 }, goto: 'rev_miho_invoice_pay' },
      { text: '"흥정 도움은 직원 의무 아닌가요?" 슬쩍 반박한다.', set: { rep: 0 }, goto: 'rev_miho_invoice_argue' }
    ] }
  ],
  rev_miho_invoice_smile: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '…그, 그건 지불 방식으로 인정 안 해요! …하지만 이번에만 특별히 받아 줄게요. 도장 쾅!' },
    { narr: '청구서에 "웃음으로 상계"라고 써 넣고 미호가 신나게 도장을 찍었다. 꼬리가 부채처럼 흔들렸다.' },
    { goto: 'rev_end' }
  ],
  rev_miho_invoice_pay: [
    { narr: '미호가 은화를 세어 보더니 영수증을 또박또박 써서 건넸다. 그리고 소매에서 꿀사탕 하나를 슬쩍 꺼내 내 손에 얹었다. "…서비스예요. 이건 청구 안 해요."' },
    { goto: 'rev_end' }
  ],
  rev_miho_invoice_argue: [
    { narr: '미호가 입을 벌렸다 닫았다. 주판을 튕기고 이마를 짚더니 종이를 구겼다. "…이 건은 보류예요. 다음 달에 다시 청구서를 쓸게요!" 청구서는 서랍 속으로 사라졌다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 리아의 빨래 산 (리아 호감 2칸) =================
  rev_lia_laundry: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마당에 빨래가 산처럼 쌓여 있다. 그 뒤에서 리아의 머리가 살짝 보인다. 손에는 이미 거품이 한가득이다. "도, 도움은 괜찮아! 혼자서도 할 수 있어!"' },
    { show: 'lia', face: 'surprised', pos: 'center' },
    { choice: [
      { who: 'lia', text: '"같이 하자. 짜는 건 내가 할게."', set: { 'aff.lia': 2, fat: 5 }, goto: 'rev_lia_laundry_help' },
      { text: '"쉬는 날은 쉬어야죠." 빨래를 빼앗아 마당 의자에 앉힌다.', set: { 'aff.lia': 1 }, goto: 'rev_lia_laundry_rest' },
      { text: '"그럼 맡길게요." 수건 하나만 챙겨 간다.', set: { 'aff.lia': 0 }, goto: 'rev_lia_laundry_leave' }
    ] }
  ],
  rev_lia_laundry_help: [
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '…이렇게 같이 빨래하는 거, 어릴 때 이후로 처음이야. 그때도 물장난만 하다가 둘 다 혼났었잖아.' },
    { narr: '리아가 물을 튕겨 내 얼굴에 맞혔다. 반격하자 거품이 하늘로 날아올랐다. 빨래는 반만 끝났지만 마당이 웃음소리로 가득했다.' },
    { goto: 'rev_end' }
  ],
  rev_lia_laundry_rest: [
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '쉬, 쉬라고…? 일하는 게 쉬는 건데. …아니, 알았어. 오늘만. 대신 나 지켜보지 마, 졸음 올 것 같으니까.' },
    { narr: '리아는 의자에 앉자마자 오 분도 안 되어 고개를 떨구었다. 빨래는 내가 마저 널었다. 햇볕 냄새가 났다.' },
    { goto: 'rev_end' }
  ],
  rev_lia_laundry_leave: [
    { narr: '리아가 입술을 살짝 내밀었다가 고개를 끄덕였다. "…응. 혼자 해도 괜찮아." 괜찮다는 말이 괜찮지 않게 들렸다. 돌아보니 빨랫줄 앞의 어깨가 작아 보였다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 은수저 도둑 까마귀 =================
  rev_crow_thief: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '식당 창가에서 은수저 하나가 사라졌다. 창밖 처마 위에서 까마귀 한 마리가 수저를 부리에 물고 이쪽을 보고 있다. 당당하다 못해 뻔뻔하다.' },
    { choice: [
      { text: '빵 부스러기로 꾀어 수저와 교환한다. (1G)', cost: 1, goto: 'rev_crow_thief_trade' },
      { text: '사다리를 놓고 직접 올라가 되찾는다.', set: { fat: 5 }, goto: 'rev_crow_thief_ladder' },
      { text: '"그냥 선물로 해." 포기한다.', set: { gold: -3 }, goto: 'rev_crow_thief_gift' }
    ] }
  ],
  rev_crow_thief_trade: [
    { narr: '빵 부스러기를 창턱에 놓자 까마귀가 수저를 떨어뜨리고 빵을 물고 날아갔다. 거래 성립. 이 마을에서는 까마귀도 합리적이다.' },
    { goto: 'rev_end' }
  ],
  rev_crow_thief_ladder: [
    { narr: '지붕에 올라가자 까마귀의 둥지가 있었다. 안에는 은수저 외에도 단추, 구슬, 열쇠가 가득하다. 수저만 슬쩍 집어 내려왔다. 까마귀가 항의하듯 울었다.' },
    { goto: 'rev_end' }
  ],
  rev_crow_thief_gift: [
    { narr: '까마귀가 수저를 물고 지붕 너머로 사라졌다. 은화 한 닢 값은 날아갔지만 하늘을 나는 은빛이 그림처럼 예뻤다. 가끔은 지는 것도 낭만이다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 선발대의 방문 (3주차, 사절단 직전) =================
  rev_envoy_scout: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '말쑥한 제복의 젊은 기사가 여관에 들러 방문 일정을 알렸다. "왕립 학술원 조사단이 곧 이 마을을 방문합니다. 여관 사정을 미리 확인해도 되겠습니까?"' },
    { choice: [
      { text: '식당과 객실을 정성껏 안내한다.', set: { rep: 1 }, goto: 'rev_envoy_scout_tour' },
      { text: '"음식 맛이나 보고 가세요." 간단한 요리를 대접한다. (3G)', cost: 3, set: { rep: 1, 'today.tip': 20, 'today.note': '선발대가 소문을 내서 팁이 조금 후하다 (팁 +20%)' }, goto: 'rev_envoy_scout_meal' },
      { text: '"일정은 이미 알고 있습니다." 간단히 답한다.', goto: 'rev_envoy_scout_short' }
    ] }
  ],
  rev_envoy_scout_tour: [
    { narr: '기사는 방과 주방을 꼼꼼히 훑어보더니 수첩에 무언가를 적었다. "정돈이 잘 되어 있군요. 사절단장님께 그대로 보고하겠습니다."' },
    { goto: 'rev_end' }
  ],
  rev_envoy_scout_meal: [
    { narr: '기사는 수프를 한 숟갈 뜨고 눈을 크게 떴다. 두 숟갈째에 말이 없었고 세 숟갈째에 수첩을 덮었다. "…이건 보고서에 적을 말이 없군요. 먹는 데 바빠서요."' },
    { goto: 'rev_end' }
  ],
  rev_envoy_scout_short: [
    { narr: '기사는 짧게 고개를 끄덕이고 돌아갔다. 인상이 어땠을지 알 수 없다. 사절단이 오는 날 알게 되겠지.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 장작 장수 (4주차) =================
  rev_storm_wood: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '이른 아침, 장작 수레를 끄는 장수가 여관 앞에 섰다. "폭풍이 온다니 장작이 불티나게 팔립니다. 지금 사 두시면 값을 깎아 드리죠."' },
    { choice: [
      { text: '장작을 넉넉히 들인다. (8G)', cost: 8, set: { rep: 1, 'today.price': -10, 'today.note': '장작 장수가 재료도 덤으로 줘서 오늘 장보기가 10% 싸다' }, goto: 'rev_storm_wood_buy' },
      { text: '"집에 남은 걸로 버텨 볼게요."', goto: 'rev_storm_wood_skip' },
      { who: 'miho', text: '미호에게 흥정을 맡긴다.', if: 'aff.miho>=3', set: { 'aff.miho': 1, 'today.price': -20, 'today.note': '미호가 장작값을 확 깎아서 오늘 장보기가 20% 싸다' }, goto: 'rev_storm_wood_miho' }
    ] }
  ],
  rev_storm_wood_buy: [
    { narr: '창고 한쪽에 장작이 층층이 쌓였다. 장수는 고마워하며 보너스로 소금 한 자루까지 얹어 주었다. 폭풍이 오기 전에 작은 준비가 하나 끝났다.' },
    { goto: 'rev_end' }
  ],
  rev_storm_wood_skip: [
    { narr: '장수는 어깨를 으쓱하고 옆집으로 향했다. 창고의 장작 수를 세어 보니 모자랄 것 같다. 다음 장사꾼이 와 주면 좋겠다.' },
    { goto: 'rev_end' }
  ],
  rev_storm_wood_miho: [
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '장작 한 단에 이 정도라고요? 어머, 그건 도둑질이에요. 제가 도적 출신인데도 이건 양심이 아파요. 이 가격은 어때요?' },
    { narr: '십 분 후 장수는 머리를 쥐어뜯으며 장작을 내렸다. 미호가 장부에 한 줄 적었다. "오늘의 승리." 꼬리가 높이 올랐다.' },
    { goto: 'rev_end' }
  ],

  // ================= 단발: 옛 병사의 전설 =================
  rev_old_soldier: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '식당 구석에서 백발의 노인이 따뜻한 차를 마시며 중얼거렸다. "삼백 년 전에도 이런 하늘이었지. 푸른 빛이 올라오고 가축이 울고 새들이 남쪽으로 갔어." 눈빛이 먼 곳을 보고 있다.' },
    { choice: [
      { text: '옆에 앉아 이야기를 끝까지 들어 준다.', set: { rep: 1 }, goto: 'rev_old_soldier_listen' },
      { text: '"그때는 어떻게 이겨 냈어요?" 질문을 던진다.', goto: 'rev_old_soldier_ask' },
      { text: '"어르신, 차가 식어요." 가볍게 말을 돌린다.', goto: 'rev_old_soldier_skip' }
    ] }
  ],
  rev_old_soldier_listen: [
    { narr: '노인의 이야기는 한 시간이 넘게 이어졌다. 어떤 병사가 어떤 구멍을 막았고, 어떤 마법사가 이름을 바쳤는지. 전부 책에서 읽은 이야기 같지만 목소리에는 진짜 슬픔이 있었다.' },
    { goto: 'rev_end' }
  ],
  rev_old_soldier_ask: [
    { narr: '"서로 손을 놓지 않았지." 노인이 말했다. "그게 전부야. 별것 아닌 것 같지만 그것밖에 없었어." 노인은 찻잔을 비우고 천천히 일어났다. 한참 동안 그 말이 머릿속에서 울렸다.' },
    { goto: 'rev_end' }
  ],
  rev_old_soldier_skip: [
    { narr: '노인은 웃으며 차를 비웠다. "그래, 그래. 이런 이야기는 젊은이에게 어울리지 않지." 노인이 떠난 뒤에도 의자에서 따뜻한 온기가 남아 있었다.' },
    { goto: 'rev_end' }
  ]
});
