const CACHE_NAME = "my-cache-v1";

const urlsToCache = [
  "/setsuen/",
  "/setsuen/index.html",
  "/setsuen/index.css",
  "/setsuen/index.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
