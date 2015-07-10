module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');

    app.get(app.get('version') + '/activities', function(req, res) {

        knex('activities').then(function(activities) {
            if (activities.length === 0) {
                return res.send([]);
            }

            return res.send(activities);

        }).error(function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });
    });

    app.get(app.get('version') + '/activities/:slug', function(req, res) {

        if (!errors.checkValidSlug(req.params.slug)) {
            var err = errors.errorInvalidIdentifier('slug', req.params.slug);
            return res.status(err.status).send(err);
        }

        knex('activities').select().where('slug', '=', req.params.slug)
        .then(function(activity) {
            if (activity.length === 0) {
                var err = errors.errorObjectNotFound('activity');
                return res.status(err.status).send(err);
            }

            return res.send(activity[0]);
        });

    });
};
