const CACHE = 'batalha-tribos-v1-5-0';
const CORE = ['./','./index.html','./styles.css','./game.js','./social.js','./config.js','./privacidade.html','./manifest.webmanifest','./icon.svg','./favicon.png','./icon-192.png','./icon-512.png','./logo-oficial.webp','./arte-munduruku.webp','./arte-muirapinima.webp','./exploration.js','./expedition.css','./guardians.js','./guardians.css','./trails.js','./trails.css','./assets/avatar-realista-munduruku.webp','./assets/avatar-realista-muirapinima.webp','./assets/universo-munduruku.webp','./assets/aldeia-muirapinima.webp','./assets/lança.webp','./assets/arco.webp','./assets/flechas.webp','./assets/escudo.webp','./assets/tocha.webp','./assets/machado.webp','./assets/corda.webp','./assets/tambor.webp','./assets/maraca.webp','./assets/bolsa.webp'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('batalha-tribos-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(c => c.put(event.request, copy)); }
    return response;
  })));
});
