// Service Worker mudah untuk KBBS PWA
// Supaya app bole buka standalone (tanpa browser bar)

const CACHE = 'kbbs-v1'

// Masa install - cache page utama
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/', '/dashboard', '/login'])
    )
  )
  self.skipWaiting()
})

// Aktif terus
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch - cuba network dulu, kalau gagal guna cache
self.addEventListener('fetch', (e) => {
  // Skip non-GET dan Supabase requests
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('supabase.co')) return

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((cache) => cache.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
