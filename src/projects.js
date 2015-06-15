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
}
