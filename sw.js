// sw.js — minimal app-shell cache for the Device Wipe Control page.
//
// Caches ONLY the static shell (this HTML file, the manifest, and icons) so
// tapping the home-screen icon opens the app instantly, even with no signal
// at that exact moment. It deliberately does NOT cache or intercept any
// Google API / Drive requests — those always go over the real network,
// since the wipe flag genuinely cannot be set without actually reaching
// Google Drive. This service worker only makes the shell load fast; it does
// not add any offline capability to the wipe action itself.

const CACHE_NAME = 'wipe-control-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up any older cache versions from a previous deploy
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intervene for requests to this same origin's shell files — never
  // touch Google's OAuth/Drive API domains, so sign-in and the actual wipe
  // request always hit the live network, never a stale cached response.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        // Truly offline and not in cache (e.g. first-ever visit with no
        // connectivity) — nothing sensible to return, let it fail normally.
        return new Response('Offline and not yet cached.', { status: 503 });
      });
    })
  );
});
