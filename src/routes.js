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
    knex('users').insert(req.body).then(function (user) {
      console.log(user);
      knex('users').where(req.body).then(function (user_retrieved) {
        return res.send(user_retrieved);
      });
    }).catch(function (error) {
      res.send(error);
    });
  });

  app.post('/checkins/add', function (req, res) {
    knex('checkins').insert(req.body).then(function (checkin) {
      console.log(checkin);
      knex('checkins').where(req.body).then(function (checkin_retrieved) {
        return res.send(checkin_retrieved);
      });
    }).catch(function (error) {
      res.send(error);
    });
  });

  app.post('/activities/add', function (req, res) {
    knex('activities').insert(req.body).then(function (activity) {
      knex('activities').where(req.body).then(function (activity) {
        return res.send(activity);
      });
    }).catch(function (error) {
      res.send(error);
    });
  });


  app.post('/projects/add', function (req, res) {
    knex('projects').insert(req.body).then(function (project) {
      console.log(project);
      knex('projects').where(req.body).then(function (project_retrieved) {
        return res.send(project_retrieved);
      });
    }).catch(function (error) {
      res.send(error);
    });
  });


}
