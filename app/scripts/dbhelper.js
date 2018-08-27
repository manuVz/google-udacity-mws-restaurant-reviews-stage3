/**
 * Common database helper functions.
 */
class DBHelper {
  
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    //return `http://localhost:${port}/data/restaurants.json`;
    return `http://localhost:${port}/restaurants`;
  }
 
  
  static promiseDb () {
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
    
  }
   
  static fetchRestaurants (){
    //Check in INDEXDB
    return this.promiseDb ()
    .then(db => {
      //console.log('In Index db');
      const tx = db.transaction('restaurants');
      const store = tx.objectStore('restaurants');
      return store.getAll();
    
    }).then (restaurants =>{
      //console.log(`******restaurants e ${restaurants.length}`)
      if(restaurants.length !==0)
        return Promise.resolve(restaurants);
      else {
            let urlToFetch = DBHelper.DATABASE_URL;
            //console.log(`Url : ${urlToFetch}`);
            return fetch(urlToFetch, {method:'GET'})
            .then( response => response.json())
            .then( restaurants => {
              return this.promiseDb()
              .then( db => {
                const tx = db.transaction('restaurants','readwrite');
                const store = tx.objectStore('restaurants');

                restaurants.forEach(restaurant => {
                  store.put(restaurant);
                });

                return tx.complete.then(()=>Promise.resolve(restaurants));
              })
        
            }).catch(error =>{
                console.log(`Request failed. Returned status of ${error}`);
              });
          }
      });
  }

 
  /*
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  } */
  
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    // fetch all restaurants with proper error handling.
    return DBHelper.fetchRestaurants()
    .then( restaurants =>{
            return restaurants.find( r => r.id === id);
      }).catch(error =>{
      console.log(`Restaurant does not exist ${error}`);
    });  
      
  }
  static fetchAllReviews(){
    return this.promiseDb ()
    .then(db => {
      //console.log('In Index db For Reviews');
      const tx = db.transaction('reviews');
      const store = tx.objectStore('reviews');
      const indexReview = store.index('restaurant');
      return indexReview.getAll();
    }).then (reviews =>{
      //console.log(`******reviews e ${reviews.length}`)
      if(reviews.length !==0)
        return Promise.resolve(reviews);
      else {
            let databaseUrl = new URL(DBHelper.DATABASE_URL);
            let reviewUrl = `${databaseUrl.origin}/reviews/`;
            return fetch(reviewUrl)
            .then(reviews => reviews.json())
            .then( reviews => {
              return this.promiseDb()
              .then( db => {
                const tx = db.transaction('reviews','readwrite');
                const store = tx.objectStore('reviews');
              
                reviews.forEach(review => {
                  store.put(review);
                });

                return tx.complete.then(()=>Promise.resolve(reviews));
              })
        
            }).catch(error =>{
                console.log(`Request failed. Returned status of ${error}`);
              });
        }
      })
    }
    static fetchReviewsById(id){
      return this.promiseDb ()
      .then(db => { 
        
        const tx = db.transaction('reviews');
        const store = tx.objectStore('reviews');
        const indexReview = store.index('restaurant');
        return indexReview.getAll(id);
      }).then (reviews =>{
        //if No createdAt field fetch, when I store in Server -> no date, in indexdb I store the date. 
        let flag =0;
        reviews.forEach(review =>{
          if(!review.createdAt){
            flag=1;
            return;
          }
        })
        if((reviews.length !==0) && (flag==0)){
            
            return Promise.resolve(reviews);
        
          } 
          else {
            
            let databaseUrl = new URL(DBHelper.DATABASE_URL);
            let reviewUrl = `${databaseUrl.origin}/reviews/?restaurant_id=${id}`;
            return fetch(reviewUrl)
            .then(reviews => reviews.json())
              .then( reviews => {
                return this.promiseDb()
                .then( db => {
                  const tx = db.transaction('reviews','readwrite');
                  const store = tx.objectStore('reviews');
                  
                  reviews.forEach(review => {
                    store.put(review);
                  });
  
                  return tx.complete.then(()=>Promise.resolve(reviews));
                })
          
              }).catch(error =>{
                  console.log(`Request failed. Returned status of ${error}`);
                });
          }
        })
      }
  /*static fetchReviewsById(id){
    let databaseUrl = new URL(DBHelper.DATABASE_URL);
    let reviewUrl = `${databaseUrl.origin}/reviews/?restaurant_id=${id}`;
    return fetch(reviewUrl)
    .then(reviews => reviews.json())
    .catch(err => console.log('No restaurant found'));
  }*/

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    // Fetch all restaurants  with proper error handling
    return DBHelper.fetchRestaurants()
    .then(restaurants =>{
       restaurants.filter( r => r.cuisine_type == cuisine);
    }).catch(error=>{
      console.log(`No restaurant for cuisine type, ${error}`);
    });
      
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
    .then(restaurants =>{
      restaurants.filter(r => r.neighborhood == neighborhood);
    }).catch(error => {
      console.log(`No restaturant found, ${error}`);
    })
        
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
    .then(restaurants => {
      let results = restaurants
      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      return results;
    }).catch (error => {
      console.log(`No restaurants found, ${error}`);
    })
      
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    // Fetch all restaurants
   return DBHelper.fetchRestaurants()
   .then(restaurants =>{
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        return uniqueNeighborhoods;
    }).catch(error => {
      console.log(`No neighborhoods found, ${error}`);
    });
      
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines() {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
    .then(restaurants => {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        return uniqueCuisines;
    }).catch (error => {
      console.log(`No cuisines, ${error}`);
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph)
      return (`/images/${restaurant.photograph}`);
    else 
      return('images/no_image');
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  /*static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */
  static updatefavorite(id, status){
    const urlDatabase = DBHelper.DATABASE_URL;
    fetch(`${urlDatabase}/${id}/?is_favorite=${status}`, {method:'PUT'})
      .then(() => { console.log(`Ristorante ${id} aggiornato su server con status ${status}`)
      this.promiseDb()
        .then(db =>{
          const tx = db.transaction('restaurants','readwrite');
          const store = tx.objectStore('restaurants');
          store.get(id)
          .then(restaurant =>{
            restaurant.is_favorite = status;
            store.put(restaurant);
          });
        })
    });
  }

  static addreview(newReview){
    const database = new URL(DBHelper.DATABASE_URL);
    let reviewToServer = {
      'restaurant_id' : newReview.restaurant_id,
      'name' : newReview.name,
      'rating' : newReview.rating,
      'comments' : newReview.comments
    }

    if(!navigator.onLine){
      DBHelper.sendOffline(reviewToServer);
      return;
    }
    let fetchrequest = {
      method:'POST',
      body: JSON.stringify(reviewToServer),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    };
    //console.log(`Oggetto: ${reviewToServer}`);
    //console.log(`Richiesta a server ${fetchrequest}`);
    this.promiseDb()
    .then( db => {
      const tx = db.transaction('reviews','readwrite');
      const store = tx.objectStore('reviews');
      store.put(reviewToServer);
      //console.log('Scritto in index db');
      return tx.complete.then(()=>Promise.resolve(db));
    })

    fetch(`${database.origin}/reviews`, fetchrequest).then( () =>{
        console.log('Successfully update to Server');
    })
    .catch(err =>{
      console.log(`Error ${err}`);
    })
    
  }

  static sendOffline (reviewoffline) {
    localStorage.setItem('offline', JSON.stringify(reviewoffline))
    window.addEventListener('online',(online)=>{
      let review = JSON.parse(localStorage.getItem('offline'));
      if(review !== null)
        DBHelper.addreview(reviewoffline);
      localStorage.removeItem('offline');
    })
  }

}
