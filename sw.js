// 서비스 워커: 오프라인 캐시 (네트워크 우선, 실패하면 캐시)
// 파일을 추가/수정한 뒤 배포할 때는 아래 VERSION 숫자를 올리면 예전 캐시가 정리됩니다.
const VERSION = 'v2-romance'; // 5일 연애 시뮬레이션 버전 (배포 때마다 올려서 폰의 옛 캐시를 정리)
const CACHE = 'inn-vn-' + VERSION;
// 미리 캐시할 파일 (tools/check-story.js 가 이 목록과 실제 파일을 비교해 줍니다)
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/style.css', 'js/engine.js',
  'story/characters.js', 'story/backgrounds.js', 'story/common.js',
  'story/day1.js', 'story/day2.js', 'story/day3.js', 'story/day4.js', 'story/day5.js', 'story/endings.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'assets/bg/cave_front.svg', 'assets/bg/cave_inside.svg', 'assets/bg/inn_dawn.svg', 'assets/bg/inn_day.svg', 'assets/bg/inn_evening.svg', 'assets/bg/inn_front.svg', 'assets/bg/inn_night.svg', 'assets/bg/roof_night.svg', 'assets/bg/square_day.svg', 'assets/bg/square_festival.svg',
  'assets/char/erion/normal.svg', 'assets/char/erion/smile.svg', 'assets/char/erion/angry.svg', 'assets/char/erion/shy.svg', 'assets/char/erion/surprised.svg', 'assets/char/erion/sad.svg',
  'assets/char/kaela/normal.svg', 'assets/char/kaela/smile.svg', 'assets/char/kaela/angry.svg', 'assets/char/kaela/shy.svg', 'assets/char/kaela/surprised.svg', 'assets/char/kaela/sad.svg',
  'assets/char/miho/normal.svg', 'assets/char/miho/smile.svg', 'assets/char/miho/angry.svg', 'assets/char/miho/shy.svg', 'assets/char/miho/surprised.svg', 'assets/char/miho/sad.svg',
  'assets/char/lia/normal.svg', 'assets/char/lia/smile.svg', 'assets/char/lia/angry.svg', 'assets/char/lia/shy.svg', 'assets/char/lia/surprised.svg', 'assets/char/lia/sad.svg'
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
