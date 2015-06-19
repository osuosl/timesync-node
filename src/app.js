//Library requirements
var express = require('express');
var bodyParser = require('body-parser');
var knexBuilder = require('knex');
var knexfile = require('../knexfile');
var db = process.env.DATABASE || 'development';

//Load the database (default to development)
var knex = require('knex')(knexfile[db]);

var app = express();
//app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('knex', knex);

// Set API version prefix
app.set('version', '/v1');

//Load local functions
var routes = require('./routes')(app);
var users = require('./users')(app);
var projects = require('./projects')(app);
var activities = require('./activities')(app);
var checkins = require('./checkins')(app);

app.listen(process.env.PORT || 8000, function () {
    console.log('App now listening on %s', process.env.PORT || 8000);
});
