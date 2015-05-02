module.exports = function(app) {
  var knex = app.get('knex');
  app.get(app.get('version') + '/users', function (req, res) {
    knex('users').then(function (users) {
      return res.send(users);
    });
  });

  app.post('/users/add', function (req, res) {
    knex('users').insert( {username: req.body.username}).then(function (users) {
      console.log(users);
    });
  });
}
