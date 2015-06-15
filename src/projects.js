module.exports = function(app) {
  var knex = app.get('knex');

  app.get(app.get('version') + '/projects', function (req, res) {
    knex('projects').then(function (projects) {
      var count = 0;
      projects.forEach(function(project) {
        knex('slugs').where({'project': project.id}).select('slug').then(function(slugs) {
          project.slugs = [];
          slugs.forEach(function(slug) {
            project.slugs.push(slug.slug);
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
      knex('slugs').where({'project': req.params.id}).select('slug').then(function(slugs) {
          project = project_list[0];
          project.slugs = [];
          slugs.forEach(function(slug) {
            project.slugs.push(slug.slug);
          });
          return res.send(project);
      });
    });
  });
}
