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

    app.delete(app.get('version') + '/activities/:slug', function(req, res) {
        if (!helpers.validateSlug(req.params.slug)) {
            let err = errors.errorInvalidIdentifier('slug', req.params.slug);
            return res.status(err.status).send(err);
        }

        let activityId = knex('activities').select('id')
        .where('slug', req.params.slug);

        // Check timesactivities to see if an activity (id) is being referenced
        knex('timesactivities').select('id').where('id', '=', activityId)
        .then(function(activity) {
            /* If the length of the activity array is greater than 0, then
               the activity id is being referenced by timesactivities */
            if (activity.length > 0) {
                res.set('Allow', 'GET, POST');
                let err = errors.errorRequestFailure('activity');
                return res.status(err.status).send(err);
            }

            // delete activity after running through the checks
            knex('activities').where('slug', req.params.slug).del()
            .then(function(numObj) {
                /* When deleting something from the table, the number of
                   objects deleted is returned. So to confirm that deletion was
                   successful, make sure that the number returned is at least
                   one. */
                if (numObj >= 1) {
                    return res.send();
                }

                let err = errors.errorObjectNotFound('slug', req.params.slug);
                return res.status(err.status).send(err);
            }).catch(function(error) {
                let err = errors.errorServerError(error);
                return res.status(err.status).send(err);
            });
        });
    });
};
