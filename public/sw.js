// Service Worker for ResuRabbit
// Handles caching of PDF files and provides offline support

const CACHE_NAME = "resurabit-cache-v1";
const ASSETS_TO_CACHE = ["/", "/index.html", "/styles/globals.css"];

// Install event - cache core assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching core assets");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Clearing old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener("fetch", (event) => {
  // Special handling for PDF files
  if (
    event.request.url.includes("/api/view-pdf") ||
    event.request.url.endsWith(".pdf")
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache if fetch failed or not ok
            if (!networkResponse || !networkResponse.ok) {
              return networkResponse;
            }

            // Cache the response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch(() => {
            // If fetch fails completely, return a fallback
            return new Response("PDF viewing is not available offline", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            });
          });
      })
    );
  } else {
    // Default fetch strategy for other resources - Network first, falling back to cache
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Listen for messages from clients
self.addEventListener("message", (event) => {
  // Handle cache invalidation messages
  if (event.data && event.data.type === "CLEAR_PDF_CACHE") {
    caches.open(CACHE_NAME).then((cache) => {
      // Clear all PDF files from cache
      cache.keys().then((requests) => {
        requests.forEach((request) => {
          if (
            request.url.includes("/api/view-pdf") ||
            request.url.endsWith(".pdf")
          ) {
            cache.delete(request);
          }
        });
      });
    });
  }
});
