const cacheName = "restaurant-reviews-001";
import idb from 'idb';


    const promiseDb = idb.open ('restaurant-reviews', 1, upgradeDb =>{
        switch(upgradeDb.oldVersion){
        case 0: upgradeDb.createObjectStore('restaurants', 
            {keyPath:'id', autoIncrement: true }); 
        }
    });
    

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

/*const fetchStore = function (response){
    const promise = new Promise (function(resolve,reject) {

        //console.log(`Response data: ${response}`);
        return (response && response.data || fetch(request)
            .then (responsejson => { responsejson.json();})
            .then(jsonFile => {
                return promiseDb.then( db => {
                    console.log('In responsejson');
                    const tx = db.transaction('restaurants', 'readwrite');
                    for (i in jsonFile ){
                        tx.objectStore('restaurants').put(jsonFile[i]);
                    }
                })
                return jsonFile;
            })
        );

}); 
return promise;
}
*/

self.addEventListener('fetch', event =>{
    let request = event.request;
    const urlrequest = new URL(event.request.url);
    const urlpath = urlrequest.pathname;
    if((urlrequest.port === '1337') && (urlpath.indexOf('/restaurants')>-1)){
        console.log(urlrequest.port);
        toServer(event);
    }  
    else {
        console.log(urlrequest.port);
        NotServer (event);
    }
});

const toServer = event => {
    console.log("to server");
    console.log(event.request);
    event.respondWith(
        promiseDb.then (db =>{
            return db
            .transaction('restaurants', 'readonly')
            .objectStore('restaurants')
            .getAll();
        }).then(fetchOrget =>{
            console.log(`Ecco event in fetchOrget ${event.request}`);
            console.log(fetchOrget);
            console.log(fetchOrget.length);
            return (fetchOrget) || fetch(event.request)
            .then(risposta =>{
                console.log(`Dopo fetch in promise: ${risposta} `);
                return risposta.json();
            }).then(data => {
            console.log(`Questa è la risposta in json : ${data}`);
                return promiseDb.then( db => {
                const tx = db.transaction('restaurants','readwrite');
                const store = tx.objectStore('restaurants');
                console.log(`Siamo in db per scriver json tipo dati: ${typeof(data)}`);
                console.log(`Dati: ${data}`);
                //let restaurants = JSON.parse (data);
                //restaurants.forEach(restaurant =>{
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
        
            console.log(`Il tipo di response : ${response}`);
            console.log(response);
            console.log(`Questo invece dovrebbe essere un value javascript ${JSON.stringify(response)}`);
            const dataJson = JSON.stringify(response);
            return new Response(dataJson);
            //return response;
         
    }).catch(err =>{
        return new Response("error in network response, failed to fetch",{status:500});
    })
    
); 
}

const NotServer = event =>{
    const request = event.request;
    event.respondWith(
        caches.match(request)
        .then(response => {
            return response || fetch(request);
        }).catch(err =>{
            console.log(`Failed ${err}`);
        })
    );
}