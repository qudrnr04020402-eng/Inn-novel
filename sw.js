// 서비스 워커: 오프라인 캐시 (네트워크 우선, 실패하면 캐시)
// 파일을 추가/수정한 뒤 배포할 때는 아래 VERSION 숫자를 올리면 예전 캐시가 정리됩니다.
const VERSION = 'v14-mgmt-meta'; // 2단계 콘텐츠(이벤트 6~10/주간/랜덤 확장) 30일 구성(달력/주차/피로/일상일) 버전 (이전: v10-cart) (배포 때마다 올려서 폰의 옛 캐시를 정리)
const CACHE = 'inn-vn-' + VERSION;
// 미리 캐시할 파일 (tools/check-story.js 가 이 목록과 실제 파일을 비교해 줍니다)
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/style.css', 'css/meta.css', 'js/meta-core.js', 'js/cal-core.js', 'js/tavern-core.js', 'js/mgmt-core.js', 'js/event-core.js', 'js/inn-core.js', 'js/llm-core.js', 'js/sfx.js', 'js/bgm.js', 'js/engine.js',
  'story/characters.js', 'story/backgrounds.js', 'story/cg.js', 'story/audio.js', 'story/common.js', 'story/tavern.js',
  'story/gifts.js', 'story/lodging.js', 'story/inn-rank.js', 'story/management.js', 'story/day1.js', 'story/day2.js', 'story/day3.js', 'story/day4.js', 'story/day5.js', 'story/day6.js', 'story/day7.js', 'story/heroine-events.js', 'story/plain-days.js', 'story/calendar.js', 'story/routine.js', 'story/weekly-events.js', 'story/week-main.js', 'story/tavern-routine.js', 'story/endings.js', 'story/deep-events.js', 'story/night-events.js', 'story/rivalry.js', 'story/random-events.js', 'story/random-events-more.js', 'story/night-events-more.js', 'story/weekly-scenes.js', 'story/hev-erion.js', 'story/hev-kaela.js', 'story/hev-miho.js', 'story/hev-lia.js', 'story/route-core.js', 'story/route-erion.js', 'story/route-kaela.js', 'story/route-miho.js', 'story/route-lia.js', 'story/week2-crisis.js', 'story/ngplus.js', 'story/achievements.js', 'story/llm-persona.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'assets/bg/cave_front.svg', 'assets/bg/cave_inside.svg', 'assets/bg/inn_dawn.svg', 'assets/bg/inn_day.svg', 'assets/bg/inn_evening.svg', 'assets/bg/inn_front.svg', 'assets/bg/inn_night.svg', 'assets/bg/roof_night.svg', 'assets/bg/square_day.svg', 'assets/bg/square_festival.svg',
  'assets/char/erion/normal.webp', 'assets/char/erion/smile.webp', 'assets/char/erion/angry.webp', 'assets/char/erion/shy.webp', 'assets/char/erion/surprised.webp', 'assets/char/erion/sad.webp', 'assets/char/erion/face.webp',
  'assets/char/kaela/normal.webp', 'assets/char/kaela/smile.webp', 'assets/char/kaela/angry.webp', 'assets/char/kaela/shy.webp', 'assets/char/kaela/surprised.webp', 'assets/char/kaela/sad.webp', 'assets/char/kaela/face.webp',
  'assets/char/miho/normal.webp', 'assets/char/miho/smile.webp', 'assets/char/miho/angry.webp', 'assets/char/miho/shy.webp', 'assets/char/miho/surprised.webp', 'assets/char/miho/sad.webp', 'assets/char/miho/face.webp',
  'assets/char/lia/normal.webp', 'assets/char/lia/smile.webp', 'assets/char/lia/angry.webp', 'assets/char/lia/shy.webp', 'assets/char/lia/surprised.webp', 'assets/char/lia/sad.webp', 'assets/char/lia/face.webp',
  'assets/char/baron/normal.svg', 'assets/char/baron/smile.svg', 'assets/char/baron/angry.svg', 'assets/char/baron/shy.svg', 'assets/char/baron/surprised.svg', 'assets/char/baron/sad.svg',
  'assets/char/tobi/normal.svg', 'assets/char/tobi/smile.svg', 'assets/char/tobi/angry.svg', 'assets/char/tobi/shy.svg', 'assets/char/tobi/surprised.svg', 'assets/char/tobi/sad.svg',
  'assets/char/greta/normal.svg', 'assets/char/greta/smile.svg', 'assets/char/greta/angry.svg', 'assets/char/greta/shy.svg', 'assets/char/greta/surprised.svg', 'assets/char/greta/sad.svg',
  'assets/char/marta/normal.svg', 'assets/char/marta/smile.svg', 'assets/char/marta/angry.svg', 'assets/char/marta/shy.svg', 'assets/char/marta/surprised.svg', 'assets/char/marta/sad.svg',
  'assets/char/fin/normal.svg', 'assets/char/fin/smile.svg', 'assets/char/fin/angry.svg', 'assets/char/fin/shy.svg', 'assets/char/fin/surprised.svg', 'assets/char/fin/sad.svg',
  'assets/char/chief/normal.svg', 'assets/char/chief/smile.svg', 'assets/char/chief/angry.svg', 'assets/char/chief/shy.svg', 'assets/char/chief/surprised.svg', 'assets/char/chief/sad.svg',
  'assets/char/rosa/normal.svg', 'assets/char/rosa/smile.svg', 'assets/char/rosa/angry.svg', 'assets/char/rosa/shy.svg', 'assets/char/rosa/surprised.svg', 'assets/char/rosa/sad.svg', 'assets/char/noble/normal.svg', 'assets/char/noble/smile.svg', 'assets/char/noble/angry.svg', 'assets/char/noble/shy.svg', 'assets/char/noble/surprised.svg', 'assets/char/noble/sad.svg',
  'assets/char/envoy/normal.svg', 'assets/char/envoy/smile.svg', 'assets/char/envoy/angry.svg', 'assets/char/envoy/shy.svg', 'assets/char/envoy/surprised.svg', 'assets/char/envoy/sad.svg', 'assets/char/examiner/normal.svg', 'assets/char/examiner/smile.svg', 'assets/char/examiner/angry.svg', 'assets/char/examiner/shy.svg', 'assets/char/examiner/surprised.svg', 'assets/char/examiner/sad.svg',
  'assets/gifts/flower.svg', 'assets/gifts/sweets.svg', 'assets/gifts/ink.svg', 'assets/gifts/whetstone.svg', 'assets/gifts/trinket.svg', 'assets/gifts/oldbook.svg', 'assets/gifts/scarf.svg', 'assets/gifts/honeywine.svg',
  'assets/tavern/ale.svg', 'assets/tavern/bread.svg', 'assets/tavern/herb.svg', 'assets/tavern/mead.svg', 'assets/tavern/meat.svg', 'assets/tavern/milk.svg', 'assets/tavern/moonberry.svg', 'assets/tavern/mushroom.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.indexOf('/llm/') !== -1) return; // 자유 대화(PC 서버 /llm/*)는 캐시하지 않고 네트워크로만
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
  );
});
