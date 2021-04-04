console.log("Hello World");

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


$('#imgUploader').on("change", loadImage)
