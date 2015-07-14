//Library requirements
var express = require('express');
var bodyParser = require('body-parser');
var knexfile = require('../knexfile');
var db = process.env.DATABASE || 'development';

//Load the database (default to development)
var knex = require('knex')(knexfile[db]);

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('knex', knex);

// Set API version prefix
app.set('version', '/v1');

//Load local functions
require('./routes')(app);
require('./users')(app);
require('./projects')(app);
require('./activities')(app);
require('./times')(app);

app.listen(process.env.PORT || 8000, function() {
    console.log('App now listening on %s', process.env.PORT || 8000);
});
