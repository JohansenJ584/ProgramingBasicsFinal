// server.js
//init all the librarys
var qs = require('querystring');
var express = require('express');
var app = express();
var SpotifyWebApi = require('spotify-web-api-node');

//Creates a spotify api with clientID Client Sceret.
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,//           'e50e62cd99d54658ac709ddc2eb99e65',
  clientSecret : process.env.CLIENT_SECRET,//'eb27b295193d46408c7c3f945678ac1d',
});
//all the things that we are requesting from spotify apit
const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];

//The spotify api redirects url information
const redirectUriParameters = {
  client_id: process.env.CLIENT_ID,
  response_type: 'token',
  scope: scopes,
  redirect_uri: encodeURI('https://good-confusion-spotify.glitch.me/'),
  show_dialog: true,
}
//the actuily refirect url for the spotify api project.
const redirectUri = `https://accounts.spotify.com/authorize?${qs.stringify(redirectUriParameters)}`;

//Uses the token and secert token to gain acess to you spotify thought the log in and get that user spacefic user acess token
function authenticate(callback) {
  spotifyApi.clientCredentialsGrant()
    .then(function(data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);  
      callback instanceof Function && callback();
      spotifyApi.setAccessToken(data.body['access_token']);
    }, function(err) {
      console.log('Something went wrong when retrieving an access token', err.message);
    });
}
authenticate();

//Express to the app what directory of static files it has acess too.
app.use(express.static('public'));
//if fetch is called on a /search* call this function with request and the send back the respnese.
app.get("/search", function (request, response) {
  reAuthenticateOnFailure((failure) => {
    spotifyApi.searchTracks(request.query.query, { limit: 4 }) //Change this for the amount of recmend songs from the search
    .then(function(data) { response.send(data.body); }, failure);
  })
});
//try again to authercate with acess_token
const reAuthenticateOnFailure = (action) => {
  action(() => {
    authenticate(action);
  })
}
//Send the user to the redirect adress
app.get("/spotifyRedirectUri", function (request, response) {
  response.send(JSON.stringify({ redirectUri }, null, 0))});

//get the feature or characters of searched song.
app.get("/features", function (request, response) {
  reAuthenticateOnFailure((failure) => {
    spotifyApi.getAudioFeaturesForTrack(request.query.id)
    .then(function(data) { response.send(data.body); }, failure);
  })
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
