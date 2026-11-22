// ============================================================
//  3일차 — 달맞이 장터와 소원 등불
//  아침(장터 준비 + 노점 경영 선택) -> 낮(히로인 이벤트 3) -> 저녁(축제: 함께 걷기 / 소원 등불) -> 밤
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 아침 =================
  d3_open: [
    { bgm: 'inn_day' },
    { day: 3, time: '아침', tip: '오늘은 1년에 한 번 열리는 달맞이 장터!\n저녁 축제에서는 소원 등불을 함께 띄울 사람을 고르게 돼요.' },
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '마을 광장에 장터 천막이 하나둘 올라간다. 해마다 열리는 \'달맞이 장터\'. 올해는 불안한 분위기 속에서도 \'불안할수록 평소처럼 하자\'는 촌장님의 한마디로 열기로 했다.' },
    { show: 'lia', face: 'smile', pos: 'left' },
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'lia', text: '우리 여관도 노점을 내자! 올해는 손님도 많으니까, 잘만 하면 장사가 꽤 될 거야.' },
    { say: 'miho', text: '사장님사장님! 제가 아주 좋은 아이템을 알아요. \'봉인 수호 부적\'이라고, 요즘 같은 때 불티나게 팔릴 거예요. 원가는 종이 한 장!' },
    { say: 'lia', face: 'angry', text: '그건 사기잖아! 사람들이 진짜로 믿으면 어쩌려고!' },
    { say: 'miho', face: 'normal', text: '믿는 만큼 위안이 되니까 이것도 서비스… 아, 아무튼 사장님이 결정하세요!' },
    { narr: '노점 메뉴를 정해야 한다. 이 선택이 여관의 평판과 금고에 영향을 줄 것 같다.' },
    { choice: [
      { text: '정성껏 만든 꿀빵을 판다 (재료비 20G)', cost: 20, set: { gold: 36, rep: 1, 'aff.lia': 1 }, goto: 'd3_stall_honey' },
      { text: '간단한 고기 꼬치를 판다 (재료비 8G)', cost: 8, set: { gold: 20 }, goto: 'd3_stall_skewer' },
      { text: '미호의 \'봉인 수호 부적\'을 판다', set: { gold: 45, rep: -2, 'aff.miho': 1, 'aff.lia': -1 }, goto: 'd3_stall_charm' }
    ] }
  ],
  d3_stall_honey: [
    { say: 'lia', face: 'smile', text: '우와, 냄새 좋다! 이거 이름을 \'은빛 여우 꿀빵\'으로 하자. 간판도 내가 그려 줄게!' },
    { narr: '노점 앞에는 아침부터 줄이 늘어섰다. \'은빛 여우관\'이라는 이름이 조금씩 마을 사람들 입에 오른다.' },
    { goto: 'd3_pick' }
  ],
  d3_stall_skewer: [
    { say: 'miho', face: 'normal', text: '꼬치라… 평범하지만 안전한 선택이네요. 마진은 박하지만요.' },
    { narr: '무난하게 팔려 나갔다. 큰 이익도, 큰 실수도 없는 하루다.' },
    { goto: 'd3_pick' }
  ],
  d3_stall_charm: [
    { say: 'miho', face: 'smile', text: '헤헤, 역시 사장님은 장사를 아시는군요! 문양은 제가 그릴게요. 효과는 책임 못 지지만요!' },
    { say: 'lia', face: 'sad', text: '…나 모르는 일이야. 나중에 신전에 참회하러 올 거면 미리 말해 줘.' },
    { narr: '금고는 두둑해졌지만, 뒷맛이 쓰다. 몇몇 마을 사람들이 부적을 들고 수군거리고 있다.' },
    { goto: 'd3_pick' }
  ],

  // ================= 낮 =================
  // 아침 랜덤 사건 (story/random-events.js): 확률로 짧은 돌발 사건을 거친 뒤 낮으로 이어진다
  d3_pick: [{ rand: 'morning', then: 'd3_pick_day' }],
  d3_pick_day: [
    { time: '낮' }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '노점 준비가 거의 끝났다. 저녁 축제까지 시간이 남았다. 누구와 시간을 보낼까?' },
    { goto: 'pick' }
  ],

  // ----- 에리온 3: 동굴 앞 -----
  erion_3: [
    { set: { 'ev.erion': 1 } }, { bg: 'cave_front' }, { hide: 'all' },
    { narr: '손에 붕대를 감은 에리온이 뒷산 길로 올라가는 게 보였다. 나는 조용히 그 뒤를 따라갔다.' },
    { narr: '동굴 입구. 푸른 문양이 새겨진 바위 아래에서 그녀가 걸음을 멈췄다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…따라왔어? 정말 눈치 없는 인간이네.' },
    { narr: '붕대 아래로 붉게 번진 화상이 보인다. 어젯밤 봉인을 다지다 마력이 역류한 모양이다.' },
    { cg: 'erion_cave' },
    { show: 'erion', face: 'angry' },
    { say: 'erion', text: '이건 내 일이야. 인간 따위가 낄 일이 아니라고. 사흘 후 이 마을이 어떻게 되든, 내가 어떻게든 해.' },
    { cg: 'hide' },
    { choice: [
      { text: '말없이 붕대를 풀고 상처를 다시 정성껏 감아 준다', set: { 'aff.erion': 2 }, goto: 'erion_3_bandage' },
      { text: '"…걱정돼서 따라왔어요."', set: { 'aff.erion': 1 }, goto: 'erion_3_worry' },
      { text: '"위험하다고요! 당장 돌아가요!"', set: { 'aff.erion': -1 }, goto: 'erion_3_scold' },
      { text: '미리 사 온 약초 연고를 건넨다 (6G)', cost: 6, set: { 'aff.erion': 2 }, goto: 'erion_3_salve' }
    ] }
  ],
  erion_3_bandage: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '뭐, 뭐 하는 거야! 손 놔!' },
    { narr: '하지만 뿌리치지는 않았다. 붕대를 풀고, 물로 닦고, 다시 감는 동안 에리온은 숨을 죽이고 있었다. 길고 가는 손가락이 가볍게 떨렸다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…이상해. 누가 내 손을 이렇게 만져 준 건 아주 오래전이야. 스승님 이후로는… 처음이야.' },
    { goto: 'after_pick' }
  ],
  erion_3_worry: [
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…누, 누가 걱정해 달래? 바보 같은 소리 하지 마.' },
    { narr: '말은 그렇게 해도 돌아서는 뒷모습의 귀 끝이 빨갛다. 엘프 귀는 감정을 숨기는 데 영 소질이 없는 모양이다.' },
    { goto: 'after_pick' }
  ],
  erion_3_scold: [
    { show: 'erion', face: 'angry' },
    { say: 'erion', text: '내가 누구에게 명령받을 사람처럼 보여?! 건방져.' },
    { narr: '공기가 서늘하게 가라앉았다. 서리 한 가닥이 발끝을 스치고 지나갔다. 오늘은 말이 지나쳤던 것 같다.' },
    { goto: 'after_pick' }
  ],
  erion_3_salve: [
    { say: 'erion', face: 'surprised', text: '…이건 월광초 연고잖아. 인간 마을에도 이런 게 있었어?' },
    { narr: '연고를 바르자 에리온의 눈이 가늘게 풀렸다. 통증이 한결 가신 모양이다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…이상한 사람. 이런 건 누가 알려 줬어. 아니, 묻지 않을게. …고마워.' },
    { goto: 'after_pick' }
  ],

  // ----- 카엘라 3: 갑옷의 비밀 -----
  kaela_3: [
    { set: { 'ev.kaela': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '창고 구석에서 카엘라가 갑옷을 닦고 있다. 평소라면 노래를 불렀을 텐데, 오늘은 이상할 만큼 조용하다.' },
    { show: 'kaela', face: 'sad', pos: 'center' },
    { say: 'kaela', text: '…주인장인가. 마침 잘 왔다. 한 가지, 고백할 것이 있다.' },
    { say: 'kaela', text: '나는… 정식 기사가 아니다. 왕국 기사 시험에 세 번 떨어졌다. 이 갑옷은 할부로 샀고, 오우거는… 멀리서 본 게 전부다.' },
    { narr: '갑옷 옆구리의 가격표가 아직도 달랑거린다. 그녀는 그것을 손으로 감싸 쥐었다.' },
    { cg: 'kaela_tag' },
    { say: 'kaela', text: '그래도 영웅이 되고 싶었다. 진짜 누군가를 구하는 사람이. …웃어도 좋다. 이럴 줄 알았다.' },
    { say: 'kaela', face: 'normal', text: '…세 번째로 떨어진 날, 왕도 주점에서 먹은 게 있다. 고기를 에일에 푹 졸여서 갓 구운 빵에 올린 건데, 그걸 먹으면서 처음으로 \'다음엔 붙자\'고 생각했지. 그 맛이 아직도 혀끝에 남아 있다.' },
    { cg: 'hide' },
    { choice: [
      { text: '"지금 이 마을에서 제일 기사다운 사람은 당신이에요."', set: { 'aff.kaela': 2 }, goto: 'kaela_3_knight' },
      { text: '"시험은 또 보면 되죠. 연습은 제가 같이 할게요."', set: { 'aff.kaela': 2 }, goto: 'kaela_3_train' },
      { text: '따뜻한 차와 과자를 가져온다 (5G)', cost: 5, set: { 'aff.kaela': 1 }, goto: 'kaela_3_tea' },
      { text: '"그럼 오우거 이야기는 전부 거짓말이었어요?"', set: { 'aff.kaela': -1 }, goto: 'kaela_3_lie' }
    ] }
  ],
  kaela_3_knight: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…내가?' },
    { narr: '카엘라는 한참 말이 없었다. 그러다 손등으로 눈가를 쓱 닦았다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…처음이다. 그런 말을 들은 건. 고맙다, 주인장. 그 말만으로도, 다음 시험은 붙을 수 있을 것 같다.' },
    { goto: 'after_pick' }
  ],
  kaela_3_train: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '같이? 진짜냐? 두 번 말 못 물리는 거다!' },
    { narr: '둘이서 창고 앞마당에서 기본 자세부터 다시 시작했다. 카엘라가 의외로 진지한 얼굴로 땀을 흘렸다. 덕분에 빨랫줄은 무사했다.' },
    { say: 'kaela', face: 'shy', text: '…이렇게 같이 해 주는 사람이 있다는 게 이렇게 든든한 줄 몰랐다.' },
    { goto: 'after_pick' }
  ],
  kaela_3_tea: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '과자다! …아니, 위로할 필요는 없다! 하지만 과자는 먹겠다!' },
    { narr: '카엘라는 훌쩍이면서 과자를 한 입에 다 넣었다. 조금 기운이 나는 모양이다.' },
    { goto: 'after_pick' }
  ],
  kaela_3_lie: [
    { show: 'kaela', face: 'angry' },
    { say: 'kaela', text: '거짓말이 아니라… 아니, 거짓말이긴 하지만! 그렇게 정확하게 짚지 마라!' },
    { narr: '카엘라가 갑옷을 챙겨 도망치듯 나가 버렸다. 직설적인 말이 아팠던 모양이다. 반성해야겠다.' },
    { goto: 'after_pick' }
  ],

  // ----- 미호 3: 편지 -----
  miho_3: [
    { set: { 'ev.miho': 1 } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '뒷마당 우물가. 미호가 구겨진 편지를 읽고 있다. 평소처럼 장난치는 기색이 없고, 귀가 축 처져 있다.' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { say: 'miho', text: '…아, 사장님. 아무것도 아니에요. 그냥 고향에서 온 편지요. 글자 틀린 게 웃겨서 보고 있었어요.' },
    { narr: '편지에는 삐뚤빼뚤한 글씨가 가득하다. \'미호 언니, 겨울이 와요. 석탄이 모자라요.\'' },
    { cg: 'miho_letter' },
    { say: 'miho', face: 'sad', text: '…보육원 아이들이에요. 일곱 명. 제가 훔친 돈의 행방, 궁금하셨죠? 부자 상인이랑 못된 징세관한테서만 훔쳐서, 전부 거기로 보내요.' },
    { say: 'miho', face: 'sad', text: '겨울이면 원장님이 산에서 따 온 버섯을 꿀술에 졸여서 빵에 얹어 주셨어요. 달고 따끈해서, 그거 먹을 때만큼은 아무도 안 울었는데…' },
    { say: 'miho', face: 'smile', text: '돈 밝히는 도적이라는 건 거짓말 아니에요. 그래야 아이들을 먹이니까요. 헤헤, 실망했죠?' },
    { cg: 'hide' },
    { choice: [
      { text: '(말없이 곁에 앉아 어깨를 빌려준다)', set: { 'aff.miho': 2 }, goto: 'miho_3_shoulder' },
      { text: '"아이들 몫이면 도울게요." 20골드를 건넨다 (20G)', cost: 20, set: { 'aff.miho': 3, rep: 1 }, goto: 'miho_3_money' },
      { text: '"도둑질 말고 정당하게 벌어요. 일자리는 내가 알아봐 줄게요."', set: { 'aff.miho': 1 }, goto: 'miho_3_job' },
      { text: '"그렇군요. 힘내요." 하고 자리를 뜬다', set: { 'aff.miho': -1 }, goto: 'miho_3_leave' }
    ] }
  ],
  miho_3_shoulder: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '…어? 뭐예요, 갑자기.' },
    { narr: '미호의 꼬리가 천천히 내 쪽으로 다가와 팔을 감쌌다. 따뜻하고 폭신했다.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…이건 서비스예요. 아니, 서비스 받는 건 저고, 어… 아무튼 요금은 안 받을게요. 이번만요.' },
    { goto: 'after_pick' }
  ],
  miho_3_money: [
    { show: 'miho', face: 'surprised' },
    { say: 'miho', text: '이, 이거 20골드…! 사장님 지금 여관 사정도 빠듯하잖아요. 이걸 왜…' },
    { narr: '미호의 큰 눈이 순식간에 눈물로 가득 찼다. 그녀는 소매로 얼굴을 퍽퍽 문질렀다.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…빚으로 쳐 둘게요. 아니, 빚 아니고. …고마워요. 진짜로. 이자 같은 거 안 받을게요. 제 평생에서 처음 하는 소리예요.' },
    { goto: 'after_pick' }
  ],
  miho_3_job: [
    { say: 'miho', face: 'normal', text: '정당하게요? 도적이 정당하게 벌면 하루 수입이 십분의 일이 된다고요, 사장님.' },
    { say: 'miho', face: 'smile', text: '…그래도 그렇게 말해 주는 사람은 처음이에요. 생각은 해 볼게요. 생각만요!' },
    { goto: 'after_pick' }
  ],
  miho_3_leave: [
    { say: 'miho', face: 'sad', text: '…네, 힘낼게요. 사장님도요.' },
    { narr: '돌아서서 걸어가는 뒷모습에서 꼬리가 축 늘어져 있었다. 괜히 모질게 굴었다는 생각이 들었다.' },
    { goto: 'after_pick' }
  ],

  // ----- 리아 3: 질투 (다른 히로인과의 호감도가 높으면 질투 버전, 아니면 피로 버전) -----
  lia_3: [
    { if: 'aff.erion>=3 || aff.kaela>=3 || aff.miho>=3', goto: 'lia_3_jealous' },
    { goto: 'lia_3_calm' }
  ],
  lia_3_jealous: [
    { set: { 'ev.lia': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '창가에 앉아 있던 리아가 내 얼굴을 보더니 휙 하고 고개를 돌렸다.' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { say: 'lia', text: '…왔어? 오늘은 누구랑 놀다 오는 길이야?' },
    { narr: '어딘가 가시 돋친 말투다. 그녀는 소매 끝을 만지작거리며 창밖만 보고 있다.' },
    { show: 'lia', face: 'sad' },
    { say: 'lia', text: '아니, 그냥. 요즘 네가 다른 사람들이랑 같이 있는 걸 자주 봐서. 좋은 일이지! 손님이랑 친해지는 건 장사에도 좋고!' },
    { narr: '억지로 웃는 얼굴이다. 어릴 때도 거짓말할 때는 오른쪽 눈썹이 올라갔는데, 지금도 똑같다.' },
    { choice: [
      { text: '"혹시… 질투해?"', set: { 'aff.lia': 1 }, goto: 'lia_3_ask' },
      { text: '"네가 제일 편한 사람이라 자꾸 뒤로 미뤘나 봐. 미안."', set: { 'aff.lia': 2 }, goto: 'lia_3_sorry' },
      { text: '(말없이 빵 한 조각을 반으로 나눠 건넨다)', set: { 'aff.lia': 1 }, goto: 'lia_3_bread' },
      { text: '"무슨 소리야? 난 아무 일도 없었는데."', set: { 'aff.lia': -1 }, goto: 'lia_3_deny' }
    ] }
  ],
  lia_3_ask: [
    { show: 'lia', face: 'surprised' },
    { say: 'lia', text: '누, 누가! 아, 아니거든!' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…조금은. 아주 조금은 그랬어. 소꿉친구는 원래 이래도 되는 거 아니야? 나도 이런 내가 싫지만…' },
    { goto: 'after_pick' }
  ],
  lia_3_sorry: [
    { show: 'lia', face: 'surprised' },
    { say: 'lia', text: '…뭐야, 그게. 그런 말 하면 화낼 수가 없잖아.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '알았어. 용서해 줄게. 대신 이번 축제 때는 나랑도 같이 걸어 줘야 해. 약속이야.' },
    { goto: 'after_pick' }
  ],
  lia_3_bread: [
    { narr: '어릴 때부터 싸우면 빵을 반으로 나눠 먹으며 화해했다. 리아도 그걸 기억하는 것 같다.' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…치사해. 이런 건 반칙이야. 반칙인데… 맛있네.' },
    { goto: 'after_pick' }
  ],
  lia_3_deny: [
    { show: 'lia', face: 'sad' },
    { say: 'lia', text: '…그래. 그랬구나. 아무 일도 없었구나.' },
    { narr: '리아가 웃었다. 하지만 웃는 눈이 전혀 웃고 있지 않았다. 아차 싶었지만 이미 늦었다.' },
    { goto: 'after_pick' }
  ],
  lia_3_calm: [
    { set: { 'ev.lia': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '리아가 빨래를 개다가 꾸벅꾸벅 졸고 있었다. 눈 밑에 짙은 그늘이 드리워져 있다.' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { say: 'lia', text: '…어? 졸지 않았어! 아니, 잠깐 눈을 감고 있었을 뿐이야!' },
    { say: 'lia', face: 'sad', text: '신전 일이랑 여관 일이 겹쳐서 좀 피곤하긴 해. 하지만 괜찮아. 힘든 건 다들 마찬가지니까.' },
    { choice: [
      { text: '"오늘은 내가 개 줄게. 잠깐 눈 붙여."', set: { 'aff.lia': 2 }, goto: 'lia_3_calm_sleep' },
      { text: '"너 쓰러지면 곤란해. 며칠은 신전 쪽을 줄여."', set: { 'aff.lia': 1 }, goto: 'lia_3_calm_rest' },
      { text: '"그럼 임금을 올려 줄까?" 농담을 한다', set: { 'aff.lia': 1 }, goto: 'lia_3_calm_joke' }
    ] }
  ],
  lia_3_calm_sleep: [
    { narr: '리아를 의자에 앉히고 담요를 덮어 줬다. 처음엔 사양하더니 이내 내 어깨에 머리를 기대고 새근새근 잠들었다.' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…우응… 아버님… 이불… 내가 갤게요…' },
    { narr: '잠꼬대하는 모습에 웃음이 났다. 한 시간쯤 어깨를 빌려주었다. 어깨는 저렸지만 이상하게 기분이 좋았다.' },
    { goto: 'after_pick' }
  ],
  lia_3_calm_rest: [
    { say: 'lia', face: 'smile', text: '…알았어. 걱정해 줘서 고마워. 네가 그렇게 말해 주면 쉬어도 되는 것 같은 기분이 들어.' },
    { goto: 'after_pick' }
  ],
  lia_3_calm_joke: [
    { say: 'lia', face: 'smile', text: '임금? 지금까지 받은 적도 없는걸. 그럼 밀린 것까지 한꺼번에 올려 줘야겠네?' },
    { narr: '농담으로 받아넘기는 얼굴이 조금 생기를 되찾았다. 그래도 눈 밑 그늘은 여전하다.' },
    { goto: 'after_pick' }
  ],

  // ================= 저녁: 장터 노점 영업 -> 달맞이 축제 =================
  // 저녁 영업(story/tavern.js 의 day3, 광장 노점)을 마친 뒤 축제 산책 / 소원 등불 / 대지진으로 이어진다
  d3_evening: [
    { bgm: 'festival' },
    { time: '저녁' }, { bg: 'square_festival' }, { hide: 'all' },
    { narr: '해가 지자 광장에 수백 개의 등불이 켜졌다. 천막마다 사람들의 웃음소리가 흘러넘친다. 불안은 잠시 뒤로 밀어 둔 듯한, 따뜻한 밤이다.' },
    { narr: '우리 노점 앞에도 줄이 늘어서기 시작했다. 화덕과 술통이 오늘의 주방이다. 메뉴는 정해져 있지 않다. 손님이 원하는 걸 만들어 내면 된다.' },
    { tavern: 'day3' },
    { goto: 'd3_ev_walk' }
  ],
  d3_ev_walk: [
    { bg: 'square_festival' }, { hide: 'all' },
    { narr: '노점을 닫을 시간이 되자 단골들이 "이제 가서 놀다 와" 하며 등을 떠밀었다. 다 같이 광장으로 나섰다.' },
    { cg: 'festival_all' },
    { show: 'kaela', face: 'smile', pos: 'left' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'kaela', text: '하하하! 이것이 장터인가! 냄새, 소리, 불빛! 영웅의 피가 끓는다!' },
    { say: 'miho', text: '사장님, 저기 꼬치 천막 줄 선 거 보세요! 저희 노점보다 비싸게 팔아요. 가서 정찰 좀 하고 올게요!' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'lia', text: '에리온 씨도 오셨네요! 아까 제가 억지로 끌고 왔는데… 화나진 않으셨죠?' },
    { say: 'erion', text: '…시끄러워. 하지만 등불은 예쁘네.' },
    { cg: 'hide' },
    { narr: '다 같이 광장을 거닐다가, 문득 한 사람과 함께 걷고 싶어졌다.' },
    { choice: [
      { who: 'erion', text: '"에리온, 같이 둘러봐요. 별꽃 사탕이 있는지 찾아봐요."', set: { 'aff.erion': 1 }, goto: 'd3_walk_erion' },
      { who: 'kaela', text: '"카엘라, 저기 과녁 맞히기 어때요?"', set: { 'aff.kaela': 1 }, goto: 'd3_walk_kaela' },
      { who: 'miho', text: '"미호, 흥정 구경 좀 시켜 줘요."', set: { 'aff.miho': 1 }, goto: 'd3_walk_miho' },
      { who: 'lia', text: '"리아, 어릴 때 먹던 찐빵 아직 있을까?"', set: { 'aff.lia': 1 }, goto: 'd3_walk_lia' }
    ] }
  ],
  d3_walk_erion: [
    { hide: 'all' }, { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '약초와 사탕을 파는 작은 천막 앞. 에리온이 반짝이는 사탕에 시선을 빼앗겼다.' },
    { say: 'erion', text: '…별꽃 사탕이라고 써 있네. 가짜일 거야. 엘프의 별꽃은 인간 땅에서는 자라지 않으니까.' },
    { narr: '사탕 하나를 사서 건네자 그녀는 흘겨보면서도 받아 한 입 물었다. 그리고 눈을 크게 떴다.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…진짜 별꽃은 아니지만, 비슷한 맛은 나. 달빛열매 향이 살짝 섞였네. 스승님의 차에도 그게 들어갔었어. 인간들도 꽤 하네.' },
    { goto: 'd3_lantern' }
  ],
  d3_walk_kaela: [
    { hide: 'all' }, { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '과녁 맞히기! 활이라면 영웅의 전공이 아니지만, 이 몸에게 불가능이란 없다!' },
    { narr: '카엘라가 던진 공은 과녁을 향하지 않고 곧장 주인 아저씨의 모자를 날려 버렸다. 열 번 던져서 열 번 빗나갔다.' },
    { show: 'kaela', face: 'sad' },
    { say: 'kaela', text: '…이상하다. 오늘은 바람이 적의 편이군.' },
    { narr: '대신 내가 던져 마지막 한 번을 맞혔다. 경품으로 받은 작은 사자 인형을 카엘라의 손에 쥐여 주었다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…사자 인형. 이건 가보로 삼겠다. 평생 간직하지.' },
    { goto: 'd3_lantern' }
  ],
  d3_walk_miho: [
    { hide: 'all' }, { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '자, 잘 보세요 사장님. 가격 흥정의 정석은 \'상대가 울 때까지 깎는 것\'이에요.' },
    { narr: '미호의 흥정은 예술이었다. 천막 주인이 눈물을 흘리며 반값 이하로 물건을 내놓았다. 그러자 미호는 슬쩍 돈을 더 얹어 주었다.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…제가 깎는 건 사기꾼한테서만이에요. 이 아저씨는 진짜 어렵게 사는 분이라서요. 이건 비밀이에요, 사장님.' },
    { goto: 'd3_lantern' }
  ],
  d3_walk_lia: [
    { hide: 'all' }, { show: 'lia', face: 'smile', pos: 'center' },
    { narr: '광장 구석 벤치에 둘이 나란히 앉아 김이 모락모락 나는 찐빵을 나눠 먹었다. 어릴 때 늘 앉던 자리다.' },
    { say: 'lia', text: '여기, 기억나? 네가 찐빵 먹다가 뜨거워서 뱉었잖아. 그것도 신관님 앞에서.' },
    { say: 'lia', face: 'shy', text: '…그날도 같이 앉았지. 우린 그때부터 이랬나 봐. 같이 앉으면 마음이 놓이는 사이.' },
    { goto: 'd3_lantern' }
  ],

  // ----- 소원 등불 -----
  d3_lantern: [
    { bgm: 'romance' },
    { hide: 'all' },
    { narr: '밤이 깊어지자 광장 한가운데서 종이 울렸다. 소원 등불을 하늘에 띄우는 시간이다.' },
    { narr: '전해 오는 이야기가 있다. \'등불을 함께 띄운 사람과는 오래도록 이어진다.\'' },
    { narr: '손에 쥔 하얀 등불이 따뜻하다. 누구와 함께 띄울까?' },
    { choice: [
      { who: 'erion', text: '"에리온, 이 등불… 같이 띄워 줄래요?"', set: { 'aff.erion': 2 }, goto: 'd3_lantern_erion' },
      { who: 'kaela', text: '"카엘라, 소원 같이 빌어요."', set: { 'aff.kaela': 2 }, goto: 'd3_lantern_kaela' },
      { who: 'miho', text: '"미호, 한 번쯤은 돈 말고 소원 빌어 봐요."', set: { 'aff.miho': 2 }, goto: 'd3_lantern_miho' },
      { who: 'lia', text: '"리아, 올해도 같이 띄우자. 어릴 때처럼."', set: { 'aff.lia': 2 }, goto: 'd3_lantern_lia' }
    ] }
  ],
  d3_lantern_erion: [
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '…내가? 인간의 풍습 같은 건…' },
    { narr: '말은 그래도 에리온은 등불의 한쪽 끝을 조용히 붙잡았다. 둘이 함께 손을 놓자 등불이 천천히 떠올랐다.' },
    { cg: 'erion_lantern' },
    { say: 'erion', face: 'shy', text: '…소원은 말하면 안 이루어진대. 그러니까 묻지 마. …다만, 이 마을이 무사하길. 그리고, 아니. 더는 안 말해.' },
    { narr: '푸른 책이 그녀의 품 안에서 아주 작게 빛났다. 마치 등불에 답하듯.' },
    { cg: 'hide' },
    { goto: 'd3_ev_quake' }
  ],
  d3_lantern_kaela: [
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '소원이라! 영웅의 소원은 하나뿐이다! 이 손으로 진짜 누군가를 구하는 것!' },
    { narr: '카엘라는 두 손으로 등불을 받치고 눈을 감았다. 평소의 큰 목소리와 달리 작게 속삭였다.' },
    { cg: 'kaela_lantern' },
    { say: 'kaela', face: 'shy', text: '…그리고 한 가지 더. 이 여관에서 지낸 시간이, 오래오래 이어졌으면 좋겠다. …이건 비밀이다! 들었으면 잊어라!' },
    { narr: '등불이 하늘로 올라가는 동안 카엘라의 손이 내 소매를 살짝 쥐고 있었다.' },
    { cg: 'hide' },
    { goto: 'd3_ev_quake' }
  ],
  d3_lantern_miho: [
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '돈 말고요? 제 소원은 늘 돈이었는데… 음, 잠깐만요, 생각 좀 해 볼게요.' },
    { narr: '미호는 등불에 한참 글씨를 썼다가 지우고, 또 썼다. 그리고 내가 못 보게 손으로 가렸다.' },
    { cg: 'miho_lantern' },
    { say: 'miho', face: 'shy', text: '…아이들이 따뜻한 겨울을 보내게 해 주세요. 그리고 이 여관에, 오래 있게 해 주세요. 뭐, 월세 안 내고요!' },
    { narr: '웃으며 말하는 목소리가 아주 조금 떨렸다. 꼬리가 천천히 내 팔을 감았다.' },
    { cg: 'hide' },
    { goto: 'd3_ev_quake' }
  ],
  d3_lantern_lia: [
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '응, 올해도 같이 띄우자. 우린 늘 그랬으니까.' },
    { narr: '리아가 등불에 조심스레 글씨를 썼다. 어릴 때는 \'과자 많이 먹게 해 주세요\'였다. 이번에는 내가 못 보게 소매로 가렸다.' },
    { cg: 'lia_lantern' },
    { say: 'lia', face: 'shy', text: '…내가 뭘 적었는지는 비밀이야. 하지만 있잖아, 내년에도, 그다음 해에도 이렇게 같이 띄우면 좋겠다.' },
    { narr: '등불이 떠오르는 순간, 리아의 손이 내 손을 살며시 잡았다. 놓지 않았다. 한참을.' },
    { cg: 'hide' },
    { goto: 'd3_ev_quake' }
  ],
  d3_ev_quake: [
    { bgm: 'tension' },
    { hide: 'all' },
    { narr: '수백 개의 등불이 밤하늘로 떠오르던 그때였다.' },
    { fx: 'shake' },
    { narr: '쿠르르릉— 땅이 크게 흔들렸다. 어제보다 훨씬 강하다. 천막이 흔들리고 사람들이 비명을 질렀다. 하늘로 오르던 등불들이 일제히 같은 방향으로 휘어졌다. 뒷산의 동굴 쪽으로.' },
    { sfx: 'mystery' }, { fx: 'flash' },
    { narr: '동굴 쪽에서 푸른 빛줄기가 하늘로 치솟았다. 등불들이 그 빛에 빨려들 듯 모여든다.' },
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '…이렇게 빨리. 사흘이 아니라 이틀도 안 남았어.' },
    { show: 'kaela', face: 'surprised', pos: 'left' },
    { show: 'lia', face: 'surprised', pos: 'right' },
    { say: 'kaela', text: '주, 주민들을 대피시켜야 한다! 주인장, 지시를!' },
    { narr: '광장은 혼란에 빠졌다. 모두가 나를 바라보고 있다. 지금은 여관 주인으로서 침착해야 한다.' },
    { choice: [
      { text: '큰 소리로 침착하게 대피를 안내한다', set: { rep: 2, 'aff.kaela': 1 }, goto: 'd3_ev_guide' },
      { text: '아이들과 노인을 먼저 여관 지하로 모신다', set: { rep: 2, 'aff.lia': 1 }, goto: 'd3_ev_kids' },
      { text: '일단 노점의 돈궤부터 챙긴다', set: { gold: 15, rep: -2 }, goto: 'd3_ev_coin' }
    ] }
  ],
  d3_ev_guide: [
    { say: 'kaela', face: 'smile', text: '이 몸이 선두에 서겠다! 모두 나를 따르라! 침착하게! 밀지 마라!' },
    { narr: '카엘라의 우렁찬 목소리가 광장을 가로질렀다. 사람들이 질서를 되찾고 대피로로 향했다. 이럴 땐 그녀의 허세가 든든하다.' },
    { goto: 'd3_ev_end' }
  ],
  d3_ev_kids: [
    { say: 'lia', face: 'normal', text: '아이들은 내가 맡을게! 모두 두려워하지 마, 손잡고 따라와!' },
    { narr: '리아가 아이들의 손을 잡고 여관으로 향했다. 그 뒷모습이 어느 때보다 믿음직했다.' },
    { goto: 'd3_ev_end' }
  ],
  d3_ev_coin: [
    { say: 'miho', face: 'surprised', text: '사장님…? 지금 돈이 문제예요? 아, 아니, 저도 챙기긴 했지만요!' },
    { narr: '금고는 지켰지만 어수선한 틈에 대피가 늦어진 사람들이 있었다. 마을 사람들이 차가운 눈으로 쳐다본다.' },
    { goto: 'd3_ev_end' }
  ],
  d3_ev_end: [
    { hide: 'all' },
    { narr: '다행히 부상자는 없었다. 하지만 오늘 밤 일은 마을 사람들 모두의 가슴에 불안의 씨앗을 심었다.' },
    { goto: 'd3_night' }
  ],

  // ================= 밤 =================
  d3_night: [
    { bgm: 'inn_night' },
    { time: '밤' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '손님도, 이웃도 모두 지친 밤이다. 방에 돌아와 겉옷을 벗는데, 누군가 조용히 문을 두드렸다.' },
    { if: WIN('erion', 8), goto: 'd3_night_erion' },
    { if: WIN('kaela', 8), goto: 'd3_night_kaela' },
    { if: WIN('miho', 8), goto: 'd3_night_miho' },
    { if: WIN('lia', 8), goto: 'd3_night_lia' },
    { goto: 'd3_night_none' }
  ],
  d3_night_none: [
    { narr: '문을 열어 봐도 복도는 조용했다. 아직 먼 밤하늘에 푸른 빛줄기가 희미하게 남아 있다.' },
    { narr: '내일은 마을 사람들을 안심시켜야 한다. 그리고 에리온에게서 진실을 들어야 한다. 이불 속에서 생각을 정리하다 잠들었다.' },
    { goto: 'd3_upgrade' }
  ],
  d3_night_erion: [
    { bgm: 'romance' },
    { show: 'erion', face: 'shy', pos: 'center' },
    { say: 'erion', text: '…아직 안 잤어? 불이 켜져 있길래.' },
    { narr: '에리온은 문 앞에서 한동안 머뭇거리다가, 품에서 작은 사탕 하나를 꺼냈다. 아까 광장에서 산 별꽃 사탕이다.' },
    { say: 'erion', text: '…남은 거야. 버리기 아까워서. 내일 이야기하겠다고 한 거, 기억하고 있지? 그전에… 그냥 얼굴이 보고 싶었어. 아, 아니, 방 상태가 궁금해서!' },
    { set: { 'aff.erion': 1 } },
    { narr: '당황한 에리온의 귀 끝이 불그레했다. 그녀는 사탕을 내 손에 쥐여 주고 도망치듯 돌아갔다.' },
    { goto: 'd3_upgrade' }
  ],
  d3_night_kaela: [
    { bgm: 'romance' },
    { show: 'kaela', face: 'shy', pos: 'center' },
    { say: 'kaela', text: '주인장. 사자 인형 말이다. 방에 두고 오다가, 그, 문득 감사 인사를 다시 하고 싶어서 왔다.' },
    { narr: '카엘라는 인형을 품에 안은 채 서 있었다. 평소의 호쾌한 목소리가 작게 가라앉아 있다.' },
    { say: 'kaela', face: 'smile', text: '오늘 광장에서 사람들을 대피시킬 때, 처음으로 진짜 기사가 된 것 같았다. 이 기분을 만들어 준 건 주인장이다. 고맙다.' },
    { set: { 'aff.kaela': 1 } },
    { say: 'kaela', face: 'shy', text: '그, 그럼 이만! 영웅은 쿨하게 사라진다!' },
    { narr: '카엘라는 쿵쿵 계단을 내려가다가 한 번 넘어졌다. 쿨하지 않았다. 그래도 좋았다.' },
    { goto: 'd3_upgrade' }
  ],
  d3_night_miho: [
    { bgm: 'romance' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '사장님, 지붕 위 구경 안 갈래요? 오늘 밤은 별이 엄청 잘 보여요.' },
    { bg: 'roof_night' },
    { narr: '미호를 따라 지붕에 올라갔다. 하늘에는 아직 등불 몇 개가 남아 반짝이고 있다. 미호가 내 옆에 걸터앉아 꼬리로 담요처럼 어깨를 덮어 주었다.' },
    { say: 'miho', face: 'shy', text: '있잖아요, 사장님. 저 사실 이 여관 이름 듣고 놀랐어요. 우리 마을 옛이야기에 나오는 이름이거든요. \'은빛 여우가 쉬어 가는 집\'.' },
    { set: { 'aff.miho': 1 } },
    { say: 'miho', face: 'smile', text: '…그래서 일부러 찾아온 거예요. 도둑질하러 온 척했지만. 비밀이에요?' },
    { bg: 'inn_night' },
    { goto: 'd3_upgrade' }
  ],
  d3_night_lia: [
    { bgm: 'romance' },
    { show: 'lia', face: 'shy', pos: 'center' },
    { say: 'lia', text: '자, 잠깐만 들어가도 돼? 오늘 광장에서 있었던 일, 아직도 심장이 두근거려서…' },
    { narr: '리아가 침대 옆 의자에 앉았다. 손에는 아까 우리가 띄운 등불의 종이 조각이 쥐여 있다.' },
    { say: 'lia', face: 'smile', text: '이건 아까 등불에서 떨어진 조각이야. 내 소원 글씨가 남아 있어. …보여 주진 않을 거야. 아직은.' },
    { set: { 'aff.lia': 1 } },
    { say: 'lia', face: 'normal', text: '내일이 어떻게 되든, 난 네 곁에 있을게. 그건 약속이야. 어릴 때 한 약속, 이번에는 내가 먼저 지킬 거야.' },
    { goto: 'd3_upgrade' }
  ]
});
