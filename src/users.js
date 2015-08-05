module.exports = function(app) {
    var knex = app.get('knex');

    app.get(app.get('version') + '/users', function(req, res) {
        knex('users').then(function(users) {
            return res.send(users);
        }).error(function(error) {
            var err = errors.errorServerError(error);
            res.status(err.status).send(err);
        });
    });

    app.post(app.get('version') + '/users/add', function(req, res) {
        knex('users').insert({username: req.body.username})
        .then(function(users) {
            console.log(users);
            return res.redirect(303, app.get('version') + '/users');
        }).error(function(error) {
            var err = errors.errorServerError(error);
            res.status(err.status).send(err);
        });
    });
};
