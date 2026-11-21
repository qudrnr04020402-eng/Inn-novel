// ============================================================
//  1일차 스크립트 — 은빛 여우관
//  씬 id: [ 명령, 명령, ... ]  형태. 자세한 명령어는 README.md 참고.
//  2일차를 추가하려면 story/day2.js 를 만들고
//    Object.assign(STORY.scenes, { d2_open: [ ... ] });
//  처럼 씬을 덧붙인 뒤 index.html 에 <script> 한 줄을 추가하세요.
// ============================================================
window.STORY = {
  title: '은빛 여우관',
  subtitle: '변두리 마을 여관 이야기',
  start: 'd1_open',                        // 새 게임 시작 씬
  init: { gold: 50, rep: 0, aff: { kael: 0, erion: 0 }, flag: {} }, // 시작 변수
  scenes: {}
};

Object.assign(STORY.scenes, {

  // ---------- 아침: 오프닝 ----------
  d1_open: [
    { bg: 'inn_front' },
    { narr: '변두리 마을 라이펜. 그 끝자락, 낡은 간판 아래에 여관 \'은빛 여우관\'이 있다.' },
    { narr: '아버지에게 물려받은 이 여관의 주인이 된 지 이제 일주일. 손님은… 아직 한 손에 꼽을 정도다.' },
    { bg: 'inn_day' },
    { narr: '장부를 펼쳐 보니 금고에는 {gold} 골드. 이번 달 세금을 낼 수 있을지 아슬아슬하다.' },
    { narr: '그때, 문이 쾅 하고 열렸다.' },
    { goto: 'd1_kael_enter' }
  ],

  // ---------- 손님 1: 카엘 ----------
  d1_kael_enter: [
    { show: 'kael', face: 'smile', pos: 'center' },
    { say: 'kael', text: '하하하! 이 마을에서 가장 좋은 여관이 여기라고 들었다! 아, 두 번째로 좋은 곳일 수도 있겠군. 첫 번째는 당연히 내가 묵는 곳이니까!' },
    { narr: '등에 커다란 대검을 멘 사내가 문틀에 머리를 찧을 뻔하며 들어섰다. 갑옷이 번쩍번쩍하다. 너무 새것처럼.' },
    { say: 'kael', face: 'normal', text: '나는 붉은 사자 카엘! 오우거 세 마리를 혼자 베었고, 드래곤과 눈이 마주친 적도 있는 몸이지. 이름을 기억해 둬라, 주인장.' },
    { choice: [
      { text: '대단하시네요! 영광입니다, 카엘 님.',        set: { 'aff.kael': 1 },                     goto: 'd1_kael_praise' },
      { text: '…갑옷에 흠집이 하나도 없네요?',              set: { 'aff.kael': -1, 'flag.kael_doubt': true }, goto: 'd1_kael_doubt' },
      { text: '숙박비는 하룻밤에 20골드, 선불입니다.',        set: { gold: 20 },                          goto: 'd1_kael_pay' }
    ] }
  ],

  d1_kael_praise: [
    { say: 'kael', face: 'smile', text: '오오, 보는 눈이 있군! 마음에 들었다. 이 마을 여관 주인치고는 말이야!' },
    { narr: '칭찬이 칭찬 같지 않지만, 기분 좋은 건 기분 좋은 거니까.' },
    { goto: 'd1_kael_room' }
  ],
  d1_kael_doubt: [
    { say: 'kael', face: 'troubled', text: '이, 이건… 그, 전투가 끝나면 매번 정성껏 닦기 때문이다! 흠집은 닦으면 사라지는 법이지!' },
    { narr: '그럴 리가 없다. 게다가 갑옷 옆구리에 가격표가 달랑거리고 있었다.' },
    { say: 'kael', face: 'angry', text: '…보지 마라.' },
    { goto: 'd1_kael_room' }
  ],
  d1_kael_pay: [
    { say: 'kael', face: 'normal', text: '선불? 영웅에게 선불을 요구하다니 담이 큰 주인장이군. 좋다, 여기 있다!' },
    { narr: '금화 20닢이 카운터 위로 쨍그랑 쏟아졌다. 허세는 심해도 돈은 확실한 손님이다.' },
    { goto: 'd1_kael_room' }
  ],

  d1_kael_room: [
    { say: 'kael', face: 'normal', text: '그런데 말이다, 주인장. 영웅에게는 \'영웅 할인\'이라는 게 있다고 들었다. 숙박비는 반값이겠지?' },
    { choice: [
      { text: '물론이죠. 영웅이 묵는 여관이라고 소문나면 저희도 영광이니까요.', set: { 'aff.kael': 2, gold: -10, rep: 1 }, goto: 'd1_kael_deal_yes' },
      { text: '죄송하지만 영웅 할인은 저희 여관에 없어요.',                     set: { 'aff.kael': -1, gold: 10 },         goto: 'd1_kael_deal_no' },
      { text: '할인은 없지만, 오우거 이야기를 들려주시면 저녁을 서비스로 드릴게요.', set: { 'aff.kael': 1, gold: -3 },          goto: 'd1_kael_deal_story' }
    ] }
  ],
  d1_kael_deal_yes: [
    { say: 'kael', face: 'smile', text: '하하! 역시 말이 통하는군! 소문을 내 주지. 은빛 여우관은 사자의 쉼터라고!' },
    { goto: 'd1_kael_rumor' }
  ],
  d1_kael_deal_no: [
    { say: 'kael', face: 'troubled', text: '으, 으음. 그렇다면 어쩔 수 없지. 영웅은 이런 사소한 일에 연연하지 않는 법이다.' },
    { narr: '손가락으로 지갑 속을 슬쩍 확인하는 모습이 보였다. 꽤 가벼워 보인다.' },
    { goto: 'd1_kael_rumor' }
  ],
  d1_kael_deal_story: [
    { say: 'kael', face: 'smile', text: '저녁 서비스라니! 좋다, 오우거 이야기 말이지? 그건 어느 비 오는 밤이었다…' },
    { narr: '이야기는 이십 분 동안 이어졌고, 그사이 오우거의 키는 두 배로 자랐다.' },
    { goto: 'd1_kael_rumor' }
  ],

  d1_kael_rumor: [
    { say: 'kael', face: 'normal', text: '그건 그렇고, 요즘 마을 밖 고블린 동굴에서 이상한 일이 벌어진다는 소문, 들었나? 내가 그걸 해결하러 왔다.' },
    { say: 'kael', text: '밤마다 동굴에서 푸른 빛이 새어 나온다더군. 고블린이 그런 마법을 쓸 리가 없어. 분명 뭔가 있다!' },
    { narr: '이번 말만큼은 허세가 아니라 진심으로 들렸다.' },
    { say: 'kael', face: 'smile', text: '자, 방 열쇠를 다오! 영웅은 먼저 한숨 자고 나서 일하는 법이니까!' },
    { hide: 'kael' },
    { narr: '카엘은 2층으로 쿵쿵 올라갔다. 계단이 비명을 지른다. 벌써부터 수리비가 걱정이다.' },
    { goto: 'd1_erion_enter' }
  ],

  // ---------- 손님 2: 에리온 ----------
  d1_erion_enter: [
    { narr: '해가 기울 무렵, 이번에는 소리 없이 문이 열렸다. 바람이 한 번 스쳤을 뿐인데, 어느새 카운터 앞에 누군가 서 있었다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…방이 있나.' },
    { narr: '깊이 눌러쓴 후드 아래로 뾰족한 귀가 보인다. 엘프다. 로브에서는 오래된 종이와 약초 냄새가 났다.' },
    { say: 'erion', text: '가장 안쪽, 창이 작은 방. 이름은 에리온. 직업과 목적은 적지 않겠다. 대가는 충분히 치르지.' },
    { narr: '카운터에 금화 주머니가 놓였다. 묵직하다. 평소 숙박비의 서너 배는 되어 보인다.' },
    { choice: [
      { text: '알겠습니다. 손님 사정은 묻지 않는 게 저희 여관 방침이에요.', set: { gold: 30, 'aff.erion': 1, rep: -1 }, goto: 'd1_erion_accept' },
      { text: '죄송하지만 용건 정도는 알아야 방을 드릴 수 있어요.',          set: { 'aff.erion': -1, rep: 1 },            goto: 'd1_erion_ask' },
      { text: '주머니는 넣어 두세요. 대신 방에서 위험한 마법은 쓰지 않겠다고 약속해 주세요.', set: { gold: 15, 'aff.erion': 1, rep: 1 }, goto: 'd1_erion_promise' }
    ] }
  ],
  d1_erion_accept: [
    { say: 'erion', face: 'smile', text: '…현명하군. 이런 변두리 여관에 이런 주인이라니, 의외다.' },
    { narr: '그가 처음으로 입꼬리를 올렸다. 아주 살짝. 하지만 수상한 손님을 받았다는 사실이 마음 한구석에 걸린다.' },
    { goto: 'd1_erion_after' }
  ],
  d1_erion_ask: [
    { say: 'erion', face: 'angry', text: '…이름은 이미 말했다. 용건은 이 마을 근처의 오래된 동굴. 그 이상은 알 필요 없다.' },
    { narr: '목소리가 차갑게 가라앉았지만, 그는 순순히 금화 몇 닢을 더 내려놓았다.' },
    { set: { gold: 20 } },
    { goto: 'd1_erion_after' }
  ],
  d1_erion_promise: [
    { say: 'erion', face: 'surprised', text: '…약속? 마법사에게 약속을 요구한 사람은 네가 처음이다.' },
    { say: 'erion', face: 'smile', text: '좋다. 건물을 태우지 않겠다고 약속하지. 그 정도는 어렵지 않다.' },
    { narr: '진지하게 안심해도 되는 말인지는 잘 모르겠다.' },
    { goto: 'd1_erion_after' }
  ],
  d1_erion_after: [
    { say: 'erion', face: 'normal', text: '식사는 방으로 가져다 달라. 조용한 것이 좋다.' },
    { hide: 'erion' },
    { narr: '에리온은 역시 소리 없이 계단을 올랐다.' },
    { narr: '동굴이라고 했다. 카엘이 말한 그 동굴일까. 두 손님의 목적지가 같다는 사실에 불안한 예감이 스친다.' },
    { goto: 'd1_evening' }
  ],

  // ---------- 저녁: 충돌 ----------
  d1_evening: [
    { bg: 'inn_evening' },
    { narr: '저녁이 되자 마을 사람들이 술을 마시러 하나둘 모여들었고, 은빛 여우관은 오랜만에 시끌벅적해졌다.' },
    { set: { gold: 15 } },
    { show: 'kael', face: 'smile', pos: 'left' },
    { say: 'kael', text: '자, 모두 들어라! 내일이면 이 몸이 고블린 동굴의 수수께끼를 풀 것이다! 오늘은 내가 한턱 쏘지!' },
    { narr: '마을 사람들이 환호했다. 계산서를 누가 낼지는 아직 아무도 모른다.' },
    { show: 'erion', face: 'normal', pos: 'right' },
    { narr: '그때 계단에서 에리온이 내려왔다. 그의 손에는 푸른빛이 은은하게 일렁이는 책이 들려 있다.' },
    { say: 'kael', face: 'angry', text: '어이, 거기 귀 뾰족한 친구! 그 푸른빛… 동굴에서 새어 나온다던 빛과 똑같지 않나!' },
    { say: 'erion', face: 'surprised', text: '…!' },
    { say: 'erion', face: 'angry', text: '눈이 좋군. 어리석게도.' },
    { say: 'kael', face: 'angry', text: '역시 수상하다! 동굴 사건의 범인은 네놈이지!' },
    { narr: '술집이 순식간에 조용해졌다. 대검의 손잡이와 책 위의 푸른빛이 동시에 번쩍인다. 이대로면 가게가 부서진다.' },
    { choice: [
      { text: '두 분 다 진정하세요! 여관 안에서는 검도 마법도 금지입니다!', set: { rep: 1 },                          goto: 'd1_mediate' },
      { text: '카엘 님 말에도 일리가 있어요. 그 책, 보여 주실 수 있나요?',    set: { 'aff.kael': 1, 'aff.erion': -1 }, goto: 'd1_side_kael' },
      { text: '에리온 님은 제 손님입니다. 증거 없이 의심하지 마세요.',        set: { 'aff.erion': 2, 'aff.kael': -1 }, goto: 'd1_side_erion' },
      { if: 'aff.kael>=2', text: '카엘 님, 영웅이라면 먼저 이야기를 들어 보는 게 멋지지 않을까요?', set: { 'aff.kael': 1, rep: 1 }, goto: 'd1_hero' }
    ] }
  ],
  d1_mediate: [
    { narr: '카운터를 두 손으로 쾅 쳤다. 일순간 모두가 조용해졌다.' },
    { say: 'kael', face: 'troubled', text: '…주인장?' },
    { narr: '"싸우시려면 밖에서요! 그리고 수리비는 먼저 내시고요!"' },
    { say: 'kael', face: 'troubled', text: '…수리비.' },
    { say: 'erion', face: 'normal', text: '…합리적인 규칙이군.' },
    { narr: '두 사람은 마지못해 물러섰고, 마을 사람들이 박수를 쳤다. 평판이 조금 오른 것 같다.' },
    { goto: 'd1_night' }
  ],
  d1_side_kael: [
    { say: 'erion', face: 'angry', text: '…너도 같은 생각이군.' },
    { narr: '에리온은 책을 로브 속에 감추고 차갑게 말했다. "보여 줄 이유가 없다."' },
    { say: 'kael', face: 'smile', text: '봤나! 숨기는 게 있다는 증거다!' },
    { narr: '분위기가 싸늘하게 식었다. 에리온은 아무 말 없이 계단을 올라갔다.' },
    { hide: 'erion' },
    { goto: 'd1_night' }
  ],
  d1_side_erion: [
    { say: 'kael', face: 'angry', text: '이 몸의 의심을 무시하겠다고?!' },
    { say: 'erion', face: 'surprised', text: '…나를 감싸는 건가.' },
    { say: 'kael', face: 'troubled', text: '칫… 영웅은 증거 없이 칼을 뽑지 않는다. 오늘은 넘어가 주지.' },
    { narr: '카엘은 입을 삐죽거리며 맥주잔을 들었다. 에리온은 말없이 나를 한 번 바라보았다.' },
    { goto: 'd1_night' }
  ],
  d1_hero: [
    { say: 'kael', face: 'troubled', text: '…오! 그렇군. 영웅은 먼저 이야기를 듣는다! 물론 알고 있었다!' },
    { say: 'kael', face: 'normal', text: '에리온이라고 했나? 설명해 봐라, 설명을!' },
    { say: 'erion', face: 'surprised', text: '…이 단순한 인간이 스스로 칼을 거두다니.' },
    { say: 'erion', face: 'normal', text: '동굴의 푸른빛은 내 책과 같은 종류의 마력이다. 나는 그것을 쫓아왔을 뿐, 만든 쪽이 아니다.' },
    { set: { 'flag.truth_shared': true } },
    { say: 'kael', face: 'smile', text: '그럼 같은 편이라는 거군!' },
    { narr: '이렇게 쉽게 풀리다니. 허세와 단순함도 때로는 쓸모가 있다.' },
    { goto: 'd1_night' }
  ],

  // ---------- 밤 ----------
  d1_night: [
    { bg: 'inn_night' },
    { hide: 'all' },
    { narr: '밤이 깊었다. 손님들은 각자 방으로 올라갔고, 나는 장부를 정리하고 있었다.' },
    { narr: '똑똑. 누군가 카운터 쪽으로 다가오는 기척이 났다.' },
    { if: 'aff.erion>=1', goto: 'd1_night_erion' },
    { goto: 'd1_night_erion_cold' }
  ],
  d1_night_erion: [
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…아직 안 잤나.' },
    { say: 'erion', text: '오늘 일에 대한 빚을 갚지. 동굴 안에는 봉인이 있다. 오래전 엘프 마법사들이 걸어 둔 것이다. 푸른빛은 그 봉인이 약해지고 있다는 신호지.' },
    { say: 'erion', text: '내 책은 그 봉인의 열쇠 중 하나다. 그리고 누군가 나머지 열쇠를 모으고 있다.' },
    { narr: '알고 싶지 않았던 종류의 이야기다. 하지만 이 사람은 나를 믿고 말해 주는 것이다.' },
    { say: 'erion', face: 'smile', text: '여관에는 피해가 가지 않게 하겠다. …그리고, 차 한 잔 얻을 수 있겠나.' },
    { choice: [
      { text: '물론이죠. 따뜻한 약초차를 내올게요.',       set: { 'aff.erion': 1, 'flag.erion_trust': true }, goto: 'd1_night_tea' },
      { text: '…내일 이야기하면 안 될까요? 너무 졸려서요.', set: { gold: 0 },                                  goto: 'd1_night_sleepy' }
    ] }
  ],
  d1_night_tea: [
    { narr: '김이 오르는 찻잔을 건네자, 에리온은 두 손으로 조심스럽게 받았다.' },
    { say: 'erion', face: 'smile', text: '…따뜻하군. 이렇게 차를 마셔 본 지가 오래되었다.' },
    { hide: 'erion' },
    { goto: 'd1_night_kael' }
  ],
  d1_night_sleepy: [
    { say: 'erion', face: 'smile', text: '…인간은 정말 잘 자는군. 좋다, 내일 하지.' },
    { hide: 'erion' },
    { goto: 'd1_night_kael' }
  ],
  d1_night_erion_cold: [
    { narr: '돌아보니 아무도 없었다. 카운터 위에는 쪽지 한 장만 놓여 있다.' },
    { narr: '\'내일 새벽에 떠난다. 방값은 이미 충분히 냈다. — E\'' },
    { narr: '아무 설명도 없다. 그는 나에게 아무것도 알려 줄 마음이 없는 모양이다.' },
    { set: { 'flag.erion_left': true } },
    { goto: 'd1_night_kael' }
  ],

  d1_night_kael: [
    { narr: '2층에서 쿵 하는 소리가 났다. 올라가 보니 카엘이 복도에 앉아 대검을 닦고 있었다.' },
    { show: 'kael', face: 'normal', pos: 'center' },
    { if: 'aff.kael>=2', goto: 'd1_kael_honest' },
    { goto: 'd1_kael_loud' }
  ],
  d1_kael_honest: [
    { say: 'kael', face: 'troubled', text: '…주인장. 사실 말이다. 오우거 세 마리라는 건… 아직 한 마리밖에 못 잡았다. 그것도 어린 놈으로.' },
    { narr: '그는 머리를 긁적이며 쓴웃음을 지었다. 허세 뒤에 숨은 건 의외로 솔직한 사람이었다.' },
    { choice: [
      { text: '한 마리도 대단한 거예요. 내일은 진짜 영웅이 되실 거예요.', set: { 'aff.kael': 1, rep: 1 }, goto: 'd1_kael_end_a' },
      { text: '그럼 영웅 할인은 취소해도 될까요?',                          set: { gold: 10 },                goto: 'd1_kael_end_b' }
    ] }
  ],
  d1_kael_end_a: [
    { say: 'kael', face: 'smile', text: '…하하. 그렇게 말해 주는 건 네가 처음이다. 고맙다, 주인장.' },
    { goto: 'd1_end' }
  ],
  d1_kael_end_b: [
    { say: 'kael', face: 'angry', text: '그건 안 된다! 그것만은 안 돼!' },
    { narr: '웃음이 터졌다. 카엘도 투덜거리다가 결국 따라 웃었다.' },
    { goto: 'd1_end' }
  ],
  d1_kael_loud: [
    { say: 'kael', face: 'normal', text: '아직 안 잤나, 주인장? 영웅의 곁에서 밤을 지새우겠다는 건가? 좋은 마음가짐이다!' },
    { narr: '그냥 장부를 정리하던 중이었는데. 하지만 굳이 정정하지는 않았다.' },
    { say: 'kael', face: 'smile', text: '내일 동굴에서 돌아오면 모두에게 이 여관을 자랑해 주지!' },
    { goto: 'd1_end' }
  ],

  // ---------- 1일차 마무리 ----------
  d1_end: [
    { hide: 'all' },
    { narr: '창밖으로 달이 높이 떴다. 오늘 하루 은빛 여우관에는 두 명의 손님이 왔고, 금고는 조금 무거워졌다.' },
    { if: 'rep>=2', goto: 'd1_end_good' },
    { narr: '아직 마을 사람들은 이 여관에 큰 기대는 없는 모양이다. 내일은 조금 더 잘해 봐야지.' },
    { goto: 'd1_summary' }
  ],
  d1_end_good: [
    { narr: '술집에서 들은 이야기가 벌써 마을에 퍼진 것 같다. \'은빛 여우관 주인, 믿을 만하더라\'는 소문과 함께.' },
    { goto: 'd1_summary' }
  ],
  d1_summary: [
    { narr: '내일 두 사람은 동굴로 떠나겠지. 그곳에서 무슨 일이 기다리고 있을까.' },
    { summary: { title: '1일차 결과', note: '2일차는 다음 업데이트에서 만나요!' } }
  ]
});
