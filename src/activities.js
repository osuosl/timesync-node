'use strict';

module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');
    var helpers = require('./helpers')(app);

    app.get(app.get('version') + '/activities', function(req, res) {

        knex('activities').then(function(activities) {
            if (activities.length === 0) {
                return res.send([]);
            }

            return res.send(activities);

        }).catch(function(error) {
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

        }).catch(function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });

    });

    // DELETE implementation starts here -- delete this comment later

    app.delete(app.get('version') + '/activities/:slug', function(req, res) {
        if (!helpers.validateSlug(req.params.slug)) {
            var err = errors.errorInvalidIdentifier('slug', req.params.slug);
            return res.status(err.status).send(err);
        }

        // delete matching activity
        knex('activities').where('slug', req.params.slug).del()
        .then(function(numObj) {
            // if the number of objects deleted is at least one
            if (numObj >= 1) {
                return res.send();
            }

            var err = errors.errorObjectNotFound('slug', req.params.slug);
            return res.status(err.status).send(err);
        }).catch(function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });
    });
};
