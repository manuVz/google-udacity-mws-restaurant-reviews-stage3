const cacheName = "restaurant-reviews-001";
import idb from 'idb';


self.addEventListener('install', event =>{
    event.waitUntil(caches.open(cacheName)
    .then( cache =>{
        console.log("in cache");
        return cache.addAll([
           '/',
           '/index.html',
           '/restaurant.html',
           '/styles/styles.css',
           '/scripts/main.js',
           '/scripts/restaurant_info.js',
           '/scripts/dbhelper.js',
           '/scripts/module/idb.js',
           '/scripts/sw_register.js',
           '/images/1-300_1x.jpg', '/images/1-500_1x.jpg', '/images/1-600_2x.jpg', '/images/1-800_2x.jpg',
           '/images/2-300_1x.jpg', '/images/2-500_1x.jpg', '/images/2-600_2x.jpg', '/images/2-800_2x.jpg',
           '/images/3-300_1x.jpg', '/images/3-500_1x.jpg', '/images/3-600_2x.jpg', '/images/3-800_2x.jpg',
           '/images/4-300_1x.jpg', '/images/4-500_1x.jpg', '/images/4-600_2x.jpg', '/images/4-800_2x.jpg',
           '/images/5-300_1x.jpg', '/images/5-500_1x.jpg', '/images/5-600_2x.jpg', '/images/5-800_2x.jpg',
           '/images/6-300_1x.jpg', '/images/6-500_1x.jpg', '/images/6-600_2x.jpg', '/images/6-800_2x.jpg',
           '/images/7-300_1x.jpg', '/images/7-500_1x.jpg', '/images/7-600_2x.jpg', '/images/7-800_2x.jpg',
           '/images/8-300_1x.jpg', '/images/8-500_1x.jpg', '/images/8-600_2x.jpg', '/images/8-800_2x.jpg',
           '/images/9-300_1x.jpg', '/images/9-500_1x.jpg', '/images/9-600_2x.jpg', '/images/9-800_2x.jpg',
           '/images/no_image-300_1x.jpg', '/images/no_image-500_1x.jpg', '/images/no_image-600_2x.jpg', 'images/no_image-800_2x.jpg'      
        ]).catch( err =>{
            console.log(`Cache not open, error: ${err}`);
        });
    })
  );
});

self.addEventListener('fetch', event =>{
    let request = event.request;
    const urlrequest = new URL(event.request.url);
    const urlpath = urlrequest.pathname;
    
    //Divide request
    
    if(urlrequest.port === '1337'){
        console.log(`Verso Server ${urlrequest.port} e path: ${urlpath} `);

       if(urlpath.startsWith('/restaurants'))
        return;
       if(urlpath.startsWith('/review'))
        return;
       
        
    }  
        console.log(`Altro traffico con porta: ${urlrequest.port} e path: ${urlpath} `);
        event.respondWith(
            caches.match(event.request)
            .then(response => {
                if(response) return response
                return caches.open(cacheName).then(cache =>{
                    return fetch(event.request).then(network => {
                        cache.put(event.request.url, network.clone());
                        return network;
                })
                
                })
            }).catch(err =>{
                console.log(`Failed ${err}`);
            })
        );
});



