const path = require('path');
const express = require('express');
const { geocodeAddress } = require('./APIs/geocode');

const app = express();

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

app.get('/address/:position', (req, res) => {
    let position = req.params.position;
    geocodeAddress(position)
    .then((address) => {
        res.send(address);
    }).catch((error)=>{
        res.status(500);
        res.send(error);
    });
});

module.exports = app;