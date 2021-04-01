# Wish We Were There

For this project we will develop an app which replaces the need to travel to exotic destinations, which has been lost due to Covid travel restrictions. The app will let the user search for a holiday destination and recreate a holiday photo by overlaying an image of themselves onto the destination image.

## User Story

AS A holidaymaker who hasn't been able to travel this year
I WANT a way of creating an image of myself in one of my favourite destinations
SO THAT I can share with friends and family 

## Acceptance Criteria

GIVEN I’m on a image creation site
WHEN I search for a destination
THEN I’m given some options to select an image
WHEN I upload an image of myself
THEN the background is removed from my image
WHEN I select create
THEN my image is overlaid on the selected destination image to create a composite image I am able to dowload and share

## Technology Used 

### CSS Framework
We will use Zurb's Foundation CSS framework for the styling and layout of the application

### APIs 
* When searching a location, we will use the GeoCode API to return latitude and longitude
* Using the lat and long, we will use Amadeus API to return places of interest in the chosen location
* For the destination image source we will use the Flickr API, which will return images of the places of interest
* The Background Remover API by Hotpot.ai, hosted on RapidAPI will be used to remove the background of the user image




