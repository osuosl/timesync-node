module.exports = function(app) {
  var knex = app.get('knex');

  app.get('/', function (req, res) {
    res.send('hello javascript');
  });

  app.post('/', function (req, res) {
    res.send('hello javascript');
  });
}
