/**
 * Created by Michael on 11/14/2016.
 */

var express = require('express');
var fs = require('fs');
var https = require('https');
var rootCas = require('ssl-root-cas/latest').create();
rootCas
  .addFile(__dirname + '/certs/server-key.pem')
  .addFile(__dirname + '/certs/server-crt.pem')
  .addFile(__dirname + '/certs/ca_client-crt.pem')
  .addFile(__dirname + '/certs/ca_server-key.pem')
  .addFile(__dirname + '/certs/ca_server-crt.pem')
  .addFile(__dirname + '/certs/ca_client-key.pem')
  .addFile(__dirname + '/certs/snort-crt.pem')
  .addFile(__dirname + '/certs/snort-key.pem')
  ;

require('https').globalAgent.options.ca = rootCas;
require('ssl-root-cas').inject();

 
var bodyParser = require('body-parser'),
    dataArray = {},
    aciveIDs = {},
    time = {};



var useAuth = true;
var app = express();

var options = {
    key: fs.readFileSync('certs/server-key.pem'),
    cert: fs.readFileSync('certs/server-crt.pem'),
    ca: fs.readFileSync('certs/ca_client-crt.pem'),
    //crl: fs.readFileSync('certs/ca-crl.pem'),
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));   

app.use(function (req, res, next) {
    var log = new Date() + ' ' + req.connection.remoteAddress + ' ' + req.method + ' ' + req.url;
    var cert = req.socket.getPeerCertificate();
    if (cert.subject) {
        log += ' ' + cert.subject.CN;
    }
    console.log(log);
    next();
});


if (useAuth) {
    //cert authorization
    
    // app.use(function (req, res, next) {
    //     if (!req.client.authorized) {
    //         return res.status(401).send('User is not authorized');
    //     }
    //     next();
    // });

    options.requestCert = true;
    options.rejectUnauthorized = false;
}

app.use(function (req, res, next) {
    res.writeHead(200);
    // res.end("This is response from the server!\n");
    res.end('last registered tag(s): ' + dataArray + ' time: ' + time); 
    next();
});

app.post('/setData', (req, res) => {
    console.log('POST-request on /setData');
    console.log(req.body);
    console.log('The posted tag from Raspberry Pi');
    console.log(req.body.data);
    console.log('The time when a tag is sended');
    console.log(req.body.time);
    // console.log('number of active tag in this moment on the Pi');
    // console.log(req.body.activetags);
    console.log('Post request gateID');
    console.log(req.body.gateID);
    console.log('Post request IP Address');
    console.log(req.body.ipAddress);
    console.log('Post request Gate MacAddress');
    console.log(req.body.macAddress);
     if (req.body.data !== null || req.body.data !== undefined ) {  dataArray = req.body.data; time = req.body.time , aciveIDs = req.body.activetags }
 //   console.log(dataArray);
    res.end();
});

app.get('/getData', (req, res) => {
    console.log(' GET-request on /getData');
    // res.json(dataArray); req.body.data
  //  console.log(res);
    res.json('the tag(s): ' + dataArray + ' time: ' + time); 
});

var listener = https.createServer(options, app).listen(4433, function () {
    console.log('Express HTTPS server listening on port ' + listener.address().port);
});


// var app = connect().use(connect.static('public')).listen(3000, "0.0.0.0");