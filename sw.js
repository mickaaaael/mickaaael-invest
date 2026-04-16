const CACHE_NAME = 'mick-finance-v1';
const ASSETS = [
  '/index.html',
  '/logo.png',
  '/logo2.png',
  '/logo3.png',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2'
];

// Installation — met en cache les fichiers essentiels
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation — supprime les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — Network first, fallback to cache (pour toujours avoir les données fraiches)
self.addEventListener('fetch', e => {
  // Ne pas cacher les appels API (Google Apps Script, Yahoo, etc.)
  if (e.request.url.includes('script.google.com') ||
      e.request.url.includes('yahoo') ||
      e.request.url.includes('api.')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre à jour le cache avec la version fraiche
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
