// ============================================================
//  평범한 하루 — 한 히로인의 순서 이벤트를 다 봤거나, 다음 이벤트의 조건(주차 등)이 아직 안 맞을 때 그 사람을 고르면 나오는 짧은 장면
//  - 히로인당 6개를 PLAIN_DAYS 순서대로 돌려 씁니다 (본 횟수 pl.<id>). 호감도 +1, 끝은 {goto:'after_pick'}.
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
    { scene: 'erion_plain6', text: '마당의 고양이 앞에 쪼그려 앉아 있다. 표정은 평소 그대로인데 손이 바쁘다.' }
  ],
  kaela: [
    { scene: 'kaela_plain1', text: '마당 한가운데서 느긋하게 기지개를 켜고 있다.' },
    { scene: 'kaela_plain2', text: '닭장 앞에서 닭과 눈싸움 중이다. 아직 이기지 못한 듯하다.' },
    { scene: 'kaela_plain3', text: '목검을 들고 허수아비 앞에서 자세를 잡고 있다. 어째 허수아비가 더 늠름하다.' },
    { scene: 'kaela_plain4', text: '식당에서 고기 접시를 앞에 두고 진지하게 고민하는 중이다.' },
    { scene: 'kaela_plain5', text: '지붕 수리를 돕겠다며 사다리를 붙들고 서 있다. 사다리는 이미 기울었다.' },
    { scene: 'kaela_plain6', text: '아이들에게 둘러싸여 무용담을 하나 더 만들어 내고 있다.' }
  ],
  miho: [
    { scene: 'miho_plain1', text: '카운터에 턱을 괴고 하품을 하고 있다.' },
    { scene: 'miho_plain2', text: '손님 없는 틈에 꼬리를 빗질하고 있다.' },
    { scene: 'miho_plain3', text: '장부를 거꾸로 들고 이리저리 살피고 있다. 뭔가 이상한 계산이 나온 모양이다.' },
    { scene: 'miho_plain4', text: '창고 선반에 올라가 재료 상자를 뒤지고 있다. 꼬리만 보인다.' },
    { scene: 'miho_plain5', text: '식당 창가에서 지나가는 행상인들의 짐을 눈으로 세고 있다.' },
    { scene: 'miho_plain6', text: '동전 한 닢을 손가락 사이로 굴리며 심심해하고 있다.' }
  ],
  lia: [
    { scene: 'lia_plain1', text: '빨랫줄에 시트를 널며 콧노래를 부르고 있다.' },
    { scene: 'lia_plain2', text: '마당 꽃밭에 물을 주고 있다. 화분이 어제보다 늘었다.' },
    { scene: 'lia_plain3', text: '식당 식탁을 하나하나 닦으며 오늘 손님 수를 세고 있다.' },
    { scene: 'lia_plain4', text: '신전에서 얻어 온 약초를 말리고 있다. 마당에 향기가 가득하다.' },
    { scene: 'lia_plain5', text: '계단에 앉아 낡은 앨범 같은 것을 넘겨 보고 있다.' },
    { scene: 'lia_plain6', text: '주방에서 반죽을 치대며 이마에 밀가루를 묻히고 있다.' }
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
    { set: { 'aff.erion': 1, 'pl.erion': 1 } },
    { goto: 'after_pick' }
  ],
  erion_plain2: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'erion', face: 'shy', pos: 'center' },
    { narr: '리아가 빨래를 너는 모습을 에리온이 창가에서 멀찍이 보고 있었다.' },
    { say: 'erion', text: '…보고 있던 거 아니야. 그냥, 바람에 시트가 펄럭이는 게 신기해서.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '사장님도 같이 보자. 아무 말 안 해도 되니까.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1 } },
    { goto: 'after_pick' }
  ],
  kaela_plain1: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { narr: '마당 한가운데서 카엘라가 크게 기지개를 켜고 있었다. 오늘은 대검을 눕혀 두었다.' },
    { say: 'kaela', text: '주인장! 오늘은 수련을 쉬는 날이다. 쉬는 것도 수련이라고 누가 그랬거든!' },
    { say: 'kaela', text: '…그런데 쉬는 법을 몰라서 곤란하다. 같이 일광욕이나 하겠나?' },
    { narr: '나란히 앉아 햇볕을 쬐었다. 카엘라는 오 분도 못 가 코를 골았다.' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1 } },
    { goto: 'after_pick' }
  ],
  kaela_plain2: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'angry', pos: 'center' },
    { narr: '닭장 앞에서 카엘라가 닭 한 마리와 눈싸움을 하고 있었다.' },
    { say: 'kaela', text: '이 녀석, 사흘째 눈을 안 피한다. 보통 놈이 아니야!' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…아, 졌다. 주인장이 와서 시선을 뺏긴 것뿐이다. 무효다, 무효!' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1 } },
    { goto: 'after_pick' }
  ],
  miho_plain1: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { narr: '카운터에 턱을 괸 미호가 하품을 삼켰다. 장부는 이미 다 정리된 것 같다.' },
    { say: 'miho', text: '사장님, 손님 없을 땐 돈 안 되는 일 하면 손해예요. …그러니까 이건 서비스예요, 말동무 서비스.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '오늘은 무료예요. 아주 특별히.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1 } },
    { goto: 'after_pick' }
  ],
  miho_plain2: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'miho', face: 'shy', pos: 'center' },
    { narr: '볕 좋은 오후, 미호가 마당 의자에서 꼬리를 정성껏 빗질하고 있었다.' },
    { say: 'miho', text: '…꼬리 손질은 영업 비밀이에요. 뒤에서 몰래 보지 말라고요.' },
    { say: 'miho', text: '그래도 사장님이니까 한 번만. 빗 잡아 줄래요? 아, 너무 세게는 말고요!' },
    { set: { 'aff.miho': 1, 'pl.miho': 1 } },
    { goto: 'after_pick' }
  ],
  lia_plain1: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { narr: '리아가 시트를 빨랫줄 가득 널고 있었다. 하얀 천이 파도처럼 펄럭인다.' },
    { say: 'lia', text: '날씨 좋을 때 말려야 해! 거들어 줄래? 그쪽 끝을 잡아 줘.' },
    { narr: '둘이 시트 양 끝을 맞잡고 털었다. 햇볕 냄새가 얼굴을 스쳤다.' },
    { say: 'lia', text: '…이런 하루, 오래 기억할 것 같아.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1 } },
    { goto: 'after_pick' }
  ],
  lia_plain2: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { narr: '마당 꽃밭에 물을 주는 리아 옆에 쪼그려 앉았다. 화분이 어제보다 하나 늘었다.' },
    { say: 'lia', text: '신전 정원에서 한 포기 얻어 왔어. 이 꽃은 여관 앞에 놓으면 손님들이 좋아할 것 같아서.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '네 이름을 붙여도 돼? …농담이야, 반쯤.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1 } },
    { goto: 'after_pick' }
  ],
  erion_plain3: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '식당 구석에서 에리온이 메뉴판을 보고 있었다. 정확히는, 메뉴판의 달콤한 칸만.' },
    { say: 'erion', text: '…재료 구성을 살펴보는 중이야. 학술적인 관심. 다른 뜻은 없어.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…이거, 한 접시만. 아, 조용히 내와. 소문나면 곤란하니까.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1 } },
    { goto: 'after_pick' }
  ],
  erion_plain4: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '우물 물 위로 구름이 천천히 지나갔다. 에리온은 그걸 한참 들여다보다가 내 기척에 고개를 들었다.' },
    { say: 'erion', text: '물에 비친 하늘은 진짜 하늘보다 조용해서 좋아. …이런 소리 하면 이상한가.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '이상하다고 안 하네. …고마워. 물 한 바가지 줘.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1 } },
    { goto: 'after_pick' }
  ],
  erion_plain5: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'erion', face: 'surprised', pos: 'center' },
    { narr: '복도 끝 창가에서 에리온이 뭔가를 열심히 적다가 내가 다가가자 책을 탁 덮었다.' },
    { say: 'erion', text: '…일기 같은 거야. 오늘 있었던 일을 적어 두는 것뿐. 보지 마.' },
    { say: 'erion', face: 'shy', text: '…오늘 일은 이미 적었어. 네가 차를 가져다준 것도. 읽어 줄 생각은 없으니까 그만 가.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1 } },
    { goto: 'after_pick' }
  ],
  erion_plain6: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '마당의 얼룩 고양이 앞에 에리온이 쪼그려 앉아 있었다. 손가락 끝에서 아주 작은 푸른 불꽃이 반짝였고, 고양이는 그걸 열심히 쫓았다.' },
    { say: 'erion', text: '…마법은 이럴 때 쓰는 거야. 위험한 데 쓰지 않고.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '이 녀석 이름 지었어. 비밀이야. …너한테만 알려 줄까.' },
    { set: { 'aff.erion': 1, 'pl.erion': 1 } },
    { goto: 'after_pick' }
  ],
  kaela_plain3: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'angry', pos: 'center' },
    { narr: '허수아비 앞에서 카엘라가 목검을 쥐고 노려보고 있었다. 허수아비는 꿈쩍도 하지 않는다.' },
    { say: 'kaela', text: '이 녀석, 태도가 불손하다! 영웅 앞에서 고개도 안 숙이다니!' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…주인장이 응원해 주면 한 합 겨뤄 보겠다. 응원은 크게 해라!' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1 } },
    { goto: 'after_pick' }
  ],
  kaela_plain4: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'kaela', face: 'normal', pos: 'center' },
    { narr: '식탁 위에 고기 접시 두 개가 놓여 있었다. 카엘라는 팔짱을 낀 채 둘을 번갈아 노려보았다.' },
    { say: 'kaela', text: '왼쪽은 크고 오른쪽은 향이 좋다. 영웅의 결단이 필요한 순간이다!' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…둘 다 먹겠다! 결단이 빨라서 좋지 않나? 주인장도 한 점 먹어라!' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1 } },
    { goto: 'after_pick' }
  ],
  kaela_plain5: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { narr: '지붕 수리를 돕겠다며 카엘라가 사다리를 붙잡고 있었다. 사다리가 서서히 기울기 시작한다.' },
    { say: 'kaela', text: '으, 으앗! 주인장, 사다리를 잡아라! 영웅의 명령이다!' },
    { narr: '둘이서 사다리를 붙들고 한참을 낑낑거렸다. 겨우 균형을 되찾자 카엘라가 땀을 닦으며 크게 웃었다.' },
    { say: 'kaela', face: 'smile', text: '하하! 역시 팀워크다! 아마 지붕은 내일 고치게 될 거다!' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1 } },
    { goto: 'after_pick' }
  ],
  kaela_plain6: [
    { bg: 'square_day' }, { hide: 'all' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { narr: '골목에서 아이들 한 무리가 카엘라를 둘러싸고 있었다. 무용담은 오늘 한 마리 용이 더 늘어 있었다.' },
    { say: 'kaela', text: '그래서 그 용이 말하길, "붉은 사자여, 나를 베지 마라!" 내가 대답했다. "미안하지만 베어야겠다!"' },
    { narr: '아이들이 환호했다. 카엘라는 나를 발견하더니 어색하게 헛기침을 했다.' },
    { say: 'kaela', face: 'shy', text: '…용은 사실 도마뱀이었다고 말하면 안 된다. 아이들 꿈은 지켜 줘야 하니까.' },
    { set: { 'aff.kaela': 1, 'pl.kaela': 1 } },
    { goto: 'after_pick' }
  ],
  miho_plain3: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'miho', face: 'surprised', pos: 'center' },
    { narr: '미호가 장부를 거꾸로 들고 끙끙대고 있었다. 한참 후에야 나를 발견했다.' },
    { say: 'miho', text: '사장님! 이 장부, 어제와 합이 안 맞아요! 누가 제 계산을 건드렸어요!' },
    { show: 'miho', face: 'normal' },
    { say: 'miho', text: '…아, 제가 거꾸로 들고 있었네요. 이건 비밀로 해 주세요. 계산의 달인 체면이 있어서.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1 } },
    { goto: 'after_pick' }
  ],
  miho_plain4: [
    { bg: 'inn_day' }, { hide: 'all' },
    { narr: '창고 선반 위에서 꼬리 하나가 삐죽 흔들렸다. 올려다보니 미호가 상자 사이에 파묻혀 있었다.' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '재고 점검이에요! 위쪽에 먼지 쌓인 상자를 정리하는 중이고요. 도둑질 아니에요, 정리예요, 정리!' },
    { say: 'miho', text: '…이거 봐요, 오래된 꿀단지 발견! 공동 재산으로 등록할게요. 맛은 먼저 제가 확인하고요.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1 } },
    { goto: 'after_pick' }
  ],
  miho_plain5: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'miho', face: 'normal', pos: 'center' },
    { narr: '창가에서 미호가 지나가는 행상인들의 짐을 눈으로 세고 있었다. 입술이 달싹달싹 움직인다.' },
    { say: 'miho', text: '저 마차는 오늘 장터에서 손해 볼 거예요. 짐 반이 이미 상했거든요. 눈에 다 보여요.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '이런 눈으로 평생 살면 피곤해요. 그래서 가끔 사장님 얼굴을 봐요. 계산이 안 되는 얼굴이라 쉬어져요.' },
    { set: { 'aff.miho': 1, 'pl.miho': 1 } },
    { goto: 'after_pick' }
  ],
  miho_plain6: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { narr: '미호가 동전 한 닢을 손가락 사이로 굴리며 심심해하고 있었다. 동전이 손등에서 손바닥으로 매끄럽게 넘어간다.' },
    { say: 'miho', text: '이거, 사장님 몫이에요. 오늘 장 보다가 거스름돈을 잘못 받은 척 챙겼는데… 아, 아니, 정직하게 받은 거예요!' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…돌려드릴게요. 이상하게 사장님 앞에서는 주머니가 무거워져서요. 양심이 무거운 건가?' },
    { set: { 'aff.miho': 1, 'pl.miho': 1 } },
    { goto: 'after_pick' }
  ],
  lia_plain3: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { narr: '식당 식탁을 하나씩 닦으며 리아가 입속으로 숫자를 세고 있었다.' },
    { say: 'lia', text: '식탁이 열 개고 의자가 서른 개… 오늘은 손님이 얼마나 올까? 어제보다 많으면 좋겠다.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '네가 열심히 하니까, 나도 신나. 헛되지 않을 것 같아서.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1 } },
    { goto: 'after_pick' }
  ],
  lia_plain4: [
    { bg: 'inn_front' }, { hide: 'all' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { narr: '마당 가득 약초가 널려 있었다. 바람이 불 때마다 쌉싸름하고 달콤한 향기가 퍼졌다.' },
    { say: 'lia', text: '신전에서 얻어 온 거야. 말리면 차로 마실 수 있어. 두통이랑 불면에 좋대.' },
    { say: 'lia', face: 'shy', text: '…너 요즘 눈 밑이 어두워. 한 봉지 챙겨 줄게. 아니, 매일 한 잔씩 마시게 할 거야.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1 } },
    { goto: 'after_pick' }
  ],
  lia_plain5: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'lia', face: 'normal', pos: 'center' },
    { narr: '계단에 앉은 리아가 낡은 그림책을 넘기고 있었다. 모서리가 닳아 있다.' },
    { say: 'lia', text: '이거 기억나? 어릴 때 네가 맨날 읽어 달라고 했던 책. 여관 다락에서 찾았어.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '그때는 내가 읽어 주고 네가 잠들었는데. …이번엔 나도 졸리면 같이 자도 돼?' },
    { set: { 'aff.lia': 1, 'pl.lia': 1 } },
    { goto: 'after_pick' }
  ],
  lia_plain6: [
    { bg: 'inn_day' }, { hide: 'all' },
    { show: 'lia', face: 'surprised', pos: 'center' },
    { narr: '주방에서 리아가 반죽을 치대다가 이마에 밀가루를 묻힌 채 고개를 들었다.' },
    { say: 'lia', text: '앗, 보지 마! 빵 만드는 중이야. 신전 빵집에서 비법을 배웠거든. 잘 부풀면 좋겠는데.' },
    { narr: '이마의 밀가루를 소매로 닦아 주자 리아가 눈을 크게 떴다. 귀가 새빨개졌다.' },
    { say: 'lia', face: 'shy', text: '…고마워. 다 구워지면 제일 먼저 줄게. 약속이야.' },
    { set: { 'aff.lia': 1, 'pl.lia': 1 } },
    { goto: 'after_pick' }
  ]
});
