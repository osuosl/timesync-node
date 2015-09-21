'use strict';

module.exports = function(app) {
  const knex = app.get('knex');
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const authPost = require('./authenticatedPost');

  app.get(app.get('version') + '/activities', async function(req, res) {
    try {
      const activities = await knex('activities');
      if (activities.length === 0) {
        res.send([]);
      } else {
        res.send(activities);
      }
    } catch (error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    }
  });

  app.get(app.get('version') + '/activities/:slug', async function(req, res) {
    if (errors.isInvalidSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    // get matching activity
    try {
      const activity = await knex('activities').select()
      .where('slug', '=', req.params.slug);

      if (activity.length === 0) {
        const err = errors.errorObjectNotFound('activity');
        return res.status(err.status).send(err);
      }

      return res.send(activity[0]);
    } catch (error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    };
  });

  app.delete(app.get('version') + '/activities/:slug', async function(req, res) {
    if (!helpers.validateSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    try {
      const activityId = await knex('activities').select('id')
      .where('slug', req.params.slug);
      // Check timesactivities to see if an activity (id) is being referenced
      const activity = await knex('timesactivities').select('id').where('id', '=', activityId);

      if (activity.length > 0) {
        res.set('Allow', 'GET, POST');
        const err = errors.errorRequestFailure('activity');
        return res.status(err.status).send(err);
      }

      const numObj = await knex('activities').where('slug', req.params.slug).del();

      /* When deleting something from the table, the number of
      objects deleted is returned. So to confirm that deletion was
      successful, make sure that the number returned is at least
      one. */
      if (numObj >= 1) {
        return res.send();
      } else {
        const err = errors.errorObjectNotFound('slug', req.params.slug);
        return res.status(err.status).send(err);
      }
    } catch (error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    }
  });

  authPost(app, app.get('version') + '/activities/:slug', async function(req, res) {
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

    try {
      const obj = await knex('activities').first().select('activities.name as name',
      'activities.slug as slug', 'activities.id as id')
      .where('slug', '=', req.params.slug);
    } catch (error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    }

    /* req.body.object.name = updated name
       currObj.name = name remains unchanged

       req.body.object.slug = updated slug
       currObj.slug = slug remains unchanged */
    const activity = {
      name: req.body.object.name || obj.name,
      slug: req.body.object.slug || obj.slug,
    };

    try {
      const numObj = await knex('activities')
      .where('slug', '=', req.params.slug).update(activity);
    } catch (error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    }

    if (numObj >= 1) {
      activity.id = obj.id;
      return res.send(activity);
    } else {
      const err = errors.errorObjectNotFound('activity');
      return res.status(err.status).send(err);
    }
  });

  authPost(app, app.get('version') + '/activities', async function(req, res) {
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

    try {
      const existing = await knex('activities').where('slug', '=', obj.slug);
    } catch (error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    }

    if (existing.length) {
      const err = errors.errorSlugsAlreadyExist(
        existing.map(function(slug) {
          return slug.slug;
        })
      );

      return res.status(err.status).send(err);
    }

    try {
      const activities = knex('activities').insert(obj);
    } catch (error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    }
    // activities is a list containing the ID of the
    // newly created activity
    const activity = activities[0];
    obj.id = activity;
    res.send(JSON.stringify(obj));
  });
};
