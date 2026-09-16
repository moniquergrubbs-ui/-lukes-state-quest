/* Luke's State Quest 5.0. App resources and photos only; no progress leaves the browser. */
const VERSION='5.0.0';
const SCOPE=new URL(self.registration.scope).pathname;
const PREFIX='lukes-state-quest-'+SCOPE.replace(/[^a-z0-9]/gi,'_')+'-';
const SHELL=PREFIX+VERSION, MEDIA=PREFIX+'media';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(SHELL).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith(PREFIX)&&k!==SHELL&&k!==MEDIA)||/^statequest-v\d+$/.test(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function isMedia(url){return /(^|\.)(wikimedia\.org|wikipedia\.org)$/.test(url.hostname)||url.hostname==='images.unsplash.com';}
async function trim(cache){const keys=await cache.keys();await Promise.all(keys.slice(0,Math.max(0,keys.length-200)).map(k=>cache.delete(k)));}
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);
 if(url.origin===self.location.origin&&url.pathname.startsWith(SCOPE)){
  event.respondWith((async()=>{const cache=await caches.open(SHELL);try{const res=await fetch(req);if(res.ok){event.waitUntil(cache.put(req,res.clone()));return res;}const saved=await cache.match(req);return saved||res;}catch{const saved=await cache.match(req);return saved||(req.mode==='navigate'?await cache.match('./index.html'):Response.error());}})());
 }else if(isMedia(url)){
  event.respondWith((async()=>{const cache=await caches.open(MEDIA),saved=await cache.match(req);if(saved)return saved;const res=await fetch(req);if(res.ok||res.type==='opaque'){event.waitUntil(cache.put(req,res.clone()).then(()=>trim(cache)));}return res;})());
 }
});
