module.exports = function(app) {
  var knex = app.get('knex');
  var errors = require('./errors');
  var Promise = require('bluebird');

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

  // TODO: add docs specifying you need to specify the Content-Type: application/json
  // header when using the API
  app.post(app.get('version') + '/projects/add', function (req, res) {
    var count = 0, user = null, projectslug_count = 0, error = false;
    var project = JSON.parse(JSON.stringify(req.body));
    delete project.slugs;
    delete project.owner;
    knex('users').where({'username': req.body.owner}).then(function(userlist) {
      if(userlist.length === 0 && error === false) {
        error = true;
        return res.status(400).send(
          errors.errorInvalidSlug(req.body.owner + " is not a valid username"));
      } else {
        project.owner = userlist[0].id;
      }
      if(projectslug_count == req.body.slugs.length && project.owner) {
          saveProject(project, req.body.slugs).then(function(saved) {
            res.redirect('/v1/projects/' + saved);
          });
      }
    });
    req.body.slugs.forEach(function(slug) {
      knex('projectslugs').where({'name': slug}).then(function(projectslug) {
        if(projectslug.length !== 0 && error === false) {
          error = true;
          return res.status(400).send(
            errors.errorExistingSlug("slug " + slug + " is already in use"));
        } else {
        projectslug_count++;
        }
        if(projectslug_count == req.body.slugs.length && project.owner) {
          saveProject(project, req.body.slugs).then(function(saved) {
            res.redirect('/v1/projects/' + saved);
          });
        }
      });
    });
  });

  var saveProject = function(project, slugs) {
    var promise = new Promise(function(resolve, reject) {
      knex('projects').insert(project).then(function(proj) {
        slugs.forEach(function(slug, index) {
          knex('projectslugs').insert({name: slug, project: proj[0]}).then(function(ps) {
            if(index === slugs.length - 1) { // todo this won't work
              resolve(slug); // return slug to redirect user to its projects endpoint
            }
          });
        });
      });
    });
    return promise;
  };
};


