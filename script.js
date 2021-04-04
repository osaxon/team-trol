console.log("Hello World");

const CITIES_URL = "https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json";
const COUNTRIES_URL = "https://pkgstore.datahub.io/core/country-list/data_json/data/8c458f2d15d9f2119654b29ede6e45b8/data_json.json";
const CITIES = [];
const COUNTRIES = [];
var DISPLAYED_IMAGES = [];
var POI_LIST = [];
//Pseudo Code

//Modal 1
//Search input is entered and on button click...
    //Geocode API is called using the entered destination
        //Lat and Long are returned, saved as variables
    //Flickr API is called with returned lat and long as parameters
        //Pictures are returned (5?) from API call and rendered on page in canvas elements with click listeners for user to select
            //When user clicks on selected image, it is converted into base64 using canvas.toDataURL(), then saved to localStorage
        
//Additional function if time---
//Amadeus API is called with returned lat and long as parameters
    //Places of interest around chosen destination are returned
    //Returned places of interest can be used for the Flickr API call to get more specific images

//Modal 2
//Upload file button is displayed on modal (input type="file")
    //When clicked, user has the option to choose .png or .jpg file from their device
    //When file is chosen it is displayed in canvas element
//User has button to accept image
    //Button runs function to call image backround remover API
        //Image is converted onto base64 using canvas.toDataURL()
        //Base64 is stored as variable and passed into the APi call as parameter
        //Api call returns base64 data of new, edited image
        //Image is displayed in canvas element
//User has button to accept image and continue
    //Button saves base64 data for image in localStorage to be used next

//Modal 3
    //Canvas element is displayed on modal with context of: ctx.globalCompositeOperation = "source-over"
    //Within the canvas, img elements are filled using base64 data for images saved in localStorage
        //Destination image first, cropped user image second
    //Button is displayed to click when user is happy with final image
        //Button click saves final image, making it available to download


function loadImage(){
    var img = new Image();
    img.onload = drawImg;
    img.src = URL.createObjectURL(this.files[0]);
};

function drawImg() {
    var canvas = document.getElementById('usrImgCanvas')
    var ctx = canvas.getContext("2d");
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.drawImage(this, 0,0);
};

// Check if the user has entered 3 characters in the location text input box
function checkLocationChars() {
    console.log("Here");
    var text = $("#city_text").val().trim();
    text = text.replace(/\s+/g, ''); // Replaces all spaces with an empty string
    if(text.length >= 3) { 
        var results = findCity(text);
        constructCityOptions(results);
    }
}


$('#imgUploader').on("change", loadImage);
$('#city_text').on("keypress", checkLocationChars);
loadAllCities();
$('#modal-1').on('open.zf.reveal', function() {
    $('cities').val('');
    $('.message').html('');
    updateLocationModelNext();
});  

$('.location').prop("disabled", true);

// Move to poi and pictures modal
function nextToPictures() {
    $("#nextToPictures").click();
}

// Load cities from  datahub public api and stores response in CITIES array
function loadAllCities() {
    fetch(COUNTRIES_URL)
    .then((resp) => resp.json())
    .then(function(response) {
        response.forEach((country) => COUNTRIES.push({name: country.Name, code: country.Code}));
        fetch(CITIES_URL)
        .then((resp) => resp.json())
        .then(function(response) {
            response.forEach((city) => CITIES.push({city: city.name, country: city.country, countryCode: findCountryCode(city.country)}));               
        })
    })    
}


// Fuse fuzzy logic search for a city
function findCity(text) {
    const opt = {
        distance: 0,
        threshold: 0,
        keys: ['city', 'country']
    };
    const fuse = new Fuse(CITIES, opt)
    const result = fuse.search(text);
    return result;  
}

// Locates equivalent country code from countries list
function findCountryCode(text) {
    var country = COUNTRIES.find(x => x.name.trim().toLowerCase() === text.trim().toLowerCase());
    return country ? country.code : '';
}

// Construct options for city select
function constructCityOptions(cities) {
    console.log(cities);
    if (cities.length > 0) {
        var text = "";
        cities.forEach((x) => text += "<option value='" + x.item.countryCode + "-" + x.item.city + "'>" + x.item.city + ", " + x.item.country + "</option>");
        $(".cities-select > select").html(text);
        setCityOptionDisplay(true); 
    } else {
        setCityOptionDisplay(false);
    }
    
}

// Set city search result option display visibility
function setCityOptionDisplay(flag) {
    const text = flag ? 'flex' : 'none';
    $(".cities-select > select").css('display', text);
}

// Retrieves points of interest
function getMyPlaces(evt) {
    var selectedCity =  $(".cities-select > select").val();
    if (!validateSelectedCity(selectedCity)) {
        return;
    }
    var tokens = selectedCity.split("-");
    var cityName = tokens[1];
    var countryCode = tokens[0];
    DISPLAYED_IMAGES = [];
    $(".progress").css("display", "flex");
    $("#nextToPictures").attr("disabled", true);
    findMyPointsOfInterest(cityName, countryCode, (resp) => {    
        var text = constructPoiListText(resp, cityName);
        $(".poi-holder").html(text);
        $(".progress").css("display", "none");
        $("#nextToPictures").attr("disabled", false);
        $(".message").css("display", "block");
        if (resp.length > 0) {
            $(".message").html("Points of interests found, click Next to continue");
        } else {
            $(".message").html("No Points of interests found, please try again");
        }
        POI_LIST = resp;
        updateLocationModelNext();       
    },
    (error) => {
        $(".message").html("Could not locate points of interest for the selected city");
        $(".message").css("display", "block");
        $(".progress").css("display", "none");
        updateLocationModelNext();
    });
}

// Validate selected city
function validateSelectedCity(city) {
  if (!city || city.trim().length === 0) {
    $(".message").html("Please select a city from the list");
    $(".message").css("display", "block");
    return false;
  } else {
      return true;
  }
}

// Update Move to point of interest (Next) button visibility
function updateLocationModelNext() {
    if (POI_LIST.length === 0) {
        $('.location').prop("disabled", true);
    } else {
        $('.location').removeAttr("disabled");
    }    
}

// Construct picture div
function constructPicture(photo) {
    return "<div class='picture'>"
           +  "<img src='" + photo.url + "' onclick=showSelectedImage('" + photo.url + "')>"
           +"</div>";
}

// Construct pictures container html
function constructPictures(photos) {
    var text = "<div class='picture-rows'>"
                + "<div class='pictures'>";
    var photoCount = 0;
    var index = 0;
    while(index < photos.length && photoCount <= 10)  {
        var photo = photos[index];
        if (!DISPLAYED_IMAGES.find((x) => x === photo.url)) {
            text += constructPicture(photo);
            DISPLAYED_IMAGES.push(photo.url);
            photoCount++;
        }
        index++;
    }
    text += "</div></div>";    
    return text;
}

// Construct point of interest container html text
function constructPoiText(poi) {
    return  "<div class='poi-row'>"
               + "<label class='poi-name'>" + poi.name + "</label>"
               + constructPictures(poi.photos)
            + "</div>";
}

// Construct point of interest list html text
function constructPoiListText(pois, cityName) {    
    var text =  "<h2>Points of Interests - " + cityName + "</h2>";
                + "<div class='poi-container'>";
    pois.forEach((poi) => text += constructPoiText(poi));
    text += "</div>";
    return text;            
}

// Construct selected image modal image html text
function showSelectedImage(url) {
    console.log(url);
    var bigUrl = convertImageUrlToLargeSize(url)
    var text = "<img src='" + bigUrl + "'>";
    $(".selected-image").html(text);
    $("#moveToSelected").click();
}

// Returns the url for selected image for further background image manipulation
// function getSelectedImageUrl() {
//     return $('.selected-image img').attr('src');
// }