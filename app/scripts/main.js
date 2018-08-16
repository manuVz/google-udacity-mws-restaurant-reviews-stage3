let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  //alert("Hello welcome to Restaurant Review");
  //
  fetchNeighborhoods();
  fetchCuisines();
  initMap();
});
//prova tecnica2
/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods().then(neighborhoods => {    
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }).catch (err => console.log(err));

}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines().then(cuisines => {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }).catch(err => console.error(err));
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
/*window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();*/

 const initMap = () => {
    self.newMap = L.map('map', {
          center: [40.722216, -73.987501],
          zoom: 12,
          scrollWheelZoom: false
        });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
      mapboxToken: 'pk.eyJ1IjoibWFudXZpIiwiYSI6ImNqa2ZiZHJmeDA2amwzcXBqMHlmamZobXQifQ.rV6-qE4fqd3wciv3LREYwQ',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(newMap);
  
    updateRestaurants();
  // Give a title to iframe
  /*google.maps.event.addListenerOnce(self.map, 'idle', () =>{
    document.getElementsByTagName('iframe')[0].title = 'Map of resturant locations';
  });*/
}

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
    .then(restaurants => {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    
  }).catch(err => console.error(err));
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  // For Google Maps self.markers.forEach(m => m.setMap(null));
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  
  //Insert the correct name of image for responsive image
  const img= DBHelper.imageUrlForRestaurant(restaurant);
  const ext = 'jpg';
  const img300 = `${img}-300_1x.${ext}`;
  const img500 = `${img}-500_1x.${ext}`;
  const img600 = `${img}-600_2x.${ext}`;
  const img800 = `${img}-800_2x.${ext}`;
  // Create sring for srcset attribute
  const srcset300 = `${img300} 300w`;
  const srcset500 = `${img500} 500w`;
  const srcset600 = `${img600} 600w`;
  const srcset800 = `${img800} 800w`;
  // Default image resolution
  image.src = img500;
  // Insert srcset attribute
  image.srcset = `${srcset300},${srcset500},${srcset600},${srcset800}`;
  image.alt = `${restaurant.name}`;
  li.append(image);

  const divtext = document.createElement('div');
  divtext.className = 'restaurant-text';
  li.append(divtext);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  
  divtext.append(name);
  
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  divtext.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  divtext.append(address);
  
  const dvfavourite = document.createElement('div');
  dvfavourite.className = 'restaurant-favourite';
  li.append(dvfavourite);
  
  const div = document.createElement('div');
  div.className ='restaurant-button';
  li.append(div);
   
  const btnfavourite = document.createElement ('button');
  btnfavourite.innerHTML = 'favourite';
  btnfavourite.setAttribute('aria-label','Press to get favourite');
  btnfavourite.addEventListener ('click', () => {});
  dvfavourite.append(btnfavourite);

  const more = document.createElement('button');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label',`View Details of ${restaurant.name} restaurant`);
  more.addEventListener('click', () => {window.location.href = DBHelper.urlForRestaurant(restaurant);});
  div.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

} 
/*addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}*/
