module.exports = function(app) {
  var knex = app.get('knex');

  app.get(app.get('version') + '/projects', function (req, res) {
    knex('projects').then(function (projects) {
      return res.send(projects);
    });
  });
}
