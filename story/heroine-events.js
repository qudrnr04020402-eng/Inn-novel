// ============================================================
//  히로인 낮 이벤트 목록 (데이터) — 새 이벤트(6~10번째 …)는 여기에 한 줄 + 장면(씬)만 추가하면 됩니다.
//  - 낮 행동 선택 화면(story/common.js 의 pick)은 이 표로 자동 만들어집니다. (js/cal-core.js 의 pickOptions)
//  - kind 가 'seq'(기본)인 이벤트는 "그 히로인을 N번째로 골랐을 때" 순서대로 열립니다. (ev.<id> = 지금까지 본 순서 이벤트 수)
//    다음 순서 이벤트의 조건이 아직 안 맞으면(예: 주차 전) 그 히로인은 "평범한 하루"(story/plain-days.js)로 대체됩니다.
//  - kind 가 'extra' 인 이벤트는 순서와 무관한 "조건 이벤트"(깊은 이야기 등)입니다. 조건이 맞으면 별도 선택지로 나오고, 한 번 보면 사라집니다.
//  - 조건(모두 만족해야 열림): minWeek / maxWeek(주차) · minDay / maxDay(일차) · minAff(그 히로인 호감도 값) · if(조건식, && 만 쓸 것)
//  - 장면(씬) 규칙: 순서 이벤트 씬은 {set:{'ev.<히로인id>':1}} 로 시작, 모든 이벤트 씬은 {goto:'after_pick'} 로 끝납니다.
//    extra 이벤트 씬은 'ev.' 를 올리지 않습니다 (본 기록은 선택 시 자동으로 evdone.<id> 에 남습니다).
//  - 예) 에리온 6번째(순서) 이벤트: erion 배열 맨 뒤(extra 앞/뒤 상관없음, seq 끼리만 순서)에
//      { id: 'erion_6', scene: 'erion_6', text: '미리보기 한 줄', minWeek: 3, minAff: HEART(3) }
//    그리고 story/ 아래 새 파일(또는 기존 파일)에 STORY.scenes.erion_6 를 만들고, index.html 과 sw.js 에 파일을 등록하세요.
// ============================================================
window.HEROINE_EVENTS = {
  erion: [
    { id: 'erion_1', scene: 'erion_1', minWeek: 1, text: '마당 구석 벤치에서 푸른 책을 펼쳐 놓고 먼 산을 보고 있다.' },
    { id: 'erion_2', scene: 'erion_2', minWeek: 2, text: '주방 앞을 서성인다. 달콤한 냄새가 나는 쪽을 자꾸 흘끔거린다.' },
    { id: 'erion_3', scene: 'erion_3', minWeek: 3, text: '손에 붕대를 감은 채 동굴 쪽으로 걸어가고 있다.' },
    { id: 'erion_4', scene: 'erion_4', minWeek: 4, text: '지붕 위에서 책을 안고 가만히 앉아 있다.' },
    { id: 'erion_5', scene: 'erion_5', kind: 'extra', minWeek: 3, minAff: HEART(4), tag: '깊은 이야기', text: '붉게 물든 하늘 아래, 책 맨 뒷장을 펼쳐 놓고 한참을 보고 있다.' }
  ],
  kaela: [
    { id: 'kaela_1', scene: 'kaela_1', minWeek: 1, text: '마당에서 대검을 휘두르고 있다. 폼이 요란하다. 빨랫줄이 위험하다.' },
    { id: 'kaela_2', scene: 'kaela_2', minWeek: 2, text: '마을 아이들에게 둘러싸여 무용담을 늘어놓는 중이다.' },
    { id: 'kaela_3', scene: 'kaela_3', minWeek: 3, text: '창고 구석에서 혼자 갑옷을 닦고 있다. 어쩐지 기운이 없다.' },
    { id: 'kaela_4', scene: 'kaela_4', minWeek: 4, text: '"동굴 주변을 정찰하겠다!" 하며 이미 문 앞에 서 있다.' },
    { id: 'kaela_5', scene: 'kaela_5', kind: 'extra', minWeek: 3, minAff: HEART(4), tag: '깊은 이야기', text: '여관 계단에 앉아 구겨진 종이를 폈다 접었다 하고 있다. 큰 소리가 없다.' }
  ],
  miho: [
    { id: 'miho_1', scene: 'miho_1', minWeek: 1, text: '카운터 앞을 어슬렁거린다. 눈이 손님 지갑을 따라다닌다.' },
    { id: 'miho_2', scene: 'miho_2', minWeek: 2, text: '식료품 창고 구석에서 장부 같은 걸 펴 놓고 동전을 세고 있다.' },
    { id: 'miho_3', scene: 'miho_3', minWeek: 3, text: '뒷마당 우물가에 걸터앉아 편지를 읽고 있다. 평소답지 않게 조용하다.' },
    { id: 'miho_4', scene: 'miho_4', minWeek: 4, text: '귀를 쫑긋 세운 채 동굴 쪽을 바라보고 있다.' },
    { id: 'miho_5', scene: 'miho_5', kind: 'extra', minWeek: 3, minAff: HEART(4), tag: '깊은 이야기', text: '카운터 뒤에서 낡은 편지 뭉치를 꺼내 놓고 조용히 동전을 세고 있다.' }
  ],
  lia: [
    { id: 'lia_1', scene: 'lia_1', minWeek: 1, text: '양동이와 걸레를 들고 복도를 닦고 있다. 콧노래가 들린다.' },
    { id: 'lia_2', scene: 'lia_2', minWeek: 2, text: '물동이를 이고 우물에서 돌아오는 길이다. 어쩐지 위태위태하다.' },
    { id: 'lia_3', scene: 'lia_3', minWeek: 3, text: '창가에 앉아 말없이 바깥을 보고 있다. 표정이 평소와 조금 다르다.' },
    { id: 'lia_4', scene: 'lia_4', minWeek: 4, text: '신전 앞 계단에 앉아 있다. 손에 낡은 부적을 쥐고 있다.' },
    { id: 'lia_5', scene: 'lia_5', kind: 'extra', minWeek: 3, minAff: HEART(4), tag: '깊은 이야기', text: '신전 문 앞에 서서 한참을 들어가지 못하고 있다.' }
  ]
};
