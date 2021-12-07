//init alot of the varitbles need to run the spotify atty
var player;
const ACCESS_TOKEN_KEY = 'spotify-audio-analysis-playback-token';
const ACCESS_TOKEN_EXPIRY_KEY = 'spotify-audio-analysis-playback-token-expires-in';
const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
if(!accessToken || parseInt(localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY)) < Date.now()) {
  window.location = '/';
}
let deviceId = '';
//let intervalID;
let crowdImg, ctxImg, base_image, imgData;
let alphaSwitch = false;
let alphaValue = 0.0;

//Sets up are two canvas for draw are art on it
function drawAnalysis(data) {
  //List the data into a p htlm by id
  const JSONData = document.getElementById("JSONDATA");
  JSONData.innerHTML = JSON.stringify(data);  
  const featuresChart = document.getElementById("features-chart");
  featuresChart.style.width = featuresChart.offsetWidth;
  featuresChart.width = featuresChart.offsetWidth * 2;
  featuresChart.style.height = featuresChart.offsetHeight;
  featuresChart.height = featuresChart.offsetHeight * 2;
  const width = featuresChart.width;
  const height = featuresChart.height;
  //All the just to set up the width and height of the canvas needed
  const ctx = featuresChart.getContext("2d");
  //all the varibles that we get acess for
  var danceability = 0,
    key = [],
    loudness = 0,
    valence = 0,
    tempo = 0,
    mode = 0,
    energy = 0,
    speechiness = 0,
    acousticness = 0,
    instrumentalness = 0,
    liveness = 0;
  var p1 = data; //.body;//audio_feature;
  danceability = p1.danceability; //used
  loudness = p1.loudness; //used
  valence = p1.valence; //used
  tempo = p1.tempo; //used
  mode = p1.mode;
  energy = p1.energy; //used
  speechiness = p1.speechiness;
  acousticness = p1.acousticness;
  instrumentalness = p1.instrumentalness;
  liveness = p1.liveness;
  //set the color of the lines based of the energy levels or how acousticness the song is
  var LineColor1 = Math.floor(energy * 16777215).toString(16);
  var LineColor2 = Math.floor(acousticness * 16777215).toString(16);
  
    
  const descData = document.getElementById("Desc");
  descData.innerHTML = " The Top line is created with Valence: " + valence + " loudness: " + loudness + " and the color from energy: " + energy + "."
                     + " The bottom line is created with danceability: " + danceability + " tempo: " + tempo + "and the color from acousticness: " + acousticness + "."
                     + " The crowd shows up if the liveness: " + liveness + " is over .45."
  
  
  
  //Set up the charaacters for the first line
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#" + LineColor2;
  ctx.fillStyle = "#" + LineColor2;
  ctx.beginPath();
  ctx.lineTo(0, height);
  var currentHeight = height / 3;
  //draws the squily line up and down based of the valance and loudness
  for (var i = 0; i <= width; i++) {
    currentHeight += (valence * loudness * (Math.random() < 0.5 ? -1 : 1)) / 10;
    ctx.lineTo(i, currentHeight);
  }
  ctx.lineTo(width, height);
  ctx.stroke();
  ctx.fill();

  ctx.strokeStyle = "#" + LineColor1;
  ctx.fillStyle = "#" + LineColor1;
  ctx.beginPath();
  ctx.lineTo(0, height);
  var currentHeight = height / 2;
    //draws the squily line up and down based of the danceabilty and temp

  for (var i = 0; i <= width; i++) {
    currentHeight +=
      (danceability * tempo * (Math.random() < 0.5 ? -1 : 1)) / 20;
    ctx.lineTo(i, currentHeight);
  }
  ctx.lineTo(width, height);
  ctx.stroke();
  ctx.fill();
  //get the canvas for the crowd
  crowdImg = document.getElementById("crowd-img");
  crowdImg.style.width = crowdImg.offsetWidth;
  crowdImg.width = crowdImg.offsetWidth * 2;
  crowdImg.style.height = crowdImg.offsetHeight;
  crowdImg.height = crowdImg.offsetHeight * 2;
  ctxImg = crowdImg.getContext("2d");
  //if a crowd is in the audio start animation of crowd
  if (liveness > 0.45) {
    //Should there be a crowd
    base_image = new Image();
    base_image.src =
      "https://cdn.glitch.me/09b02d99-cb68-456e-bd05-59c28521e6d0%2FCrowd.png?v=1638552647316";
    base_image.onload = function() {
      animateFade(base_image);
    };
  }
}
//animates the crowd shake and the fading in and out
function animateFade(base_image) {
  requestAnimationFrame(animateFade);
  base_image = new Image();
  base_image.src =
    "https://cdn.glitch.me/09b02d99-cb68-456e-bd05-59c28521e6d0%2FCrowd.png?v=1638552647316";
  ctxImg.clearRect(0, 0, crowdImg.width, crowdImg.height);
  ctxImg.save();
  var dx = Math.random() * 30;
  var dy = Math.random() * 30;
  ctxImg.translate(dx, dy);
  ctxImg.drawImage(base_image, 0, 175);
  ctxImg.restore();
  ctxImg.globalAlpha = alphaValue;
  if (alphaSwitch) {
    alphaValue += 0.002;
  } else {
    alphaValue -= 0.002;
  }
  if (alphaValue > 1.0 || alphaValue < 0) {
    alphaSwitch = !alphaSwitch;
  }
}

function getAnalysis(id) {
  let query = "/features?id=" + id;
  return fetch(query)
    .then(e => e.json())
    .then(data => {
      drawAnalysis(data);
      fetch(
        `https://api.spotify.com/v1/me/player/play${deviceId &&
          `?device_id=${deviceId}`}`,
        {
          method: "PUT",
          body: JSON.stringify({ uris: [`spotify:track:${id}`] }),
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      ).catch(e => console.error(e));
    });
}

//allows for playing of music when the song is slected
function onSpotifyPlayerAPIReady() {
  player = new Spotify.Player({
    name: 'Audio Analysis Player',
    getOauthToken: function (callback) { callback(accessToken); },
    volume: 0.8
  });
  
  // Ready
  player.on('ready', function (data) {
    deviceId = data.device_id;
    setTimeout(() => {
      fetch('https://api.spotify.com/v1/me/player', {
        method: "PUT",
        body: JSON.stringify({
          device_ids:[
            data.device_id
          ],
          play: false
        }),
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).catch(e => console.error(e));
    }, 100);
  });
  // Connect to the player!
  player.connect();
}
//when the document finshed parsing allow for searching of tracks then populate them
document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('input');
  document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    const searchQuery = '/search?query=' + (query => !query ? "cut to the feeling" : query)(input.value);
    fetch(searchQuery).then(e => e.json()).then(data => {
      document.getElementById('results').innerHTML = data.tracks.items
        .map(track => `<li class="text-salmon" onClick="getAnalysis(&apos;${ track.id }&apos;)">${track.name} - ${track.artists[0].name}</li>`)
        .join('\n');
    }).catch(error => {
      document.getElementById('results').innerHTML = error;
    });
        
  });
  
});

