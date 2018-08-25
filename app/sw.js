const cacheName = "restaurant-reviews-001";
import idb from 'idb';

//Promise For indexDB, create IndexDB and createObjectStore restaurants
    
/*function promiseDb () {
    return idb.open ('restaurant-reviews', 1, upgradeDb =>{
      switch(upgradeDb.oldVersion){
      case 0: upgradeDb.createObjectStore('restaurants', 
          {keyPath:'id', autoIncrement: true }); 
      case 1: 
      const reviews = upgradeDb.createObjectStore('reviews',
          {keyPath: 'id', autoIncrement: true});
          reviews.createIndex('restaurant', 'restaurant_id');
      }
   }); 
    
  }*/

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
    console.log(urlrequest);
    console.log(location.origin);
    console.log(event.request.url.split(/[?#]/)[0]);
   /*if(urlrequest.origin === location.origin){
        console.log(urlrequest.origin);
        if(urlrequest.pathname === '/'){
            console.log('Origin');
            return;
        }
        if(urlrequest.pathname.startsWith('/restaurants')){
            event.respondWith(toServer(event.request));
            return;
        }
    }*/
    //Divide request
    //if((urlrequest.port === '1337') && (urlpath.startsWith('/restaurants'))){
    if(urlrequest.port === '1337'){
        console.log(`Verso Server ${urlrequest.port} e path: ${urlpath} `);
       //toServer(event);
       if(urlpath.startsWith('/restaurants'))
        return;
       if(urlpath.startsWith('/review'))
        return;
    }  
    //else {
        console.log(`Altro traffico con porta: ${urlrequest.port} e path: ${urlpath} `);
        //NotServer (event.request);
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
    //event.respondWith(}
});

function toServer (eventRequest) {
        //If in IndexDb get
        promiseDb.then (db =>{
            return db
            .transaction('restaurants', 'readonly')
            .objectStore('restaurants')
            .getAll();
        }).then(fetchOrget =>{
            //If in database promise resolve or fetch
            return fetchOrget || fetch(eventRequest)
            .then(risposta =>{
                //Take json data in response object 
                return risposta.json();
            }).then(data => {
                //Store Json in indexDB
                return promiseDb.then( db => {
                const tx = db.transaction('restaurants','readwrite');
                const store = tx.objectStore('restaurants');
                
                Array.prototype.forEach.call(data, restaurant =>{
                    store.put(restaurant);
                    console.log(`Restaurant: ${restaurant}`);
                })
                    tx.complete;
                    return data;
                }).catch(err =>{
                        console.log(`Errore in db: ${err}`); 
                        console.log(`Data di tipo ${typeof(data)} in json ${data}`);
                    })

            }).catch(err =>{
                console.log(`Errore in data: ${err}`);
                })
    }).then(response => {
            //Build data json
            const dataJson = JSON.stringify(response);
            return new Response(dataJson);
            
         
    }).catch(err =>{
        //If not fetch 
        return new Response("error in network response, failed to fetch",{status:500});
    })
    
}

function NotServer (event){
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            return response || fetch(event.request);
        }).catch(err =>{
            console.log(`Failed ${err}`);
        })
    );
    
}