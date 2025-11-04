// service-worker.js - versão mínima para PWA
self.addEventListener("install", event => {
    // SW instalado, mas não faz cache por enquanto
    console.log("Service Worker instalado.");
    self.skipWaiting(); // ativa imediatamente
});

self.addEventListener("activate", event => {
    console.log("Service Worker ativado.");
    self.clients.claim(); // assume controle das páginas abertas
});

self.addEventListener("fetch", event => {
    // Apenas deixa passar as requisições normalmente, sem cache
    event.respondWith(fetch(event.request));
});
  