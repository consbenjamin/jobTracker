const CACHE_NAME = "job-tracker-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((r) => r ?? new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } }))
      )
    );
    return;
  }
  event.respondWith(
    fetch(event.request).then((response) => {
      const clone = response.clone();
      if (response.status === 200 && url.origin === self.location.origin) {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request).then((r) => r ?? caches.match("/")))
  );
});
