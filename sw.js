// 코알라 구구단 서비스워커: 앱 파일은 인터넷 우선(없으면 저장본), 음성·글꼴은 저장본 우선
const SHELL = 'koala-shell-v7';
const MEDIA = 'unicorn-media-v1';
const FILES = ['./', 'index.html', 'app.css', 'app.js', 'scenery.js', 'calc.js', 'manifest.json', 'fonts/fredoka.css', 'fonts/pretendard.css',
  'fonts/fredoka-latin-500-normal.woff2', 'fonts/fredoka-latin-600-normal.woff2', 'fonts/fredoka-latin-700-normal.woff2',
  'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'icon-180.png', 'favicon-32.png'];

self.addEventListener('install', e => {
  // 브라우저 HTTP 캐시(깃허브 페이지 10분)를 건너뛰고 서버에서 새로 받아 저장
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== MEDIA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// 음성 파일 미리 받기 (없는 파일은 건너뜀)
self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'cache-audio') return;
  e.waitUntil(caches.open(MEDIA).then(async c => {
    for (const f of e.data.files) {
      if (await c.match(f)) continue;
      try { const r = await fetch(f); if (r.ok) await c.put(f, r); } catch (err) { /* 다음에 다시 */ }
    }
  }));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isAudio = url.pathname.includes('/audio/') || url.pathname.includes('/fonts/pretendard/');
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;

  if (isAudio || isFont) {
    e.respondWith(caches.open(MEDIA).then(async c => {
      const hit = await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok || r.type === 'opaque') c.put(req, r.clone());
      return r;
    }));
    return;
  }
  // 앱 파일: 인터넷이 되면 항상 서버에서 최신(바뀐 게 없으면 304로 가볍게), 안 되면 저장본
  e.respondWith(caches.open(SHELL).then(async c => {
    const key = req.mode === 'navigate' ? 'index.html' : req;
    try {
      const r = await fetch(req, { cache: 'no-cache' });
      if (r.ok) c.put(key, r.clone());
      return r;
    } catch (err) {
      return (await c.match(key, { ignoreSearch: true })) || Response.error();
    }
  }));
});
