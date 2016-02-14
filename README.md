## Public Restrooms in NYC Parks Map Project

This single-page application shows a list of all the public restrooms in NYC parks and their location on a Google Map. Users can filter by borough or search through the list. Clicking on a map marker reveals information about the restroom, as well as local venues and pictures of the area.

Link to live page: [https://nyc-restroom-map.herokuapp.com/](https://nyc-restroom-map.herokuapp.com/)

####Part 1: Finding location data for public restrooms in New York (Not included in this repo)

First, I found the relevant data on NYC parks and restrooms online and linked restroom locations to latitude and longitude coordinates.

1) I found a json of all the public restrooms in the city by making an API request here: 
https://data.cityofnewyork.us/Recreation/Directory-Of-Toilets-In-Public-Parks/hjae-yuav

2) Using the Google Geocoding API I matched each restroom location and borough to latitude and longitude coordinates, as well as a unique Google place_id. I included this data in model.js.

####Part 2: Building a map based on the data

######What you need:
npm

Bower

Gulp

######To create the development version, from the root folder:

1) Install the dependencies into the local node_modules folder, based on the package.json file

`npm install`

2) Install packages to their newest versions according to bower.json

`bower update`

3) Use gulp to create the /dist folder

`gulp`

4) Open /dist/index.html to see the map.

####References used

Udacity website

KnockoutJS documentation

Foursquare API documentation

Google Maps APi documentation

Yeoman generator for KnockoutJS