const OPEN_WEATHER_API_KEY = '8cd65c28a9fdcddbfb9c20132db7a158';
const OPEN_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?q={city}&appid=' + OPEN_WEATHER_API_KEY;

const AMADEUS_POI_URL = 'https://api.amadeus.com/v1/reference-data/locations/pois?latitude={latitude}&longitude={longitude}&radius=1&page%5Blimit%5D=10&page%5Boffset%5D=0';
const AMADEUS_API_KEY =  'IqyzmmsnOGa7H8cAlG1k6YqzQTF5';
const AMADEUS_TOKEN_URL = "https://api.amadeus.com/v1/security/oauth2/token";
const AMADEUS_CLIENT_ID = 'JOvXUOY3OX69sVGTnojMRj8zUMDLhd04';
const AMADEUS_CLIENT_SECRET = 'jAceA5FwC0oePI4c';

const FLICKR_API_KEY = 'd21c44465e491207d604a059d71668d6';
const FLICKR_API_URL = 'https://www.flickr.com/services/rest?method=flickr.photos.search&api_key='
                       + FLICKR_API_KEY + '&lat={latitude}&lon={longitude}&format=json&safe_search=1&per_page=5&page=1&nojsoncallback=1';


$("button").click(function() {
    console.log('Here');
    getPlaces()
    .then(function(data) {
        console.log(data);
        var latitude = data.coord.lat;
        var longitude = data.coord.lon;
        getAmadeusPlacesOfInterest(latitude, longitude)
        .then(function(response) {
          
          console.log(response);
        });
      });
 });        


function getPlaces() {
    var text = $("input").val();
    var url = OPEN_WEATHER_URL.replace("{city}", text);
    console.log(url);
    return fetch(url)
    .then((resp) => resp.json());
}

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

function getFlickrImages(lat, lon) {
    var url = FLICKR_API_URL.replace("{latitude}", lat).replace("{longitude}", lon);
    var images = [];
    console.log(url);
    return fetch(url)
    .then((resp) => resp.json())
    .then(function(response) {
       response.photos.photo.forEach((photo) => images.push(createFlickrImageUrl(photo)));
       return images;
    });
}

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

function createFlickrImageUrl(photo) {
  var urlText = "https://live.staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_c.jpg";
  return {
    url: urlText,
    title: photo.title
  };
}

function createPlaceOfInterest(poi, images) {
  return {
    type: poi.category,
    photos: images
  };
}