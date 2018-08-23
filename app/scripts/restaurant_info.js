let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
  /*let promises = [fetchRestaurantFromURL,fetchReviewsFromUrl];
  Promise.all(promises)
  .then((results) =>{
    fillRestaurantHTML(results.restaurant);
    
    //fillReviewsHTML();
  })

*/
});

/**
 * Initialize leaflet map
 */
const initMap = () => {
  fetchRestaurantFromURL()
    .then(restaurant => {     
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    })

} 
/**
 * Initialize Google map, called from HTML.
 */

/*window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      google.maps.event.addListenerOnce(self.map, 'idle', () =>{
        document.getElementsByTagName('iframe')[0].title = 'Resturant location';
      });
    }
  });
}*/

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = () => {
  if (self.restaurant) { // restaurant already fetched!
    return Promise.resolve(self.restaurant);
  }
  const id = parseInt(getParameterByName('id'));
  //console.log(`FetchRestaurant ${id}`);
  if (!id) { // no id found in URL
    return Promise.reject('No restaurant id in URL')
  } 
  else {
    return DBHelper.fetchRestaurantById(id)
    .then(restaurant => {
      console.log(`Restaurant: ${restaurant}`);
      if (!restaurant) {
        return Promise.reject('Restaurant not found');
      }
      self.restaurant = restaurant;
      fillRestaurantHTML();
      return restaurant;
    })
  }
}

const fetchReviewsFromUrl =() =>{
  if (self.reviews) { // restaurant already fetched!
    return Promise.resolve(self.reviews);
  }
  const id = parseInt(getParameterByName('id'));
  //console.log(`FetchRestaurant ${id}`);
  if (!id) { // no id found in URL
    return Promise.reject('No restaurant id in URL')
  } 
  else {
    return DBHelper.fetchReviewsById(id)
    .then(reviews => {
      console.log(`Restaurant: ${reviews}`);
      if (!reviews) {
        return Promise.resolve('Restaurant not found');
      }
      self.reviews = reviews;
      return reviews;
    })

  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address; 
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';

  const img = DBHelper.imageUrlForRestaurant(restaurant);
  //const img2 = img.split('.');
  const ext = 'jpg'; 
  // Insert correct name of images in srcset attribute
  const img300 = `${img}-300_1x.${ext}`;
  const img500 = `${img}-500_1x.${ext}`;
  const img600 = `${img}-600_2x.${ext}`;
  const img800 = `${img}-800_2x.${ext}`;
  // Create strings for srcset attribute
  const srcset300 = `${img300} 300w`;
  const srcset500 = `${img500} 500w`;
  const srcset600 = `${img600} 600w`;
  const srcset800 = `${img800} 800w`;
  image.src = img500;
  //Create srcset attribute
  image.srcset = `${srcset300},${srcset500},${srcset600},${srcset800}`;
  image.alt =`${restaurant.name}`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fetchReviewsFromUrl()
  .then( () => {
    fillReviewsHTML();
  })
  
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.className = 'day';
    row.appendChild(day);
    
    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.className = 'hour';
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'review-name';
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.className = 'review-date';
  const parseDate = new Date (review.createdAt); 
  date.innerHTML = parseDate;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.className = 'review-rating';
  rating.innerHTML = `Rating: ${review.rating}`;
  
  var i;
  for (i=0;i < review.rating; i++)
  {  
    const star = document.createElement('span');
    star.className = ' fa fa-star checked';
    rating.appendChild(star);
  }
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = 'review-comment';
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

//sendReview = () => {
  //console.log(`Ecco il metodo sendReview`);
  //}
