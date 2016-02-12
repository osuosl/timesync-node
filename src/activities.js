'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const authRequest = require('./authenticatedRequest');
  const uuid = require('uuid');
  const log = app.get('log');

  function constructActivity(inActivity, res) {
    if (!inActivity) {
      const err = errors.errorObjectNotFound('activity');
      res.status(err.status);
      return err;
    }

    const outActivity = {
      name: inActivity.name,
      slug: inActivity.slug,
      uuid: inActivity.uuid,
      revision: inActivity.revision,
    };

    const fields = ['created_at', 'deleted_at', 'updated_at'];

    fields.forEach(function(f) {
      if (inActivity[f]) {
        outActivity[f] = new Date(parseInt(inActivity[f], 10)).toISOString()
                                                              .substring(0, 10);
      } else {
        outActivity[f] = null;
      }
    });

    return outActivity;
  }

  authRequest.get(app, app.get('version') + '/activities',
  function(req, res) {
    const knex = app.get('knex');
    let activitiesQ;

    /* Only query for activities that have not been soft-deleted
     * If the include_deleted param is true, query for all activities
     * regardless of 'deleted' status */
    if (req.query.include_deleted === 'true' ||
        req.query.include_deleted === '') {
      activitiesQ = knex('activities');
    } else {
      activitiesQ = knex('activities').where({deleted_at: null});
    }

    // Include revisions parameter was passed
    if (req.query.include_revisions === 'true' ||
        req.query.include_revisions === '') {
      // The activitiesQ query is all we need, no further filtering
      activitiesQ.then(function(activities) {
        if (activities.length === 0) {
          return res.send([]);
        }
        // Send all activities fitlered on the 'newest' field
        return res.send(activities.filter(function(a) {
          return a.newest;
        // Map the 'constructActivity' function to each activity
        }).map(function(a) {
          const child = constructActivity(a, res);
          // Set the child's parent field to a similar map,
          // filter on them having the same uuid and different revisions
          child.parents = activities.filter(function(p) {
            return a.uuid === p.uuid && a.revision !== p.revision;
          }).map(function(p) {
            return constructActivity(p, res);
          });
          return child;
        }));
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    // Include revisions parameter was not included
    } else {
      // Add the 'newest === true' filter to the db query
      activitiesQ.where({newest: true}).then(function(activities) {
        if (activities.length === 0) {
          return res.send([]);
        }
        // Send the processed objects, pretty straight forward.
        return res.send(activities.map(function(activity) {
          return constructActivity(activity, res);
        }));
      }).catch(function(error) {
        log.error(req, 'Error requesting activities: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }
  });

  authRequest.get(app, app.get('version') + '/activities/:slug',
  function(req, res) {
    const knex = app.get('knex');
    if (errors.isInvalidSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    const activityQ = knex('activities').where({slug: req.params.slug})
                    .orderBy('revision', 'desc');

    // Include revisions parameter was passed
    if (req.query.include_revisions === 'true' ||
        req.query.include_revisions === '') {
      // The activitiesQ query is all we need, no further filtering
      activityQ.then(function(activity) {
        // Send the newest activity
        return res.send(activity.filter(function(a) {
          return a.newest;
        }).map(function(a) {
          const child = constructActivity(a, res);
          // With the parents field filled out (or equal to [])
          child.parents = activity.filter(function(p) {
            return p.revision !== a.revision;
          }).map(function(p) {
            return constructActivity(p, res);
          });
          return child;
        // Return the frist element since this is a 1 element array
        }).pop());
      }).catch(function(error) {
        log.error(req, 'Error requesting activity by slug: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    } else {
      activityQ.where({newest: true}).first().then(function(activity) {
        return res.send(constructActivity(activity, res));
      }).catch(function(error) {
        log.error(req, 'Error requesting activity by slug: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }
  });

  authRequest.delete(app, app.get('version') + '/activities/:slug',
  function(req, res) {
    const knex = app.get('knex');
    if (!helpers.validateSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    knex('activities').select('id', 'name').where('slug', req.params.slug)
    .first().then(function(activity) {
      if (!activity) {
        const err = errors.errorObjectNotFound('slug', req.params.slug);
        return res.status(err.status).send(err);
      }

      knex('timesactivities').select('id').where('activity', activity.id)
      .then(function(tas) {
        /* If the length of the array is greater than 0, then the activity id
        is being referenced by timesactivities */
        if (tas.length > 0) {
          res.set('Allow', 'GET, POST');
          const err = errors.errorRequestFailure('activity');
          return res.status(err.status).send(err);
        }

        knex.transaction(function(trx) {
          // delete activity after running through the checks
          trx('activities').where('slug', req.params.slug)
          .update({'deleted_at': Date.now(), 'slug': null})
          .then(function() {
            trx.commit();
            return res.send();
          }).catch(function(error) {
            log.error(req, 'Error deleting activity: ' + error);
            trx.rollback();
          });
        }).catch(function(error) {
          log.error(req, 'Rolling back transaction.');
          const err = errors.errorServerError(error);
          return res.status(err.status).send(err);
        });
      }).catch(function(error) {
        log.error(req, 'Error selecting times from activity: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }).catch(function(error) {
      log.error(req, 'Error requesting activity to delete: ' + error);
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  authRequest.post(app, app.get('version') + '/activities/:slug',
  function(req, res) {
    const knex = app.get('knex');
    const currObj = req.body.object;

    const validKeys = ['name', 'slug'];

    /* eslint-disable prefer-const */
    for (let key in currObj) {
    /* eslint-enable prefer-const */

    // indexOf returns -1 if the parameter it not in the array
    // so this will return true if the slug/name DNE
      if (validKeys.indexOf(key) === -1) {
        const err = errors.errorBadObjectUnknownField('activity', key);
        return res.status(err.status).send(err);
      }
    }

    const fields = [
      {name: 'name', type: 'string', required: false},
      {name: 'slug', type: 'string', required: false},
    ];

    const validationFailure = helpers.validateFields(currObj, fields);
    if (validationFailure) {
      const err = errors.errorBadObjectInvalidField(
        'activity',
        validationFailure.name,
        validationFailure.type,         // expected type
        validationFailure.actualType    // actual type received
      );
      return res.status(err.status).send(err);
    }

    // checks non-empty string was sent to update name
    if (currObj.name !== undefined && currObj.name.length === 0) {
      const err = errors.errorBadObjectInvalidField(
        'activity', 'name', 'string', 'empty string');
      return res.status(err.status).send(err);
    }

    // checks non-empty string was sent to update slug
    if (currObj.slug !== undefined && currObj.slug.length === 0) {
      const err = errors.errorBadObjectInvalidField(
        'activity', 'slug', 'slug', 'empty string');
      return res.status(err.status).send(err);
    }

    // checks for valid slugs
    if (!helpers.validateSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    knex.transaction(function(trx) {
      trx('activities').first().where({slug: req.params.slug})
      .update({newest: false}).then(function() {
        trx('activities').first().select(
          'activities.name as name',
          'activities.slug as slug',
          'activities.uuid as uuid',
          'activities.revision as rev',
          'activities.created_at as created_at',
          'activities.newest as newest')
        .where('slug', '=', req.params.slug).then(function(obj) {
          if (!obj) {
            const err = errors.errorObjectNotFound('activity');
            return res.status(err.status).send(err);
          }

          /* currObj.name = updated name
             obj.name = name remains unchanged

             currObj.slug = updated slug
             obj.slug = slug remains unchanged */
          const activity = {
            name: currObj.name || obj.name,
            slug: currObj.slug || obj.slug,
            uuid: obj.uuid,
            revision: obj.rev + 1,
            updated_at: Date.now(),
            created_at: parseInt(obj.created_at, 10),
          };

          trx('activities').insert(activity).returning('id').then(function() {
            activity.created_at = new Date(activity.created_at)
            .toISOString().substring(0, 10);

            activity.updated_at = new Date(activity.updated_at)
            .toISOString().substring(0, 10);

            trx.commit();
            return res.send(activity);
          }).catch(function(error) {
            log.error(req, 'Error inserting updated activity: ' + error);
            trx.rollback();
          });
        }).catch(function(error) {
          log.error(req, 'Error selecting activity to update: ' + error);
          trx.rollback();
        });
      }).catch(function(error) {
        log.error(req, 'Error deprecating old activity: ' + error);
        trx.rollback();
      });
    }).catch(function(error) {
      log.error(req, 'Rolling back transaction!');
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  authRequest.post(app, app.get('version') + '/activities',
  function(req, res) {
    const knex = app.get('knex');
    const obj = req.body.object;

    const validKeys = ['name', 'slug'];

    /* eslint-disable prefer-const */
    for (let key in obj) {
    /* eslint-enable prefer-const */

    // indexOf returns -1 if the parameter it not in the array
    // so this will return true if the slug/name DNE
      if (validKeys.indexOf(key) === -1) {
        const err = errors.errorBadObjectUnknownField('activity', key);
        return res.status(err.status).send(err);
      }
    }

    const fields = [
      {name: 'name', type: 'string', required: true},
      {name: 'slug', type: 'string', required: true},
    ];

    /* eslint-disable prefer-const */
    for (let field of fields) {
    /* eslint-enable prefer-const */
      if (!obj[field.name]) {
        const err = errors.errorBadObjectMissingField('activity', field.name);
        return res.status(err.status).send(err);
      }
    }

    const validationFailure = helpers.validateFields(obj, fields);
    if (validationFailure) {
      const err = errors.errorBadObjectInvalidField(
        'activity',
        validationFailure.name,
        validationFailure.type,         // expected type
        validationFailure.actualType    // actual type received
      );
      return res.status(err.status).send(err);
    }

    // checks non-empty string was sent to update name
    if (obj.name.length === 0) {
      const err = errors.errorBadObjectInvalidField(
        'activity', 'name', 'string', 'empty string');
      return res.status(err.status).send(err);
    }

    // checks non-empty string was sent to update slug
    if (obj.slug.length === 0) {
      const err = errors.errorBadObjectInvalidField(
        'activity', 'slug', 'slug', 'empty string');
      return res.status(err.status).send(err);
    }

    // checks for valid slugs
    if (!helpers.validateSlug(obj.slug)) {
      const err = errors.errorBadObjectInvalidField(
        'activity', 'slug', 'slug', 'non-slug string');
      return res.status(err.status).send(err);
    }

    knex('activities').where('slug', '=', obj.slug).then(function(existing) {
      if (existing.length) {
        const err = errors.errorSlugsAlreadyExist(
          existing.map(function(slug) {
            return slug.slug;
          })
        );

        return res.status(err.status).send(err);
      }

      obj.uuid = uuid.v4();
      obj.revision = 1;
      obj.created_at = Date.now();

      knex('activities').insert(obj).returning('id').then(function() {
        // activities is a list containing the ID of the
        // newly created activity
        obj.created_at = new Date(obj.created_at)
        .toISOString().substring(0, 10);

        return res.send(JSON.stringify(obj));
      }).catch(function(error) {
        log.error(req, 'Error creating activity: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }).catch(function(error) {
      log.error(req, 'Error checking for activity existence: ' + error);
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });
};
