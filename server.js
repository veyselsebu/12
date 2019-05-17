var express = require('express');
var app = express();
const sampleClient = require("./app/controllers/sampleclient");
var bodyParser = require('body-parser')

const cors = require('cors')
const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
 
global.__basedir = __dirname;
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
let router = require('./app/routers/file.router.js');
app.use('/', router);


// Create a Server
let server = app.listen(8000, () => {

  let host = server.address().address
  let port = server.address().port
  console.log("App listening at http://%s:%s", host, port); 
})

