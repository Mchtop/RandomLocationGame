var map;
var coordinates;
var panorama;
var marker;
var marker2;
var markerLocation;
var line;
var markers = [];
var latLng;
var flightPlanCoordinates = [];

function initialize() {

  coordinates = {lat: 42.345573, lng: -71.098326};

  map = new google.maps.Map(document.getElementById('map'), {
      center: coordinates,
      zoom: 1,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false
  });

  map.setOptions({draggableCursor:'crosshair'});

  panorama = new google.maps.StreetViewPanorama(
    document.getElementById('pano'), {
        position: coordinates,
        pov: {
        heading: 34,
        pitch: 10
        }
    });

    google.maps.event.addListener(map, 'click', function(event) {
       placeMarker(event.latLng);
    });

    function placeMarker(location) {
      if (!marker || !marker.setPosition) {
        marker = new google.maps.Marker({
          position: location,
          map: map,
        });
        markerLocation = location;
      } else {
        markerLocation = location;
        marker.setPosition(location);
      }
    }

    google.maps.event.addDomListener(window, 'load', initialize);
}

// connect marker with actual location
function guessFunction(){

  marker2 = new google.maps.Marker({
    position: coordinates,
    map: map,
  });

  alert(marker + ", " + marker2);
  markers.push(marker);
  markers.push(marker2);

  // coords.push(coordinates);
  // coords.push(markerLocation);
  //
  // line = new google.maps.Polyline({
  //   path: coords,
  //   geodesic: true,
  //   strokeColor: '#FF0000',
  //   strokeOpacity: 1.0,
  //   strokeWeight: 2
  //   });
  // line.setMap(map);

  for(var marker in markers){
    latLng = {
      'lat':markers[marker].position.lat(),
      'lng':markers[marker].position.lng()
    };
    flightPlanCoordinates.push(latLng);
  }

  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);
}
