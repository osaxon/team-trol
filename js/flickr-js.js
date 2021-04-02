const OPEN_WEATHER_API_KEY = '8cd65c28a9fdcddbfb9c20132db7a158';
const OPEN_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?q={city}&appid=' + OPEN_WEATHER_API_KEY;

const AMADEUS_POI_URL = 'https://api.amadeus.com/v1/reference-data/locations/pois?latitude={latitude}&longitude={longitude}&radius=1&page%5Blimit%5D=10&page%5Boffset%5D=0';
const AMADEUS_API_KEY =  'IqyzmmsnOGa7H8cAlG1k6YqzQTF5';

const FLICKR_API_KEY = 'd21c44465e491207d604a059d71668d6';
const FLICKR_API_URL = 'https://www.flickr.com/services/rest?method=flickr.photos.search&api_key='
                       + FLICKR_API_KEY + '&lat={latitude}&lon={longitude}&format=json&safe_search=1&per_page=5&page=1&nojsoncallback=1';

$("button").click(function() {
    console.log('Here');
    getPlaces();
});

function getPlaces() {
    var text = $("input").val();
    var url = OPEN_WEATHER_URL.replace("{city}", text);
    console.log(url);
    fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {
       var latitude = data.coord.lat;
       var longitude = data.coord.lon;
       console.log(latitude, longitude);
       getAmadeusPlacesOfInterest(latitude, longitude);
    })
    .catch(function(error) {
      alert('City details could not be retrieved');
      console.log(error);
    });
}

function getAmadeusPlacesOfInterest(lat, long) {
    var url = AMADEUS_POI_URL.replace("{latitude}", lat).replace("{longitude}", long);
    console.log(url);
    fetch(url, {headers: {
        Authorization: 'Bearer ' +  AMADEUS_API_KEY
    }})
    .then((resp) => resp.json())
    .then(function(response) {
       console.log(response.data);
       response.data.forEach(element => {
           getFlickrImages(element.geoCode.latitude, element.geoCode.longitude);
       });
    })
    .catch(function(error) {
      alert('City details could not be retrieved');
      console.log(error);
    });
}

function getFlickrImages(lat, lon) {
    var url = FLICKR_API_URL.replace("{latitude}", lat).replace("{longitude}", lon);
    console.log(url);
    fetch(url)
    .then((resp) => resp.json())
    .then(function(response) {
       console.log(response);
    })
    .catch(function(error) {
      console.log(error);
    });
}