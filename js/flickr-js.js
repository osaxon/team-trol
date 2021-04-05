const GEOCODE_API_KEY = '316422980633679378271x33089';
const GEOCODE_URL = 'https://geocode.xyz/{city}?region={countryCode}&auth=' + GEOCODE_API_KEY + "&json=1";

const AMADEUS_POI_URL = 'https://api.amadeus.com/v1/reference-data/locations/pois?latitude={latitude}&longitude={longitude}&radius=1&page%5Blimit%5D=10&page%5Boffset%5D=0';
const AMADEUS_API_KEY =  'IqyzmmsnOGa7H8cAlG1k6YqzQTF5';
const AMADEUS_TOKEN_URL = "https://api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_CLIENT_ID = 'JOvXUOY3OX69sVGTnojMRj8zUMDLhd04';
const AMADEUS_CLIENT_SECRET = 'jAceA5FwC0oePI4c';
const NUMBER_OF_FLICKR_PICTURES = 100;

const FLICKR_API_KEY = 'd21c44465e491207d604a059d71668d6';
const FLICKR_API_URL = 'https://www.flickr.com/services/rest?method=flickr.photos.search&api_key='
                       + FLICKR_API_KEY + '&lat={latitude}&lon={longitude}&format=json&safe_search=1&per_page={numberOfFlickerPictures}&page=1&nojsoncallback=1';

// Locates points of interest
// city - City name
// countryCode - 2 letter country code
// call back function for ok response
// call back function for error response
function findMyPointsOfInterest(city, countryCode, poiCallBackFn, poiErrorCallBackFn) {
    getPlaces(city, countryCode)
    .then(function(data) {
        var latitude = data.latt;
        var longitude = data.longt;
        getAmadeusPlacesOfInterest(latitude, longitude)
        .then(function(response) {
          poiPromises = [];
          response.data.forEach((poi) => {
            poiDetails = {
              latitude: poi.geoCode.latitude,
              longitude: poi.geoCode.longitude,
              category: poi.category,
              name: poi.name
            }
            poiPromises.push(getFlickrImages(poiDetails))
          });
         Promise.all(poiPromises)
         .then(function(response) {
           poiCallBackFn(response);
         });  
        });
      }) .catch(function(error) {
          poiErrorCallBackFn(error);
      });
 }        

// Returns a Promise for fetching city
function getPlaces(city, countryCode) {
    var text = city; 
    var url = GEOCODE_URL.replace("{city}", text).replace("{countryCode}", countryCode);
    return fetch(url)
    .then((resp) => resp.json());
}

// Returns a Promise for fetching amadeus places of interest
// lat - latitude
// long - longitude
function getAmadeusPlacesOfInterest(lat, long) { 
    return getAmadeusToken()
    .then((resp) => resp.json())
    .then(function(response) {
      var url = AMADEUS_POI_URL.replace("{latitude}", lat).replace("{longitude}", long);
      return fetch(url, {headers: {
        Authorization: 'Bearer ' +  response.access_token
        }})
     }) 
    .then((resp) => resp.json());
}

// Returns a Promise for retrieving flickr images
function getFlickrImages(poiDetails) {
    var lat = poiDetails.latitude;
    var lon = poiDetails.longitude;
    var url = FLICKR_API_URL.replace("{latitude}", lat).replace("{longitude}", lon).replace("{numberOfFlickerPictures}", NUMBER_OF_FLICKR_PICTURES);
    var images = [];
    return fetch(url)
    .then((resp) => resp.json())
    .then(function(response) {
       response.photos.photo.forEach((photo) => images.push(createFlickrImageUrl(photo)));
       return {
         name: poiDetails.name,
         category: poiDetails.category,
         latitude: poiDetails.latitude,
         longitude: poiDetails.longitude,
         photos: images
       }  
    });
}

// Retrieves amadeus api token
function getAmadeusToken() {
  var url = AMADEUS_TOKEN_URL;
  var bodyText = "grant_type=client_credentials&client_id=" + AMADEUS_CLIENT_ID + "&client_secret=" + AMADEUS_CLIENT_SECRET;
  return fetch(url, {
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyText,
    method: 'POST'
   } 
  );
}

// Construct flickr image url
function createFlickrImageUrl(photo) {
  var urlText = "https://live.staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_q.jpg";
  return {
    url: urlText,
    title: photo.title
  };
}

// Create an object representation of poi with photos
function createPlaceOfInterest(poi, images) {
  return {
    type: poi.category,
    photos: images
  };
}

// Converts flickr image to large
function convertImageUrlToLargeSize(url) {
  return url.replace("_q.jpg", "_b.jpg");
}

