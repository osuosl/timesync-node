'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const authRequest = require('./authenticatedRequest');
  const uuid = require('uuid');
  const log = app.get('log');

  function constructProject(inProject, res, slugs) {
    if (!inProject) {
      const err = errors.errorObjectNotFound('project');
      res.status(err.status);
      return err;
    }

    // manually create our project object from inProject.
    const outProject = {
      name: inProject.name,
      uri: inProject.uri,
      uuid: inProject.uuid,
      revision: inProject.revision,
    };
    if (slugs) { outProject.slugs = slugs.sort(); }

    const fields = ['updated_at', 'deleted_at', 'created_at'];

    fields.forEach(function(f) {
      if (inProject[f]) {
        outProject[f] = new Date(parseInt(inProject[f], 10)).toISOString()
                                                            .substring(0, 10);
      } else {
        outProject[f] = null;
      }
    });

    return outProject;
  }

  authRequest.get(app, app.get('version') + '/projects',
  function(req, res) {
    const knex = app.get('knex');
    let projectsQ;

    if (req.query.include_deleted === 'true' ||
        req.query.include_deleted === '') {
      projectsQ = knex('projects');
    } else {
      projectsQ = knex('projects').where({deleted_at: null});
    }

    projectsQ = projectsQ.select(
      // Select the 'slugs' to be the projectslugs name
      'projectslugs.name as slug',
      // Explicitly select everything else from projects
      'projects.uri as uri',
      'projects.name as name',
      'projects.uuid as uuid',
      'projects.revision as revision',
      'projects.deleted_at as deleted_at',
      'projects.updated_at as updated_at',
      'projects.created_at as created_at',
      'projects.newest as newest')
    // Order them from most recently updated to last updated
    .orderBy('revision')
    // Do a left join so we keep projects without a slug field
    // https://en.wikipedia.org/wiki/Join_(SQL)#Left_outer_join for more info.
    .leftOuterJoin('projectslugs', 'projects.id', 'projectslugs.project');
    // Yes this code is duplicated in both GET endpoints. If you have strong
    // feelings about this, change it. kthnkxby

    // The 'include_revisions' query  parameter was included
    if (req.query.include_revisions === 'true' ||
        req.query.include_revisions === '') {
      projectsQ.then(function(projects) {
        if (projects.length === 0) {
          return res.send([]);
        }
        return res.send(projects.filter(function(proj) {
          return proj.newest;
        }).map(function(proj) {
          const slugs = projects.filter(function(p) {
            return p.uuid === proj.uuid && p.slug;
          }).map(function(p) {
            return p.slug;
          });

          const child = constructProject(proj, res, slugs);
          child.parents = projects.filter(function(p) {
            return p.uuid === proj.uuid && !p.newest;
          }).map(function(p) {
            return constructProject(p, res);
          });

          return JSON.stringify(child);
        }).filter(function(proj, index, self) {
          return index === self.indexOf(proj);
        }).map(function(proj) {
          return JSON.parse(proj);
        }));
      }).catch(function(error) {
        log.error(req, 'Error requesting projects: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    } else {
      // If the 'slugs' field is null that means the object is a parent
      // Children may have empty slug fields `[]` but not null.
      projectsQ.where({newest: true}).then(function(projects) {
        if (projects.length === 0) {
          return res.send([]);
        }
        return res.send(projects.map(function(proj) {
          const slugs = projects.filter(function(p) {
            return p.uuid === proj.uuid && p.slug;
          }).map(function(p) {
            return p.slug;
          });

        // This return -> filter -> map perform the following action
        // Compiled and stringify a list of compiled times
          return JSON.stringify(constructProject(proj, res, slugs));
        }).filter(function(proj, index, self) {
        // Check for duplicate entries created by the above map
        // (you cannot do this comparison on objects since javascript looks at
        // memory when doing indexOf, not string equality.
          return index === self.indexOf(proj);
        }).map(function(proj) {
        // Convert the stringified, non-duplicated, objects back into native
        // javascript objects.
          return JSON.parse(proj);
        }));
      }).catch(function(error) {
        log.error(req, 'Error requestingss: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }
  });

  authRequest.get(app, app.get('version') + '/projects/:slug',
  function(req, res) {
    const knex = app.get('knex');
    if (errors.isInvalidSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    // Finds UUID of project with the requested slug
    const uuidSubquery = knex('projectslugs')
                       // Join on projects w/ the same id as the slug's project
                       .join('projects', 'projectslugs.project', 'projects.id')
                       // Select the uuid as the uuid
                       .select('projects.uuid as uuid')
                       // Where the name matches the slug passed
                       .where({'projectslugs.name': req.params.slug});

    // Select all projects (minus slugs) with the matching slug
    // This is a doozy so let's break it down
    // Select from the 'projects' table
    const projectQ = knex('projects').select(
      // Select the 'slugs' to be the projectslugs name
      'projectslugs.name as slug',
      // Explicitly select everything else from projects
      'projects.uri as uri',
      'projects.name as name',
      'projects.uuid as uuid',
      'projects.revision as revision',
      'projects.deleted_at as deleted_at',
      'projects.updated_at as updated_at',
      'projects.created_at as created_at',
      'projects.newest as newest')
    // Order them from most recently updated to last updated
    .orderBy('revision', 'desc')
    // Do a left join so we keep projects without a slug field
    // https://en.wikipedia.org/wiki/Join_(SQL)#Left_outer_join for more info.
    .leftOuterJoin('projectslugs', 'projects.id', 'projectslugs.project')
    // Matching on the uuid subquery (comments above)
    .where({'uuid': uuidSubquery});

    // The 'include_revisions' query  parameter was included
    if (req.query.include_revisions === 'true' ||
        req.query.include_revisions === '') {
      projectQ.then(function(project) {
        // We have to fetch a list of the slugs *before* processing the project
        const slugs = project.filter(function(proj) {
          return proj.slug;
        }).map(function(proj) {
          return proj.slug;
        });
        return res.send(project.filter(function(proj) {
          return proj.newest;
        }).map(function(proj) {
          const child = constructProject(proj, res, slugs);
          child.parents = project.filter(function(p) {
            // We only want to process old revisions
            return !p.newest && p.revision !== child.revision;
          }).map(function(p) {
            return constructProject(p, res);
          });
          return child;
        // Since map's return a list and we only want the first element...
        }).pop());
      }).catch(function(error) {
        log.error(req, 'Error requesting project: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });

    // The 'include_revisions' query  parameter was *not* included
    } else {
      projectQ.andWhere({newest: true}).then(function(project) {
        const slugs = project.filter(function(proj) {
          return proj.slug;
        }).map(function(proj) {
          return proj.slug;
        });

        // Since we have a list of slugs, but they're all mostly the same, we
        // pass project.pop() and the slugs lis to constructProject
        return res.send(constructProject(project.pop(), res, slugs));
      }).catch(function(error) {
        log.error(req, 'Error requesting project: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }
  });

  authRequest.post(app, app.get('version') + '/projects',
  function(req, res, authUser) {
    const knex = app.get('knex');
    const obj = req.body.object;

    // run various checks
    // valid keys
    const validKeys = ['name', 'uri', 'slugs'];
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
      obj.created_at = Date.now();
      obj.revision = 1;

      // create object to insert into database
      const insertion = {
        uri: obj.uri,
        name: obj.name,
        uuid: obj.uuid,
        created_at: obj.created_at,
        revision: 1,
      };

      knex.transaction(function(trx) {
        /* 'You take the trx.rollback(), the story ends. You wake up in your
            bed and none of the database calls ever happened. You take the
            trx.commit(), you stay in wonderland, and everything is saved to
            the database.' */

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
            // The creating user must now be made project manager
            const managerRole = {
              project: project,
              user: authUser.id,
              manager: true,
              spectator: true,
              member: true,
            };

            trx('userroles').insert(managerRole).then(function() {
              obj.created_at = new Date(obj.created_at)
              .toISOString().substring(0, 10);

              trx.commit();
              return res.send(JSON.stringify(obj));
            }).catch(function(error) {
              log.error(req, 'Error creating user roles for project: ' + error);
              trx.rollback();
            });
          }).catch(function(error) {
            log.error(req, 'Error creating project slugs: ' + error);
            trx.rollback();
          });
        }).catch(function(error) {
          log.error(req, 'Error creating updated project: ' + error);
          trx.rollback();
        });
      }).catch(function(error) {
        log.error(req, 'Rolling back transaction.');
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }).catch(function(error) {
      log.error(req, 'Error checking slugs\' existence: ' + error);
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  authRequest.post(app, app.get('version') + '/projects/:slug',
  function(req, res, authUser) {
    const knex = app.get('knex');
    const obj = req.body.object;

    // valid keys
    const validKeys = ['name', 'uri', 'slugs'];
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
    if (obj.slugs) {
      if (obj.slugs.length) {
        const invalidSlugs = obj.slugs.filter(function(slug) {
          return !helpers.validateSlug(slug);
        });

        if (invalidSlugs.length) {
          const err = errors.errorBadObjectInvalidField('project', 'slugs',
            'slugs', 'non-slug strings');
          return res.status(err.status).send(err);
        }
      } else { // Slugs was passed as an empty array
        const err = errors.errorBadObjectInvalidField('project', 'slugs',
          'array of slugs', 'empty array');
        return res.status(err.status).send(err);
      }
    }

    // returns the project ID for the project slug
    const projectIdQuery = knex('projectslugs').select('project')
    .where('name', req.params.slug);

    // retrieves the project from the database, selecting the project
    // where its ID matches the slug's project (the projectIdQuery).
    knex('projects').first().select('projects.id as id',
    'projects.name as name', 'projects.uri as uri',
    'projects.uuid as uuid', 'projects.revision as revision',
    'projects.created_at as created_at')
    .where('projects.id', '=', projectIdQuery)
    .then(function(project) {
      // project contains all of the information about the project the
      // user is updating

      // access userroles, check if user is participating in project
      knex('userroles').where({user: authUser.id, project: project.id})
      .then(function(roles) {
        if (roles.length === 0 || roles[0].manager === false) {
          const err = errors.errorAuthorizationFailure(authUser.username,
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
          project.name = obj.name || project.name;
          project.revision += 1;
          project.created_at = parseInt(project.created_at, 10);
          project.updated_at = Date.now();
          project.newest = true;

          const oldId = project.id;
          delete project.id;

          // trx can be used just like knex, but every call is temporary
          // until trx.commit() is called. Until then, they're stored
          // separately, and, if something goes wrong, can be rolled
          // back without side effects.
          knex.transaction(function(trx) {
            trx('projects').update({newest: false}).where({id: oldId})
            .then(function() {
              trx('projects').insert(project).returning('id')
              .then(function(id) {
                const projID = id[0];

                project.created_at = new Date(project.created_at)
                .toISOString().substring(0, 10);
                project.updated_at = new Date(project.updated_at)
                .toISOString().substring(0, 10);

                trx('userroles').where({project: oldId})
                .update({project: projID}).then(function() {
                  trx('projectslugs').where({project: oldId})
                  .then(function(existingSlugObjs) {
                    const existingSlugs = existingSlugObjs.map(function(slug) {
                      return slug.name;
                    });

                    if (helpers.getType(obj.slugs) === 'array') {
                      const newSlugs = [];

                      newSlugs.push(trx('projectslugs').del()
                      .where({project: oldId}));

                      /* eslint-disable */
                      for (let slug of obj.slugs) {
                      /* eslint-enable */
                        newSlugs.push(trx('projectslugs')
                        .insert({project: projID, name: slug}));
                      }

                      Promise.all(newSlugs).then(function() {
                        project.slugs = obj.slugs.sort();
                        delete project.newest;
                        trx.commit();
                        res.send(JSON.stringify(project));
                      }).catch(function(error) {
                        log.error(req, 'Error inserting slugs: ' + error);
                        trx.rollback();
                      });
                    } else {
                      trx('projectslugs').update({project: projID})
                      .where({project: oldId}).then(function() {
                        project.slugs = existingSlugs.sort();
                        delete project.newest;
                        trx.commit();
                        res.send(project);
                      }).catch(function(error) {
                        log.error(req, 'Error inserting slugs: ' + error);
                        trx.rollback();
                      });
                    }
                  }).catch(function(error) {
                    log.error(req, 'Error retrieving existing slugs: ' + error);
                    trx.rollback();
                  });
                }).catch(function(error) {
                  log.error(req, 'Error updating user roles: ' + error);
                  trx.rollback();
                });
              }).catch(function(error) {
                log.error(req, 'Error inserting updated roles: ' + error);
                trx.rollback();
              });
            }).catch(function(error) {
              log.error(req, 'Error deprecating old project: ' + error);
              trx.rollback();
            });
          }).catch(function(error) {
            log.error(req, 'Rolling back transaction.');
            const err = errors.errorServerError(error);
            return res.status(err.status).send(err);
          });
        }).catch(function(error) {
          log.error(req, 'Error requesting project slugs for update: ' + error);
          const err = errors.errorServerError(error);
          return res.status(err.status).send(err);
        });
      }).catch(function(error) {
        log.error(req, 'Error requesting user roles for update: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }).catch(function(error) {
      log.error(req, 'Error requesting project for update: ' + error);
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  authRequest.delete(app, app.get('version') + '/projects/:slug',
  function(req, res) {
    const knex = app.get('knex');
    if (!helpers.validateSlug(req.params.slug)) {
      const err = errors.errorInvalidIdentifier('slug', req.params.slug);
      return res.status(err.status).send(err);
    }

    // Get project id
    knex('projectslugs').select('projects.id as id', 'projects.name as name')
    .first().where('projectslugs.name', req.params.slug)
    .innerJoin('projects', 'projectslugs.project', 'projects.id')
    .then(function(project) {
      if (!project) {
        const err = errors.errorObjectNotFound('slug', req.params.slug);
        return res.status(err.status).send(err);
      }

      // Get times associated with project
      knex('times').where('project', '=', project.id).then(function(times) {
        // If there are times associated, return an error
        if (times.length > 0) {
          res.set('Allow', 'GET, POST');
          const err = errors.errorRequestFailure('project');
          return res.status(err.status).send(err);
          // Otherwise delete project
        }

        /*
         * Once auth is provided on DELETE requests, compare user ID to ensure
         * they have either 'project manager' rights on the project, or admin
         * rights on the system, similar to as follows:
         *
         * knex('userroles').where({project: project.id, user: userId})
         * .first().select('manager').then(function(role) {
         *   if (!role || !role.manager) {
         *     const err = errors.errorAuthorizationFailure(user.name,
         *                                    'delete project ' + project.name);
         *     return res.status(err.status).send(err);
         *   }
         */

        knex.transaction(function(trx) {
          trx('projects').where('id', '=', project.id)
          .update({deleted_at: Date.now()}).then(function(numObj) {
            /* When deleting something from the table, the number of
            objects deleted is returned. So to confirm that deletion
            was successful, make sure that the number returned is at
            least one. */
            if (numObj !== 1) {
              trx.rollback();
            }

            trx('projectslugs').where('project', project.id).del()
            .then(function() {
              trx('userroles').where('project', project.id).del()
              .then(function() {
                trx.commit();
                return res.send();
              }).catch(function(error) {
                log.error(req, 'Error deleting userroles: ' + error);
                trx.rollback();
              });
            }).catch(function(error) {
              log.error(req, 'Error deleting slugs: ' + error);
              trx.rollback();
            });
          }).catch(function(error) {
            log.error(req, 'Error deleting project: ' + error);
            trx.rollback();
          });
        }).catch(function(error) {
          log.error(req, 'Rolling back transaction.');
          const err = errors.errorServerError(error);
          return res.status(err.status).send(err);
        });
      }).catch(function(error) {
        log.error(req, 'Error selecting project to delete: ' + error);
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    });
  });
};
