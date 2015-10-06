'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const authPost = require('./authenticatedPost');
  const uuid = require('uuid');

  app.get(app.get('version') + '/projects', function(req, res) {
    const knex = app.get('knex');
    knex('projects').then(function(projects) {
      if (projects.length === 0) {
        return res.send([]);
      }

      // only return the project once both
      // users and slugs have finished processing
      let usersDone = false;
      let slugsDone = false;

      knex('users').then(function(users) {
        const idUserMap = {};
        for (let i = 0, len = users.length; i < len; i++) {
          // make a map of every user id to their username
          idUserMap[users[i].id] = users[i].username;
        }

        for (let i = 0, len = projects.length; i < len; i++) {
          // using that user id, get the username and set it
          // to the project owner
          projects[i].owner = idUserMap[projects[i].owner];
        }

        // processing finished. Return if slugs are also finished
        usersDone = true;
        if (slugsDone) {
          return res.send(projects);
        }
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });

      knex('projectslugs').then(function(slugs) {
        const idProjectMap = {};
        for (let i = 0, len = projects.length; i < len; i++) {
          // add slugs field to every project
          projects[i].slugs = [];
          /* make a map of every project id to the whole project
          this is used to allow us to add slugs to projects
          by project id */
          idProjectMap[projects[i].id] = projects[i];
        }

        for (let i = 0, len = slugs.length; i < len; i++) {
          // add slugs to project by project id
          idProjectMap[slugs[i].project].slugs.push(slugs[i].name);
        }

        // processing finished. Return if users are also finished
        slugsDone = true;
        if (usersDone) {
          return res.send(projects);
        }
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }).catch(function(error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  app.get(app.get('version') + '/projects/:slug', function(req, res) {
    const knex = app.get('knex');
    if (errors.isInvalidSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    /*
    * Gets an project and list of slugs from a slug.
    *
    * First selects an project from the name of a slug (from the URI).
    * Then selects all slug names which match that project.
    * Resulting table will look like this:
    *
    * +----+---------+----------------------+-------------+
    * | id |   name  |          uri         |     slug    |
    * +----+---------+----------------------+-------------+
    * |  4 | Example | http://example.com/1 |      ex     |
    * |  4 | Example | http://example.com/1 |   example   |
    * |  4 | Example | http://example.com/1 |    sample   |
    * |  4 | Example | http://example.com/1 |   Beispiel  |
    * +----+---------+----------------------+-------------+
    * --------------------------------------+----------+
    *                  uuid                 | Revision |
    * --------------------------------------+----------+
    *  986fe650-4bef-4e36-a99d-ad880b7f6cad |     1    |
    *  986fe650-4bef-4e36-a99d-ad880b7f6cad |     1    |
    *  986fe650-4bef-4e36-a99d-ad880b7f6cad |     1    |
    *  986fe650-4bef-4e36-a99d-ad880b7f6cad |     1    |
    * --------------------------------------+----------+
    *
    * Equivalent SQL:
    *       SELECT projects.id AS id, projects.name AS name,
    *              projects.uri AS uri, projects.uuid as uuid,
    *              projects.revision AS revision, users.username AS owner,
    *              projectslugs.name AS slug FROM projectslugs
    *       INNER JOIN projects ON projectslugs.project = projects.id
    *       INNER JOIN users ON users.id = projects.owner
    *       WHERE projectslugs.project =
    *               (SELECT id FROM projects WHERE id =
    *                   (SELECT project FROM projectslugs
    *                    WHERE name = $slug)
    *               )
    */
    const projectSubquery = knex('projectslugs').select('project')
    .where('name', req.params.slug);
    const slugsSubquery = knex('projects').select('id')
    .where('id', '=', projectSubquery);

    knex('projectslugs').select('projects.id as id',
    'projects.name as name', 'projects.uri as uri', 'projects.uuid as uuid',
    'projects.revision as revision', 'users.username as owner',
    'projectslugs.name as slug')
    .where('projectslugs.project', '=', slugsSubquery)
    .innerJoin('projects', 'projectslugs.project', 'projects.id')
    .innerJoin('users', 'users.id', 'projects.owner')
    .then(function(results) {
      if (results.length !== 0) {
        /* manually create our project object from
        the results. All results should be the same, save
        the slug, so just create it from the first one
        */
        const project = {id: results[0].id, name: results[0].name,
          owner: results[0].owner, uri: results[0].uri, uuid: results[0].uuid,
          revision: results[0].revision, slugs: []};

        for (let i = 0, len = results.length; i < len; i++) {
          // add slugs to project
          project.slugs.push(results[i].slug);
        }

        res.send(project);
      } else {
        const err = errors.errorObjectNotFound('project');
        return res.status(err.status).send(err);
      }
    }).catch(function(error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  authPost(app, app.get('version') + '/projects', function(req, res, user) {
    const knex = app.get('knex');
    const obj = req.body.object;

    // run various checks
    // valid keys
    const validKeys = ['name', 'uri', 'owner', 'slugs'];
    /* eslint-disable prefer-const */
    for (let key in obj) {
      /* eslint-enable prefer-const */
      // indexOf returns -1 if the parameter is not in the array,
      // so this returns true if the slug is not in slugNames
      if (validKeys.indexOf(key) === -1) {
        const err = errors.errorBadObjectUnknownField('project', key);
        return res.status(err.status).send(err);
      }
    }

    // check existence of slugs
    if (!obj.slugs) {
      const err = errors.errorBadObjectMissingField('project', 'slug');
      return res.status(err.status).send(err);
    }

    // check existence of name
    if (!obj.name) {
      const err = errors.errorBadObjectMissingField('project', 'name');
      return res.status(err.status).send(err);
    }

    // check field types
    const fields = [
      {name: 'name', type: 'string', required: true},
      {name: 'uri', type: 'string', required: false},
      {name: 'owner', type: 'string', required: true},
      {name: 'slugs', type: 'array', required: true},
    ];

    // validateFields takes the object to check fields on,
    // and an array of field names and types
    const validationFailure = helpers.validateFields(obj, fields);
    if (validationFailure) {
      const err = errors.errorBadObjectInvalidField('project',
        validationFailure.name, validationFailure.type,
        validationFailure.actualType);
      return res.status(err.status).send(err);
    }

    // check validity of uri syntax
    if (obj.uri && !validUrl.isWebUri(obj.uri)) {
      const err = errors.errorBadObjectInvalidField('project', 'uri', 'uri',
      'non-uri string');
      return res.status(err.status).send(err);
    }

    // check validity of slugs
    const invalidSlugs = obj.slugs.filter(function(slug) {
      return !helpers.validateSlug(slug);
    });

    if (invalidSlugs.length) {
      const err = errors.errorBadObjectInvalidField('project', 'slugs',
      'slugs', 'non-slug strings');
      return res.status(err.status).send(err);
    }

    // check validity of owner -- it must match the submitting user
    // if checkUser fails, the user submitting the request doesn't match
    helpers.checkUser(user.username, obj.owner).then(function(userId) {
      // select any slugs that match the ones submitted
      // this is to check that none of the submitted slugs are
      // currently in use.
      knex('projectslugs').where('name', 'in', obj.slugs)
      .then(function(slugs) {
        // if any slugs match the slugs passed to us, error out
        if (slugs.length) {
          const err = errors.errorSlugsAlreadyExist(slugs.map(function(slug) {
            return slug.name;
          }));

          return res.status(err.status).send(err);
        }

        obj.uuid = uuid.v4();
        obj.revision = 1;

        // create object to insert into database
        const insertion = {
          uri: obj.uri,
          owner: userId,
          name: obj.name,
          uuid: obj.uuid,
          revision: 1,
        };

        knex.transaction(function(trx) {
          /* "You take the trx.rollback(), the story ends. You wake up in your
              bed and none of the database calls ever happened. You take the
              trx.commit(), you stay in wonderland, and everything is saved to
              the database." */

          // trx can be used just like knex, but every call is temporary until
          // trx.commit() is called. Until then, they're stored separately, and,
          // if something goes wrong, can be rolled back without side effects.
          trx('projects').insert(insertion).returning('id')
          .then(function(projects) {
            // project is a list containing the ID of the
            // newly created project
            const project = projects[0];
            const projectSlugs = obj.slugs.map(function(slug) {
              return {name: slug, project: project};
            });

            trx('projectslugs').insert(projectSlugs).then(function() {
              obj.id = project;
              trx.commit();
              res.send(JSON.stringify(obj));
            }).catch(function(error) {
              trx.rollback();
              const err = errors.errorServerError(error);
              return res.status(err.status).send(err);
            });
          });
        }).catch(function(error) {
          const err = errors.errorServerError(error);
          return res.status(err.status).send(err);
        });
      });
    }).catch(function() {
      // checkUser failed, meaning the user is not authorized
      const err = errors.errorAuthorizationFailure(req.body.auth.username,
        'create objects for ' + obj.owner);
      return res.status(err.status).send(err);
    });
  });

  authPost(app, app.get('version') + '/projects/:slug',
  function(req, res, user) {
    const knex = app.get('knex');
    const obj = req.body.object;

    // valid keys
    const validKeys = ['name', 'uri', 'owner', 'slugs'];
    /* eslint-disable prefer-const */
    for (let key in obj) {
      /* eslint-enable prefer-const */
      // indexOf returns -1 if the parameter is not in the array,
      // so this returns true if the slug is not in slugNames
      if (validKeys.indexOf(key) === -1) {
        const err = errors.errorBadObjectUnknownField('project', key);
        return res.status(err.status).send(err);
      }
    }

    // check string fields
    const fields = [
      {name: 'name', type: 'string', required: false},
      {name: 'uri', type: 'string', required: false},
      {name: 'owner', type: 'string', required: false},
      {name: 'slugs', type: 'array', required: false},
    ];

    // validateFields takes the object to check fields on,
    // and an array of field names and types
    const validationFailure = helpers.validateFields(obj, fields);
    if (validationFailure) {
      const err = errors.errorBadObjectInvalidField('project',
        validationFailure.name, validationFailure.type,
        validationFailure.actualType);
      return res.status(err.status).send(err);
    }

    // check validity of uri syntax
    if (obj.uri && !validUrl.isWebUri(obj.uri)) {
      const err = errors.errorBadObjectInvalidField('project', 'uri', 'uri',
        'string');
      return res.status(err.status).send(err);
    }

    // check validity of slugs
    if (obj.slugs && obj.slugs.length) {
      const invalidSlugs = obj.slugs.filter(function(slug) {
        return !helpers.validateSlug(slug);
      });

      if (invalidSlugs.length) {
        const err = errors.errorBadObjectInvalidField('project', 'slugs',
          'slugs', 'non-slug strings');
        return res.status(err.status).send(err);
      }
    }

    // returns the project ID for the project slug
    const projectIdQuery = knex('projectslugs').select('project')
    .where('name', req.params.slug);

    // retrieves the project from the database, selecting the project
    // where its ID matches the slug's project (the projectIdQuery).

    // also makes the owner field the username so it can be checked, and
    // puts the ownerId into the ownerId field.
    knex('projects').first().select('projects.id as id',
    'projects.name as name', 'projects.uri as uri',
    'projects.uuid as uuid', 'projects.revision as revision',
    'users.username as owner', 'users.id as ownerId')
    .where('projects.id', '=', projectIdQuery)
    .innerJoin('users', 'users.id', 'projects.owner')
    .then(function(project) {
      // project contains all of the information about the project the
      // user is updating

      // access userroles, check if user is participating in project
      knex('userroles').where({user: user.id, project: project.id})
      .then(function(roles) {
        if (roles.length === 0 || roles[0].manager === false) {
          const err = errors.errorAuthorizationFailure(user.username,
            'make changes to ' + project.name);
          return res.status(err.status).send(err);
        }

        knex('projectslugs').where('name', 'in', obj.slugs)
        .then(function(slugs) {
          // slugs contains all of the slugs named by the user that
          // currently exist in the database. This list is used to
          // check that they're not overlapping with existing slugs.

          // final check: do any of the slugs POSTed to this
          // endpoint already belong to some other project?

          let overlappingSlugs = slugs.filter(function(slug) {
            return slug.project !== project.id;
          });

          if (overlappingSlugs.length) {
            overlappingSlugs = overlappingSlugs.map(function(slug) {
              return slug.name;
            });

            const err = errors.errorSlugsAlreadyExist(overlappingSlugs);
            return res.status(err.status).send(err);
          }
          // all checks have passed

          // modify the project object gotten from the database
          // and then reinsert it into the database

          // when using knex.update() I have better luck updating
          // the entire object, even fields that aren't changed
          project.uri = obj.uri || project.uri;
          project.owner = project.ownerId;
          project.name = obj.name || project.name;
          project.revision += 1;

          delete project.ownerId;

          const oldId = project.id;
          delete project.id;

          knex('projects').where({id: oldId})
          .update({'deleted_at': Date.now()}).then(function() {
            knex('projects').insert(project).then(function(id) {
              project.id = id[0];

              knex('projectslugs').where({project: oldId})
              .then(function(existingSlugObjs) {
                const existingSlugs = existingSlugObjs.map(function(slug) {
                  return slug.name;
                });

                knex.transaction(function(trx) {
                  // trx can be used just like knex, but every call is temporary
                  // until trx.commit() is called. Until then, they're stored
                  // separately, and, if something goes wrong, can be rolled
                  // back without side effects.

                  if (helpers.getType(obj.slugs) === 'array') {
                    const newSlugs = [];

                    newSlugs.push(trx('projectslugs').del()
                    .where({project: oldId}));

                    /* eslint-disable */
                    for (let slug of obj.slugs) {
                    /* eslint-enable */
                      newSlugs.push(trx('projectslugs')
                      .insert({project: project.id, name: slug}));
                    }

                    Promise.all(newSlugs).then(function() {
                      project.slugs = obj.slugs;
                      project.owner = user.username;

                      trx.commit();
                      res.send(JSON.stringify(project));
                    }).catch(function(error) {
                      trx.rollback();
                      const err = errors.errorServerError(error);
                      return res.status(err.status).send(err);
                    });
                  } else {
                    trx('projectslugs').update({project: project.id})
                    .where({project: oldId}).then(function() {
                      project.slugs = existingSlugs;
                      project.owner = user.username;
                      res.send(project);
                    }).catch(function(error) {
                      trx.rollback();
                      const err = errors.errorServerError(error);
                      return res.status(err.status).send(err);
                    });
                  }
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
    }).catch(function(error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  app.delete(app.get('version') + '/projects/:slug', function(req, res) {
    const knex = app.get('knex');
    if (!helpers.validateSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    // Get project id
    const projectId = knex('projectslugs').select('project').where('name',
    req.params.slug);

    // Get times associated with project
    knex('times').where('project', '=', projectId).then(function(times) {
      // If there are times associated, return an error
      if (times.length > 0) {
        res.set('Allow', 'GET, POST');
        const err = errors.errorRequestFailure('project');
        return res.status(err.status).send(err);
        // Otherwise delete project
      }

      knex('projects').where('id', '=', projectId)
      .del().then(function(numObj) {
        /* When deleting something from the table, the number of
        objects deleted is returned. So to confirm that deletion
        was successful, make sure that the number returned is at
        least one. */
        if (numObj >= 1) {
          return res.send();
        }

        const err = errors.errorObjectNotFound('slug',
        req.params.slug);
        return res.status(err.status).send(err);
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    });
  });
};
