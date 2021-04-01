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