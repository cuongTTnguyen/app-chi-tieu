/* Finance Buddy SW: network-first for app files to prevent stale UI and white flash from old cache. */
const CACHE_NAME = 'finance-buddy-g6-stable-v1';
const APP_SHELL = ['./','./index.html','./tai-khoan.html','./edit.html','./user.html','./admin.html','./app.js','./layout.js','./enhancements.js','./enhancements.css','./style.css','./firebase-config.js','./firebase-sync.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('finance-buddy-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e => {
 const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
 const u=new URL(r.url); const isAppFile=/\.(html|js|css)$/.test(u.pathname)||u.pathname.endsWith('/');
 if(isAppFile){ e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE_NAME).then(c=>c.put(r,cp));}return res;}).catch(()=>caches.match(r).then(c=>c||caches.match('./index.html')))); return; }
 e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{if(res&&res.ok)caches.open(CACHE_NAME).then(cache=>cache.put(r,res.clone()));return res;})));
});
