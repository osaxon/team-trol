const CITIES_URL = "https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json";
const COUNTRIES_URL = "https://pkgstore.datahub.io/core/country-list/data_json/data/8c458f2d15d9f2119654b29ede6e45b8/data_json.json";
const CITIES = [];
const COUNTRIES = [];
var DISPLAYED_IMAGES = [];
var POI_LIST = [];

let images = [];
let MAX_WIDTH = 500;
let MAX_HEIGTH = 500;
let searches = JSON.parse(localStorage.getItem('searches')) || [];

// Check if the user has entered 3 characters in the location text input box
function checkLocationChars() {
    var text = $("#city_text").val().trim();
    text = text.replace(/\s+/g, ''); // Replaces all spaces with an empty string
    if(text.length >= 3) { 
        var results = findCity(text);
        constructCityOptions(results);
    }
}    

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

function saveSearch(arg) {
    if(searches.indexOf(arg) === -1){
        searches.push(arg);
        localStorage.setItem("searches",JSON.stringify(searches));
    } else if(searches.indexOf(arg) > -1){
        return;
    }
    searches.sort();
    if(searches.length > 5){
        searches.split(4);
        return;
    }
    //renderSearches
}

// Locates equivalent country code from countries list
function findCountryCode(text) {
    var country = COUNTRIES.find(x => x.name.trim().toLowerCase() === text.trim().toLowerCase());
    return country ? country.code : '';
}

// Construct options for city select
function constructCityOptions(cities) {
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
function getMyPlaces(evt, prevSearch) {
    var selectedCity = prevSearch || $(".cities-select > select").val();
    saveSearch(selectedCity);
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
    var bigUrl = convertImageUrlToLargeSize(url)
    loadImages(bigUrl);
    console.log(bigUrl)
    var text = "<img src='" + bigUrl + "'>";
    $(".selected-image").html(text);
    $("#moveToSelected").click();
}

// Returns the url for selected image for further background image manipulation
function getSelectedImageUrl() {
    return $('.selected-image img').attr('src');
}

//Upload image
function uploadImage(){
    var img = document.querySelector('#imgUpload');
    img.src = URL.createObjectURL(this.files[0]);
};

//Remove background of uploaded image
function removeBackground() {
    var API_KEY = "9c8057038dmsh60c7edf2f2e2a75p109df1jsnae560dc057db"
    var formData = new FormData();
    var fileField = document.querySelector("#imgUploader");
    formData.append('file', fileField.files[0]);
    
    fetch("https://image-background-removal-v2.p.rapidapi.com/v1.0/transparent-net?", {
	"method": "POST",
	"headers": {
		"x-rapidapi-key": API_KEY,
		"x-rapidapi-host": "image-background-removal-v2.p.rapidapi.com"
	},
	"body": formData

    })
    .then(response => {
        return response.json();
    })
    .then(response => {
        var cutout = response.result;
        console.log(cutout);
        displayCutout(cutout);
    })
    .catch(err => {
        console.error(err);
    });
}

//Displays cutout image
function displayCutout(cutout) {
    document.querySelector('#imgUpload').setAttribute('src', cutout);
    loadImages(cutout);
}

function loadImages(src){
    var img = new Image();
    img.onload = drawImg;
    img.src = src;
    images.push(img);
};

//Displays composite image on canvas element
function drawImg() {
    let width = this.width;
    let height = this.height;
    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGTH) {
            width *= MAX_HEIGTH / height;
            height = MAX_HEIGTH;
        }
    };
    if(images.length > 1) {
        var canvas = document.getElementById('usrImgCanvas')
        canvas.width = width
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        for(var i = 0; i < images.length; i++){
            console.log("Drawing image: " + i)
            ctx.drawImage(images[i],0,0, width, height);
        }
    }    
};

function renderSearches(event){
    $('.prev-searches').empty();
    searches.forEach(function(element){
        let newLI = $('<li>');
        newLI.text(element)
        newLI.addClass('prev-search');
        newLI.attr('data-name',element)
        $('.prev-searches').append(newLI);
    })
}

$('#imgUploader').on("change", uploadImage);
document.querySelector("#background-remover").addEventListener("click", removeBackground);

$('.lets-shoot').on('click',renderSearches);

$('.prev-searches').on('click',function(event){
    var dataName = event.target.getAttribute('data-name');
    console.log(dataName)
    getMyPlaces(event, dataName)
});

$('#city_text').on("keypress", checkLocationChars);
loadAllCities();
$('#modal-1').on('open.zf.reveal', function() {
    $('cities').val('');
    $('.message').html('');
    updateLocationModelNext();
});  

$('.location').prop("disabled", true);