module.exports = function(app) {
  var knex = app.get('knex');
  var errors = require('./errors');

  app.get(app.get('version') + '/projects', function (req, res) {
    knex('projects').then(function (projects) {
      var count = 0;
      if (projects.length === 0) {
        return res.send([]);
      }
      projects.forEach(function(project) {
        knex('projectslugs').where({'project': project.id}).select('name').then(function(slugs) {
          project.slugs = [];
          slugs.forEach(function(slug) {
            project.slugs.push(slug.name);
          });
          knex('users').where({'id': project.owner}).select('username').then(function(user) {
            project.owner = user[0].username;
            count++;
            if (count == projects.length) {
              return res.send(projects);
            }
          });
        });
      });
    });
  });

  app.get(app.get('version') + '/projects/:slug', function (req, res) {
    knex('projectslugs').where({'name': req.params.slug}).then(function(project_slug) {
      if(project_slug.length !== 0) {
        knex('projects').where({'id': project_slug[0].project}).then(function (project_list) {
          knex('projectslugs').where({'project': project_slug[0].project}).select('name').then(function(slugs) {
            project = project_list[0];
            project.slugs = [];
            slugs.forEach(function(slug) {
              project.slugs.push(slug.name);
            });
            knex('users').where({'id': project.owner}).select('username').then(function(user) {
              project.owner = user[0].username;
              return res.send(project);
            });
          });
        });
      } else {
        return res.status(404).send(
          errors.errorInvalidSlug(req.params.slug + " is not a valid project slug."));
      }
    });
  });
};
