module.exports = function(app) {
  var knex = app.get('knex');

  app.get('/projects', function (req, res) {
    knex('projects').then(function (projects) {
      return res.send(projects);
    });
  });
}
