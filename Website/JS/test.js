var map;
var coordinates;
var panorama;
var markerActualLocation;
var line;
var marker;
var markers = [];
var bounds;
var markerCoordinates = [];

function initialize() {

  coordinates = {
    lat: parseFloat((Math.random() * (90 - (-90)) - 90).toFixed(6)),
    lng: parseFloat((Math.random() * (180 - (-180)) - 180).toFixed(6))
  };

  bounds = new google.maps.LatLngBounds();

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
      addressControl: false,
      fullscreenControl: false
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

    line = new google.maps.Polyline({
      path: markerCoordinates,

      strokeColor: '#000000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    line.setMap(map);

    // disables moving the marker after clicking "guess"
    document.getElementById('guess-button').disabled = true;
    document.getElementById('next-button').disabled = false;

    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }

    map.fitBounds(bounds);

    document.getElementById("result-text").innerHTML = "You're " + haversineDistanceFunction(markers[0], markers[1]) + "km away from the actual location.";


  }

  function nextGameFunction(){
    toggleElementVisibilityFunction('next-button');
    toggleElementVisibilityFunction('result-text');
    randomizeLocationFunction();
    panorama.setPosition(coordinates);
    document.getElementById('guess-button').disabled = false;
    document.getElementById('next-button').disabled = true;
    clearMarkers();
    clearLines();
  }

  // hides/shows the element at the top
  function toggleElementVisibilityFunction(id) {
  var x = document.getElementById(id);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

// calculates distance between 2 points
function haversineDistanceFunction(mk1, mk2) {
  var R = 3958.8; // Radius of the Earth in miles
  var rlat1 = mk1.position.lat() * (Math.PI/180); // Convert degrees to radians
  var rlat2 = mk2.position.lat() * (Math.PI/180); // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (mk2.position.lng()-mk1.position.lng()) * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  return Math.round(d);
}

function randomizeLocationFunction(){
  coordinates[0] = parseFloat((Math.random() * (90 - (-90)) - 90).toFixed(6));
  coordinates[1] = parseFloat((Math.random() * (180 - (-180)) - 180).toFixed(6));
}

//removes markers from the map
function clearMarkers(){
  for (var i = 0; i < markers.length; i++ ) {
    markers[i].setMap(null);
  }
  markers.length = 0;
}

//removes polylines from the map
function clearLines(){
  line.setMap(null);
  markerCoordinates.length = 0;
}
