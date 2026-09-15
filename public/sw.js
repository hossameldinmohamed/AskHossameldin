// Minimal service worker: it exists only to satisfy PWA installability
// criteria (browsers look for a registered service worker with a fetch
// handler before offering the "Install app" prompt). It deliberately does
// not cache anything - this app's content is dynamic and DB-backed, so a
// cached response could show stale or wrong questions/answers.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
