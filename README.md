## Public Restrooms in NYC Parks Map Project

####Part 1: Finding location data for public restrooms in New York (Not included in this repo)

First, I performed some data wrangling to link information about public restrooms in NYC parks to latitude and longitude coordinates.

1) I found a json of all the public toilets in the city by making an API request here: 
https://data.cityofnewyork.us/Recreation/Directory-Of-Toilets-In-Public-Parks/hjae-yuav

2) Using the Google Geocoding API I matched the restroom location and borough to latitude and longitude coordinates, as well as place_id. In included this data in model.js.

####Part 2: Building a map based on the data

######What you need:
Bower
Gulp

######To create the development version:

1) First install packages to their newest versions according to bower.json

`bower update`

2) Then use gulp to create the /dist folder

`gulp`

3) Open /dist/index.html to see the map.