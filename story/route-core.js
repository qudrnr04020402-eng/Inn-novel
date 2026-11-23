// ============================================================
//  루트 확정 공통 장면 — 21일(3주차 일요일) 밤 "고백의 밤"
//  - story/routine.js 의 hol_night 가 21일이면 cf_open 으로 보내고, 끝나면 cf_after 가 휴일 밤의 나머지(hol_night_rest)로 돌려보냅니다.
//  - 고백 자격: 순서 이벤트 9개를 모두 봤고(ev.<id> >= 9) 호감도가 하트 5칸 이상(HEART(5)). 자격자만 선택지에 나옵니다.
//  - 고백 장면(route_<id>_confess)은 story/route-<id>.js 에 있습니다. 끝에서 flag.cf_night 이면 cf_after 로 돌아옵니다.
//  - 루트가 확정되면 flag.route / flag.route_<id> 가 켜지고 4주차 루트 이벤트(ROUTE_EVENTS)와 에필로그가 열립니다. (story/endings.js)
// ============================================================
// 고백 자격 조건식: 순서 이벤트 9개 + 하트 5칸
window.CF_COND = function (id) { return 'ev.' + id + '>=9 && aff.' + id + '>=' + HEART(5); };

Object.assign(STORY.scenes, {

  // ---------- 고백의 밤 ----------
  cf_open: [
    { set: { 'flag.cf_night': true } },
    { bgm: 'inn_night' },
    { time: '밤' }, { bg: 'roof_night' }, { hide: 'all' },
    { narr: '밤이 깊었다. 휴일의 여관은 손님도 없이 조용하고, 식당 난로에서 장작 타는 소리만 가끔 톡 튄다.' },
    { narr: '잠이 오지 않아 지붕으로 올라왔다. 별이 유난히 낮게 내려앉은 밤이다. 마을 불빛이 하나둘 꺼지고, 멀리 동굴 쪽 하늘만 희미하게 푸르다.' },
    { narr: '3주가 지났다. 처음엔 낯선 손님들이 한꺼번에 들이닥친 것이 전부였는데, 이제는 아침마다 누가 어디서 무엇을 하고 있을지 대충 짐작이 간다.' },
    { narr: '다음 주가 오면 하늘은 더 무거워질 것이다. 봉인이 풀리는 날까지 이제 열흘도 남지 않았다.' },
    { narr: '그때가 오기 전에, 마음을 말로 꺼내 둘 사람이 있다면 오늘이 좋겠다는 생각이 들었다. 내일이 되면 또 바빠질 테니까.' },
    { if: ['erion', 'kaela', 'miho', 'lia'].map(CF_COND).join(' || '), goto: 'cf_pick' },   // 자격자가 한 명이라도 있으면 선택지로 (조건식은 괄호 없이 || 만 사용)
    { goto: 'cf_none' }
  ],
  cf_pick: [
    { narr: '계단 아래에서 발소리가 났다. 한 사람이 아니다. 지붕 위로 올라올 사람도, 마당에서 올려다보는 사람도, 창문 너머에서 기다리는 사람도 있는 것 같다.' },
    { narr: '밤바람이 소매를 흔들었다. 오늘 밤은 한 사람에게만 마음을 건넬 수 있다. 누구에게, 갈까.' },
    { choice: [
      { who: 'erion', text: '푸른 책을 안고 지붕 아래에서 기다리는 에리온에게 간다.', tag: '고백 · 에리온', if: CF_COND('erion'), goto: 'route_erion_confess' },
      { who: 'kaela', text: '마당에서 대검을 세워 두고 별을 올려다보는 카엘라에게 간다.', tag: '고백 · 카엘라', if: CF_COND('kaela'), goto: 'route_kaela_confess' },
      { who: 'miho', text: '식당 창가에서 동전 한 닢을 만지작거리는 미호에게 간다.', tag: '고백 · 미호', if: CF_COND('miho'), goto: 'route_miho_confess' },
      { who: 'lia', text: '여관 문 앞에서 낡은 부적을 쥔 채 서성이는 리아에게 간다.', tag: '고백 · 리아', if: CF_COND('lia'), goto: 'route_lia_confess' },
      { text: '아직은 마음을 정하지 않는다. 별만 한참 올려다본다.', tag: '고백하지 않음', goto: 'cf_hold' }
    ] }
  ],
  // 자격자가 한 명도 없을 때
  cf_none: [
    { narr: '그런데 생각해 보니, 아직 누구에게도 마음의 끝까지 닿지는 못한 것 같다. 아니, 어쩌면 닿은 줄 알았던 마음을 아직 다 읽지 못한 것인지도 모른다.' },
    { narr: '서두를 일은 아니다. 남은 날 동안 한 사람 한 사람에게 더 가까이 다가가면 된다. 별은 내일도 뜰 테니까.' },
    { goto: 'cf_after' }
  ],
  // 고백하지 않기로 했을 때
  cf_hold: [
    { narr: '입을 열려다 말고 고개를 저었다. 지금 꺼내면 어딘가 덜 익은 말이 될 것 같았다.' },
    { narr: '아래층에서 누군가 조용히 문 닫는 소리가 들렸다. 별은 여전히 낮고, 밤은 길다. 다음 주의 하늘 아래에서 다시 생각해 보기로 했다.' },
    { goto: 'cf_after' }
  ],
  // 고백의 밤이 끝나면 휴일 밤의 나머지(밤 대화 사건 / 정산)로 돌아간다
  cf_after: [
    { set: { 'flag.cf_night': false } },
    { if: 'flag.route', goto: 'hol_close' },   // 고백한 밤에는 다른 히로인의 밤 대화로 이어지지 않게 바로 정산으로
    { goto: 'hol_night_rest' }
  ]
});
