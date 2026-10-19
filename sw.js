const CACHE='batalha-v21-demo-20261018-1';
const FILES=['./','./index.html','./app.js','./styles.css','./data/catalog.js','./assets/arsenal.svg','./assets/bestiario.svg','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/logo-aprovado.webp','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('batalha-v21-demo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const clone=res.clone();caches.open(CACHE).then(cache=>cache.put(req,clone))}return res})))})
