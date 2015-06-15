module.exports = function(app) {
  var knex = app.get('knex');

  app.get(app.get('version') + '/projects', function (req, res) {
    knex('projects').then(function (projects) {
      var count = 0;
      projects.forEach(function(project) {
        knex('projectslugs').where({'project': project.id}).select('name').then(function(slugs) {
          project.slugs = [];
          slugs.forEach(function(slug) {
            project.slugs.push(slug.name);
          });
          count++;
          if (count == projects.length) {
            return res.send(projects);
          }
        });
      });
    });
  });

  app.get(app.get('version') + '/projects/:id', function (req, res) {
    knex('projects').where({'id': req.params.id}).then(function (project_list) {
      knex('projectslugs').where({'project': req.params.id}).select('name').then(function(slugs) {
          project = project_list[0];
          project.slugs = [];
          slugs.forEach(function(slug) {
            project.slugs.push(slug.name);
          });
          return res.send(project);
      });
    });
  });
}
