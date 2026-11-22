// ============================================================
//  선물 상점 / 선물 반응 데이터 — 코드를 몰라도 글자와 숫자만 바꾸면 됩니다.
//  - 낮에 "누구와 시간을 보낼까" 화면의 "장터에서 선물 사기" 버튼으로 골드를 내고 삽니다.
//  - 산 선물은 보관함에 쌓이고, 낮 이벤트 직후의 "선물을 건넨다" 선택지나 메뉴의 "선물" 에서 줍니다.
//  - 하루에 히로인 한 명당 선물 1개만 줄 수 있습니다. (4일차 전야의 선물도 같은 한도를 씁니다)
//  - 히로인마다 취향(최애 +3 / 좋아함 +2 / 보통 +1 / 싫어함 -1)이 다르고, 처음 주면 반응을 보고 알게 됩니다.
//    알게 된 취향은 영업 화면의 "손님 메모"에 기록됩니다.
//  - 8종 x 히로인 4명 = 반응 32개를 모두 아래 react 에 적어 둡니다. face 는 normal/smile/angry/shy/surprised/sad.
//  - 검사: node tools/check-story.js (32개 반응, 취향 분포, 가격 등을 확인합니다)
// ============================================================
window.GIFTS = {

  // 취향 등급: 호감도 변화와 표시 이름 (prefs 에서 이 키로 지정)
  tiers: {
    fav:    { label: '최애',   points: 3,  mark: '♥♥♥' },
    like:   { label: '좋아함', points: 2,  mark: '♥♥' },
    normal: { label: '보통',   points: 1,  mark: '♥' },
    hate:   { label: '싫어함', points: -1, mark: '✕' }
  },

  // ---------- 선물 8종 (price = 장터 가격, desc = 설명, hint = 누가 좋아할지 살짝 알려 주는 말) ----------
  items: {
    flower:    { name: '꽃다발',       price: 10, icon: 'assets/gifts/flower.svg',    desc: '들꽃을 한 아름 묶었다. 향이 곱다.',               hint: '향기로운 것을 좋아하는 사람이 떠오른다.' },
    sweets:    { name: '달콤한 과자',  price: 8,  icon: 'assets/gifts/sweets.svg',    desc: '꿀빵집 마르타 아주머니의 꿀과자.',               hint: '달콤한 걸 몰래 좋아하는 사람, 아이들에게 나눠 주고 싶은 사람.' },
    ink:       { name: '마법 잉크',    price: 18, icon: 'assets/gifts/ink.svg',       desc: '밤하늘처럼 반짝이는 잉크. 글씨가 은은히 빛난다.', hint: '글을 쓰거나 마법을 다루는 사람에게 쓸모가 있다.' },
    whetstone: { name: '숫돌',         price: 14, icon: 'assets/gifts/whetstone.svg', desc: '대장장이가 아끼던 고급 숫돌.',                   hint: '날 선 물건을 아끼는 사람에게 어울린다.' },
    trinket:   { name: '반짝이 장신구', price: 20, icon: 'assets/gifts/trinket.svg',   desc: '작은 보석이 박힌 머리핀. 햇빛에 반짝인다.',       hint: '반짝이는 건 누구나 한 번쯤 쳐다본다.' },
    oldbook:   { name: '고서',         price: 24, icon: 'assets/gifts/oldbook.svg',   desc: '장터 헌책방 구석에서 건진 낡은 책.',             hint: '조용히 책장을 넘기는 사람에게.' },
    scarf:     { name: '털목도리',     price: 16, icon: 'assets/gifts/scarf.svg',     desc: '양털로 짠 두툼하고 따뜻한 목도리.',               hint: '찬바람이 싫은 사람에게 반가운 선물.' },
    honeywine: { name: '고급 꿀술',    price: 26, icon: 'assets/gifts/honeywine.svg', desc: '귀한 꿀술 한 병. 향이 진하다.',                   hint: '한 잔 걸치는 걸 즐기는 사람… 혹은 절대 못 마시는 사람. 조심!' }
  },

  // ---------- 히로인별 취향 (아이템 id -> 등급). 4명 모두 8종 전부를 적어야 합니다. ----------
  //  (최애 1 / 좋아함 2 / 보통 3 / 싫어함 2 가 기본 구성)
  prefs: {
    erion: { oldbook: 'fav',  ink: 'like',      sweets: 'like',      flower: 'normal', scarf: 'normal',  trinket: 'normal',    whetstone: 'hate',  honeywine: 'hate' },
    kaela: { whetstone: 'fav', honeywine: 'like', trinket: 'like',    sweets: 'normal', scarf: 'normal',  flower: 'normal',     oldbook: 'hate',   ink: 'hate' },
    miho:  { trinket: 'fav',  honeywine: 'like', sweets: 'like',     scarf: 'normal',  whetstone: 'normal', oldbook: 'normal',  flower: 'hate',    ink: 'hate' },
    lia:   { flower: 'fav',   scarf: 'like',     oldbook: 'like',    sweets: 'normal', ink: 'normal',      trinket: 'normal',   honeywine: 'hate', whetstone: 'hate' }
  },

  // ---------- 반응 대사 4 x 8 = 32개 (히로인 -> 아이템 -> { face, text }) ----------
  react: {
    erion: {
      oldbook:   { face: 'shy',       text: '…이 판본, 스승님이 즐겨 읽으시던 거야. 어떻게… 아니, 우연이겠지. …평생 아낄게. 한 번만 말할 거야. 고마워.' },
      ink:       { face: 'smile',     text: '…좋은 잉크네. 마력이 잘 먹는 걸로 골랐어. 안목, 나쁘지 않아.' },
      sweets:    { face: 'shy',       text: '…나 단 거 안 좋아한다고 했잖아. …하지만 버리기엔 아까우니까. 혼자서 먹어 줄게. 지금은 보지 마.' },
      flower:    { face: 'normal',    text: '…꽃? 숲에 가면 얼마든지 있는데. …그래도 향은 나쁘지 않네. 책상에 둘게.' },
      scarf:     { face: 'normal',    text: '…따뜻하네. 엘프는 추위 안 탄다고 했는데. …그래도 두를게. 쓸모는 있으니까.' },
      trinket:   { face: 'normal',    text: '…장식품은 잘 안 써. 하지만 반짝이는 건 책 표지에 달면 어울리겠네. 딱 그 정도야.' },
      whetstone: { face: 'angry',     text: '…숫돌? 마법사더러 칼이라도 갈라는 거야? 센스가 없어도 정도가 있지.' },
      honeywine: { face: 'angry',     text: '…술이잖아. 엘프한테 술 냄새를 들이대다니. 치워. …마음만은 받아 둘게. 마음만.' }
    },
    kaela: {
      whetstone: { face: 'smile',     text: '이, 이건 명장 도르간의 숫돌이 아니냐!? 이걸로 갈면 대검이 종이처럼 잘린다고 들었다! 주인장, 오늘부터 너는 내 평생의 은인이다! 하하하!' },
      honeywine: { face: 'smile',     text: '오오, 술이다! 영웅은 전투 뒤의 한 잔을 거르지 않는 법! 하하하, 고맙게 마시겠다!' },
      trinket:   { face: 'shy',       text: '으, 으음! 반짝이는 건 기사의 품위에 어울린다! …그, 그렇다고 좋아서 웃는 건 아니다! 갑옷 어깨에 달아 두겠다!' },
      sweets:    { face: 'smile',     text: '단 것인가! 전투 전 당분 보충도 훌륭한 전략이다! …아삭. 맛있군!' },
      scarf:     { face: 'normal',    text: '목도리라… 갑옷 안에 두르면 따뜻하겠군! …겉에서는 안 보이겠지만 괜찮다. 영웅은 보이지 않는 곳에서 노력하는 법이다!' },
      flower:    { face: 'surprised', text: '꽃이라! 승리의 화관이라도 만들어야 하나! …꽃병이 어디 있더라. 빨랫줄에 걸어 두면 안 되나?' },
      oldbook:   { face: 'sad',       text: '으윽, 글자가 빽빽하다…! 보기만 해도 눈이 감긴다. 영웅은 책과 상극이다…! 마, 마음은 고맙지만…!' },
      ink:       { face: 'surprised', text: '이게 뭐냐! 마, 마시는 약인가!? …글씨 쓰는 거라고? 나는 서명도 서툰데… 으으.' }
    },
    miho: {
      trinket:   { face: 'shy',       text: '와아아! 이거 진짜 보석이잖아요?! 감정서 없어도 알아요, 값나가는 거예요! …아, 아니, 값 때문이 아니라! 사장님이 골라 줬다는 게 제일 비싼 거예요. 헤헤.' },
      honeywine: { face: 'smile',     text: '고급 꿀술! 한 병에 얼마인지 알아요, 사장님? …알면서 사 줬다는 거죠? 오늘은 외상 하나 탕감해 드릴게요!' },
      sweets:    { face: 'smile',     text: '과자예요?! 와, 아이들 생각나요. 반은 제가 먹고 반은 편지에 같이 보낼게요. 헤헤, 고마워요!' },
      scarf:     { face: 'normal',    text: '털목도리~ 따뜻하긴 하네요. 겨울 시장에 내다 팔면 짭짤할 텐… 아, 농담이에요! …반쯤은요.' },
      whetstone: { face: 'normal',    text: '숫돌이네요. 단검 손질엔 쓸 만하죠. 가성비 보통! 감사히 받을게요.' },
      oldbook:   { face: 'surprised', text: '옛날 책이라… 이런 건 수집가들이 좋아하죠. 가격 한번 알아보고 올게요! …읽을 거라고는 안 했어요!' },
      flower:    { face: 'sad',       text: '꽃이요…? 먹을 수도 없고 며칠 지나면 시들잖아요. 돈 시드는 소리가 들려요…' },
      ink:       { face: 'angry',     text: '잉크는 팔 데도 쓸 데도 없잖아요! 사장님, 이건 쓰레기를 안긴 거나 마찬가지예요! …마음은 알겠지만요.' }
    },
    lia: {
      flower:    { face: 'shy',       text: '…꽃이야? 어릴 때 네가 들꽃 꺾어 와서 내 머리에 꽂아 줬던 거, 기억나? …기억하고 있었구나. 이 꽃 말려서 평생 간직할 거야.' },
      scarf:     { face: 'smile',     text: '와, 포근해! 신전 새벽 기도는 정말 추웠거든. …네가 걱정해 줬구나. 고마워, 진짜로.' },
      oldbook:   { face: 'smile',     text: '고서! 신전 도서관에도 없는 판본이야. 기도서 옆에 소중히 꽂아 둘게. 고마워!' },
      sweets:    { face: 'smile',     text: '과자? 고마워! 같이 먹자. …아, 네가 먼저 한 입 먹고 나서야!' },
      ink:       { face: 'normal',    text: '잉크네. 기도문 필사할 때 쓸게. 고마워. …다른 사람한테도 이런 걸 줬어? 아, 아니, 아무것도 아니야!' },
      trinket:   { face: 'normal',    text: '예쁘다…! 근데 이거, 다른 사람한테도 사 줬어? …아니, 그냥 궁금해서! 고마워, 소중히 할게.' },
      honeywine: { face: 'surprised', text: '이, 이건 술이잖아! 수습 성직자는 술 못 마신다고 몇 번을… 으으, 네가 일부러 그런 건 아니지?' },
      whetstone: { face: 'sad',       text: '숫돌…? 나는 칼 쓸 일이 없는데. 혹시 누가 갈라고 시킨 거야? …왠지 서운해.' }
    }
  }
};

// 시작 변수: 보관함 / 하루 한 번 한도 / 알아낸 취향 / 마지막으로 시간을 보낸 히로인
//  gift.inv.<선물id> = 개수, gift.given.<히로인id> = 마지막으로 선물한 일차, gift.known.<히로인id>.<선물id> = 알아낸 등급
//  gift.last = 오늘 낮에 함께 보낸 히로인, gift.met = 오늘 만난 히로인들(낮), gift.metDay = 그 일차
STORY.init.gift = { inv: {}, given: {}, known: {}, last: '', met: [], metDay: 0, bought: 0, gave: 0 };
