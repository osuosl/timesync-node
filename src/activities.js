'use strict';

module.exports = function(app) {
  const knex = app.get('knex');
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const passport = require('passport');

  app.get(app.get('version') + '/activities', function(req, res) {
    knex('activities').then(function(activities) {
      if (activities.length === 0) {
        return res.send([]);
      }

      return res.send(activities);
    }).catch(function(error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  app.get(app.get('version') + '/activities/:slug', function(req, res) {
    if (errors.isInvalidSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    // get matching activity
    knex('activities').select().where('slug', '=', req.params.slug)
    .then(function(activity) {
      if (activity.length === 0) {
        const err = errors.errorObjectNotFound('activity');
        return res.status(err.status).send(err);
      }

      return res.send(activity[0]);
    }).catch(function(error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  app.delete(app.get('version') + '/activities/:slug', function(req, res) {
    if (!helpers.validateSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    const activityId = knex('activities').select('id')
    .where('slug', req.params.slug);

    // Check timesactivities to see if an activity (id) is being referenced
    knex('timesactivities').select('id').where('id', '=', activityId)
    .then(function(activity) {
      /* If the length of the activity array is greater than 0, then
      the activity id is being referenced by timesactivities */
      if (activity.length > 0) {
        res.set('Allow', 'GET, POST');
        const err = errors.errorRequestFailure('activity');
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

        const err = errors.errorObjectNotFound('slug', req.params.slug);
        return res.status(err.status).send(err);
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
  });

    app.post(app.get('version') + '/activities/:slug',
    function(req, res, next) {
        passport.authenticate('local', function(autherr, user, info) {
            if (!user) {
                let err = errors.errorAuthenticationFailure(info.message);
                return res.status(err.status).send(err);
            }

            let obj = req.body.object;

            let validKeys = ['name', 'slug']
            for (let key in obj) {
                if (validKeys.indexOf(key) === -1) {
                    let err = errors.errorBadObjectUnknownField(
                        'activity', key);
                    return res.status(err.status).send(err);
                }
            }

            let fields = [
                {name: 'name', type: 'string', required: false},
                {name: 'slug', type: 'string', required: false},
            ];

            // Rebase later
            let validationFailure = helpers.validateFields(obj, fields);
            if (validationFailure) {
                let err = errors.errorBadObjectInvalidField(
                    'activity',
                    validationFailure.name,
                    validationFailure.type,
                    validationFailure.actualType
                );
                return res.status(err.status).send(err);
            }
        });
    });
  });

};
