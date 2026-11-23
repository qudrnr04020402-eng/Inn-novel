// ============================================================
//  히로인 신경전 — 두 히로인의 호감도가 둘 다 높을 때(하트 2칸 반 이상) 영업 직전에 일어나는 짧은 코믹 장면
//  - 한 회차에 최대 max 번, 범위(range) 안의 낮 이벤트 직후(저녁 영업 직전)에만 일어납니다. 같은 쌍은 한 번만.
//  - 선택지: 한쪽 편들기(편든 사람 호감도 +2, 상대 -1) / 둘 다 달래기(둘 다 +1). 평판은 변하지 않습니다.
//  - 새 쌍을 추가하려면 pairs 에 한 줄 + 아래 scenes 에 씬 한 개를 만드세요. (씬 끝은 {rivret:true})
//  - 확률이 아니라 "조건을 만족하면" 일어납니다. 조건을 만족하는 쌍이 여럿이면 두 사람 호감도 합이 높은 쌍이 먼저입니다.
// ============================================================
window.RIVALRY = {
  max: 4,                          // 한 회차에 일어나는 최대 횟수
  range: [5, 27],                  // 일어날 수 있는 일차 범위 [처음, 끝]
  gap: 3,                          // 직전 신경전과 최소 이 일수 이상 떨어져야 함
  need: HEART(2) + 2,               // 두 사람 모두 이 호감도 이상 (하트 2칸 반 상당)
  pairs: [
    { id: 'lia_miho',    a: 'lia',   b: 'miho',  scene: 'riv_lia_miho',    title: '주인장 옆자리' },
    { id: 'kaela_erion', a: 'kaela', b: 'erion', scene: 'riv_kaela_erion', title: '누가 더 도움이 됐나' },
    { id: 'miho_erion',  a: 'miho',  b: 'erion', scene: 'riv_miho_erion',  title: '마지막 꿀과자' },
    { id: 'kaela_lia',   a: 'kaela', b: 'lia',   scene: 'riv_kaela_lia',   title: '아침 식사 당번' }
  ]
};
// 시작 변수: riv.done = 일어난 쌍들, riv.n = 일어난 횟수, riv.ret = 끝난 뒤 돌아갈 씬
STORY.init.riv = { done: [], n: 0, ret: '' };

Object.assign(STORY.scenes, {

  // ---------- 리아 vs 미호: 주인장 옆자리 ----------
  riv_lia_miho: [
    { bgm: 'tavern' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '영업 준비로 바쁜 저녁 무렵의 식당. 카운터 끝, 주인의 바로 옆자리를 두고 두 사람 사이에 보이지 않는 불꽃이 튀고 있다.' },
    { show: 'lia', face: 'angry', pos: 'left' },
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'lia', text: '그 자리는 내가 먼저 앉았거든? 걸레질하다 잠깐 일어난 것뿐이야!' },
    { say: 'miho', text: '어머, 자리에 이름이 적혀 있나요? 앉은 사람이 임자죠. 게다가 사장님 옆자리는 영업 정보가 제일 잘 들려서요. 사용료는 3할!' },
    { say: 'lia', face: 'sad', text: '정보가 아니라 마음 쓰이는 사람 옆에 앉고 싶은 거라고. …아, 아니 이상한 뜻 아니야!' },
    { say: 'miho', face: 'normal', text: '아하, 그쪽이 더 솔직한 이유네요. 그럼 사장님이 직접 정해요. 어느 쪽이 자리의 주인이죠?' },
    { narr: '두 사람의 시선이 일제히 이쪽을 향했다. 어느 쪽을 보아도 눈빛이 따갑다.' },
    { choice: [
      { who: 'lia', text: '"리아가 먼저 앉았으니 리아 자리죠."', set: { 'aff.lia': 2, 'aff.miho': -1 }, goto: 'riv_lia_miho_a' },
      { who: 'miho', text: '"미호가 영업 정보를 챙겨 주니 오늘은 미호 자리로."', set: { 'aff.miho': 2, 'aff.lia': -1 }, goto: 'riv_lia_miho_b' },
      { text: '"카운터 양쪽에 앉으면 되잖아요. 가운데는 제가 설게요."', set: { 'aff.lia': 1, 'aff.miho': 1 }, goto: 'riv_lia_miho_c' }
    ] }
  ],
  riv_lia_miho_a: [
    { show: 'lia', face: 'smile' }, { show: 'miho', face: 'sad' },
    { say: 'lia', text: '거봐! 역시 알아주는구나. …고마워. 나, 오늘 영업 열심히 도울게!' },
    { say: 'miho', text: '칫, 소꿉친구는 반칙이에요. …좋아요, 오늘은 양보할게요. 대신 외상 이자는 올려요.' },
    { goto: 'riv_end' }
  ],
  riv_lia_miho_b: [
    { show: 'miho', face: 'smile' }, { show: 'lia', face: 'sad' },
    { say: 'miho', text: '역시 사장님은 장사가 뭔지 아세요! 앞으로도 정보는 제가 책임질게요!' },
    { say: 'lia', text: '…알았어. 오늘은 양보할게. 하지만 내일은 내가 먼저 앉을 거야. 꼭이야.' },
    { goto: 'riv_end' }
  ],
  riv_lia_miho_c: [
    { show: 'lia', face: 'surprised' }, { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '…양쪽? 그러면 사장님 양옆이 다 막히는데요? 도망칠 구멍이 없잖아요!' },
    { say: 'lia', face: 'shy', text: '그, 그게 싫은 건 아니니까… 오늘은 이걸로 봐줄게.' },
    { narr: '결국 세 사람이 나란히 카운터에 앉았다. 두 사람이 서로 팔꿈치를 슬쩍 밀고 있는 건 못 본 척하기로 했다.' },
    { goto: 'riv_end' }
  ],

  // ---------- 카엘라 vs 에리온: 누가 더 도움이 됐나 ----------
  riv_kaela_erion: [
    { bgm: 'tavern' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '저녁 영업 직전. 식탁 두 개를 붙여 놓고 카엘라와 에리온이 마주 앉아 서로 팔짱을 끼고 있다. 분위기가 심상치 않다.' },
    { show: 'kaela', face: 'angry', pos: 'left' },
    { show: 'erion', face: 'angry', pos: 'right' },
    { say: 'kaela', text: '인정해라, 에리온! 어젯밤 여관을 지킨 건 이 몸의 대검이다! 모든 괴물이 내 기합에 도망쳤다!' },
    { say: 'erion', text: '…도망친 건 너의 빨랫줄 때문이야. 실제로 결계를 친 건 나고, 네가 휘두른 대검에 내 결계 문양 세 개가 지워졌어.' },
    { say: 'kaela', face: 'surprised', text: '그, 그건 결계 위치가 나빴던 탓이다!' },
    { say: 'erion', text: '…결계 위치를 정한 건 너한테 설명했잖아. 열 번도 넘게.' },
    { narr: '두 사람의 시선이 동시에 이쪽을 향했다. 이번 일에 대한 판결이 필요한 모양이다.' },
    { choice: [
      { who: 'kaela', text: '"카엘라가 앞에서 시선을 끌어 준 덕이 컸어요."', set: { 'aff.kaela': 2, 'aff.erion': -1 }, goto: 'riv_kaela_erion_a' },
      { who: 'erion', text: '"에리온의 결계가 없었으면 큰일 날 뻔했어요."', set: { 'aff.erion': 2, 'aff.kaela': -1 }, goto: 'riv_kaela_erion_b' },
      { text: '"앞과 뒤, 두 사람이 있어서 가능했어요. 함께 한 거죠."', set: { 'aff.kaela': 1, 'aff.erion': 1 }, goto: 'riv_kaela_erion_c' }
    ] }
  ],
  riv_kaela_erion_a: [
    { show: 'kaela', face: 'smile' }, { show: 'erion', face: 'angry' },
    { say: 'kaela', text: '하하하! 들었느냐, 에리온! 역시 주인장은 진정한 영웅을 알아본다!' },
    { say: 'erion', text: '…결계 문양 세 개 값은 이 몸이 청구할 거야. 다음 식사비에서 뺄 테니 알아 둬.' },
    { goto: 'riv_end' }
  ],
  riv_kaela_erion_b: [
    { show: 'erion', face: 'smile' }, { show: 'kaela', face: 'sad' },
    { say: 'erion', text: '…당연한 말이야. 하지만 들으니 나쁘진 않네.' },
    { say: 'kaela', text: '으, 으윽… 부정할 수 없구나. 그래도 다음엔 결계 안쪽에서 영웅답게 활약하겠다!' },
    { goto: 'riv_end' }
  ],
  riv_kaela_erion_c: [
    { show: 'kaela', face: 'surprised' }, { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…함께? 이 칠칠맞지 못한 기사랑?' },
    { say: 'kaela', text: '으, 칠칠맞다니! …하지만 앞은 내가, 뒤는 에리온이 맡는다면 확실히 최강이긴 하군.' },
    { narr: '두 사람은 서로 눈을 피하면서도 어색하게 악수를 했다. 손에 힘이 지나치게 들어가 있는 건 못 본 척했다.' },
    { goto: 'riv_end' }
  ],

  // ---------- 미호 vs 에리온: 마지막 꿀과자 ----------
  riv_miho_erion: [
    { bgm: 'tavern' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '영업을 준비하던 주방. 접시 위에 꿀과자가 딱 한 조각 남았다. 그 조각을 사이에 두고 미호와 에리온의 손이 동시에 멈췄다.' },
    { show: 'miho', face: 'angry', pos: 'left' },
    { show: 'erion', face: 'shy', pos: 'right' },
    { say: 'miho', text: '이건 영업 시식용이에요! 원가가 얼만지 알아요? 제가 먼저 집었으니까 제 거예요!' },
    { say: 'erion', text: '…나, 단 거 안 좋아해. 그냥 모양이 흥미로워서 관찰하려던 것뿐이야. 마력 흐름을… 보려고.' },
    { say: 'miho', face: 'surprised', text: '관찰이요? 꿀과자의 마력 흐름이요? …귀가 새빨간데요, 에리온 씨?' },
    { say: 'erion', face: 'angry', text: '…아, 아니야! 이건 부엌이 더워서 그런 거야!' },
    { narr: '두 사람은 접시 끝을 사이에 두고 한 치도 물러서지 않는다. 시선이 이쪽으로 향했다.' },
    { choice: [
      { who: 'miho', text: '"시식용은 미호 몫이죠. 영업 담당이니까."', set: { 'aff.miho': 2, 'aff.erion': -1 }, goto: 'riv_miho_erion_a' },
      { who: 'erion', text: '"에리온도 좋아하는 거 알아요. 오늘은 에리온이 먹어요."', set: { 'aff.erion': 2, 'aff.miho': -1 }, goto: 'riv_miho_erion_b' },
      { text: '"반으로 나눠요. 제가 칼로 정확히 반으로 가를게요."', set: { 'aff.miho': 1, 'aff.erion': 1 }, goto: 'riv_miho_erion_c' }
    ] }
  ],
  riv_miho_erion_a: [
    { show: 'miho', face: 'smile' }, { show: 'erion', face: 'sad' },
    { say: 'miho', text: '해냈다! 아~ 이 달콤함! 사장님은 정말 장사를 아세요! 수수료는 오늘은 면제!' },
    { say: 'erion', text: '…흥. 별로 먹고 싶지도 않았거든. …다음에 또 만들어 주면, 그땐 관찰해 볼게.' },
    { goto: 'riv_end' }
  ],
  riv_miho_erion_b: [
    { show: 'erion', face: 'shy' }, { show: 'miho', face: 'sad' },
    { say: 'erion', text: '…좋아하는 거 알고 있었어? …누가 말한 거야. 이 일은 비밀로 해 줘.' },
    { say: 'miho', text: '으으, 내 꿀과자… 알았어요, 오늘만은 양보할게요. 대신 에리온 씨, 저 한 입은 안 줘요?' },
    { goto: 'riv_end' }
  ],
  riv_miho_erion_c: [
    { show: 'miho', face: 'surprised' }, { show: 'erion', face: 'surprised' },
    { narr: '조심스럽게 칼날을 대고 과자를 정확히 반으로 갈랐다. 두 사람이 동시에 반쪽을 낚아챘다.' },
    { say: 'miho', face: 'smile', text: '…어, 반쪽도 충분히 달아요! 이건 가성비가 좋은데요?' },
    { say: 'erion', face: 'shy', text: '…나쁘지 않아. 조금만 더 있으면 좋았겠지만. …아니, 아무것도 아니야.' },
    { goto: 'riv_end' }
  ],

  // ---------- 카엘라 vs 리아: 아침 식사 당번 ----------
  riv_kaela_lia: [
    { bgm: 'tavern' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '영업 직전의 식당. 오늘 주인의 저녁 식사를 누가 차려 줄 것인지를 놓고 카엘라와 리아가 앞치마를 사이에 두고 맞서고 있다.' },
    { show: 'kaela', face: 'angry', pos: 'left' },
    { show: 'lia', face: 'angry', pos: 'right' },
    { say: 'kaela', text: '주인장의 체력은 곧 여관의 전력이다! 영양을 챙기는 건 기사의 임무! 오늘의 식사는 이 몸이 만들겠다!' },
    { say: 'lia', text: '카엘라는 지난번에 소금이랑 설탕을 헷갈렸잖아! 그걸 주인 먹이려고?' },
    { say: 'kaela', face: 'surprised', text: '그, 그건 전략적 조미였다! 단짠의 조화다!' },
    { say: 'lia', face: 'sad', text: '…난 어릴 때부터 이 사람 입맛을 제일 잘 알아. 그렇지? 그치?' },
    { narr: '앞치마 끈을 붙잡은 두 사람이 이쪽을 바라본다. 대답이 늦어질수록 긴장감이 높아진다.' },
    { choice: [
      { who: 'kaela', text: '"카엘라의 요리, 한번 도전해 볼게요."', set: { 'aff.kaela': 2, 'aff.lia': -1 }, goto: 'riv_kaela_lia_a' },
      { who: 'lia', text: '"리아가 만든 게 제일 입에 맞아요."', set: { 'aff.lia': 2, 'aff.kaela': -1 }, goto: 'riv_kaela_lia_b' },
      { text: '"카엘라는 재료 손질, 리아는 간 맞추기. 둘이 같이 해요."', set: { 'aff.kaela': 1, 'aff.lia': 1 }, goto: 'riv_kaela_lia_c' }
    ] }
  ],
  riv_kaela_lia_a: [
    { show: 'kaela', face: 'smile' }, { show: 'lia', face: 'sad' },
    { say: 'kaela', text: '하하하! 믿어 주는 건가! 좋다, 기사의 이름을 걸고 가장 맛있는 야전식을 대령하마!' },
    { say: 'lia', text: '…소금 단지는 내가 따로 치워 둘게. 만약을 위해서. 아, 질투 아니야!' },
    { goto: 'riv_end' }
  ],
  riv_kaela_lia_b: [
    { show: 'lia', face: 'smile' }, { show: 'kaela', face: 'sad' },
    { say: 'lia', text: '정말? 그럼 솜씨를 발휘해 볼게! 네가 좋아하는 버섯 수프로 할까?' },
    { say: 'kaela', text: '으윽… 부정할 수 없다. 하지만 다음엔 반드시 설탕과 소금을 구별해 내겠다!' },
    { goto: 'riv_end' }
  ],
  riv_kaela_lia_c: [
    { show: 'kaela', face: 'surprised' }, { show: 'lia', face: 'surprised' },
    { say: 'lia', text: '…둘이서? 카엘라랑 부엌에서? 조금 불안한데.' },
    { say: 'kaela', face: 'shy', text: '내가 손질한 재료는 틀림없다! 간 맞추기는 이 몸이 반드시… 리아에게 맡기겠다!' },
    { narr: '주방에서는 칼질 소리와 "간을 보고 나서 넣으라니까!" 하는 비명이 번갈아 들렸다. 의외로 저녁 식사는 맛있었다.' },
    { goto: 'riv_end' }
  ],

  riv_end: [
    { hide: 'all' },
    { narr: '소란이 가라앉고 영업 준비가 마무리되었다. 저녁 손님들이 하나둘 문을 열고 들어온다.' },
    { rivret: true }
  ]
});
