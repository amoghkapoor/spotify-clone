require('dotenv').config()
const express = require("express")
const cors = require("cors")
const SpotifyWebApi = require("spotify-web-api-node")

const app = express()
app.use(cors())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static("../client/build"))
}

const PORT = process.env.PORT || 3001

app.listen(PORT, () => { console.log(`server is running on port ${PORT}`) });

app.post('/', function (req, res) {
    res.status(200)
});

app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken
    var spotifyApi = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/profile',
        refreshToken
    });
    spotifyApi.refreshAccessToken()
        .then(data => {
            res.json({
                accessToken: data.body.access_token,
                expiresIn: data.body.expires_in,
            })
            spotifyApi.setAccessToken(data.body['access_token']);
        })
        .catch(err => console.error("Refresh Access Token", err))
})

app.post("/login", (req, res) => {
    var code = req.body.code
    var spotifyApi = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: 'http://localhost:3000/profile'
    });
    spotifyApi.authorizationCodeGrant(code)
        .then((data) => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            })
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
        })
        .catch(err => {
            res.sendStatus(400)
            console.error("Code Grant Authorization Error", err);
        })
})