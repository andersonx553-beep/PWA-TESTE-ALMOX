const CACHE='aquaville-pwa-teste-v4';
const ASSETS=['./','./index.html','./manifest.json','./fornecedores.js'];
async function pageResponse(req){let r;try{r=await fetch(req,{cache:'no-store'})}catch(e){r=await caches.match('./index.html')}if(!r)return Response.error();try{const t=await r.clone().text();if(t.includes('fornecedores.js'))return r;return new Response(t.replace('</body>','<script src="./fornecedores.js"></script></body>'),{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8'}})}catch(e){return r}}
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(pageResponse(e.request));return}e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const copy=x.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return x}).catch(()=>caches.match('./index.html'))))});
