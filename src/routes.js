module.exports = function(app) {
  var knex = app.get('knex');

  app.get('/', function (req, res) {
    res.send('hello javascript');
  });

  app.post('/', function (req, res) {
    res.send('hello javascript');
  });

  app.get('/users', function (req, res) {
    knex('users').then(function (users) {
      return res.send(users);
    });
  });

  app.get('/projects', function (req, res) {
    knex('projects').then(function (projects) {
      return res.send(projects);
    });
  });

  app.get('/activities', function (req, res) {
    knex('activities').then(function (activities) {
      return res.send(activities);
    });
  });

  app.get('/checkins', function (req, res) {
    knex('checkins').then(function (checkins) {
      return res.send(checkins);
    });
  });

  app.post('/users/add', function (req, res) {
    knex('users').insert( {username: req.body.username}).then(function (users) {
      console.log(users);
    });
  });
}
