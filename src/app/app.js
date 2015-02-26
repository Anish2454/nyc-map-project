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
    this.visible = ko.observable(true);
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
    this.currentFilter;
    this.infoWindow;
    this.userSearch = ko.observable() ;
    this.loc ;

    this.initializeMap = function() {
        var mapOptions = {
            center: {
                lat: toilets[0].lat,
                lng: toilets[0].lng
            },
            zoom: 9
        };
        self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        self.initializeLocations();
        self.initializeFilters();
        self.initializeMarkers();
    };

    this.initializeLocations = function() {
        toilets.forEach(function(toilet) {
            self.locationList.push(new Location(toilet));
        });

        console.log(self.locationList()[0].name());
    };

    this.initializeFilters = function() {
        filters.forEach(function(filter) {
            self.filterList.push(new Filter(filter));
        });

        console.log(self.filterList()[0].name());

        self.currentFilter = ko.observable(self.filterList()[0]);
    };

    this.initializeMarkers = function() {

        //Adding one info window for the map. It will be reassigned to different markers upon map events
        self.infoWindow = new google.maps.InfoWindow({
            //content: item.name() 
            content: ""
        });

        //Markers
        ko.utils.arrayForEach(self.locationList(), function(item) {

            //Adding markers
            var tmpMarker = new google.maps.Marker({
                position: new google.maps.LatLng(item.lat(), item.lng()),
                title: item.name(),
                borough: item.borough()
            });

            //self.markerList.push( tmpMarker ) ;
            self.markerList.push({
                marker: tmpMarker,
                visible: ko.observable(true)
            });

            google.maps.event.addListener(tmpMarker, 'click', function() {
                self.findLocationData() ;
                //self.infoWindow.setContent(tmpMarker.title);
                self.infoWindow.open(self.map, tmpMarker);
            });

        });

        self.showMarkers();
    };

    this.showMarkers = function() {
        //console.log(self.currentFilter().name()) ;
        //console.log(self.markerList()) ;
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
            //console.log(item.borough) ;
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
        //console.log(self.userSearch().toLowerCase()) ;
        //console.log(e.keyCode) ;
        //if (e.keyCode === 13) {
            ko.utils.arrayForEach(self.markerList(), function(item) {
            if(item.visible() == true) {
              if (item.marker.title.toLowerCase().indexOf(self.userSearch().toLowerCase()) >= 0) {
                  item.visible(true);
                  //item.marker.setMap(self.map);
              } else {
                  item.visible(false);
              }
            }
            });
        //}
        //beers[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0
    } ;

    this.searchAuto = function() {
        ko.utils.arrayForEach(self.markerList(), function(item) {
              if ((item.marker.title.toLowerCase().indexOf(self.userSearch().toLowerCase()) >= 0) &&
                        (self.currentFilter().name() == "All" || self.currentFilter().name() == item.marker.borough)) {
                  item.visible(true);
              } else {
                  item.visible(false);
              }
            });
    } ;

    this.findLocationData = function() {
        //var place;
        $.ajax({
            url: 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyCdavfGaOd8gw-q3U9RF5PLKtJxyl7sxZc',
            type: 'GET',
            dataType: 'JSON',
            success: function (data) {
                 //data = JSON.parse(result);
                //place = new PlaceViewModel(result);
                //ko.applyBindings(place);
                //self.tmp(result) ;
                //console.log(self.tmp()) ;
                //ko.mapping.fromJS(result, {}, self);
                //self.loc.push(result) ;
                //self.loc.push(result) ;
                //console.log(result) ;

                //self.loc = ko.mapping.fromJS(self.tmp());


                //self.loc = ko.mapping.fromJS(result, {}, self);

                //console.log(self.loc) ;
                //console.log(self.loc.results()) ;
                self.showInfoWindow(data) ;
                //return self.loc.results() ;
            },
            error: function (data) {
                //left for brevity
            }
        });

        
    };

    this.showInfoWindow = function(data) {
        self.loc = ko.mapping.fromJS(data);
        console.log(self.loc.results()) ;
        console.log(self.loc.results()[0].formatted_address()) ;
        //console.log(JSON.stringify(data.results)) ;
        self.infoWindow.setContent(self.loc.results()[0].formatted_address());
    };



    this.userSearch.subscribe(this.searchAuto);

    google.maps.event.addDomListener(window, 'load', this.initializeMap);

};

$(window).resize(function() {
    var h = $(window).height(),
        MapOffsetTop = 105; // Calculate the top offset
        ScrollOffsetTop = 315 ; //scrolling bar offset

    $('#map-canvas').css('height', (h - MapOffsetTop));
    $('.scrolling').css('height', (h-ScrollOffsetTop)) ;
}).resize();

ko.applyBindings(new ViewModel());

//var height = $('#map-canvas').parent().height() ;
//$('#map-canvas').height(height) ;


//console.log(height) ;

//var parentHeight = $(this).parent().height();
//      $(this).height(parentHeight);    

//$('#map-canvas').css('height', ($(window).height()));

//Google geocode API: AIzaSyCdavfGaOd8gw-q3U9RF5PLKtJxyl7sxZc

//App token for public data: hpyz6OCeHJNRoyNO2KFT3iQKE

//Places API search: https://maps.googleapis.com/maps/api/place/details/json?placeid=EisxODEgQ3JvdG9uYSBBdmVudWUsIEhhcnJpc29uLCBOWSAxMDUyOCwgVVNB&key=AIzaSyCdavfGaOd8gw-q3U9RF5PLKtJxyl7sxZc
