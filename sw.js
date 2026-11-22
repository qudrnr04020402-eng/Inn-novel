// 서비스 워커: 오프라인 캐시 (네트워크 우선, 실패하면 캐시)
// 파일을 추가/수정한 뒤 배포할 때는 아래 VERSION 숫자를 올리면 예전 캐시가 정리됩니다.
const VERSION = 'v3-tavern'; // 저녁 영업(주문 조합) 추가 버전 (배포 때마다 올려서 폰의 옛 캐시를 정리)
const CACHE = 'inn-vn-' + VERSION;
// 미리 캐시할 파일 (tools/check-story.js 가 이 목록과 실제 파일을 비교해 줍니다)
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/style.css', 'js/tavern-core.js', 'js/engine.js',
  'story/characters.js', 'story/backgrounds.js', 'story/common.js', 'story/tavern.js',
  'story/day1.js', 'story/day2.js', 'story/day3.js', 'story/day4.js', 'story/day5.js', 'story/endings.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'assets/bg/cave_front.svg', 'assets/bg/cave_inside.svg', 'assets/bg/inn_dawn.svg', 'assets/bg/inn_day.svg', 'assets/bg/inn_evening.svg', 'assets/bg/inn_front.svg', 'assets/bg/inn_night.svg', 'assets/bg/roof_night.svg', 'assets/bg/square_day.svg', 'assets/bg/square_festival.svg',
  'assets/char/erion/normal.svg', 'assets/char/erion/smile.svg', 'assets/char/erion/angry.svg', 'assets/char/erion/shy.svg', 'assets/char/erion/surprised.svg', 'assets/char/erion/sad.svg',
  'assets/char/kaela/normal.svg', 'assets/char/kaela/smile.svg', 'assets/char/kaela/angry.svg', 'assets/char/kaela/shy.svg', 'assets/char/kaela/surprised.svg', 'assets/char/kaela/sad.svg',
  'assets/char/miho/normal.svg', 'assets/char/miho/smile.svg', 'assets/char/miho/angry.svg', 'assets/char/miho/shy.svg', 'assets/char/miho/surprised.svg', 'assets/char/miho/sad.svg',
  'assets/char/lia/normal.svg', 'assets/char/lia/smile.svg', 'assets/char/lia/angry.svg', 'assets/char/lia/shy.svg', 'assets/char/lia/surprised.svg', 'assets/char/lia/sad.svg',
  'assets/char/baron/normal.svg', 'assets/char/baron/smile.svg', 'assets/char/baron/angry.svg', 'assets/char/baron/shy.svg', 'assets/char/baron/surprised.svg', 'assets/char/baron/sad.svg',
  'assets/char/tobi/normal.svg', 'assets/char/tobi/smile.svg', 'assets/char/tobi/angry.svg', 'assets/char/tobi/shy.svg', 'assets/char/tobi/surprised.svg', 'assets/char/tobi/sad.svg',
  'assets/char/greta/normal.svg', 'assets/char/greta/smile.svg', 'assets/char/greta/angry.svg', 'assets/char/greta/shy.svg', 'assets/char/greta/surprised.svg', 'assets/char/greta/sad.svg',
  'assets/char/marta/normal.svg', 'assets/char/marta/smile.svg', 'assets/char/marta/angry.svg', 'assets/char/marta/shy.svg', 'assets/char/marta/surprised.svg', 'assets/char/marta/sad.svg',
  'assets/char/fin/normal.svg', 'assets/char/fin/smile.svg', 'assets/char/fin/angry.svg', 'assets/char/fin/shy.svg', 'assets/char/fin/surprised.svg', 'assets/char/fin/sad.svg',
  'assets/char/chief/normal.svg', 'assets/char/chief/smile.svg', 'assets/char/chief/angry.svg', 'assets/char/chief/shy.svg', 'assets/char/chief/surprised.svg', 'assets/char/chief/sad.svg',
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
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
  );
});
