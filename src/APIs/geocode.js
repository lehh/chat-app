const request = require('request');
const appId = process.env.HERE_ID;
const appCode = process.env.HERE_CODE;

var geocodeAddress = (address) => {
    return new Promise((resolve, reject) => {
        request({
            url: `https://geocoder.api.here.com/6.2/geocode.json?app_id=${appId}&app_code=${appCode}&searchtext=${address}`,
            json: true
        }, (error, response, body) => {
            if (error) {
                reject("Could not connect to geocoder.");
                console.log(error);
            } else if (body.Details) {
                reject(body.Details);
            }
            else if (body.Response.View.length < 1) {
                reject("Address not Found.");                
            } else {
                resolve(body.Response.View[0].Result[0]);
            }
        });
    });
}

module.exports = {
    geocodeAddress
}
