// ============================================================
//  밤 사건 장면 (추가분) — 데이터는 story/lodging.js 의 nightEvents.events 에 있습니다. (규칙은 story/night-events.js 머리말과 같음)
//  - 씬 이름 nev_<id>, 끝은 nev_end. 선택지 효과는 소폭(골드 ±15, 평판 ±2, 호감도 0~2 증가), lodge.note 로 다음 날 아침 정산 문구를 남깁니다.
//  - 주차/호감도 조건은 lodging.js 의 events.<id>.if 에서 겁니다. (예: 'cal.week>=3')
// ============================================================
Object.assign(STORY.scenes, {

  // ---------- 비 오는 밤의 나그네 ----------
  nev_rain_guest: [
    { bgm: 'inn_night' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '밤비가 지붕을 두드린다. 그때 문 앞에서 쿵쿵 소리가 났다. 흠뻑 젖은 나그네 한 사람이 처마 밑에서 떨고 있다.' },
    { narr: '"방은 필요 없어요. 불 곁에서 옷만 말리게 해 주세요…" 목소리가 얼어 있다.' },
    { choice: [
      { text: '난로 앞에 의자를 내주고 따뜻한 수프를 데운다', set: { gold: -3, rep: 1, 'lodge.note': '비 오는 밤 나그네에게 수프를 대접했다. 아침에 감사 인사 쪽지가 문틈에 꽂혀 있었다.' }, goto: 'nev_rain_guest_soup' },
      { text: '수건과 마른 담요만 건넨다', set: { gold: -1, 'lodge.note': '젖은 나그네에게 담요를 빌려주었다. 담요는 아침에 곱게 개어져 돌아왔다.' }, goto: 'nev_rain_guest_blanket' }
    ] }
  ],
  nev_rain_guest_soup: [
    { narr: '나그네는 수프 그릇을 두 손으로 감싸 쥐고 한참 동안 말이 없었다. 난로 불빛에 얼굴이 천천히 붉어졌다.' },
    { narr: '"이런 집이 있다는 걸 믿고 걸어왔습니다." 새벽에 일어나 보니 그는 이미 떠나고 없었다. 식탁 위에는 동전 세 닢과 빈 그릇이 놓여 있었다.' },
    { goto: 'nev_end' }
  ],
  nev_rain_guest_blanket: [
    { narr: '나그네는 담요를 둘러쓰고 난로 옆 의자에서 꾸벅꾸벅 졸았다. 빗소리와 장작 타는 소리가 번갈아 들렸다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 코 고는 손님 ----------
  nev_snorer: [
    { bgm: 'inn_night' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '쿠르르릉— 쿠르릉— 한밤중 천장에서 정체 모를 소리가 울린다. 접시가 달그락거릴 정도다. 위층 손님의 코 고는 소리다.' },
    { narr: '다른 방 손님들이 하나둘 복도로 나와 서성이고 있다. 모두 눈 밑이 어둡다.' },
    { choice: [
      { text: '코 고는 손님 방에 가서 어깨를 살짝 돌려 눕힌다', set: { rep: 1, 'lodge.note': '코 고는 손님을 살짝 돌려 눕혔더니 거짓말처럼 조용해졌다.' }, goto: 'nev_snorer_turn' },
      { text: '복도 손님들께 귀마개 대신 솜을 나눠 준다', set: { gold: -2, 'lodge.note': '손님들께 귀마개용 솜을 나눠 드렸다. 다들 아침에 쓴웃음을 지었다.' }, goto: 'nev_snorer_cotton' },
      { text: '"조금만 참으세요" 하고 문을 닫는다', set: { gold: -4, 'lodge.note': '시끄러운 밤이었다. 몇몇 손님이 아침에 숙박비 일부를 깎아 달라고 했다.' }, goto: 'nev_snorer_ignore' }
    ] }
  ],
  nev_snorer_turn: [
    { narr: '조심조심 어깨를 밀어 옆으로 눕히자 천둥이 뚝 그쳤다. 손님은 잠결에 "고맙소…" 하고 중얼거렸다.' },
    { narr: '복도에서 박수가 터질 뻔했지만 모두 입을 막고 웃음을 참았다.' },
    { goto: 'nev_end' }
  ],
  nev_snorer_cotton: [
    { narr: '솜을 귀에 꽂은 손님들이 서로를 보며 소리 없이 웃었다. 코 고는 소리는 조금 먼 파도 소리처럼 들렸다.' },
    { goto: 'nev_end' }
  ],
  nev_snorer_ignore: [
    { narr: '결국 새벽까지 천둥소리가 이어졌다. 아침 식탁은 하품 소리로 가득했다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 여우불 (미호) ----------
  nev_fox_fire: [
    { bgm: 'romance' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '마당에 푸르스름한 불빛이 둥둥 떠다닌다. 창문 너머로 보니 불빛 한가운데 미호가 서서 손가락을 까딱이고 있다.' },
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '앗, 사장님! 이건 그냥… 불쏘시개 실험이에요. 장작값을 아끼려고요. 진짜예요!' },
    { say: 'miho', face: 'shy', text: '…사실 어릴 때부터 달 밝은 밤이면 저절로 나와요. 무서워요?' },
    { choice: [
      { who: 'miho', text: '"예뻐요. 같이 봐도 돼요?"', set: { 'aff.miho': 2, 'lodge.note': '마당에서 미호의 여우불을 구경했다. 미호는 아침까지 말이 적었다.' }, goto: 'nev_fox_fire_see' },
      { who: 'miho', text: '"그 불로 난로 좀 피워 줘요. 장작 아낄 수 있겠어요."', set: { gold: 4, 'aff.miho': 1, 'lodge.note': '미호의 여우불로 난로를 피웠다. 장작값 4G 절약!' }, goto: 'nev_fox_fire_use' }
    ] }
  ],
  nev_fox_fire_see: [
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '…다들 요괴 같다고 도망갔는데. 사장님은 도망 안 가네요. 이상한 사람.' },
    { narr: '푸른 불빛이 두 사람 주위를 천천히 돌았다. 꼬리 끝이 슬쩍 불빛을 건드릴 때마다 작은 불꽃이 반짝였다.' },
    { goto: 'nev_end' }
  ],
  nev_fox_fire_use: [
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '이 불로 난로를요? 그건 생각 못 했네… 사장님, 장사 머리가 있어요! 대신 불쏘시개 사용료는 받을게요. 농담이에요, 농담.' },
    { goto: 'nev_end' }
  ],

  // ---------- 한밤의 주방 (에리온과 단것) ----------
  nev_midnight_snack: [
    { bgm: 'inn_night' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '부스럭, 달그락. 주방에서 작은 소리가 난다. 도둑인가 싶어 몰래 들여다보니 후드를 눌러쓴 사람이 꿀 항아리 앞에 서 있다.' },
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '…!! 이건 봉인 연구용 시료야. 점도와 당도를 측정하고 있었어. 절대 먹고 있던 게 아니야.' },
    { say: 'erion', face: 'shy', text: '…입가에 꿀 묻었다고 말하지 마.' },
    { choice: [
      { who: 'erion', text: '"측정이라면 같이 해요. 저도 시료 담당할게요."', set: { gold: -2, 'aff.erion': 2, 'lodge.note': '한밤의 주방에서 에리온과 꿀 시료를 함께 측정했다. 항아리가 가벼워졌다.' }, goto: 'nev_midnight_snack_join' },
      { who: 'erion', text: '"비밀로 해 줄게요. 대신 내일 차는 에리온이 끓여요."', set: { 'aff.erion': 1, 'lodge.note': '에리온의 한밤 간식은 둘만의 비밀이 되었다.' }, goto: 'nev_midnight_snack_secret' }
    ] }
  ],
  nev_midnight_snack_join: [
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…그래. 연구에는 두 번째 관측자가 필요하니까. 한 숟갈만이야, 한 숟갈만.' },
    { narr: '한 숟갈은 어느새 세 숟갈이 되었다. 달콤한 향이 주방에 번졌다.' },
    { goto: 'nev_end' }
  ],
  nev_midnight_snack_secret: [
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…좋아, 거래 성립이야. 내일 끓이는 차는 특별히 진하게 해 줄게.' },
    { goto: 'nev_end' }
  ],

  // ---------- 야간 순찰 (카엘라) ----------
  nev_night_watch: [
    { bgm: 'inn_night' }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '문단속을 하러 나갔더니 여관 앞마당에서 누군가 국자를 창처럼 들고 서성이고 있다. 달빛에 투구 대신 냄비 뚜껑이 번쩍인다.' },
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { say: 'kaela', text: '아, 아니에요! 야간 경계 훈련이에요! 이상한 그림자가 있어서… 알고 보니 빨랫줄이었지만요!' },
    { choice: [
      { who: 'kaela', text: '"그럼 같이 순찰해요. 한 바퀴만."', set: { 'aff.kaela': 2, 'lodge.note': '카엘라와 야간 순찰을 한 바퀴 돌았다. 빨랫줄 외에는 아무 일도 없었다.' }, goto: 'nev_night_watch_walk' },
      { who: 'kaela', text: '"따뜻한 우유부터 마셔요. 보초도 쉬어야죠."', set: { gold: -1, 'aff.kaela': 1, 'lodge.note': '야간 순찰 중이던 카엘라에게 따뜻한 우유를 건넸다.' }, goto: 'nev_night_watch_milk' }
    ] }
  ],
  nev_night_watch_walk: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '둘이 서니까 든든해요! 앞은 제가 맡을게요. 뒤는… 뒤는 사장님이 봐 주세요!' },
    { narr: '마당을 한 바퀴 돌고 우물가를 지나 처마 밑까지. 카엘라의 발소리가 일정하게 울렸다. 이번엔 박자가 정확했다.' },
    { goto: 'nev_end' }
  ],
  nev_night_watch_milk: [
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…따뜻해요. 보초 근무 중에 이러면 안 되는데, 이건 휴식도 임무의 일부니까 괜찮겠죠?' },
    { goto: 'nev_end' }
  ],

  // ---------- 자장가 (리아) ----------
  nev_lullaby: [
    { bgm: 'romance' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '2층 복도 끝에서 낮은 노랫소리가 들린다. 어린 손님이 잠들지 못해 칭얼대는 걸 리아가 무릎에 앉히고 노래를 불러 주고 있다.' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '쉿, 이제 막 잠들려는 참이에요. 사장님도 들어와요. 이 노래, 어릴 때 우리 같이 불렀던 거 기억나요?' },
    { choice: [
      { who: 'lia', text: '작은 목소리로 같이 부른다', set: { 'aff.lia': 2, 'lodge.note': '리아와 함께 어린 손님에게 자장가를 불러 주었다. 아이는 곧 잠들었다.' }, goto: 'nev_lullaby_sing' },
      { who: 'lia', text: '말없이 담요를 끌어올려 준다', set: { 'aff.lia': 1, 'lodge.note': '리아가 재운 아이에게 담요를 덮어 주었다.' }, goto: 'nev_lullaby_blanket' }
    ] }
  ],
  nev_lullaby_sing: [
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…음정이 하나도 안 변했네요. 그때도 사장님은 두 번째 줄만 틀렸어요. 후후.' },
    { goto: 'nev_end' }
  ],
  nev_lullaby_blanket: [
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '고마워요. 이럴 때 말 안 해도 되는 사람, 사장님밖에 없어요.' },
    { goto: 'nev_end' }
  ],

  // ---------- 흔들리는 밤 (2주차 이후, 봉인의 여진) ----------
  nev_tremor: [
    { bgm: 'tension' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '자정 무렵 바닥이 낮게 울렸다. 선반의 컵들이 짤랑거리고, 지하 어디선가 푸른빛이 새어 올라온다. 봉인이 또 한 번 뒤척인 것이다.' },
    { narr: '2층 손님들이 놀라서 계단 위에 모여 있다. "방금 뭐였죠?" 모두가 이쪽만 쳐다본다.' },
    { choice: [
      { text: '"오래된 마을이라 가끔 그래요" 하며 차분히 달랜다', set: { rep: 1, 'lodge.note': '밤의 흔들림에 놀란 손님들을 차분하게 달랬다.' }, goto: 'nev_tremor_calm' },
      { text: '따뜻한 차를 돌리며 이야기를 돌린다', set: { gold: -3, 'lodge.note': '흔들림에 놀란 손님들에게 따뜻한 차를 돌렸다.' }, goto: 'nev_tremor_tea' }
    ] }
  ],
  nev_tremor_calm: [
    { narr: '흔들림은 금세 잦아들었고, 손님들은 한숨을 쉬며 방으로 돌아갔다. 지하에서 올라오던 푸른빛도 조용히 사그라들었다.' },
    { narr: '(이 마을에 무슨 일이 일어나고 있다. 서두르지 않으면 안 될 것이다.)' },
    { goto: 'nev_end' }
  ],
  nev_tremor_tea: [
    { narr: '찻잔이 한 바퀴 돌 즈음, 손님들은 웃음을 되찾았다. 한 아이가 "아까 지진, 용이 뒤척인 거야?" 하고 물어서 모두 웃었다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 밤새 필사하는 사절단 서기 (3주차 이후) ----------
  nev_scribe_night: [
    { bgm: 'tension' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '새벽 두 시, 식당에 아직 불이 켜져 있다. 사절단 서기관이 낡은 종이 위에 쉼 없이 무언가를 베끼고 있다. 곁에는 푸른 표지의 책 그림이 있다.' },
    { narr: '"아, 사장님. 이건 공식 기록이 아닙니다. 그냥… 이 마을 전설이 마음에 들어서요." 서기관이 어색하게 웃는다.' },
    { choice: [
      { text: '"그럼 이 마을 이야기 하나 해 드릴게요." 옆에 앉는다', set: { rep: 1, 'lodge.note': '사절단 서기관에게 마을 이야기를 들려주었다. 보고서에 좋게 쓰겠다고 했다.' }, goto: 'nev_scribe_night_talk' },
      { text: '말없이 따뜻한 차와 간식을 놓아 준다', set: { gold: -2, 'lodge.note': '밤새 필사하는 서기관에게 야식을 놓아 주었다.' }, goto: 'nev_scribe_night_tea' }
    ] }
  ],
  nev_scribe_night_talk: [
    { narr: '이야기를 듣는 동안 서기관의 펜이 조금씩 느려졌다. "…이 기록은 공식 보고서에 안 넣겠습니다. 그냥 제 수첩에만 두죠."' },
    { goto: 'nev_end' }
  ],
  nev_scribe_night_tea: [
    { narr: '서기관은 고개를 한 번 숙이고 다시 펜을 들었다. 새벽빛이 창에 걸릴 때쯤, 식탁 위에는 빈 접시와 깨끗이 접힌 종이 한 장이 남았다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 반딧불이 (1~2주차) ----------
  nev_firefly: [
    { bgm: 'romance' }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '창밖이 이상하게 환하다. 나가 보니 마당 가득 반딧불이가 떠올랐다. 나뭇가지마다 작은 불빛이 별처럼 박혀 있다.' },
    { narr: '손님들도 하나둘 마당으로 나와 말없이 올려다본다. 이런 밤은 일 년에 며칠 안 된다고 한다.' },
    { choice: [
      { text: '마당에 의자를 내놓고 손님들께 차를 돌린다', set: { gold: -3, rep: 1, 'lodge.note': '반딧불이의 밤, 마당에서 손님들께 차를 돌렸다. 입소문이 났다.' }, goto: 'nev_firefly_tea' },
      { text: '혼자 조용히 벤치에 앉아 구경한다', set: { 'lodge.note': '반딧불이가 가득한 마당에서 혼자 한참 앉아 있었다.' }, goto: 'nev_firefly_alone' }
    ] }
  ],
  nev_firefly_tea: [
    { narr: '찻잔 위에도 반딧불이 하나가 내려앉았다. 손님 한 사람이 속삭였다. "여기서 하룻밤 더 묵고 싶군요."' },
    { goto: 'nev_end' }
  ],
  nev_firefly_alone: [
    { narr: '한참을 바라보다가 문득 오늘 하루가 얼마나 길었는지 생각했다. 불빛이 하나둘 꺼질 때까지 아무 소리도 내지 않았다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 불씨 지키기 (3주차 이후, 추운 밤) ----------
  nev_cold_night: [
    { bgm: 'inn_night' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '밤이 깊어지자 방 안 공기가 서늘해진다. 난로의 불씨가 거의 꺼져 가고 땔감 통도 비어 있다. 늦가을 밤바람이 문틈으로 들어온다.' },
    { choice: [
      { text: '창고에서 장작을 더 가져와 난로를 다시 지핀다', set: { gold: -3, rep: 1, 'lodge.note': '추운 밤, 장작을 더 가져와 난로를 지폈다. 손님들이 따뜻하게 잤다.' }, goto: 'nev_cold_night_wood' },
      { text: '남은 불씨를 모아 담요를 한 장씩 돌린다', set: { 'lodge.note': '불씨가 약한 밤, 손님방에 담요를 한 장씩 돌렸다.' }, goto: 'nev_cold_night_blanket' }
    ] }
  ],
  nev_cold_night_wood: [
    { narr: '장작이 탁 하고 튀자 불꽃이 살아났다. 위층에서 문 열리는 소리가 나더니 손님이 "아, 따뜻해졌어요" 하고 웃으며 다시 들어갔다.' },
    { goto: 'nev_end' }
  ],
  nev_cold_night_blanket: [
    { narr: '방마다 담요를 돌리자 복도의 발소리가 하나둘 사라졌다. 아침에 보니 모두 담요를 코끝까지 끌어올린 채 곤히 자고 있었다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 별 대신 먹구름 — 폭풍 전야 (4주차) ----------
  nev_calm_before: [
    { bgm: 'tension' }, { bg: 'roof_night' }, { hide: 'all' },
    { narr: '지붕 위에 올라가 하늘을 보았다. 별이 한 점도 없다. 바람이 뚝 멎고, 마을 개들이 약속이나 한 듯 조용하다.' },
    { narr: '이상할 만큼 고요한 밤이다. 마치 모든 것이 숨을 죽이고 무언가를 기다리는 것처럼.' },
    { choice: [
      { text: '내일을 위해 일찍 눕는다', set: { 'lodge.note': '폭풍 전야의 고요한 밤. 일찍 눈을 붙였다.' }, goto: 'nev_calm_before_sleep' },
      { text: '내려가서 창고 문과 지붕을 다시 한 번 살핀다', set: { gold: -2, rep: 1, 'lodge.note': '폭풍을 앞두고 창고 문과 지붕을 다시 단속했다.' }, goto: 'nev_calm_before_check' }
    ] }
  ],
  nev_calm_before_sleep: [
    { narr: '이불을 끌어올렸지만 쉽게 잠이 오지 않았다. 아래층에서 에리온의 책장 넘기는 소리만 희미하게 들렸다.' },
    { goto: 'nev_end' }
  ],
  nev_calm_before_check: [
    { narr: '사다리를 타고 올라가 기와를 하나하나 눌러 보았다. 헐거운 곳 두어 군데에 돌을 올려 두었다. 내일 쓸모가 있을지도 모른다.' },
    { goto: 'nev_end' }
  ]
});
