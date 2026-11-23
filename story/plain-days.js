// ============================================================
//  평범한 하루 — 한 히로인의 순서 이벤트를 다 봤거나, 다음 이벤트의 조건(주차 등)이 아직 안 맞을 때 그 사람을 고르면 나오는 짧은 장면
//  - 히로인당 10개 (기본 6 + 주차/호감도 조건부 4). 조건이 맞는 것 중 아직 안 본 것부터, 다 봤으면 조건 맞는 것을 돌려 씁니다 (본 횟수 pl.<id>).
//    항목에 maxWeek/minWeek/minDay/minAff/if 를 달면 그 조건일 때만 나옵니다. 호감도 +1, 끝은 {goto:'after_pick'}.
//  - 새 장면을 늘리려면: 아래 PLAIN_DAYS 의 그 히로인 배열에 { scene, text(선택지 미리보기 한 줄) } 를 추가하고,
//    같은 이름의 장면을 만드세요. 장면에는 {set:{'aff.<id>':1,'pl.<id>':1}} 이 들어가야 합니다. (README "일상 문구 추가법")
// ============================================================
window.PLAIN_DAYS = {
  erion: [
    { scene: 'erion_plain1', text: '마당 벤치에 앉아 차를 홀짝이고 있다. 오늘은 책을 덮어 두었다.' },
    { scene: 'erion_plain2', text: '빨래 너는 리아를 멀찍이서 지켜보고 있다. 눈이 마주치면 시선을 돌린다.' },
    { scene: 'erion_plain3', text: '식당 구석에서 메뉴판을 뚫어져라 보고 있다. 달콤한 항목에서 시선이 멈춘다.' },
    { scene: 'erion_plain4', text: '우물가에서 물 위에 비친 하늘을 가만히 들여다보고 있다.' },
    { scene: 'erion_plain5', text: '복도 끝 창가에서 책에 뭔가를 적고 있다. 내가 다가가자 슬쩍 책을 덮는다.' },
    { scene: 'erion_plain6', text: '마당의 고양이 앞에 쪼그려 앉아 있다. 표정은 평소 그대로인데 손이 바쁘다.' },
    { scene: 'erion_plain7', text: '낙엽이 쌓인 마당 한구석에서 낙엽 하나를 책갈피로 만들고 있다.', maxWeek: 2 },
    { scene: 'erion_plain8', text: '창가에서 푸른 책을 꼭 안은 채 바깥을 경계하듯 보고 있다.', minWeek: 3 },
    { scene: 'erion_plain9', text: '식당 식탁에 마법 잉크병을 늘어놓고 뭔가를 그리고 있다.', minAff: HEART(2) },
    { scene: 'erion_plain10', text: '폭풍이 오기 전, 방 안에서 짐을 풀고 다시 싸고 있다.', minWeek: 4 }
  ],
  kaela: [
    { scene: 'kaela_plain1', text: '마당 한가운데서 느긋하게 기지개를 켜고 있다.' },
    { scene: 'kaela_plain2', text: '닭장 앞에서 닭과 눈싸움 중이다. 아직 이기지 못한 듯하다.' },
    { scene: 'kaela_plain3', text: '목검을 들고 허수아비 앞에서 자세를 잡고 있다. 어째 허수아비가 더 늠름하다.' },
    { scene: 'kaela_plain4', text: '식당에서 고기 접시를 앞에 두고 진지하게 고민하는 중이다.' },
    { scene: 'kaela_plain5', text: '지붕 수리를 돕겠다며 사다리를 붙들고 서 있다. 사다리는 이미 기울었다.' },
    { scene: 'kaela_plain6', text: '아이들에게 둘러싸여 무용담을 하나 더 만들어 내고 있다.' },
    { scene: 'kaela_plain7', text: '마당에서 새 장화를 신고 물웅덩이를 일부러 밟아 보고 있다.', maxWeek: 2 },
    { scene: 'kaela_plain8', text: '우물가에서 갑옷 가격표를 만지작거리며 뭔가 계산 중이다.', minWeek: 3 },
    { scene: 'kaela_plain9', text: '식당 구석에서 토큰 하나를 놓고 진지한 표정으로 단골들을 관찰한다.', minAff: HEART(2) },
    { scene: 'kaela_plain10', text: '내일 폭풍 대비로 마당의 도끼와 사다리를 정리하고 있다.', minWeek: 4 }
  ],
  miho: [
    { scene: 'miho_plain1', text: '카운터에 턱을 괴고 하품을 하고 있다.' },
    { scene: 'miho_plain2', text: '손님 없는 틈에 꼬리를 빗질하고 있다.' },
    { scene: 'miho_plain3', text: '장부를 거꾸로 들고 이리저리 살피고 있다. 뭔가 이상한 계산이 나온 모양이다.' },
    { scene: 'miho_plain4', text: '창고 선반에 올라가 재료 상자를 뒤지고 있다. 꼬리만 보인다.' },
    { scene: 'miho_plain5', text: '식당 창가에서 지나가는 행상인들의 짐을 눈으로 세고 있다.' },
    { scene: 'miho_plain6', text: '동전 한 닢을 손가락 사이로 굴리며 심심해하고 있다.' },
    { scene: 'miho_plain7', text: '카운터 뒤에서 동전 더미를 높이 쌓다가 무너뜨리고 있다.', maxWeek: 2 },
    { scene: 'miho_plain8', text: '창가에서 낯선 상인들을 눈으로 훑으며 장부에 적고 있다.', minWeek: 3 },
    { scene: 'miho_plain9', text: '식당에서 7개의 작은 주머니에 동전을 나눠 담고 있다.', minAff: HEART(2) },
    { scene: 'miho_plain10', text: '간판 아래에 서서 여우 그림을 올려다보며 한숨을 쉰다.', minWeek: 4 }
  ],
  lia: [
    { scene: 'lia_plain1', text: '빨랫줄에 시트를 널며 콧노래를 부르고 있다.' },
    { scene: 'lia_plain2', text: '마당 꽃밭에 물을 주고 있다. 화분이 어제보다 늘었다.' },
    { scene: 'lia_plain3', text: '식당 식탁을 하나하나 닦으며 오늘 손님 수를 세고 있다.' },
    { scene: 'lia_plain4', text: '신전에서 얻어 온 약초를 말리고 있다. 마당에 향기가 가득하다.' },
    { scene: 'lia_plain5', text: '계단에 앉아 낡은 앨범 같은 것을 넘겨 보고 있다.' },
    { scene: 'lia_plain6', text: '주방에서 반죽을 치대며 이마에 밀가루를 묻히고 있다.' },
    { scene: 'lia_plain7', text: '빨래 바구니를 든 채 마당에서 낙엽을 줍고 있다.', maxWeek: 2 },
    { scene: 'lia_plain8', text: '식당 한구석에서 작은 성서를 펼쳐 놓고 조용히 기도한다.', minWeek: 3 },
    { scene: 'lia_plain9', text: '주방에서 같이 먹자며 작은 도시락을 두 개 싸고 있다.', minAff: HEART(2) },
    { scene: 'lia_plain10', text: '신전에서 가져온 작은 부적들을 문마다 걸고 있다.', minWeek: 4 }
  ]
};

Object.assign(STORY.scenes, {
  erion_plain1: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '벤치 옆자리에 말없이 앉았다. 에리온은 한참 만에 찻잔을 내밀었다.' },
    { say: 'erion', text: '…식기 전에 마셔. 오늘은 책 말고 이 차가 더 좋아서.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '이런 하루도 나쁘지 않네. 아무 일도 안 일어나는 하루.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain1': true } },
    { goto: 'after_pick' }
  ],
  erion_plain2: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'erion', face: 'shy', pos: 'center' },
    { narr: '리아가 빨래를 너는 모습을 에리온이 창가에서 멀찍이 보고 있었다.' },
    { say: 'erion', text: '…보고 있던 거 아니야. 그냥, 바람에 시트가 펄럭이는 게 신기해서.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '사장님도 같이 보자. 아무 말 안 해도 되니까.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain2': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain1: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { narr: '마당 한가운데서 카엘라가 크게 기지개를 켜고 있었다. 오늘은 대검을 눕혀 두었다.' },
    { say: 'kaela', text: '주인장! 오늘은 수련을 쉬는 날이다. 쉬는 것도 수련이라고 누가 그랬거든!' },
    { say: 'kaela', text: '…그런데 쉬는 법을 몰라서 곤란하다. 같이 일광욕이나 하겠나?' },
    { narr: '나란히 앉아 햇볕을 쬐었다. 카엘라는 오 분도 못 가 코를 골았다.' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain1': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain2: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'angry', pos: 'center' },
    { narr: '닭장 앞에서 카엘라가 닭 한 마리와 눈싸움을 하고 있었다.' },
    { say: 'kaela', text: '이 녀석, 사흘째 눈을 안 피한다. 보통 놈이 아니야!' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…아, 졌다. 주인장이 와서 시선을 뺏긴 것뿐이다. 무효다, 무효!' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain2': true } },
    { goto: 'after_pick' }
  ],
  miho_plain1: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { narr: '카운터에 턱을 괸 미호가 하품을 삼켰다. 장부는 이미 다 정리된 것 같다.' },
    { say: 'miho', text: '사장님, 손님 없을 땐 돈 안 되는 일 하면 손해예요. …그러니까 이건 서비스예요, 말동무 서비스.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '오늘은 무료예요. 아주 특별히.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain1': true } },
    { goto: 'after_pick' }
  ],
  miho_plain2: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'miho', face: 'shy', pos: 'center' },
    { narr: '볕 좋은 오후, 미호가 마당 의자에서 꼬리를 정성껏 빗질하고 있었다.' },
    { say: 'miho', text: '…꼬리 손질은 영업 비밀이에요. 뒤에서 몰래 보지 말라고요.' },
    { say: 'miho', text: '그래도 사장님이니까 한 번만. 빗 잡아 줄래요? 아, 너무 세게는 말고요!' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain2': true } },
    { goto: 'after_pick' }
  ],
  lia_plain1: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { narr: '리아가 시트를 빨랫줄 가득 널고 있었다. 하얀 천이 파도처럼 펄럭인다.' },
    { say: 'lia', text: '날씨 좋을 때 말려야 해! 거들어 줄래? 그쪽 끝을 잡아 줘.' },
    { narr: '둘이 시트 양 끝을 맞잡고 털었다. 햇볕 냄새가 얼굴을 스쳤다.' },
    { say: 'lia', text: '…이런 하루, 오래 기억할 것 같아.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain1': true } },
    { goto: 'after_pick' }
  ],
  lia_plain2: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { narr: '마당 꽃밭에 물을 주는 리아 옆에 쪼그려 앉았다. 화분이 어제보다 하나 늘었다.' },
    { say: 'lia', text: '신전 정원에서 한 포기 얻어 왔어. 이 꽃은 여관 앞에 놓으면 손님들이 좋아할 것 같아서.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '네 이름을 붙여도 돼? …농담이야, 반쯤.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain2': true } },
    { goto: 'after_pick' }
  ],
  erion_plain3: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '식당 구석에서 에리온이 메뉴판을 보고 있었다. 정확히는, 메뉴판의 달콤한 칸만.' },
    { say: 'erion', text: '…재료 구성을 살펴보는 중이야. 학술적인 관심. 다른 뜻은 없어.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…이거, 한 접시만. 아, 조용히 내와. 소문나면 곤란하니까.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain3': true } },
    { goto: 'after_pick' }
  ],
  erion_plain4: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '우물 물 위로 구름이 천천히 지나갔다. 에리온은 그걸 한참 들여다보다가 내 기척에 고개를 들었다.' },
    { say: 'erion', text: '물에 비친 하늘은 진짜 하늘보다 조용해서 좋아. …이런 소리 하면 이상한가.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '이상하다고 안 하네. …고마워. 물 한 바가지 줘.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain4': true } },
    { goto: 'after_pick' }
  ],
  erion_plain5: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'erion', face: 'surprised', pos: 'center' },
    { narr: '복도 끝 창가에서 에리온이 뭔가를 열심히 적다가 내가 다가가자 책을 탁 덮었다.' },
    { say: 'erion', text: '…일기 같은 거야. 오늘 있었던 일을 적어 두는 것뿐. 보지 마.' },
    { say: 'erion', face: 'shy', text: '…오늘 일은 이미 적었어. 네가 차를 가져다준 것도. 읽어 줄 생각은 없으니까 그만 가.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain5': true } },
    { goto: 'after_pick' }
  ],
  erion_plain6: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '마당의 얼룩 고양이 앞에 에리온이 쪼그려 앉아 있었다. 손가락 끝에서 아주 작은 푸른 불꽃이 반짝였고, 고양이는 그걸 열심히 쫓았다.' },
    { say: 'erion', text: '…마법은 이럴 때 쓰는 거야. 위험한 데 쓰지 않고.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '이 녀석 이름 지었어. 비밀이야. …너한테만 알려 줄까.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain6': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain3: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'angry', pos: 'center' },
    { narr: '허수아비 앞에서 카엘라가 목검을 쥐고 노려보고 있었다. 허수아비는 꿈쩍도 하지 않는다.' },
    { say: 'kaela', text: '이 녀석, 태도가 불손하다! 영웅 앞에서 고개도 안 숙이다니!' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…주인장이 응원해 주면 한 합 겨뤄 보겠다. 응원은 크게 해라!' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain3': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain4: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'kaela', face: 'normal', pos: 'center' },
    { narr: '식탁 위에 고기 접시 두 개가 놓여 있었다. 카엘라는 팔짱을 낀 채 둘을 번갈아 노려보았다.' },
    { say: 'kaela', text: '왼쪽은 크고 오른쪽은 향이 좋다. 영웅의 결단이 필요한 순간이다!' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…둘 다 먹겠다! 결단이 빨라서 좋지 않나? 주인장도 한 점 먹어라!' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain4': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain5: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { narr: '지붕 수리를 돕겠다며 카엘라가 사다리를 붙잡고 있었다. 사다리가 서서히 기울기 시작한다.' },
    { say: 'kaela', text: '으, 으앗! 주인장, 사다리를 잡아라! 영웅의 명령이다!' },
    { narr: '둘이서 사다리를 붙들고 한참을 낑낑거렸다. 겨우 균형을 되찾자 카엘라가 땀을 닦으며 크게 웃었다.' },
    { say: 'kaela', face: 'smile', text: '하하! 역시 팀워크다! 아마 지붕은 내일 고치게 될 거다!' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain5': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain6: [
    { bg: 'square_day' }, { hide: 'all' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { narr: '골목에서 아이들 한 무리가 카엘라를 둘러싸고 있었다. 무용담은 오늘 한 마리 용이 더 늘어 있었다.' },
    { say: 'kaela', text: '그래서 그 용이 말하길, "붉은 사자여, 나를 베지 마라!" 내가 대답했다. "미안하지만 베어야겠다!"' },
    { narr: '아이들이 환호했다. 카엘라는 나를 발견하더니 어색하게 헛기침을 했다.' },
    { say: 'kaela', face: 'shy', text: '…용은 사실 도마뱀이었다고 말하면 안 된다. 아이들 꿈은 지켜 줘야 하니까.' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain6': true } },
    { goto: 'after_pick' }
  ],
  miho_plain3: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'miho', face: 'surprised', pos: 'center' },
    { narr: '미호가 장부를 거꾸로 들고 끙끙대고 있었다. 한참 후에야 나를 발견했다.' },
    { say: 'miho', text: '사장님! 이 장부, 어제와 합이 안 맞아요! 누가 제 계산을 건드렸어요!' },
    { show: 'miho', face: 'normal' },
    { say: 'miho', text: '…아, 제가 거꾸로 들고 있었네요. 이건 비밀로 해 주세요. 계산의 달인 체면이 있어서.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain3': true } },
    { goto: 'after_pick' }
  ],
  miho_plain4: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '창고 선반 위에서 꼬리 하나가 삐죽 흔들렸다. 올려다보니 미호가 상자 사이에 파묻혀 있었다.' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '재고 점검이에요! 위쪽에 먼지 쌓인 상자를 정리하는 중이고요. 도둑질 아니에요, 정리예요, 정리!' },
    { say: 'miho', text: '…이거 봐요, 오래된 꿀단지 발견! 공동 재산으로 등록할게요. 맛은 먼저 제가 확인하고요.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain4': true } },
    { goto: 'after_pick' }
  ],
  miho_plain5: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { narr: '창가에서 미호가 지나가는 행상인들의 짐을 눈으로 세고 있었다. 입술이 달싹달싹 움직인다.' },
    { say: 'miho', text: '저 마차는 오늘 장터에서 손해 볼 거예요. 짐 반이 이미 상했거든요. 눈에 다 보여요.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '이런 눈으로 평생 살면 피곤해요. 그래서 가끔 사장님 얼굴을 봐요. 계산이 안 되는 얼굴이라 쉬어져요.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain5': true } },
    { goto: 'after_pick' }
  ],
  miho_plain6: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { narr: '미호가 동전 한 닢을 손가락 사이로 굴리며 심심해하고 있었다. 동전이 손등에서 손바닥으로 매끄럽게 넘어간다.' },
    { say: 'miho', text: '이거, 사장님 몫이에요. 오늘 장 보다가 거스름돈을 잘못 받은 척 챙겼는데… 아, 아니, 정직하게 받은 거예요!' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…돌려드릴게요. 이상하게 사장님 앞에서는 주머니가 무거워져서요. 양심이 무거운 건가?' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain6': true } },
    { goto: 'after_pick' }
  ],
  lia_plain3: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { narr: '식당 식탁을 하나씩 닦으며 리아가 입속으로 숫자를 세고 있었다.' },
    { say: 'lia', text: '식탁이 열 개고 의자가 서른 개… 오늘은 손님이 얼마나 올까? 어제보다 많으면 좋겠다.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '네가 열심히 하니까, 나도 신나. 헛되지 않을 것 같아서.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain3': true } },
    { goto: 'after_pick' }
  ],
  lia_plain4: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { narr: '마당 가득 약초가 널려 있었다. 바람이 불 때마다 쌉싸름하고 달콤한 향기가 퍼졌다.' },
    { say: 'lia', text: '신전에서 얻어 온 거야. 말리면 차로 마실 수 있어. 두통이랑 불면에 좋대.' },
    { say: 'lia', face: 'shy', text: '…너 요즘 눈 밑이 어두워. 한 봉지 챙겨 줄게. 아니, 매일 한 잔씩 마시게 할 거야.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain4': true } },
    { goto: 'after_pick' }
  ],
  lia_plain5: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { narr: '계단에 앉은 리아가 낡은 그림책을 넘기고 있었다. 모서리가 닳아 있다.' },
    { say: 'lia', text: '이거 기억나? 어릴 때 네가 맨날 읽어 달라고 했던 책. 여관 다락에서 찾았어.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '그때는 내가 읽어 주고 네가 잠들었는데. …이번엔 나도 졸리면 같이 자도 돼?' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain5': true } },
    { goto: 'after_pick' }
  ],
  lia_plain6: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'lia', face: 'surprised', pos: 'center' },
    { narr: '주방에서 리아가 반죽을 치대다가 이마에 밀가루를 묻힌 채 고개를 들었다.' },
    { say: 'lia', text: '앗, 보지 마! 빵 만드는 중이야. 신전 빵집에서 비법을 배웠거든. 잘 부풀면 좋겠는데.' },
    { narr: '이마의 밀가루를 소매로 닦아 주자 리아가 눈을 크게 떴다. 귀가 새빨개졌다.' },
    { say: 'lia', face: 'shy', text: '…고마워. 다 구워지면 제일 먼저 줄게. 약속이야.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain6': true } },
    { goto: 'after_pick' }
  ],

  // ---------- 2단계 추가: 주차/호감도 조건이 붙은 평범한 하루 (PLAIN_DAYS 의 maxWeek/minWeek/minAff) ----------
  erion_plain7: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '에리온이 주운 낙엽 한 장을 들여다보고 있었다. 가을이 막 시작된 마당은 아직 푸르고 붉다.' },
    { say: 'erion', text: '…이게 책갈피로 제일 좋아. 색이 변하는 중이라 아직 결정을 못 한 잎 같아서.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '사장님도 하나 골라. 같은 색으로 맞추자는 건 아니야. 그냥 하나 정도는 가져도 괜찮은 날이잖아.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain7': true } },
    { goto: 'after_pick' }
  ],
  erion_plain8: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '에리온이 창가에서 푸른 책을 가슴에 안고 마을 쪽을 보고 있었다. 요즘 마을 공기는 어쩐지 바삭하게 마른 느낌이다.' },
    { say: 'erion', text: '…책이 아까부터 진동을 멈추질 않아. 괜찮아, 아직은 버틸 수 있는 정도야.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…옆에 있어 줄래? 아무 말 안 해도 되니까. 그냥 사람 온기가 있으면 책이 좀 얌전해지는 것 같아서.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain8': true } },
    { goto: 'after_pick' }
  ],
  erion_plain9: [
    { bg: 'inn_evening' }, { hide: 'all' },
    { show: 'erion', face: 'smile', pos: 'center' },
    { narr: '에리온이 식당 식탁 위에 잉크병을 줄줄이 세워 놓고 작은 마법진을 그리고 있었다. 빛이 꼬리를 물고 번진다.' },
    { say: 'erion', text: '…보지 마. 아니, 봐도 돼. 이건 장난으로 그리는 거니까. 불 켜는 마법진 같은 거.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '봐, 켜졌지? 이 정도면 촛불 값은 아낄 수 있겠어. …사장님 장사에 도움이 되고 싶어서 그런 거야, 별 뜻은 없어.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain9': true } },
    { goto: 'after_pick' }
  ],
  erion_plain10: [
    { bg: 'inn_evening' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '에리온의 방문이 반쯤 열려 있었다. 짐 가방을 열었다 닫았다 하다가 내 기척에 화들짝 놀라 멈춘다.' },
    { say: 'erion', text: '…이건 어디 가려는 게 아니야. 가방 속 물건 순서가 마음에 안 들어서 정리하던 거야.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…사장님 방은 지붕이 튼튼해? 폭풍이 오면 책이 어떻게 될지 몰라서. 괜찮으면 옆에 책상 하나만 빌려줘.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1, 'evdone.erion_plain10': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain7: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { narr: '카엘라가 새 장화를 신고 마당의 작은 물웅덩이를 한 발씩 첨벙 밟고 있었다.' },
    { say: 'kaela', text: '새 장화의 방수 시험 중이다! 결과는 합격! 아니, 한쪽만 합격이다!' },
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…발가락이 젖었다. 사장님, 이건 전술적 후퇴다! 수건을 가져와 주겠나?' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain7': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain8: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'kaela', face: 'normal', pos: 'center' },
    { narr: '카엘라가 우물가에서 갑옷 소매에 달린 가격표를 만지작거리고 있었다. 입술이 달싹달싹 숫자를 세는 중이다.' },
    { say: 'kaela', text: '…이번 달 할부금이 이만큼이고, 남은 회차가 이만큼이니까… 흠, 암산이 틀렸다. 사장님이 한 번 해 줄 수 있나?' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '아하, 생각보다 빨리 끝나는군! 기사가 되기 전에 빚부터 갚는다! 순서가 이상하지만 멋지지 않은가!' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain8': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain9: [
    { bg: 'inn_evening' }, { hide: 'all' },
    { show: 'kaela', face: 'normal', pos: 'center' },
    { narr: '카엘라가 식당 구석에서 팔짱을 낀 채 단골들을 찬찬히 관찰하고 있었다. 평소의 허세는 어디 가고 눈빛이 진지하다.' },
    { say: 'kaela', text: '…마르타 부인은 왼손잡이고, 토비는 거짓말할 때 귀가 빨개진다. 이 정도면 정찰병으로도 먹고살 수 있겠지?' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…사장님, 기사가 못 되더라도 이 마을에서 쓸모 있는 사람이 되고 싶다. 이런 말 해도 되나?' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain9': true } },
    { goto: 'after_pick' }
  ],
  kaela_plain10: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'normal', pos: 'center' },
    { narr: '카엘라가 마당에서 도끼와 사다리, 밧줄을 일렬로 늘어놓고 있었다. 평소보다 훨씬 조용하고 정확한 손놀림이다.' },
    { say: 'kaela', text: '폭풍 대비 장비 점검이다. 이 도끼는 장작용, 이 밧줄은 지붕용. 아무것도 안 부수고 끝내는 게 오늘의 목표다!' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '사장님은 사다리 쪽을 잡아 줘. …이번에는 절대 놓치지 않는다. 내 책임이니까.' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1, 'evdone.kaela_plain10': true } },
    { goto: 'after_pick' }
  ],
  miho_plain7: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'miho', face: 'surprised', pos: 'center' },
    { narr: '미호가 카운터에서 동전을 탑처럼 쌓다가 와르르 무너뜨렸다. 꼬리가 동전 하나를 슬쩍 가리고 있다.' },
    { say: 'miho', text: '아, 이건 재고 점검이에요! 쌓아서 세는 게 제일 정확하거든요! …꼬리 아래는 안 봐도 돼요.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '한 닢 부족하네요? …어머, 제 꼬리 속에 있었네요. 신기한 일이죠? 헤헤.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain7': true } },
    { goto: 'after_pick' }
  ],
  miho_plain8: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { narr: '미호가 식당 창가에서 지나가는 상인 행렬을 눈으로 훑으며 장부에 뭔가를 적고 있었다. 평소의 장난기 대신 날카로운 눈빛이다.' },
    { say: 'miho', text: '…요즘 상인들 짐이 가벼워요. 팔러 온 게 아니라 피해서 도망가는 사람들 같아요. 무슨 소문이 도나 봐요.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…아, 이건 영업 비밀이에요. 사장님한테만 말하는 거예요. 아무한테도 말하면 안 돼요? 약속이에요.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain8': true } },
    { goto: 'after_pick' }
  ],
  miho_plain9: [
    { bg: 'inn_evening' }, { hide: 'all' },
    { show: 'miho', face: 'shy', pos: 'center' },
    { narr: '미호가 식당 한구석에서 작은 주머니 일곱 개에 동전을 나눠 담고 있었다. 나를 보더니 황급히 손으로 가린다.' },
    { say: 'miho', text: '…아, 이건 저금통이에요. 비밀 저금통. 보지 못한 걸로 해 주세요. 부탁이에요.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '…고마워요. 사장님은 이상한 걸 캐묻지 않아서 좋아요. 계산 안 되는 사람 같아서 가끔 무섭기도 하지만요.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain9': true } },
    { goto: 'after_pick' }
  ],
  miho_plain10: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'miho', face: 'shy', pos: 'center' },
    { narr: '미호가 간판 아래에 서서 은빛 여우 그림을 올려다보고 있었다. 평소와 달리 눈빛이 아주 조용하다.' },
    { say: 'miho', text: '…폭풍이 오면 이 간판도 떨어질지 몰라요. 그러면 여우는 어디로 가야 하죠?' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '…농담이에요. 간판은 제가 직접 묶어 놓을 거예요. 이 집은 제 투자처니까요. 투자처는 지켜야죠.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1, 'evdone.miho_plain10': true } },
    { goto: 'after_pick' }
  ],
  lia_plain7: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { narr: '리아가 빨래 바구니를 든 채 마당에서 낙엽을 하나씩 주워 담고 있었다. 바구니 안은 어느새 색색의 잎으로 가득하다.' },
    { say: 'lia', text: '낙엽으로 책갈피를 만들까 해서. 에리온이 좋아하더라. …이건 비밀이야, 놀리지 말고.' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…같이 줍자. 둘이 하면 금방이야. 어릴 때도 이렇게 같이 주웠었잖아.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain7': true } },
    { goto: 'after_pick' }
  ],
  lia_plain8: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { narr: '리아가 식당 구석에서 작은 성서를 펼쳐 놓고 조용히 입술을 움직이고 있었다. 해가 기울며 얼굴에 그림자가 졌다.' },
    { say: 'lia', text: '…요즘 기도가 자꾸 길어져. 뭔가 무거운 게 마을 위에 얹혀 있는 느낌이라서.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '…하지만 여기 오면 숨이 쉬어져. 이 집은 이상하게 따뜻하거든. 고마워, 사장님.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain8': true } },
    { goto: 'after_pick' }
  ],
  lia_plain9: [
    { bg: 'inn_evening' }, { hide: 'all' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { narr: '리아가 주방에서 도시락 두 개를 정성스레 싸고 있었다. 하나는 크고 하나는 작다. 내 기척에 화들짝 돌아본다.' },
    { say: 'lia', text: '앗, 마침 잘 왔어. 이거, 같이 먹자고 싼 건데… 작은 건 내 거고 큰 건 사장님 거야. 알겠지?' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…큰 걸 줘야 많이 먹을 테니까. 다른 뜻은 없어. 아니, 있긴 있는데… 먹고 나서 말할게.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain9': true } },
    { goto: 'after_pick' }
  ],
  lia_plain10: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { narr: '리아가 여관 문마다 작은 부적을 걸고 있었다. 사다리 위에서 균형을 잡으며 입술을 오므린 채 집중하고 있다.' },
    { say: 'lia', text: '폭풍 대비 부적이야. 효과는 보증 못 하지만… 걸어 두면 마음이 편해지거든.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '이 문에는 특별히 하나 더 걸어야지. 사장님 방문 쪽은 두 개야. …아, 불평 금지.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1, 'evdone.lia_plain10': true } },
    { goto: 'after_pick' }
  ]
});
