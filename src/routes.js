module.exports = function(app) {
  var knex = app.get('knex');

  app.get(app.get('version') + '/', function (req, res) {
    res.send('hello javascript');
  });

  app.post(app.get('version') + '/', function (req, res) {
    res.send('hello javascript');
  });
}
