// Service worker minimo: so existe pra mostrar uma pagina amigavel quando o
// app abre sem internet (importante no app nativo, que carrega o site ao
// vivo — sem isso, sem conexao vira tela em branco/erro do navegador).
// Nao guarda em cache nada do app em si (JS/CSS/HTML principal), so essa
// pagina de fallback — assim nao interfere na atualizacao normal do app.
const OFFLINE_URL = "/offline.html";
const CACHE_NAME = "casa-app-offline-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
