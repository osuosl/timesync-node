module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');

    app.get(app.get('version') + '/activities', function(req, res) {

        knex('activities').then(function(activities) {
            /* istanbul ignore if */
            if (activities.length === 0) {
                return res.send([]);
            }

            return res.send(activities);

        }).catch(/* istanbul ignore next */ function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });
    });

    app.get(app.get('version') + '/activities/:slug', function(req, res) {

        if (errors.isInvalidSlug(req.params.slug)) {
            var err = errors.errorInvalidIdentifier('slug', req.params.slug);
            return res.status(err.status).send(err);
        }

        // get matching activity
        knex('activities').select().where('slug', '=', req.params.slug)
        .then(function(activity) {
            if (activity.length === 0) {
                var err = errors.errorObjectNotFound('activity');
                return res.status(err.status).send(err);
            }

            return res.send(activity[0]);

        }).catch(/* istanbul ignore next */ function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });

    });
};
