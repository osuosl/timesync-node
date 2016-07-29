'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const authRequest = require('./authenticatedRequest');
  const uuid = require('uuid');
  const log = app.get('log');

  function constructActivity(inActivity) {
    if (!inActivity) {
      return errors.errorObjectNotFound('activity');
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
          const child = constructActivity(a);
          if (child.error) {
            return errors.send(child, res);
          }
          // Set the child's parent field to a similar map,
          // filter on them having the same uuid and different revisions
          child.parents = activities.filter(function(p) {
            return a.uuid === p.uuid && a.revision !== p.revision;
          }).map(function(p) {
            const val = constructActivity(p);
            if (val.error) {
              return errors.send(val, res);
            }

            return val;
          });
          return child;
        }));
      }).catch(function(error) {
        return errors.send(errors.errorServerError(error), res);
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
          const val = constructActivity(activity);
          if (val.error) {
            return errors.send(val, res);
          }

          return val;
        }));
      }).catch(function(error) {
        log.error(req, 'Error requesting activities: ' + error);
        return errors.send(errors.errorServerError(error), res);
      });
    }
  });

  authRequest.get(app, app.get('version') + '/activities/:slug',
  function(req, res) {
    const knex = app.get('knex');
    if (errors.isInvalidSlug(req.params.slug)) {
      return errors.send(errors.errorInvalidIdentifier('slug', req.params.slug),
                                                                          res);
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
          if (child.error) {
            return errors.send(child, res);
          }
          // With the parents field filled out (or equal to [])
          child.parents = activity.filter(function(p) {
            return p.revision !== a.revision;
          }).map(function(p) {
            const val = constructActivity(p, res);
            if (val.error) {
              return errors.send(res, val);
            }

            return val;
          });
          return child;
        // Return the frist element since this is a 1 element array
        }).pop());
      }).catch(function(error) {
        log.error(req, 'Error requesting activity by slug: ' + error);
        return errors.send(errors.errorServerError(error), res);
      });
    } else {
      activityQ.where({newest: true}).first().then(function(activity) {
        const val = constructActivity(activity, res);
        if (val.error) {
          return errors.send(val, res);
        }
        return res.send(val);
      }).catch(function(error) {
        log.error(req, 'Error requesting activity by slug: ' + error);
        return errors.send(errors.errorServerError(error));
      });
    }
  });

  authRequest.delete(app, app.get('version') + '/activities/:slug',
  function(req, res, user) {
    const knex = app.get('knex');

    if (!user.site_manager && !user.site_admin) {
      return errors.send(errors.errorAuthorizationFailure(user.username,
        'delete activities'), res);
    }

    if (!helpers.validateSlug(req.params.slug)) {
      return errors.send(errors.errorInvalidIdentifier('slug', req.params.slug),
                                                                          res);
    }

    knex('activities').select('id', 'name').where('slug', req.params.slug)
    .first().then(function(activity) {
      if (!activity) {
        return errors.send(errors.errorObjectNotFound('slug', req.params.slug),
                                                                          res);
      }

      knex('times').select('times.id').whereNull('times.deleted_at')
      .where('times.newest', true)
      .join('timesactivities', 'timesactivities.activity', activity.id)
      .then(function(tas) {
        /* If the length of the array is greater than 0, then the activity id
        is being referenced by timesactivities */
        if (tas.length > 0) {
          res.set('Allow', 'GET, POST');
          return errors.send(errors.errorRequestFailure('activity'), res);
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
          return errors.send(errors.errorServerError(error), res);
        });
      }).catch(function(error) {
        log.error(req, 'Error selecting times from activity: ' + error);
        return errors.send(errors.errorServerError(error), res);
      });
    }).catch(function(error) {
      log.error(req, 'Error requesting activity to delete: ' + error);
      return errors.send(errors.errorServerError(error), res);
    });
  });

  authRequest.post(app, app.get('version') + '/activities/:slug',
  function(req, res, user) {
    const knex = app.get('knex');
    const currObj = req.body.object;

    if (!user.site_manager && !user.site_admin) {
      return errors.send(errors.errorAuthorizationFailure(user.username,
          'update activities'), res);
    }

    const validKeys = ['name', 'slug'];

    /* eslint-disable prefer-const */
    for (let key in currObj) {
    /* eslint-enable prefer-const */

    // indexOf returns -1 if the parameter it not in the array
    // so this will return true if the slug/name DNE
      if (validKeys.indexOf(key) === -1) {
        return errors.send(errors.errorBadObjectUnknownField('activity', key),
                                                                          res);
      }
    }

    const fields = [
      {name: 'name', type: 'string', required: false},
      {name: 'slug', type: 'string', required: false},
    ];

    const validationFailure = helpers.validateFields(currObj, fields);
    if (validationFailure) {
      return errors.send(errors.errorBadObjectInvalidField(
        'activity',
        validationFailure.name,
        validationFailure.type,         // expected type
        validationFailure.actualType    // actual type received
      ), res);
    }

    // checks non-empty string was sent to update name
    if (currObj.name !== undefined && currObj.name.length === 0) {
      return errors.send(errors.errorBadObjectInvalidField(
        'activity', 'name', 'string', 'empty string'), res);
    }

    // checks non-empty string was sent to update slug
    if (currObj.slug !== undefined && currObj.slug.length === 0) {
      return errors.send(errors.errorBadObjectInvalidField(
        'activity', 'slug', 'slug', 'empty string'), res);
    }

    // checks for valid slugs
    if (!helpers.validateSlug(req.params.slug)) {
      return errors.send(errors.errorInvalidIdentifier('slug', req.params.slug),
                                                                          res);
    }

    if (currObj.slug && !helpers.validateSlug(currObj.slug)) {
      return errors.send(errors.errorBadObjectInvalidField('activity', 'slug',
                          'valid slug', 'invalid slug ' + currObj.slug), res);
    }

    knex('activities').where('slug', currObj.slug)
    .then(function(existingSlugs) {
      if (existingSlugs.length !== 0) {
        return errors.send(errors.errorSlugsAlreadyExist([currObj.slug]), res);
      }

      knex('activities').where('name', currObj.name)
      .then(function(existingNames) {
        if (existingNames.length !== 0) {
          return errors.send(errors.errorBadObjectInvalidField('activity',
            'name', 'unique name', 'name which already exists'), res);
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
                return errors.send(errors.errorObjectNotFound('activity'), res);
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

              trx('activities').insert(activity).returning('id')
              .then(function() {
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
          return errors.send(errors.errorServerError(error), res);
        });
      }).catch(function(error) {
        log.error(req, 'Error retrieving existing activity names: ' + error);
        return errors.send(errors.errorServerError(error), res);
      });
    }).catch(function(error) {
      log.error(req, 'Error retrieving existing activity slugs: ' + error);
      return errors.send(errors.errorServerError(error), res);
    });
  });

  authRequest.post(app, app.get('version') + '/activities',
  function(req, res, user) {
    const knex = app.get('knex');
    const obj = req.body.object;

    if (!user.site_manager && !user.site_admin) {
      return errors.send(errors.errorAuthorizationFailure(user.username,
          'create activities'), res);
    }

    const validKeys = ['name', 'slug'];

    /* eslint-disable prefer-const */
    for (let key in obj) {
    /* eslint-enable prefer-const */

    // indexOf returns -1 if the parameter it not in the array
    // so this will return true if the slug/name DNE
      if (validKeys.indexOf(key) === -1) {
        return errors.send(errors.errorBadObjectUnknownField('activity', key),
                                                                          res);
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
        return errors.send(errors.errorBadObjectMissingField('activity',
            field.name), res);
      }
    }

    const validationFailure = helpers.validateFields(obj, fields);
    if (validationFailure) {
      return errors.send(errors.errorBadObjectInvalidField(
        'activity',
        validationFailure.name,
        validationFailure.type,         // expected type
        validationFailure.actualType    // actual type received
      ), res);
    }

    // checks non-empty string was sent to update name
    if (obj.name.length === 0) {
      return errors.send(errors.errorBadObjectInvalidField(
        'activity', 'name', 'string', 'empty string'), res);
    }

    // checks non-empty string was sent to update slug
    if (obj.slug.length === 0) {
      return errors.send(errors.errorBadObjectInvalidField(
        'activity', 'slug', 'slug', 'empty string'), res);
    }

    // checks for valid slugs
    if (!helpers.validateSlug(obj.slug)) {
      return errors.send(errors.errorBadObjectInvalidField(
        'activity', 'slug', 'slug', 'non-slug string'), res);
    }

    knex('activities').where('slug', '=', obj.slug).then(function(existing) {
      if (existing.length) {
        return errors.send(errors.errorSlugsAlreadyExist([obj.slug]), res);
      }

      knex('activities').where('name', obj.name).then(function(existingNames) {
        if (existingNames.length) {
          const err = errors.errorBadObjectInvalidField('activity', 'name',
            'unique name', 'name which already exists');
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
        log.error(req, 'Error checking for activity name existence: ' + error);
        return errors.send(errors.errorServerError(error), res);
      });
    }).catch(function(error) {
      log.error(req, 'Error checking for activity slug existence: ' + error);
      return errors.send(errors.errorServerError(error), res);
    });
  });
};
