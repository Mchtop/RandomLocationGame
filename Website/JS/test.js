var map;
var coordinates;
var panorama;
var markerActualLocation;
var line;
var marker;
var markers = [];
var bounds;
var markerCoordinates = [];
var score = [];
var distances = [];
var currentRound = 1;
var currentScore = 0;

let seconds = 0;
let minutes = 0;
let hours = 0;
let displaySeconds = 0;
let displayMinutes = 0;
let displayHours = 0;
let interval = window.setInterval(stopwatch, 1000);

function initialize() {
  toggleElementVisibilityFunctionFlex('result-popup');

  coordinates = {
    lat: 0,
    lng: 0
  };

  randomizeLocationFunction();

  bounds = new google.maps.LatLngBounds();

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

              coordinates["lat"] = panoData.location.latLng.lat();
              coordinates["lng"] = panoData.location.latLng.lng();

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

  map.addListener('click', function(event) {
    placeMarker(event.latLng);
  });
  }

  /* method to place a marker on the map & to move the marker around
  input: click event -> coordinates(lat, lng) */
  function placeMarker(location) {

    if(marker){
      if(marker.getVisible() == false){
        marker.setVisible(true);
        markers.push(marker);
      }
    }

    if (!marker || !marker.setPosition ) {
      marker = new google.maps.Marker({
        position: location,
        map: map,
      });
      markers.push(marker);
    } else {
      marker.setPosition(location);
    }

    if (document.getElementById("guess-button").disabled == true){
      toggleButtonFunction("guess-button");
    }
  }

  /* method to end the round */
  function guessFunction(){

    google.maps.event.clearListeners(map, 'click');

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
    score.push(pointsFunction(distances[distances.length - 1]));
    currentScore += pointsFunction(distances[distances.length - 1]);

    toggleElementVisibilityFunctionFlex('result-popup');

    document.getElementById("result-text").innerHTML = "You're " + distances[distances.length - 1] + "km away from the actual location.";
    document.getElementById("result-score").innerHTML = "You gained " + pointsFunction(distances[distances.length - 1])+ " points.";

    var mapAndButton = document.getElementById("map-and-button");
    if(!mapAndButton.classList.contains("expand")){
      mapAndButton.classList.toggle("expand");
    }

    // if it's the last round, "next"-button is hidden and "show results"-button is shown
    if(currentRound == 5){
      toggleElementVisibilityFunctionFlex("showResults-button");
      toggleElementVisibilityFunctionFlex("next-button");
    }
  }

  /* method to start a new round */
  function nextGameFunction(){
    toggleElementVisibilityFunctionFlex('result-popup');
    toggleButtonFunction('guess-button');
    toggleButtonFunction('next-button');
    clearMarkers();
    clearLines();

    randomizeLocationFunction();
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

                coordinates["lat"] = panoData.location.latLng.lat();
                coordinates["lng"] = panoData.location.latLng.lng();
                panorama.setPosition(panoData.location.latLng);

                map.setStreetView(panorama);
              }
          }
      }
    });

    var mapAndButton = document.getElementById("map-and-button");
    if(mapAndButton.classList.contains("expand")){
      mapAndButton.classList.toggle("expand");
    }

    currentRound++;
    document.getElementById("currentRound").innerHTML = currentRound + " / 5"
    document.getElementById("currentScore").innerHTML = currentScore;

    document.getElementById("guess-button").disabled = true;

    map.addListener('click', function(event) {
      placeMarker(event.latLng);
    });
  }

  /* method to make elements visible through use of "flex" style */
  function toggleElementVisibilityFunctionFlex(id) {
    var x = document.getElementById(id);
    if (x.style.display == "none") {
      x.style.display = "flex";
    } else {
      x.style.display = "none";
    }
  }

  /* method to make elements visible through use of "block" style */
  function toggleElementVisibilityFunctionBlock(id) {
    var x = document.getElementById(id);
    if (x.style.display == "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }

  /* method to toggle clickability of an element*/
  function toggleButtonFunction(id){
    if(document.getElementById(id).disabled == false){
      document.getElementById(id).disabled = true;
    } else {
      document.getElementById(id).disabled = false;
    }
  }

  /* method to calculate distance between 2 google maps markers */
  function haversineDistanceFunction(mk1, mk2) {
    var R = 3958.8; // Radius of the Earth in miles
    var rlat1 = mk1.position.lat() * (Math.PI/180); // Convert degrees to radians
    var rlat2 = mk2.position.lat() * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (mk2.position.lng()-mk1.position.lng()) * (Math.PI/180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
    return Math.round(d);
  }

  /* method to limit the coordinates used to places that have streetview */
  function randomizeLocationFunction(){

    switch(Math.floor(Math.random() * 8)){
      // formula: (max_Lat/Lng - (min_Lat/Lng)) + (min_Lat/Lng)))
      // case 8 is currently excluded. add +1 to add case 8 again. Case 8 reduces the amount of streetviews found
      case 0:
        coordinates["lat"] = parseFloat((Math.random() * (70 - (57)) + (57)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (-124 - (-153)) + (-153)).toFixed(6));
        break;
      case 1:
        coordinates["lat"] = parseFloat((Math.random() * (57 - (7)) + (7)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (-60 - (-153)) + (-153)).toFixed(6));
        break;
      case 2:
        coordinates["lat"] = parseFloat((Math.random() * (3 - (-57)) + (-57)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (-33 - (-85)) + (-85)).toFixed(6));
        break;
      case 3:
        coordinates["lat"] = parseFloat((Math.random() * (75 - (59)) + (59)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (-11 - (-60)) + (-60)).toFixed(6));
        break;
      case 4:
        coordinates["lat"] = parseFloat((Math.random() * (71 - (25)) + (25)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (78 - (-18)) + (-18)).toFixed(6));
        break;
      case 5:
        coordinates["lat"] = parseFloat((Math.random() * (25 - (-36)) + (-36)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (78 - (-18)) + (-18)).toFixed(6));
        break;
      case 6:
        coordinates["lat"] = parseFloat((Math.random() * (60 - (-44)) + (-44)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (165 - (78)) + (78)).toFixed(6));
        break;
      case 7:
        coordinates["lat"] = parseFloat((Math.random() * (23 - (-49)) + (-49)).toFixed(6));
        coordinates["lng"] = parseFloat((Math.random() * (180 - (165)) + (165)).toFixed(6));
        break;
    }
  }

  /* method to remove markers from the map */
  function clearMarkers(){
    for (var i = 0; i < markers.length; i++ ) {
      markers[i].setVisible(false);
    }
    markers = [];
  }

  /* method to remove polylines from the map */
  function clearLines(){
    line.setMap(null);
    markerCoordinates = [];
  }

  /* method to calculate points*/
  function pointsFunction(dist){
    // 5000*((1-0.0007)^x)
    var points = 5000 * Math.pow((1-0.0007),dist);

    points = parseInt(points);
    return points;
  }

  /* method to increase/decrease map size*/
  function expandMap(){
    var mapAndButton = document.getElementById("map-and-button");
    mapAndButton.classList.toggle("expand");
  }

  /* method to show results*/
  function showResults(){

    var endscore = 0;
    for(i = 0; i < 5; i++){
      document.getElementById("score-" + (i+1)).innerHTML= "" + score[i] + " pts";
      document.getElementById("distance-" + (i+1)).innerHTML= "" + distances[i] + " km";
      endscore += score[i];
    }
    document.getElementById("endscore").innerHTML="Total Points: " + endscore + " pts";

    toggleElementVisibilityFunctionFlex("end-page");
    toggleElementVisibilityFunctionFlex("result-popup");
    toggleElementVisibilityFunctionBlock("header-score");
    toggleElementVisibilityFunctionBlock("map-and-button");
    toggleElementVisibilityFunctionFlex("pano");
  }

  /* method to start new game */
  function hideResults(){
    toggleElementVisibilityFunctionFlex("end-page");
    toggleElementVisibilityFunctionFlex("result-popup");
    //toggleElementVisibilityFunctionBlock("header-score");
    toggleElementVisibilityFunctionBlock("map-and-button");
    toggleElementVisibilityFunctionFlex("pano");
  }

  function stopwatch(){
    seconds++;

    if(seconds / 60 === 1) {
      seconds = 0;
      minutes++;

      if(minutes / 60 === 1) {
        minutes = 0;
        hours++;
      }
    }

    if(seconds < 10) {
      displaySeconds = "0" + seconds.toString();
    } else {
      displaySeconds = seconds;
    }

    if(minutes < 10) {
      displayMinutes = "0" + minutes.toString();
    } else {
      displayMinutes = minutes;
    }

    if(hours < 10) {
      displayHours = "0" + hours.toString();
    } else {
      displayHours = hours;
    }

    document.getElementById("header-timer-timer").innerHTML = displayHours + ":" + displayMinutes + ":" + displaySeconds;
  }

  function stopTimer() {
    if(currentRound == 5){
      window.clearInterval(interval)
    }
  }