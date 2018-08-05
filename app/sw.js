const cacheName = "restaurant-reviews-001";

self.addEventListener('install', event =>{
    event.waitUntil(caches.open(cacheName)
    .then( cache =>{
        console.log("in cache");
        return cache.addAll([
           '/',
           '/index.html',
           '/restaurant.html',
           'css/styles.css',
           'js/main.js',
           'js/restaurant_info.js',
           'js/dbhelper.js',
           'js/sw_register.js',
           'img/1-300_1x.jpg', 'img/1-500_1x.jpg', 'img/1-600_2x.jpg', 'img/1-800_2x.jpg',
           'img/2-300_1x.jpg', 'img/2-500_1x.jpg', 'img/2-600_2x.jpg', 'img/2-800_2x.jpg',
           'img/3-300_1x.jpg', 'img/3-500_1x.jpg', 'img/3-600_2x.jpg', 'img/3-800_2x.jpg',
           'img/4-300_1x.jpg', 'img/4-500_1x.jpg', 'img/4-600_2x.jpg', 'img/4-800_2x.jpg',
           'img/5-300_1x.jpg', 'img/5-500_1x.jpg', 'img/5-600_2x.jpg', 'img/5-800_2x.jpg',
           'img/6-300_1x.jpg', 'img/6-500_1x.jpg', 'img/6-600_2x.jpg', 'img/6-800_2x.jpg',
           'img/7-300_1x.jpg', 'img/7-500_1x.jpg', 'img/7-600_2x.jpg', 'img/7-800_2x.jpg',
           'img/8-300_1x.jpg', 'img/8-500_1x.jpg', 'img/8-600_2x.jpg', 'img/8-800_2x.jpg',
           'img/9-300_1x.jpg', 'img/9-500_1x.jpg', 'img/9-600_2x.jpg', 'img/9-800_2x.jpg',
           'img/10-300_1x.jpg', 'img/10-500_1x.jpg', 'img/10-600_2x.jpg', 'img/10-800_2x.jpg'
            
        ]).catch( err =>{
            console.log(`Cache not open, error: ${err}`);
        });
    })
  );
});

self.addEventListener('fetch', event =>{
    let request = event.request;
    event.respondWith(
        caches.match(request)
        .then(response => {
            return response || fetch(request);
        }).catch(err =>{
            console.log(`Failed ${err}`);
        })
    );
});
