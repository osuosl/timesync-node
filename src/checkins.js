module.exports = function(app) {
  var knex = app.get('knex');
  var errors = require('./errors');

  app.get(app.get('version') + '/times', function (req, res) {
    knex('times').then(function (times) {
      if (times.length === 0) {
        return res.send([]);
      }
      var activity_count = 0, project_count = 0, count = 0;
      times.forEach(function(time) {
        knex('users').where({'id': time.user}).select('username').then(function(user) {
          time.user = user[0].username;
        });
        knex('activityslugs').where({'activity': time.activity}).select('name').then(function(slugs) {
          time.activity = [];
          slugs.forEach(function(slug) {
            time.activity.push(slug.name);
          });
          activity_count++;
          if (project_count == activity_count == times.length) {
            return res.send(times);
          }
        });
        knex('projectslugs').where({'project': time.project}).select('name').then(function(slugs) {
          time.project = [];
          slugs.forEach(function(slug) {
            time.project.push(slug.name);
          });
          project_count++;
          if (project_count == activity_count == times.length) {
            return res.send(times);
          }
        });
      });
    });
  });

  app.get(app.get('version') + '/times/:id', function (req, res) {
    knex('times').where({'id': req.params.id}).then(function (time_list) {
      if(time_list.length !== 0) {
        time = time_list[0];
        var count = 0;
        knex('users').where({'id': time.user}).select('username').then(function(user) {
          time.user = user[0].username;
        });
        knex('activityslugs').where({'activity': time.activity}).select('name').then(function(slugs) {
          time.activity = [];
          slugs.forEach(function(slug) {
            time.activity.push(slug.name);
          });
          count++;
          if (count === 2) {
            return res.send(time);
          }
        });
        knex('projectslugs').where({'project': time.project}).select('name').then(function(slugs) {
          time.project = [];
          slugs.forEach(function(slug) {
            time.project.push(slug.name);
          });
          count++;
          if (count === 2) {
            return res.send(time);
          }
        });
      } else {
        return res.status(404).send(
          errors.errorObjectNotFound("time"));
      }

    });
  });
};
