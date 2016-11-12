self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("v1").then(function(cache) {
      cache.addAll([
        "/index.html",
        "/css/main.css",
        "/js/all.js"
      ])
    })
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
