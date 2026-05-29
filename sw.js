const CACHE_NAME = 'student-portal-v4.0'; 

const assets = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 1. Install Event (नए वर्ज़न को डाउनलोड करना)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching App Assets');
      return cache.addAll(assets);
    })
  );
});

// 2. Activate Event (पुराने कैशे को डिलीट करना)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// 3. Message Event (Update Popup के "UPDATE" बटन पर क्लिक करने पर इसे ट्रिगर किया जाता है)
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 4. Fetch Event (Network-First Strategy - हमेशा नया डेटा लाएं)
self.addEventListener('fetch', (e) => {
  // Supabase Database API Calls को कैशे नहीं करना है, वरना पुरानी अटेंडेंस दिखेगी
  if (e.request.url.includes('supabase.co')) {
    return; 
  }

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // इंटरनेट चालू है, नया डेटा मिल गया। इसे कैशे में भी सेव कर लें।
        return caches.open(CACHE_NAME).then((cache) => {
          if (e.request.method === 'GET') {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // अगर इंटरनेट बंद है (Offline), तो कैशे (Cache) से पुराना डेटा दिखाएं
        return caches.match(e.request);
      })
  );
});
