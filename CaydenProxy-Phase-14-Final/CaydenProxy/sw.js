/* Small same-origin offline shell cache. Progress itself lives in localStorage. */
'use strict';
const CACHE = 'caydenproxy-shell-v20';
const ASSETS = ['/assets/js/question-engine.js','/assets/js/rpg-world.js','/assets/css/rpg-world.css','/assets/js/cayden-world-scene.js','/assets/css/cayden-world-scene.css','/assets/js/science-lab.js','/assets/css/science-lab.css','/assets/js/genre-catalog.js','/assets/js/floral-themes.js','/assets/css/floral-themes.css','/assets/js/petal-town.js','/assets/css/petal-town.css','/assets/css/game-progress.css','/','/index.html','/assets/css/arcade-max.css','/assets/js/arcade-max.js','/assets/css/wingeria-remastered.css','/assets/js/wingeria-remastered.js','/assets/css/music-studio-v3.css','/assets/js/music-studio-v3.js','/assets/css/world-of-bloom.css','/assets/js/world-of-bloom.js','/assets/css/wingeria-empire.css','/assets/js/wingeria-empire.js','/assets/samples/instruments/soft-piano.wav','/assets/samples/instruments/grand-piano.wav','/assets/samples/instruments/electric-piano.wav','/assets/samples/instruments/jazz-piano.wav','/assets/samples/instruments/concert-piano.wav','/assets/samples/instruments/acoustic-guitar.wav','/assets/samples/instruments/electric-guitar.wav','/assets/samples/instruments/bass-guitar.wav','/assets/samples/instruments/classical-guitar.wav','/assets/samples/instruments/rock-kit.wav','/assets/samples/instruments/jazz-kit.wav','/assets/samples/instruments/electronic-kit.wav','/assets/samples/instruments/studio-kit.wav','/assets/samples/instruments/violin.wav','/assets/samples/instruments/cello.wav','/assets/samples/instruments/viola.wav','/assets/samples/instruments/harp.wav','/assets/samples/instruments/flute.wav','/assets/samples/instruments/clarinet.wav','/assets/samples/instruments/oboe.wav','/assets/samples/instruments/saxophone.wav','/assets/samples/instruments/trumpet.wav','/assets/samples/instruments/trombone.wav','/assets/samples/instruments/french-horn.wav','/assets/samples/instruments/retro-synth.wav','/assets/samples/instruments/arcade-synth.wav','/assets/samples/instruments/edm-synth.wav','/assets/samples/instruments/ambient-synth.wav','/assets/samples/instruments/manifest.json','/assets/samples/instruments/xylophone.wav','/assets/samples/instruments/recorder.wav','/logo.svg','/favicon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('caydenproxy-shell-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.ok && (event.request.destination === 'script' || event.request.destination === 'style' || event.request.destination === 'document' || event.request.destination === 'image')) {
      const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match('/index.html'))));
});
