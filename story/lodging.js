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

  // ---------- 손님 22팀 (일반 22 + 사절단 3) ----------
  //  w: (선택) 이 주차들에만 나온다. 예) w: [3, 4]
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
    // ---- 2단계 추가 손님 (w: 나올 수 있는 주차) ----
    { id: 'tinker',    name: '땜장이 보리스', kind: '떠돌이 땜장이', glyph: '땜', color: '#e0a878', req: 'cheap',  bonus: 4, cap: 6,
      say: '냄비 몇 개만 고쳐 주고 하룻밤 자면 되오. 싼 방이면 족하오.', ok: '아침에 국자 손잡이 하나 공짜로 고쳐 놨소!',         meh: '비싼 방은 쇠 냄새가 안 나서 잠이 안 오더군.' },
    { id: 'dancer',    name: '유랑 무희 루나', kind: '유랑 무희',    glyph: '무', color: '#ff8fb8', req: 'window', bonus: 8, w: [1, 2, 3],
      say: '달빛 아래서 연습해야 춤이 늘어요. 창가 방 있나요?',      ok: '달빛이 딱 좋았어요! 광장에서 한 곡 보여 드릴게요.', meh: '창이 작아서 팔을 쭉 못 폈지 뭐예요.' },
    { id: 'fisher',    name: '호수 낚시꾼 가르', kind: '낚시꾼',     glyph: '낚', color: '#7fc4e8', req: 'quiet',  bonus: 6, w: [1, 2, 3],
      say: '새벽 입질에 집중하려면 조용해야 하오. 조용한 방이오.',    ok: '새벽 잉어가 물었소! 오늘 생선은 내가 쏘겠소.',      meh: '옆방 소리 때문에 입질을 놓쳤소…' },
    { id: 'saltgirl',  name: '소금 상인 딸 오리', kind: '소금 상인', glyph: '염', color: '#e8e0f0', req: 'soft',   bonus: 7, w: [2, 3, 4],
      say: '아버지 대신 짐 싣고 왔어요. 푹신한 침대에서 자고 싶어요!', ok: '소금 포대 베개보다 백 배 좋았어요! 소금 한 봉지 선물!', meh: '침대가 딱딱해서 소금 포대가 그립네요…' },
    { id: 'acolyte',   name: '신전 수련 사제 마르코', kind: '신전 사제', glyph: '사', color: '#c8d8ff', req: 'quiet', bonus: 7, w: [2, 3, 4],
      say: '리아 수련생을 찾아왔습니다. 기도할 수 있게 조용한 방을요.', ok: '평안한 밤이었습니다. 리아 수련생의 소식도 잘 전하겠습니다.', meh: '소란했지만… 이것도 수련이겠지요.' },
    { id: 'courier',   name: '급행 배달부 핀',  kind: '우편 배달부', glyph: '편', color: '#ffd27f', req: 'any',    bonus: 3, w: [2, 3, 4],
      say: '새벽 첫 닭이 울면 바로 떠나야 해요! 아무 방이나요!',      ok: '번개처럼 잤어요! 편지는 내일 아침 도착해요!',        meh: '번개처럼 잤어요! 편지는 내일 아침 도착해요!' },
    { id: 'mercs',     name: '용병 삼형제',    kind: '용병단',       glyph: '용', color: '#d8a0a0', req: 'wide',   bonus: 9, w: [3, 4],
      say: '셋이 한 방을 쓰기로 했소. 넓은 방이 있다면 좋겠군.',       ok: '발 뻗고 잔 게 몇 달 만이오! 마을 경비는 맡겨 두시오.', meh: '좁아서 형제끼리 발로 차며 잤소…' },
    { id: 'refugee',   name: '산 너머 피난 가족', kind: '피난 가족',  glyph: '가', color: '#b8c0c8', req: 'cheap',  bonus: 3, cap: 6, w: [4],
      say: '산 너머가 소란스러워서 내려왔어요. 가진 게 많지 않은데… 싼 방이면.', ok: '따뜻한 곳에서 아이들이 푹 잤어요. 정말 고맙습니다.',   meh: '방값이 부담이었지만… 아이들이 잘 자서 다행이에요.' },
    { id: 'mapmaker',  name: '지도 제작자 아델', kind: '지도 제작자', glyph: '도', color: '#c8e0a0', req: 'window', bonus: 8, w: [2, 3, 4],
      say: '이 마을 근처 지형을 그려야 해요. 창가 방이면 멀리까지 보이겠죠?', ok: '언덕 너머까지 한눈에 그렸어요! 이 여관도 지도에 넣어 둘게요.', meh: '창이 작아서 반쪽만 그렸어요…' },
    { id: 'cookwander', name: '떠돌이 요리사 오트', kind: '요리사',   glyph: '요', color: '#f0c890', req: 'soft',   bonus: 6, w: [1, 2, 3, 4],
      say: '하루 종일 서서 일해서 말이오. 푹신한 침대에서 자 보고 싶소.', ok: '덕분에 푹 잤소! 아침 주방 구경 좀 해도 되겠소?',      meh: '침대가 딱딱했지만, 이 집 수프 향이 위로가 됐소.' },
    // 19일차 사절단 일행 (only:true = 평소 무작위 손님에는 안 나옴, special.19 로 그날 고정 배정). 특실 수요가 높다.
    { id: 'env_chief',  only: true, name: '사절단장 이졸데', kind: '왕립 학술원',  glyph: '단', color: '#b3a8e8', req: 'wide',   bonus: 12,
      say: '문서를 펼칠 넓은 방이 필요합니다. 특실이 있다면 그쪽으로.',    ok: '충분했습니다. 보고서에 이 여관을 좋게 적겠습니다.', meh: '좁았지만 불평은 하지 않겠습니다. 기록은 하겠지만요.' },
    { id: 'env_scribe', only: true, name: '사절단 서기관',   kind: '왕립 학술원',  glyph: '서', color: '#a9b8e8', req: 'quiet',  bonus: 9,
      say: '밤새 기록을 정리해야 합니다. 조용한 방이면 좋겠습니다.',       ok: '정리가 잘 됐습니다. 감사합니다.',                   meh: '옆방 소리에 먹이 번졌습니다…' },
    { id: 'env_guard',  only: true, name: '호위 기사 하이덴', kind: '왕국 기사단',  glyph: '기', color: '#a8c0e0', req: 'window', bonus: 9,
      say: '경계를 서기 좋도록 마당이 보이는 창가 방을 부탁하오.',          ok: '창밖이 잘 보여 마음이 놓였소.',                     meh: '창이 작아 경계가 불편했소.' }
  ],
  // 일차별 고정 숙박 손님 (guests 의 id 목록). 해당 일차에는 무작위 대신 이 손님들이 온다.
  special: { 19: ['env_chief', 'env_scribe', 'env_guard'] },

  // ---------- 밤 사건 설정 (장면은 story/night-events.js 의 nev_<id> 씬) ----------
  //  chance: 사건이 일어날 확률 (숙박 접수가 끝난 뒤 하루 한 번 굴림)   range: 일어날 수 있는 일차 범위 [처음, 끝]   gap: 직전 밤 사건과 최소 이 일수 이상 떨어져야 함
  //  events.<id>: { title, weight(상대 확률), if(조건식, 선택) }
  nightEvents: {
    chance: 0.2,
    range: [1, 27],
    gap: 2,
    events: {
      thief:     { title: '한밤의 도둑',      weight: 1 },
      nightmare: { title: '악몽 꾸는 아이',   weight: 1 },
      cat:       { title: '몰래 들어온 고양이', weight: 1 },
      cloak:     { title: '수상한 손님의 정체', weight: 3, if: 'lodge.hosted.cloak' },
      drunk:     { title: '술 취한 손님',     weight: 1 },
      rain_guest: { title: '비 오는 밤의 나그네', weight: 1 },
      snorer:    { title: '코 고는 손님',     weight: 1 },
      fox_fire:  { title: '마당의 여우불',     weight: 1, if: 'aff.miho>=' + HEART(1) },
      midnight_snack: { title: '한밤의 주방',  weight: 1, if: 'aff.erion>=' + HEART(1) },
      night_watch: { title: '카엘라의 야간 순찰', weight: 1, if: 'aff.kaela>=' + HEART(1) },
      lullaby:   { title: '복도의 자장가',     weight: 1, if: 'aff.lia>=' + HEART(1) },
      tremor:    { title: '흔들리는 밤',       weight: 1, if: 'cal.week>=2' },
      scribe_night: { title: '밤새 필사하는 서기', weight: 1, if: 'cal.week>=3' },
      firefly:   { title: '반딧불이의 마당',   weight: 1, if: 'cal.week<=2' },
      cold_night: { title: '꺼져 가는 불씨',   weight: 1, if: 'cal.week>=3' },
      calm_before: { title: '폭풍 전의 고요',  weight: 1, if: 'cal.week>=4' },
      stars:     { title: '별똥별의 밤',      weight: 1, if: 'aff.erion>=' + HEART(1) + ' || aff.kaela>=' + HEART(1) + ' || aff.miho>=' + HEART(1) + ' || aff.lia>=' + HEART(1) }
    }
  }
};

// 시작 변수
//  lodge.upg.<방 업그레이드 id> = 구입 여부,  lodge.hosted.<손님 id> = 지금까지 재워 준 손님(밤 사건 조건에 쓸 수 있음),
//  lodge.report = 다음 날 아침 카드에 나올 정산 문구,  lodge.log = 하룻밤 기록 [{day, guests, gold, sat}]
STORY.init.lodge = { upg: {}, hosted: {}, seen: [], report: [], log: [], gold: 0, nights: 0, note: '' };
STORY.init.nev = { used: [], today: '', ret: '' };
