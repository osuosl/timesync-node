'use strict';

module.exports = function(app) {
  const knex = app.get('knex');
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const passport = require('passport');

  app.get(app.get('version') + '/projects', function(req, res) {
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
    *
    * Equivalent SQL:
    *       SELECT projects.id AS id, projects.name AS name,
    *              projects.uri AS uri, users.username AS owner,
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

    knex('projectslugs').select('projects.id as id', 'projects.name as name',
    'projects.uri as uri', 'users.username as owner',
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
          owner: results[0].owner, uri: results[0].uri, slugs: []};

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

  app.post(app.get('version') + '/projects', function(req, res, next) {
    passport.authenticate('local', function(autherr, user, info) {
      if (!user) {
        const err = errors.errorAuthenticationFailure(info.message);
        return res.status(err.status).send(err);
      }

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

          // create object to insert into database
          const insertion = {
            uri: obj.uri,
            owner: userId,
            name: obj.name,
          };

          knex('projects').insert(insertion).then(function(projects) {
            // project is a list containing the ID of the
            // newly created project
            const project = projects[0];
            const projectSlugs = obj.slugs.map(function(slug) {
              return {name: slug, project: project};
            });

            knex('projectslugs').insert(projectSlugs).then(function() {
              obj.id = project;
              res.send(JSON.stringify(obj));
            });
          });
        });
      }).catch(function() {
        // checkUser failed, meaning the user is not authorized
        const err = errors.errorAuthorizationFailure(req.body.auth.username,
          'create objects for ' + obj.owner);
        return res.status(err.status).send(err);
      });
    })(req, res, next);
  });

  app.post(app.get('version') + '/projects/:slug', function(req, res, next) {
    passport.authenticate('local', function(autherr, user, info) {
      if (!user) {
        const err = errors.errorAuthenticationFailure(info.message);
        return res.status(err.status).send(err);
      }

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

      obj.slugs = obj.slugs || [];

      // returns the project ID for the project slug
      const projectIdQuery = knex('projectslugs').select('project')
      .where('name', req.params.slug);

      //const userId = knex('users').select('id')
      //.where('id', '=', projectIdQuery);

      const projectQuery = knex('projects').select('name')
      .where('id', '=', projectIdQuery);
      // retrieves the project from the database, selecting the project
      // where its ID matches the slug's project (the projectIdQuery).

      // also makes the owner field the username so it can be checked, and
      // puts the ownerId into the ownerId field.
      knex('projects').first('name').where('id', '=', projectIdQuery)
      .then(function(projectName) {

        knex('userroles').where({user: user.id, project: projectIdQuery})
        .then(function(authed) {
          if (authed.length === 0 || authed[0].member === false) {
            const err = errors.errorAuthorizationFailure(user.username, 'patch '
              + projectName.name);
              return res.status(err.status).send(err);
            }

          knex('projects').first().select('projects.id as id',
          'projects.name as name', 'projects.uri as uri',
          'users.username as owner')
          .where('projects.id', '=', projectIdQuery)
          .innerJoin('users', 'users.id', 'projects.owner')
          .then(function(project) {
            // project contains all of the information about the project the
            // user is updating
            /* if (user.username !== project.owner) {
              const err = errors.errorAuthorizationFailure(req.body.auth.username,
                'create objects for ' + project.owner);
              return res.status(err.status).send(err);
            } */
            //console.log(project);

            /*knex('userroles').where({user: user.id, project: project.id})
            .then(function(authed) {
              if (authed.length === 0 || authed[0].member === false) {
                const err = errors.errorAuthorizationFailure(user.username, 'patch' +
                  project.name);
                return res.status(err.status).send(err);
              }*/

            knex('projectslugs').where('name', 'in', obj.slugs)
            .then(function(slugs) {
              // slugs contains all of the slugs named by the user that
              // currently exist in the database. This list is used to
              // check that they're not overlapping with existing slugs,
              // and to calculate which slugs need to be added.

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
              //project.owner = project.ownerId;
              project.name = obj.name || project.name;

              //delete project.ownerId;

              knex('projects').where({id: project.id}).update(project)
              .then(function() {
                // slugNames contains the list of names of slugs that
                // overlap with what the user submitted.
                const slugNames = slugs.map(function(slug) {
                  return slug.name;
                });

                knex('projectslugs').where({project: project.id})
                .then(function(existingSlugObjs) {
                  const existingSlugs = existingSlugObjs.map(function(slug) {
                    return slug.name;
                  });
                  // existingSlugs contains a list of all of slugs
                  // that already belong to the project, by name

                  // get list of slugs that is no longer in POST
                  // request
                  let delSlugs = [];
                  if (obj.slugs.length) {
                    delSlugs = existingSlugs.filter(function(slug) {
                      return obj.slugs.indexOf(slug) === -1;
                    });
                  }

                  // make a list containing all of the slugs that need
                  // to be inserted
                  const newSlugs = obj.slugs.filter(function(objSlug) {
                    if (slugNames.indexOf(objSlug) === -1) {
                      return true;
                    }
                  }).map(function(newSlug) {
                    return {name: newSlug, project: project.id};
                  });

                  // make a list containing creation and
                  // deletion promises
                  const slugsPromises = [];
                  if (delSlugs.length) {
                    slugsPromises.push(knex('projectslugs')
                    .where('name', 'in', delSlugs).del());
                  }
                  if (newSlugs.length) {
                    slugsPromises.push(knex('projectslugs').insert(newSlugs));
                  }

                  Promise.all(slugsPromises).then(function() {
                    if (obj.slugs.length) {
                      project.slugs = obj.slugs;
                    } else {
                      project.slugs = existingSlugs;
                    }

                    // project.owner = user.username;
                    res.send(JSON.stringify(project));
                  }).catch(function(error) {
                    const err = errors.errorServerError(error);
                    return res.status(err.status).send(err);
                  });
                });
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
      });
    })(req, res, next);
  });

  app.delete(app.get('version') + '/projects/:slug', function(req, res) {
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
