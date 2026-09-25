const CACHE_NAME = "todo-app-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json"
];

/* =====================================================
   INSTALL
   ===================================================== */

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  // Activate the new service worker immediately
  self.skipWaiting();

});


/* =====================================================
   ACTIVATE
   ===================================================== */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))

      );

    }).then(() => {

      // Take control of all open pages immediately
      return self.clients.claim();

    })

  );

});


/* =====================================================
   FETCH
   ===================================================== */

self.addEventListener("fetch", event => {

  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    fetch(event.request)
      .then(response => {

        // Save the newest successful response
        const responseClone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;

      })
      .catch(() => {

        // If offline, use the cached version
        return caches.match(event.request);

      })

  );

});
