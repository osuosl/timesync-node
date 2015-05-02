module.exports = function(app) {
  var knex = app.get('knex');

  app.get(app.get('version') + '/activities', function (req, res) {
    knex('activities').then(function (activities) {
      return res.send(activities);
    });
  });
}
