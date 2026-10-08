/* Service worker único da Central de Documentos.
   Ao publicar uma nova versão, mude o número em VERSION para renovar o cache nos aparelhos. */
const VERSION = "v1";
const CACHE = "central-" + VERSION;
const RUNTIME = "central-runtime"; // bibliotecas de OCR (CDN) da Justificativa de Ponto, guardadas na 1ª leitura
const PRECACHE = [
  "./",
  "./apps/certidao/favicon.ico",
  "./apps/certidao/favicon.svg",
  "./apps/certidao/index.html",
  "./apps/guia-de-remessa/favicon.ico",
  "./apps/guia-de-remessa/favicon.svg",
  "./apps/guia-de-remessa/index.html",
  "./apps/justificativa-de-ponto/icons/favicon-32.png",
  "./apps/justificativa-de-ponto/icons/favicon.ico",
  "./apps/justificativa-de-ponto/index.html",
  "./apps/rma/favicon.ico",
  "./apps/rma/favicon.svg",
  "./apps/rma/index.html",
  "./favicon.ico",
  "./favicon.svg",
  "./icons/app-certidao.png",
  "./icons/app-guia-de-remessa.png",
  "./icons/app-justificativa-de-ponto.png",
  "./icons/app-rma.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/icon-144.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-48.png",
  "./icons/icon-512.png",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest"
];
const CDN_HOSTS = ["cdn.jsdelivr.net", "tessdata.projectnaptha.com", "unpkg.com"];
const ROOT = new URL("./index.html", self.registration.scope).href;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("central-") && k !== CACHE && k !== RUNTIME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Páginas: rede primeiro (pega atualização); se demorar mais de 4 s ou estiver offline, usa o cache
function paginas(req) {
  const u = new URL(req.url);
  u.search = ""; u.hash = "";
  if (u.pathname.endsWith("/")) u.pathname += "index.html";
  const key = u.href;
  return new Promise(resolve => {
    let feito = false;
    const fim = r => { if (!feito) { feito = true; resolve(r); } };
    const t = setTimeout(async () => { const hit = await caches.match(key); if (hit) fim(hit); }, 4000);
    fetch(req).then(res => {
      clearTimeout(t);
      if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(key, c)); }
      fim(res);
    }).catch(async () => {
      clearTimeout(t);
      fim((await caches.match(key)) || (await caches.match(ROOT)) || new Response("Sem conexão", { status: 503, statusText: "Offline" }));
    });
  });
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (CDN_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.open(RUNTIME).then(async cache => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") { e.respondWith(paginas(req)); return; }

  // Demais arquivos do próprio site: cache primeiro e atualiza em segundo plano
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const net = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      return (await net) || new Response("Sem conexão", { status: 503, statusText: "Offline" });
    })
  );
});
