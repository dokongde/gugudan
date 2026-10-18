// 코알라 구구단 서비스워커: 앱 파일은 최신 우선(백그라운드 갱신), 음성 파일은 캐시 우선
const SHELL = 'koala-shell-v6';
const MEDIA = 'unicorn-media-v1';
const FILES = ['./', 'index.html', 'app.css', 'app.js', 'scenery.js', 'calc.js', 'manifest.json', 'fonts/fredoka.css', 'fonts/pretendard.css',
  'fonts/fredoka-latin-500-normal.woff2', 'fonts/fredoka-latin-600-normal.woff2', 'fonts/fredoka-latin-700-normal.woff2',
  'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'icon-180.png', 'favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
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
  // 앱 파일: 캐시를 바로 주고, 뒤에서 새 버전으로 갱신
  e.respondWith(caches.open(SHELL).then(async c => {
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
