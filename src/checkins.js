module.exports = function(app) {
  var knex = app.get('knex');

  app.get('/checkins', function (req, res) {
    knex('checkins').then(function (checkins) {
      return res.send(checkins);
    });
  });
}
