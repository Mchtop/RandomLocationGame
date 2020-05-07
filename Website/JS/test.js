var map;
var coordinates;
var panorama;
var markerActualLocation;
var line;
var marker;
var markers = [];
var markerCoordinates = [];


function initialize() {
  coordinates = {lat: 42.345573, lng: -71.098326};

  //initializes simple map view
  map = new google.maps.Map(document.getElementById('map'), {
    center: coordinates,
    zoom: 1,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    draggableCursor:'crosshair'
  });

  //initializes panorama view window
  panorama = new google.maps.StreetViewPanorama(
    document.getElementById('pano'), {
      position: coordinates,
      pov: {
        heading: 34,
        pitch: 10
      },
      addressControl: false
    });

    google.maps.event.addListener(map, 'click', function(event) {
      placeMarker(event.latLng);
    });

    //places a marker on click & moves the marker around
    function placeMarker(location) {
      if (!marker || !marker.setPosition) {
        marker = new google.maps.Marker({
          position: location,
          map: map,
        });
        markers.push(marker);
      } else {
        marker.setPosition(location);
      }
    }

    google.maps.event.addDomListener(window, 'load', initialize);
  }

  /* function to place marker with coordinates of the location &
   connect it to the marker placed by the user */
  function guessFunction(){
    markerActualLocation = new google.maps.Marker({
      position: coordinates,
      map: map,
    });

    markers.push(markerActualLocation);

    for(var marker in markers){
      latLng = {
        'lat':markers[marker].position.lat(),
        'lng':markers[marker].position.lng()
      };
      markerCoordinates.push(latLng);
    }

    var line = new google.maps.Polyline({
      path: markerCoordinates,

      strokeColor: '#000000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    line.setMap(map);

    // disables moving the marker after clicking "guess"
    google.maps.event.clearListeners(map, 'click');

    document.getElementById("result-text").innerHTML = "You're " + haversine_distance(markers[0], markers[1]) + "km away from the actual location.";
  }

  // function to calculate distance between 2 points
  function haversine_distance(mk1, mk2) {
      var R = 3958.8; // Radius of the Earth in miles
      var rlat1 = mk1.position.lat() * (Math.PI/180); // Convert degrees to radians
      var rlat2 = mk2.position.lat() * (Math.PI/180); // Convert degrees to radians
      var difflat = rlat2-rlat1; // Radian difference (latitudes)
      var difflon = (mk2.position.lng()-mk1.position.lng()) * (Math.PI/180); // Radian difference (longitudes)

      var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
      return d;
  }