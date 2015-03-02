/* ======= Model ======= */

// Raw data is in model.js

var Location = function(data) {
    this.location = ko.observable(data.location);
    this.name = ko.observable(data.name);
    this.borough = ko.observable(data.borough);
    this.open_year_round = ko.observable(data.open_year_round);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.place_id = ko.observable(data.place_id);
    this.handicap = ko.observable(data.handicap_accessible);
}

var Filter = function(data) {
    this.name = ko.observable(data);
    this.clicked = ko.observable(false);
}

/* ======= ViewModel ======= */

var ViewModel = function() {

    var self = this;

    this.map;
    this.locationList = ko.observableArray([]);
    this.filterList = ko.observableArray([]);
    this.markerList = ko.observableArray([]);

    this.legendIconList = ko.observableArray([]);
    this.currentMarker = ko.observable();
    this.userSearch = ko.observable();
    this.currentFilter;
    this.infoWindow;

    /* == ViewModel: setup == */

    this.initializeMap = function() {
        var mapOptions = {
            center: {
                lat: restrooms[0].lat,
                lng: restrooms[0].lng
            },
            zoom: 10
        };
        self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        self.initializeLocations();
        self.initializeFilters();
        self.initializeLegend();
        self.initializeMarkers();
    };

    this.initializeLocations = function() {
        restrooms.forEach(function(restroom) {
            self.locationList.push(new Location(restroom));
        });
    };

    this.initializeFilters = function() {
        filters.forEach(function(filter) {
            self.filterList.push(new Filter(filter));
        });

        self.currentFilter = ko.observable(self.filterList()[0]);
    };

    this.initializeLegend = function() {
        self.legendIconList.push({
            name: "Park",
            img: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });
        self.legendIconList.push({
            name: "Playground",
            img: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
        });
        self.legendIconList.push({
            name: "Other",
            img: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
        });

    };

    this.initializeMarkers = function() {

        //Adding one info window for the map. It will be reassigned to different markers upon map events
        self.infoWindow = new google.maps.InfoWindow({
            content: ""
        });


        //Markers
        ko.utils.arrayForEach(self.locationList(), function(item) {
            //Adding markers
            var tmpMarker = new google.maps.Marker({
                position: new google.maps.LatLng(item.lat(), item.lng()),
                title: item.name(),
                borough: item.borough(),
                id: item.place_id(),
                openYear: item.open_year_round(),
                handicap: item.handicap(),
                icon: function() {
                    if (item.name().toLowerCase().indexOf("park") >= 0) {
                        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                    } else if (item.name().toLowerCase().indexOf("playground") >= 0) {
                        return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
                    } else {
                        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
                    }

                }()
            });

            self.markerList.push({
                marker: tmpMarker,
                visible: ko.observable(true)
            });

            google.maps.event.addListener(tmpMarker, 'click', function() {
                self.currentMarker(tmpMarker);
                self.findGoogleData();
            });

        });

        self.showMarkers();
    };

    /* == ViewModel: basic functionality == */

    this.showMarkers = function() {
        ko.utils.arrayForEach(self.markerList(), function(item) {
            if (self.currentFilter().name() == "All" || self.currentFilter().name() == item.marker.borough) {
                item.visible(true);
                item.marker.setMap(self.map);
            } else {
                item.visible(false);
            }
        });

    };

    this.clearMarkers = function() {
        ko.utils.arrayForEach(self.markerList(), function(item) {
            item.marker.setMap(null);
        });
    };

    this.changeFilter = function(clickedFilter) {
        self.currentFilter(clickedFilter);
        self.clearMarkers();
        self.showMarkers();
    };

    this.selectLocation = function(clickedLocation) {
        google.maps.event.addListener(clickedLocation.marker, 'click', function() {
            self.infoWindow.setContent(clickedLocation.marker.title);
            self.infoWindow.open(self.map, clickedLocation.marker);
        });

        google.maps.event.trigger(clickedLocation.marker, 'click');
    };

    this.searchLocation = function() {
        ko.utils.arrayForEach(self.markerList(), function(item) {
            if (item.visible() == true) {
                if (item.marker.title.toLowerCase().indexOf(self.userSearch().toLowerCase()) >= 0) {
                    item.visible(true);
                } else {
                    item.visible(false);
                }
            }
        });
    };

    this.searchAuto = function() {
        ko.utils.arrayForEach(self.markerList(), function(item) {
            if ((item.marker.title.toLowerCase().indexOf(self.userSearch().toLowerCase()) >= 0) &&
                (self.currentFilter().name() == "All" || self.currentFilter().name() == item.marker.borough)) {
                item.visible(true);
            } else {
                item.visible(false);
            }
        });
    };

    /* == ViewModel: AJAX requests to fetch infoWindow data == */

    var contentGoogle;
    var contentFoursquare;

    this.findGoogleData = function() {

        // GOOGLE REQUEST
        var service = new google.maps.places.PlacesService(self.map);

        var request = {
            placeId: self.currentMarker().id
        };

        service.getDetails(request, callback);

        function callback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                contentGoogle = place;
                self.findFoursquareData();
            }
        }
    };

    this.findFoursquareData = function() {
        // FOURSQUARE REQUEST
        var clientID = 'HYHN4QP4JTA3XGD32S21GJFCXSLHAGTCADUNJEQT4AGCI01N';
        var secret = 'G4M441LF3KLNRI0EXV5K42IC3I0NAH0VOJEBVN0BJNE0GXG5';
        var date = '20150226';
        var lat = self.currentMarker().position.k;
        var lng = self.currentMarker().position.D;

        $.ajax({
                url: 'https://api.foursquare.com/v2/venues/explore?client_id=' + clientID + '&client_secret=' + secret + '&ll=' + lat + ',' + lng + '&limit=5&section="food,drinks,coffee,shops"&v=' + date,
                type: 'GET',
                dataType: "json"
            }).done(function(data) {
                contentFoursquare = data.response.groups[0].items;
                self.showInfoWindow();
            })
            .fail(function(reason) {
                console.debug(reason);
            });
    };

    this.showInfoWindow = function() {
        var title = self.currentMarker().title;
        var openYear = self.currentMarker().openYear;
        var handicap = self.currentMarker().handicap;
        var address = contentGoogle.formatted_address;
        var photos = contentGoogle.photos;
        var localVenues = [];

        //Title and basic restroom information
        var contentString = '<div id="content"></div>' +
            '<h3 >' + title + ' Restroom</h3>' +
            '<div id="bodyContent">' +
            '<p>' + address + '</p>' +
            '<p>Bathroom open year round: ' + openYear + '</p>';

        if (typeof handicap !== 'undefined') {
            contentString += '<p>Handicap accessible</p>';
        }

        contentString += '</div></div>';

        //Nearby businesses
        var localVenuesString = '<br><h5>Nearby businesses: </h5>';

        for (venue in contentFoursquare) {
            var tmp = contentFoursquare[venue].venue;
            console.log(tmp);
            localVenuesString += '<div><strong>' + tmp.name + '</strong> - ' + tmp.categories[0].name + '<br>' +
                tmp.location.formattedAddress[0] + ' ' + tmp.location.formattedAddress[1] + '<br>';

            if (typeof tmp.contact.formattedPhone !== 'undefined') {
                localVenuesString += tmp.contact.formattedPhone + '<br>';
            }
            if (typeof tmp.url !== 'undefined') {
                localVenuesString += '<a href=' + tmp.url + '>' + tmp.url + '</a>';
            }

            localVenuesString += '</div><br>';
        }

        contentString += localVenuesString;

        //Nearby photos
        if (typeof photos !== 'undefined') {
            contentString += '<h5>Nearby photos: </h5>';
            var imageString = '<div class="row text-center">';
            for (var photo in photos) {
                imageString += '<img src=' + photos[photo].getUrl({
                    'maxWidth': 300,
                    'maxHeight': 300
                }) + ' width="300"/><br><br><br>'
            }
            imageString += '</div>';

            contentString += imageString;
        }

        self.infoWindow.setContent(contentString);
        self.infoWindow.open(self.map, self.currentMarker());
    };

    this.userSearch.subscribe(this.searchAuto);

    google.maps.event.addDomListener(window, 'load', this.initializeMap);

};

$(window).resize(function() {
    var h = $(window).height(),
        MapOffsetTop = 96; // Calculate the top offset
    ScrollOffsetTop = 335; //scrolling bar offset

    $('#map-canvas').css('height', (h - MapOffsetTop));
    $('.scrolling').css('height', (h - ScrollOffsetTop));
}).resize();

ko.applyBindings(new ViewModel());
