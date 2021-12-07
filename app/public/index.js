const ACCESS_TOKEN_KEY = 'spotify-audio-analysis-playback-token';
const ACCESS_TOKEN_EXPIRY_KEY = 'spotify-audio-analysis-playback-token-expires-in';
//get the hash of url so we cant the tokens from it
function parseHash(hash) {
  return hash
    .substring(1)
    .split('&')
    .reduce(function (initial, item) {
      if (item) {
        var parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});
}
//When the document is finshes 
document.addEventListener('DOMContentLoaded', () => { //Whent the page is finshed parsing/after login activate this listener/switch to analysish.tmlt.
  if (localStorage.getItem(ACCESS_TOKEN_KEY) &&
      parseInt(parseInt(localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY))) > Date.now()) {
    window.location = "/analysis.html";
  } else {
    if(window.location.hash) {
      const hash = parseHash(window.location.hash);
      if (hash['access_token'] && hash['expires_in']) {
        localStorage.setItem(ACCESS_TOKEN_KEY, hash['access_token']);
        localStorage.setItem(ACCESS_TOKEN_EXPIRY_KEY, Date.now() + 990 * parseInt(hash['expires_in']));
        window.location = "/analysis.html";
      }
    } 
    //on login try to login into the spotify api and get the url information fomr the api
    document.getElementById('login').addEventListener('click', function(e) {
      e.preventDefault();
      fetch('/spotifyRedirectUri')
      .then(e => e.json())
      .then(data => {
        window.location = data.redirectUri;
      })
      .catch(error => { alert("Failed to prepare for Spotify Authentication")});
    });
  }
})