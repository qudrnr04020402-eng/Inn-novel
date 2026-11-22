// ============================================================
//  숙박 시스템 데이터 — 방 / 손님 / 요청 / 방 업그레이드 / 밤 사건 설정
//  코드를 몰라도 글자와 숫자만 바꾸면 됩니다. (README "숙박 시스템" 참고)
//  - 1~6일차 밤(영업 결산 뒤, 업그레이드 전)에 "숙박 접수" 화면이 열립니다.
//    그날 묵으려는 손님 2~3팀이 나오고, 손님을 누른 뒤 방을 눌러 배정합니다. 요청에 맞는 방이면 숙박비 + 만족 보너스,
//    안 맞으면 기본 숙박비만, 거절하거나 배정하지 않으면 수입 없음.
//  - 손님 구성과 밤 사건은 "세이브에 저장된 시드 + 일차"로 정해지므로 저장/불러오기로 다시 뽑을 수 없습니다. (js/inn-core.js)
//  - 밤 사건의 장면은 story/night-events.js (씬 nev_<id>) 에 있습니다.
// ============================================================
window.LODGING = {

  // ---------- 방 3개 (open:true 는 처음부터 열려 있음, unlock 은 방 업그레이드 id) ----------
  //  price: 기본 숙박비,  tags: 이 방이 만족시키는 요청 (아래 requests 의 키)
  rooms: {
    floor1: { name: '1층 싼 방',  short: '1층',   price: 6,  tags: ['cheap'],                  open: true,  desc: '마당 쪽 작은 방. 값이 싸다.' },
    floor2: { name: '2층 일반실', short: '2층',   price: 11, tags: [],                         open: true,  desc: '평범하지만 깔끔한 방.' },
    attic:  { name: '다락 특실',  short: '다락',  price: 22, tags: ['quiet', 'window', 'wide'], open: false, unlock: 'attic', desc: '지붕 밑의 넓고 조용한 방. 창이 크다.' }
  },

  // ---------- 요청 종류 (손님 요청의 키 -> 화면에 보이는 이름) ----------
  //  cheap  = 1층 싼 방이 맞음            quiet = 방음 업그레이드를 한 방 / 다락 특실
  //  window = 다락 특실 / 창 넓히기를 한 2층   soft  = 고급 침구를 들인 방
  //  wide   = 다락 특실                   any   = 아무 방이나 맞음
  requests: {
    cheap:  { label: '싼 방' },
    quiet:  { label: '조용한 방' },
    window: { label: '창가 방' },
    soft:   { label: '푹신한 침대' },
    wide:   { label: '넓은 방' },
    any:    { label: '아무 방이나' }
  },

  // ---------- 방 업그레이드 (밤의 "여관 손보기" 화면 아래쪽에 나옵니다) ----------
  //  openRoom: 이 방을 연다    tags: { 방id 또는 all: [요청 키] } 방에 붙는 속성    payBonus: 열린 방 하나당 숙박비 +G
  //  needRank: 여관 등급이 이 이상이어야 살 수 있음 (story/inn-rank.js)
  upgrades: [
    { id: 'attic',      name: '다락 특실 개조', price: 50, needRank: 4, openRoom: 'attic', desc: '다락을 정리해 특실로 연다. 넓고 조용하고 창이 큰 방. (여관 ★4 이상)' },
    { id: 'bedding',    name: '고급 침구',      price: 30, tags: { all: ['soft'] }, payBonus: 3, desc: '모든 방에 푹신한 침구를 깐다. 숙박비 +3G, "푹신한 침대" 요청이 만족된다.' },
    { id: 'soundproof', name: '방음 벽',        price: 35, tags: { all: ['quiet'] }, desc: '벽에 두꺼운 천을 댄다. 모든 방이 "조용한 방"이 된다.' },
    { id: 'windowbox',  name: '2층 큰 창',      price: 25, tags: { floor2: ['window'] }, desc: '2층 방에 큰 창을 낸다. 2층이 "창가 방"이 된다.' }
  ],

  // ---------- 하룻밤 설정 ----------
  settings: {
    threeChance: 0.45,   // 손님이 3팀일 확률 (아니면 2팀)
    satPoints: 1         // 요청을 만족시킨 팀 하나당 여관 등급 점수 (story/inn-rank.js 의 satWeight 와 곱해짐)
  },

  // ---------- 손님 12팀 ----------
  //  kind: 한 줄 소개, req: 요청 키, bonus: 만족 보너스 G, cap: (선택) 이 금액까지만 낼 수 있음(싼 방 손님이 비싼 방에 들어가도 더 안 냄)
  //  say: 접수 때 하는 한 줄 요청,  ok: 만족했을 때 아침 한마디,  meh: 요청이 안 맞았을 때 아침 한마디
  guests: [
    { id: 'redshield', name: '붉은 방패단',   kind: '모험가 파티',  glyph: '방', color: '#e5796a', req: 'cheap',  bonus: 4, cap: 6,
      say: '동전은 없어도 의리는 있소! 싼 방이면 충분하오.',        ok: '덕분에 푹 잤소! 다음엔 외상 안 하겠소!',          meh: '…방값이 좀 세더군. 의리로 참겠소.' },
    { id: 'pilgrim',   name: '순례자 세라',   kind: '순례자',       glyph: '순', color: '#9fb4ff', req: 'quiet',  bonus: 6,
      say: '새벽 기도를 드려야 해서… 조용한 방을 부탁드려요.',        ok: '밤새 마음이 고요했어요. 신의 가호가 있기를.',       meh: '벽 너머 소리가 조금 들렸지만… 괜찮아요.' },
    { id: 'clothier',  name: '포목상 드럼',   kind: '포목 상인',    glyph: '포', color: '#ffb08a', req: 'soft',   bonus: 6,
      say: '짐을 지고 온종일 걸었더니 허리가… 푹신한 침대 있소?',     ok: '구름 위에서 잔 것 같소! 소문 내 주겠소.',          meh: '침대가 딱딱해서 허리가 아직도 뻐근하오.' },
    { id: 'cloak',     name: '망토 쓴 나그네', kind: '수상한 손님',  glyph: '?', color: '#b07ae8', req: 'window', bonus: 10,
      say: '…달이 보이는 방이면 좋겠군. 이유는 묻지 마시오.',        ok: '…좋은 밤이었소. 이 여관, 기억해 두지.',            meh: '…달이 잘 안 보이더군. 뭐, 상관없소.' },
    { id: 'bard',      name: '떠돌이 악사 피코', kind: '악사',      glyph: '악', color: '#7fd0a8', req: 'cheap',  bonus: 4, cap: 6,
      say: '노래 한 곡 값으로 싼 방 부탁해요! 아침에 한 곡 더 드릴게요!', ok: '아침 노래 한 곡 선물! 은빛 여우관 만세!',          meh: '비싼 방은 어색해서 노래가 안 나오네요…' },
    { id: 'scholar',   name: '늙은 학자 베른', kind: '학자',        glyph: '학', color: '#d8d0b0', req: 'window', bonus: 7,
      say: '새벽 햇빛으로 책을 읽고 싶구려. 창가 방이면 좋겠소.',      ok: '아침 햇살에 읽은 책이 이리 달 줄이야. 고맙소.',      meh: '창이 작아서 책이 잘 안 보였소이다.' },
    { id: 'couple',    name: '여행 중인 부부', kind: '부부 여행객',  glyph: '부', color: '#ff9ec7', req: 'wide',   bonus: 9,
      say: '짐이 많아서요. 둘이 쓸 넓은 방이 있을까요?',              ok: '넓고 포근해서 여행의 피로가 싹 풀렸어요.',          meh: '방이 좀 비좁았지만 둘이라 괜찮았어요.' },
    { id: 'peddler',   name: '보따리 행상',   kind: '행상인',       glyph: '행', color: '#d6a07a', req: 'any',    bonus: 2,
      say: '어디든 괜찮아요. 눕기만 하면 되니까요!',                 ok: '하하, 잘 잤습니다! 또 들르죠!',                    meh: '하하, 잘 잤습니다! 또 들르죠!' },
    { id: 'hunter',    name: '사냥꾼 로간',   kind: '사냥꾼',       glyph: '사', color: '#9fd8a8', req: 'cheap',  bonus: 4, cap: 6,
      say: '새벽에 나갈 거라 잠만 자면 되오. 싼 방으로 주시오.',       ok: '새벽에 조용히 나왔소. 값 대비 훌륭했소.',          meh: '비싼 방값이 아깝긴 하오만, 푹 잤소.' },
    { id: 'herbalist', name: '약초꾼 미라',   kind: '약초 채집가',  glyph: '약', color: '#6fd6c8', req: 'window', bonus: 7,
      say: '말린 약초를 창가에 널어야 해요. 창가 방 되나요?',         ok: '약초가 잘 말랐어요! 덕분에 좋은 약이 되겠네요.',     meh: '창가가 아니라 약초가 눅눅해졌지 뭐예요…' },
    { id: 'oldknight', name: '은퇴 기사 하르트', kind: '은퇴 기사',  glyph: '기', color: '#cfd8e6', req: 'soft',   bonus: 6,
      say: '허리가 옛날 같지 않아서 말이오. 푹신한 침대로 부탁하오.',   ok: '허허, 오랜만에 기사 시절 막사보다 편했소.',          meh: '…바닥에서 자는 것과 별 차이 없더군. 허허.' },
    { id: 'doctor',    name: '순회 의사 엘름', kind: '순회 의사',   glyph: '의', color: '#a8c0e8', req: 'quiet',  bonus: 6,
      say: '밤에 환자 생각을 정리해야 해서요. 조용한 방이 필요합니다.', ok: '덕분에 푹 쉬었습니다. 건강하세요!',                meh: '옆방 소리가 좀… 그래도 감사합니다.' },
    // 5일차 사절단 일행 (only:true = 평소 무작위 손님에는 안 나옴, special.5 로 그날 고정 배정). 특실 수요가 높다.
    { id: 'env_chief',  only: true, name: '사절단장 이졸데', kind: '왕립 학술원',  glyph: '단', color: '#b3a8e8', req: 'wide',   bonus: 12,
      say: '문서를 펼칠 넓은 방이 필요합니다. 특실이 있다면 그쪽으로.',    ok: '충분했습니다. 보고서에 이 여관을 좋게 적겠습니다.', meh: '좁았지만 불평은 하지 않겠습니다. 기록은 하겠지만요.' },
    { id: 'env_scribe', only: true, name: '사절단 서기관',   kind: '왕립 학술원',  glyph: '서', color: '#a9b8e8', req: 'quiet',  bonus: 9,
      say: '밤새 기록을 정리해야 합니다. 조용한 방이면 좋겠습니다.',       ok: '정리가 잘 됐습니다. 감사합니다.',                   meh: '옆방 소리에 먹이 번졌습니다…' },
    { id: 'env_guard',  only: true, name: '호위 기사 하이덴', kind: '왕국 기사단',  glyph: '기', color: '#a8c0e0', req: 'window', bonus: 9,
      say: '경계를 서기 좋도록 마당이 보이는 창가 방을 부탁하오.',          ok: '창밖이 잘 보여 마음이 놓였소.',                     meh: '창이 작아 경계가 불편했소.' }
  ],
  // 일차별 고정 숙박 손님 (guests 의 id 목록). 해당 일차에는 무작위 대신 이 손님들이 온다.
  special: { 5: ['env_chief', 'env_scribe', 'env_guard'] },

  // ---------- 밤 사건 설정 (장면은 story/night-events.js 의 nev_<id> 씬) ----------
  //  chance: 사건이 일어날 확률 (숙박 접수가 끝난 뒤 하루 한 번 굴림)   days: 일어날 수 있는 일차
  //  events.<id>: { title, weight(상대 확률), if(조건식, 선택) }
  nightEvents: {
    chance: 0.25,
    days: [1, 2, 3, 4, 6],
    events: {
      thief:     { title: '한밤의 도둑',      weight: 1 },
      nightmare: { title: '악몽 꾸는 아이',   weight: 1 },
      cat:       { title: '몰래 들어온 고양이', weight: 1 },
      cloak:     { title: '수상한 손님의 정체', weight: 3, if: 'lodge.hosted.cloak' },
      drunk:     { title: '술 취한 손님',     weight: 1 },
      stars:     { title: '별똥별의 밤',      weight: 1, if: 'aff.erion>=' + HEART(1) + ' || aff.kaela>=' + HEART(1) + ' || aff.miho>=' + HEART(1) + ' || aff.lia>=' + HEART(1) }
    }
  }
};

// 시작 변수
//  lodge.upg.<방 업그레이드 id> = 구입 여부,  lodge.hosted.<손님 id> = 지금까지 재워 준 손님(밤 사건 조건에 쓸 수 있음),
//  lodge.report = 다음 날 아침 카드에 나올 정산 문구,  lodge.log = 하룻밤 기록 [{day, guests, gold, sat}]
STORY.init.lodge = { upg: {}, hosted: {}, seen: [], report: [], log: [], gold: 0, nights: 0, note: '' };
STORY.init.nev = { used: [], today: '', ret: '' };
