'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const authPost = require('./authenticatedPost');
  const uuid = require('uuid');

  app.get(app.get('version') + '/activities', function(req, res) {
    const knex = app.get('knex');

    knex('activities').orderBy('revision', 'desc').then(function(activities) {
      if (activities.length === 0) {
        return res.send([]);
      }

      // Include revisions parameter was passed
      if (req.query.include_revisions !== undefined &&
          req.query.include_revisions !== 'false') {
        // iterate over all activity entries
        //  NOTE: I'm pretty sure there's a way to do this block with nested
        //  maps. (replace the `for` loops with maps over activitites` I tried
        //  for ~30 mintues but couldn't get the tests to pass.  Let me know if
        //  you get that to work.
        for (let i=0 ; i<activities.length ; i++) {
          // Process the given activity
          let returnActivity = constructActivity(activities[i], res);
          // Check for errors
          if (returnActivity.status) {
            return res.status(returnActivity.status).send(returnActivity);
          }
          // Initialize the parent's field
          returnActivity.parents = []
          // Check if the object has been modified before
          if (returnActivity.revision > 1) {
            // remove the activity we just processed so we don't get duplicates
            activities.splice(i,i+1);
            // Iterate over every other activity
            for (let j=i ; j<activities.length ; j++) {
              // if the uuid's match add it to the parent's list
              if (activities[j].uuid === returnActivity.uuid) {
                let p = constructActivity(activities[j], res);
                if (p.status) {
                  return res.status(returnActivity.status).send(returnActivity);
                }
                returnActivity.parents.push(p);
                // remove the parent from the activities list, again so we
                // don't get duplicates.
                activities.splice(j,j+1);
              }
            }
          }
          // Set the newly processed activity to the activities list at the
          // appropriate index
          activities[i] = returnActivity;
        }
      } else {
        for (let i=0 ; i<activities.length ; i++) {
          // Make a copy of the current activity
          let returnActivity = constructActivity(activities[i], res);
          if (returnActivity.status) {
            return res.status(returnActivity.status).send(returnActivity);
          }
          // Set the activity to the successfully constructed acvitity
          activities[i] = returnActivity;
        }
      }
      // After all activities are processed completely, send them off to the
      // user.
      return res.send(activities);
    }).catch(function(error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  function constructActivity(activity, res) {
    if (!activity) {
      const err = errors.errorObjectNotFound('activity');
      return err;
    }

    activity.created_at = new Date(parseInt(activity.created_at, 10))
    .toISOString().substring(0, 10);
    if (activity.updated_at) {
      activity.updated_at = new Date(parseInt(activity.updated_at, 10))
      .toISOString().substring(0, 10);
    } else {
      activity.updated_at = null;
    }
    if (activity.deleted_at) {
      activity.deleted_at = new Date(parseInt(activity.deleted_at, 10))
      .toISOString().substring(0, 10);
    } else {
      activity.deleted_at = null;
    }

    return activity;
  }

  app.get(app.get('version') + '/activities/:slug', function(req, res) {
    const knex = app.get('knex');
    if (errors.isInvalidSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    // include_revisions parameter was passed
    if (req.query.include_revisions !== undefined &&
        req.query.include_revisions !== 'false') {
      // get matching activity
      knex('activities').select().where('slug', '=', req.params.slug)
      .orderBy('revision', 'desc').then(function(activities) {
        // create the processesd activity
        const mainActivity = constructActivity(activities.splice(0,1)[0], res);
        // If the activity is an error
        if (mainActivity.status) {
          return res.status(mainActivity.status).send(mainActivity);
        }
        // set parents to the past revisions of an object in descending order.
        mainActivity.parents = activities.map(function(a) {;
          // construct the activity
          a =  constructActivity(a)
          // Check if there is an error
          if (a.status) {
            return res.status(a.status).send(a);
          }
          // return it to the map function
          return a;
        });
        return res.send(mainActivity);
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    } else {
      // get matching activity
      knex('activities').select().first().where('slug', '=', req.params.slug)
      .orderBy('revision', 'desc').then(function(activity) {
        // create the processesd activity
        activity = constructActivity(activity, res);
        // If the activity is an error
        if (activity.status) {
          return res.status(activity.status).send(activity);
        }
        // Otherwise send the (complete and valid) activity
        return res.send(activity);
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }
  });

  app.delete(app.get('version') + '/activities/:slug', function(req, res) {
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
          .then(function(numObj) {
            /* When deleting something from the table, the number of
            objects deleted is returned. So to confirm that deletion was
            successful, make sure that the number returned is at least
            one. */
            if (numObj >= 1) {
              trx.commit();
              return res.send();
            }

            trx.rollback();
            const err = errors.errorObjectNotFound('slug', req.params.slug);
            return res.status(err.status).send(err);
          }).catch(function(error) {
            trx.rollback();
            const err = errors.errorServerError(error);
            return res.status(err.status).send(err);
          });
        }).catch(function(error) {
          const err = errors.errorServerError(error);
          return res.status(err.status).send(err);
        });
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }).catch(function(error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  authPost(app, app.get('version') + '/activities/:slug', function(req, res) {
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

    knex('activities').first().select('activities.name as name',
    'activities.slug as slug', 'activities.id as id',
    'activities.uuid as uuid', 'activities.revision as rev',
    'activities.created_at as created_at')
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

      knex('activities').insert(activity).returning('id').then(function(id) {
        activity.id = id[0];
        activity.created_at = new Date(activity.created_at)
        .toISOString().substring(0, 10);

        activity.updated_at = new Date(activity.updated_at)
        .toISOString().substring(0, 10);

        return res.send(activity);
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    });
  });

  authPost(app, app.get('version') + '/activities', function(req, res) {
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

      knex('activities').insert(obj).returning('id').then(function(activities) {
        // activities is a list containing the ID of the
        // newly created activity
        const activity = activities[0];
        obj.id = activity;
        obj.created_at = new Date(obj.created_at)
        .toISOString().substring(0, 10);

        return res.send(JSON.stringify(obj));
      });
    });
  });
};
