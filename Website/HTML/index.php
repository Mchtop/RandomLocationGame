<!DOCTYPE html>
<html lang="en">
<title>RandomLocationGame</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<head>
  <link rel="stylesheet" type="text/css" href="../CSS/test.css">
</head>
<body>
  <header>
    <div id="header-score">
      <table id="header-score-table">
        <tr>
          <th id="round">Round</th>
          <th>Score</th>
        </tr>
        <tr>
          <th id="round">0 / 5</th>
          <th>999</th>
        </tr>
      </table>
    </div>
  </header>
  <div class="result-popup-window">
    <div id="result-popup">
      <span id="result-text"></span>
      <span id="result-score">You gained X Points</span>
      <input type="button" id="next-game-button" onClick="" value="Next Game"/>
    </div>
  </div>

  <script src="../JS/test.js"></script>
  <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCaHZk4ZNggKV1Y8Dn80h3XkYbl6XAOmKw&callback=initialize"></script>
  <div class="map-and-button">
    <div id="map">
    </div>
    <input type="button" id="expand-button" onclick="expandFunction()" value="EXPAND"/>
    <input type="button" id="guess-button" onclick="guessFunction()" value="GUESS"/>
  </div>
  <div id="pano"></div>
</body>
