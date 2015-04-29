var express = require('express');
var bodyParser = require('body-parser')
var knexBuilder = require('knex');

var knex = knexBuilder({
  client: process.env.CLIENT || 'sqlite3',
  connection: process.env.DATABASE_URL || { filename: 'dev.sqlite3' }
});

var app = express();
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('knex', knex);

//var routes = require('./routes')(app);

app.get('/', function (req, res) {
  res.send('hello javascript');
});

app.post('/', function (req, res) {
  console.log(req.body.test);
  res.send('hello javascript');
});

app.post('/users/add', function (req, res) {
  var user = this.knex('users').insert( {username: req.body.username});
  console.log(user);
});


app.listen(process.env.PORT || 8000, function () {
  console.log('App now listening on %s', process.env.Port || 8000);
});
