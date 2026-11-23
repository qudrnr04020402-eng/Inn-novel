// ============================================================
//  2회차 이상 한정 장면 — 낯익은 기분(기시감) 4편
//  - 조건: 변수 run(지금 회차)이 2 이상일 때만 낮 선택지에 나옵니다 (HEROINE_EVENTS 의 kind:'extra' + if:'run>=2').
//    vars.run 은 새 게임을 시작할 때 js/meta-core.js 가 정합니다. (1회차/옛 세이브에는 없음 = 이 장면은 나오지 않음)
//  - 메타 발언 없이 "어딘가 본 적 있는 기분" 정도로만 은근하게. 한 번 보면 사라집니다(evdone). extra 이벤트라서 'ev.<id>' 는 올리지 않고 {goto:'after_pick'} 로 끝납니다.
//  - 3회차 이상이면 대사가 한 줄 더 깊어집니다 ({if:'run>=3'}).
// ============================================================
(function () {
  var add = function (h, e) { (HEROINE_EVENTS[h] = HEROINE_EVENTS[h] || []).push(e); };
  add('erion', { id: 'ngp_erion', scene: 'ngp_erion', kind: 'extra', minWeek: 1, minDay: 3, if: 'run>=2', tag: '2회차 · 낯익은 얼굴', text: '마당 벤치에서 책을 펴 놓고, 책 대신 이쪽을 한참 바라보고 있다.' });
  add('kaela', { id: 'ngp_kaela', scene: 'ngp_kaela', kind: 'extra', minWeek: 1, minDay: 5, if: 'run>=2', tag: '2회차 · 기시감', text: '대검을 휘두르다 말고 빨랫줄을 올려다보며 고개를 갸웃거리고 있다.' });
  add('miho', { id: 'ngp_miho', scene: 'ngp_miho', kind: 'extra', minWeek: 1, minDay: 4, if: 'run>=2', tag: '2회차 · 이상한 감', text: '장부를 펴 놓고 숫자를 세다가 갑자기 연필을 멈췄다.' });
  add('lia', { id: 'ngp_lia', scene: 'ngp_lia', kind: 'extra', minWeek: 2, minDay: 8, if: 'run>=2', tag: '2회차 · 꿈 이야기', text: '창가에 앉아 졸린 얼굴로 창밖의 신전 종탑을 보고 있다.' });
})();

Object.assign(STORY.scenes, {

  // ================= 에리온: 전에 본 적 있는 얼굴 =================
  ngp_erion: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마당 벤치에서 에리온이 책을 펼쳐 둔 채 이쪽을 보고 있다. 책장은 한참 전부터 넘어가지 않은 모양이다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…이상한 말이지만, 한 가지 물어볼게. 우리, 전에 만난 적 있어?' },
    { say: 'erion', face: 'shy', text: '아니, 알아. 이 여관에 온 건 처음이고 너를 본 것도 처음이야. 그런데 네가 문을 열고 들어오는 모습이 자꾸 눈앞에 겹쳐서. 백 년을 살면 가끔 이런 일이 있어.' },
    { narr: '에리온은 책을 덮고 손끝으로 표지를 두드렸다. 푸른 표지가 어렴풋이 빛났다가 가라앉았다.' },
    { if: 'run>=3', goto: 'ngp_erion_3' },
    { goto: 'ngp_erion_ask' }
  ],
  ngp_erion_3: [
    { say: 'erion', face: 'sad', text: '…게다가 이번엔 책이 조용해. 마치 이미 한 번 읽은 이야기라서 더 할 말이 없다는 듯이. 이상하지?' },
    { goto: 'ngp_erion_ask' }
  ],
  ngp_erion_ask: [
    { choice: [
      { text: '"저도 그런 기분이 들 때가 있어요. 그럼 오늘 처음 인사하는 걸로 해요."', set: { 'aff.erion': 3 }, goto: 'ngp_erion_a' },
      { text: '"전생에 만났을지도 모르죠."', set: { 'aff.erion': 2 }, goto: 'ngp_erion_b' },
      { text: '"차 한 잔 드릴까요? 익숙한 맛으로요."', set: { 'aff.erion': 2, gold: -3 }, goto: 'ngp_erion_c' }
    ] }
  ],
  ngp_erion_a: [
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…좋아. 처음 뵙겠습니다, 여관 주인. 에리온이야. 오래 신세 질 거 같아. 이유는 모르겠지만.' },
    { goto: 'after_pick' }
  ],
  ngp_erion_b: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…농담이라도 그런 말은 조심해. 정말이면 곤란하니까. …곤란한 건 아니고, 어떻게 인사해야 할지 모르니까.' },
    { goto: 'after_pick' }
  ],
  ngp_erion_c: [
    { narr: '찻잔을 내밀자 에리온은 한 모금 마시더니 눈을 가늘게 떴다. 설탕이 반 스푼 더 들어간 차였다. 말한 적 없는데.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…역시 이상해. 네가 내 입맛을 어떻게 알아. 우연이지. 우연이라고 해 줘.' },
    { goto: 'after_pick' }
  ],

  // ================= 카엘라: 빨랫줄의 기시감 =================
  ngp_kaela: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '카엘라가 대검을 휘두르다 말고 빨랫줄 앞에 우뚝 섰다. 평소 같으면 이미 줄에 걸려 넘어졌을 타이밍이다.' },
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { say: 'kaela', text: '주인장! 이상하다! 이 몸은 지금 이 각도에서 빨랫줄에 걸릴 거란 확신이 든다! 오른발을 반 보 뒤로 빼야 안 걸린다는 확신까지!' },
    { narr: '카엘라는 정말로 오른발을 반 보 뒤로 뺐다. 대검이 빨랫줄 위를 사뿐히 스치고 지나갔다. 빨래 한 장 흔들리지 않았다.' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '봤나! 이것이 수련의 성과다! …아니, 수련한 적은 없는데. 몸이 먼저 알아서 움직였다! 이상한 일이군!' },
    { if: 'run>=3', goto: 'ngp_kaela_3' },
    { goto: 'ngp_kaela_ask' }
  ],
  ngp_kaela_3: [
    { say: 'kaela', face: 'normal', text: '…갑옷 할부 증서도 어디서 본 기분이다. 마지막 회차가 언제인지 외우고 있는 것 같단 말이지. 이 몸은 기사인데 어째서 이자 계산이 빠른 거지?' },
    { goto: 'ngp_kaela_ask' }
  ],
  ngp_kaela_ask: [
    { choice: [
      { text: '"대단해요! 그 감각, 마당 청소할 때도 써 주세요."', set: { 'aff.kaela': 3 }, goto: 'ngp_kaela_a' },
      { text: '"그럼 다음에 제가 어디서 넘어질지도 알아맞혀 봐요."', set: { 'aff.kaela': 2 }, goto: 'ngp_kaela_b' },
      { text: '"…정말로 수련한 적 없어요?" 슬쩍 떠본다.', set: { 'aff.kaela': 2 }, goto: 'ngp_kaela_c' }
    ] }
  ],
  ngp_kaela_a: [
    { say: 'kaela', face: 'smile', text: '맡겨라! 청소도 기사의 의무다! 빗자루를 쥐는 순간 이 몸의 직감이 폭발할 것이다!' },
    { narr: '카엘라는 빗자루를 들고 마당을 쓸었다. 놀랍게도 단 한 번도 먼지를 흘리지 않았다. 다만 빗자루 자루가 중간에 부러졌다.' },
    { goto: 'after_pick' }
  ],
  ngp_kaela_b: [
    { say: 'kaela', face: 'surprised', text: '으음… 주인장은 오늘 저녁, 계단 세 번째 칸에서 발을 헛디딘다! …아니, 어쩐지 그런 느낌이다!' },
    { narr: '저녁에 정말로 계단 세 번째 칸에서 휘청했다. 카엘라는 "봤지!" 하고 손뼉을 쳤고, 나는 입을 다물 수밖에 없었다.' },
    { goto: 'after_pick' }
  ],
  ngp_kaela_c: [
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…없다. 맹세코 없다. 그런데 주인장 얼굴을 보면 이상하게 안심이 된다. 오래 함께 싸운 전우를 만난 것처럼. 기사의 감이란 참 알 수 없군.' },
    { goto: 'after_pick' }
  ],

  // ================= 미호: 장부에 없는 숫자 =================
  ngp_miho: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '카운터 뒤에서 미호가 연필을 멈추고 이마를 긁적이고 있다. 귀가 반쯤 접혀 있다.' },
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '사장님, 이상해요. 장부에 안 적은 숫자가 머릿속에 있어요. 다음 주 쌀값이 오르고, 닷새 뒤엔 우유가 싸진다는… 근거는 없는데 확신이 서요.' },
    { say: 'miho', face: 'normal', text: '그리고 사장님이 지금 뭐라고 할지도 알 것 같아요. "또 장사 얘기예요?" 맞죠? 아니면 "얼마인데요?" 둘 중 하나!' },
    { if: 'run>=3', goto: 'ngp_miho_3' },
    { goto: 'ngp_miho_ask' }
  ],
  ngp_miho_3: [
    { say: 'miho', face: 'sad', text: '…솔직히 말하면 이 여관 금고 비밀번호도 알 것 같아요. 훔칠 생각은 없어요! 진짜로! 이상하게 훔치고 싶지가 않아요. 이게 제일 이상해요.' },
    { goto: 'ngp_miho_ask' }
  ],
  ngp_miho_ask: [
    { choice: [
      { text: '"그 감, 장사에 써 봐요. 어떤 재료가 오를까요?"', set: { 'aff.miho': 3, gold: 8 }, goto: 'ngp_miho_a' },
      { text: '"…얼마인데요?" 일부러 말해 본다.', set: { 'aff.miho': 2 }, goto: 'ngp_miho_b' },
      { text: '"피곤해서 그런 걸 거예요. 차 한 잔 마셔요."', set: { 'aff.miho': 2 }, goto: 'ngp_miho_c' }
    ] }
  ],
  ngp_miho_a: [
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '오! 사장님이 제 편을 들어 주다니. 좋아요, 오늘 적어 둔 건 달걀이에요. 이번 주에 사 두면 이득을 볼 거예요. …틀리면 제 탓은 아니고요!' },
    { narr: '메모를 받아 챙겼다. 귀가 쫑긋 서서 흔들리는 걸 보니 본인도 꽤 신이 난 모양이다. 어쩐지 그 달걀 이야기는 믿고 싶어졌다.' },
    { goto: 'after_pick' }
  ],
  ngp_miho_b: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '맞췄다! 정말로 맞췄어요! 사장님, 혹시 저랑 같은 꿈 꾸신 거 아니에요? …아니, 말도 안 되죠. 하하. 하하하.' },
    { narr: '웃음소리가 조금 지나치게 길었다. 미호의 귀가 계속 파르르 떨렸다.' },
    { goto: 'after_pick' }
  ],
  ngp_miho_c: [
    { say: 'miho', face: 'normal', text: '…피곤하면 이런 기분이 드나요? 그럼 다행이고요. 아니, 다행인가? 이상한 감이 사라지면 장사 감도 사라질까 봐 조금 무서워요.' },
    { narr: '차를 내밀자 미호는 두 손으로 잔을 감싸 쥐었다. 따뜻한 잔 위로 귀가 천천히 내려앉았다.' },
    { goto: 'after_pick' }
  ],

  // ================= 리아: 어디선가 꾼 꿈 =================
  ngp_lia: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '창가에서 리아가 졸린 눈으로 신전 종탑을 보고 있다. 무릎 위의 빗자루는 어느새 바닥에 굴러가 있다.' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { say: 'lia', text: '아, 왔어? 있잖아, 이상한 꿈을 꿨어. 꿈인지 어릴 때 기억인지도 모르겠어.' },
    { say: 'lia', face: 'shy', text: '나랑 너랑 달맞이 장터에서 소원 등불을 날리는데, 네가 소원을 말하기 전에 내가 먼저 알아맞혔어. 근데 꿈속의 너는 놀라지도 않고 웃기만 했어. 마치 이미 알고 있었던 것처럼.' },
    { narr: '리아는 손가락으로 창틀을 톡톡 두드렸다. 그 리듬이 어쩐지 귀에 익었다.' },
    { if: 'run>=3', goto: 'ngp_lia_3' },
    { goto: 'ngp_lia_ask' }
  ],
  ngp_lia_3: [
    { say: 'lia', face: 'normal', text: '…그런 꿈이 한 번이 아니야. 꿈에서 깰 때마다, 이번엔 네가 조금 더 오래 웃어 줬으면 좋겠다고 기도하게 돼. 이상하지?' },
    { goto: 'ngp_lia_ask' }
  ],
  ngp_lia_ask: [
    { choice: [
      { text: '"그럼 이번에는 꿈이랑 다른 소원을 빌어 볼게요."', set: { 'aff.lia': 3 }, goto: 'ngp_lia_a' },
      { text: '"꿈속의 내가 뭐라고 소원을 빌었는데요?"', set: { 'aff.lia': 2 }, goto: 'ngp_lia_b' },
      { text: '말없이 빗자루를 주워 건넨다.', set: { 'aff.lia': 2 }, goto: 'ngp_lia_c' }
    ] }
  ],
  ngp_lia_a: [
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '…응. 그럼 나도 꿈이랑 다르게 해 볼게. 이번엔 내가 먼저 소원을 말할 거야. 비밀이지만! 아직은!' },
    { goto: 'after_pick' }
  ],
  ngp_lia_b: [
    { show: 'lia', face: 'surprised' },
    { say: 'lia', text: '그건… 못 들었어. 꿈은 거기서 끝났거든. 어쩐지 네가 말하기 직전에 항상 깨는 것 같아. 그래서 더 궁금하다?' },
    { goto: 'after_pick' }
  ],
  ngp_lia_c: [
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…고마워. 이거, 꿈에서도 이렇게 받았어. 손끝이 닿을락 말락 하는 것까지. 이상해. 근데 싫지 않아.' },
    { goto: 'after_pick' }
  ]
});
