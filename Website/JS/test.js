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
var currentRound = 0;

function initialize() {
  toggleElementVisibilityFunction('result-popup');

  coordinates = {
    lat: 0,
    lng: 0
  };

  randomizeLocationFunction();

  bounds = new google.maps.LatLngBounds();

  //initializes simple map view
  map = new google.maps.Map(document.getElementById('map'), {
    center: {"lat": 0,"lng": 0},
    zoom: 1,
    minZoom: 0.5,
    panControl: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    overviewMapControl: false,
    rotateControl: false,
    fullscreenControl: false,
    draggableCursor:'crosshair',
  });

  // https://stackoverflow.com/questions/14796604/how-to-know-if-street-view-panorama-is-indoors-or-outdoors

  panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));

  var webService = new google.maps.StreetViewService();
  var checkaround = 5000000;
  webService.getPanorama({
    location: coordinates, 
    radius: checkaround, 
    source: google.maps.StreetViewSource.OUTDOOR},
    function(panoData) {
    if(panoData){

         if(panoData.location){

            if(panoData.location.latLng){

                  panorama.setPano(panoData.location.pano);
                  panorama.setPov({
                    heading: 34,
                    pitch: 10
                  });
                  panorama.setVisible(true);
                  panorama.setOptions({
                    showRoadLabels: false,
                    addressControl: false,
                    fullscreenControl: false,
                    mode : 'html4'
                  });

                  map.setStreetView(panorama);
            }
        }
    }
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

    document.getElementById("guess-button").disabled = false;
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

    var mapAndButton = document.getElementById("map-and-button");
    if(!mapAndButton.classList.contains("expand")){
      mapAndButton.classList.toggle("expand");
    }
  }

  function nextGameFunction(){
    toggleElementVisibilityFunction('result-popup');
    randomizeLocationFunction();
    panorama.setPosition(coordinates);
    toggleButtonFunction('guess-button');
    toggleButtonFunction('next-button');
    clearMarkers();
    clearLines();

    var mapAndButton = document.getElementById("map-and-button");
    if(mapAndButton.classList.contains("expand")){
      mapAndButton.classList.toggle("expand");
    }

    currentRound++;
    document.getElementById("currentRound").innerHTML = currentRound + " / 5";

    document.getElementById("guess-button").disabled = true;
  }

  // hides/shows the element at the top
  function toggleElementVisibilityFunction(id) {
    var x = document.getElementById(id);
    if (x.style.display === "none") {
      x.style.display = "flex";
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

    switch(Math.floor(Math.random() * 8)){
      // formula: (max_Lat/Lng - (min_Lat/Lng)) + (min_Lat/Lng)))
      // case 8 is currently excluded. add +1 to add case 8 again. Case 8 reduces the amount of streetviews found
      case 1:
        coordinates["lat"] = parseFloat((Math.random() * (70 - (57)) + (57)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (-124 - (-153)) + (-153)).toFixed(6));
        break;
      case 2:
        coordinates["lat"] = parseFloat((Math.random() * (57 - (7)) + (7)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (-60 - (-153)) + (-153)).toFixed(6));
        break;
      case 3:
        coordinates["lat"] = parseFloat((Math.random() * (3 - (-57)) + (-57)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (-33 - (-85)) + (-85)).toFixed(6));
        break;
      case 4:
        coordinates["lat"] = parseFloat((Math.random() * (75 - (59)) + (59)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (-11 - (-60)) + (-60)).toFixed(6));
        break;
      case 5:
        coordinates["lat"] = parseFloat((Math.random() * (71 - (25)) + (25)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (78 - (-18)) + (-18)).toFixed(6));
        break;
      case 6:
        coordinates["lat"] = parseFloat((Math.random() * (25 - (-36)) + (-36)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (78 - (-18)) + (-18)).toFixed(6));
        break;
      case 7:
        coordinates["lat"] = parseFloat((Math.random() * (60 - (-44)) + (-44)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (165 - (78)) + (78)).toFixed(6));
        break;
      case 8:
        coordinates["lat"] = parseFloat((Math.random() * (23 - (-49)) + (-49)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (180 - (165)) + (165)).toFixed(6));
        break;
    }
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

  function expandMap(){
    var mapAndButton = document.getElementById("map-and-button");
    mapAndButton.classList.toggle("expand");
  }