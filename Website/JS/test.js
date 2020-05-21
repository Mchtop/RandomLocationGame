var map;
var coordinates;
var panorama;
var markerActualLocation;
var line;
var marker;
var markers = [];
var bounds;
var markerCoordinates = [];
var points = [];
var distances = [];

function initialize() {
  toggleElementVisibilityFunction('result-popup');

  coordinates = {
    lat: parseFloat((Math.random() * (90 - (-90)) - 90).toFixed(6)),
    lng: parseFloat((Math.random() * (180 - (-180)) - 180).toFixed(6))
  };

  bounds = new google.maps.LatLngBounds();

  //initializes simple map view
  map = new google.maps.Map(document.getElementById('map'), {
    center: coordinates,
    zoom: 1,
    minZoom: 0.5,
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
      preference: 'nearest',
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
  }

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

    toggleButtonFunction('guess-button');
    toggleButtonFunction('next-button');

    for (var i = 0; i < markers.length; i++) {
      bounds.extend(markers[i].getPosition());
    }

    map.fitBounds(bounds);

    distances.push(haversineDistanceFunction(markers[0], markers[1]));

    toggleElementVisibilityFunction('result-popup');
    
    document.getElementById("result-text").innerHTML = "You're " + distances[distances.length - 1] + "km away from the actual location.";
    document.getElementById("result-score").innerHTML = "You gained " + pointsFunction(distances[distances.length - 1])+ " points.";
    
    


  }

  function nextGameFunction(){
    toggleElementVisibilityFunction('result-popup');
    randomizeLocationFunction();
    panorama.setPosition(coordinates);
    toggleButtonFunction('guess-button');
    toggleButtonFunction('next-button');
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

  function toggleButtonFunction(id){
    if(document.getElementById(id).disabled == false){
      document.getElementById(id).disabled = true;
    } else {
      document.getElementById(id).disabled = false;
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

  function pointsFunction(dist){
    var points;
    if ( dist >= 1000 ){
      points = 100 - 0.01 * dist;
    } else if ( dist < 1000 && dist >= 500 ) {
      points = 200 - 0.01 * dist;
    } else if ( dist < 500 && dist >= 100 ) {
      points = 500 - 0.01 * dist;
    } else {
      points = 1000 - 0.01 * dist;
    }
    return points;
  }