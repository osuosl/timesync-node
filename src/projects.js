'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const authPost = require('./authenticatedPost');
  const uuid = require('uuid');

  function constructProject(inProject, res, slugs) {
    if (!inProject) {
      const err = errors.errorObjectNotFound('project');
      res.status(err.status);
      return err;
    }

    // manually create our project object from inProject.
    const outProject = {name: inProject.name, owner: inProject.owner, uri:
    inProject.uri, uuid: inProject.uuid, revision: inProject.revision,
    created_at: inProject.created_at, updated_at: inProject.updated_at,
    deleted_at: inProject.deleted_at};
    if (slugs) { outProject.slugs = slugs.sort(); }

    outProject.created_at = new Date(parseInt(outProject.created_at, 10))
    .toISOString().substring(0, 10);
    if (outProject.updated_at) {
      outProject.updated_at = new Date(parseInt(outProject.updated_at, 10))
      .toISOString().substring(0, 10);
    } else {
      outProject.updated_at = null;
    }
    if (outProject.deleted_at) {
      outProject.deleted_at = new Date(parseInt(outProject.deleted_at, 10))
      .toISOString().substring(0, 10);
    } else {
      outProject.deleted_at = null;
    }

    return outProject;
  }

  app.get(app.get('version') + '/projects', function(req, res) {
    const knex = app.get('knex');
    let projectsQ;

    if (req.query.include_deleted === 'true' ||
        req.query.include_deleted === '') {
      projectsQ = knex('projects');
    } else {
      projectsQ = knex('projects').where({deleted_at: null});
    }

    projectsQ = projectsQ.select(
      // select the owner to be the users username
      'users.username as owner',
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
    // Join users with projects on the ownerId
    .join('users', 'projects.owner', 'users.id')
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

          return JSON.stringify(constructProject(proj, res, slugs));
        }).filter(function(proj, index, self) {
          return index === self.indexOf(proj);
        }).map(function(proj) {
          return JSON.parse(proj);
        }));
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }
  });

  app.get(app.get('version') + '/projects/:slug', function(req, res) {
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
      // select the owner to be the users username
      'users.username as owner',
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
    // Join users with projects on the ownerId
    .join('users', 'projects.owner', 'users.id')
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
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }
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
        obj.created_at = Date.now();
        obj.revision = 1;

        // create object to insert into database
        const insertion = {
          uri: obj.uri,
          owner: userId,
          name: obj.name,
          uuid: obj.uuid,
          created_at: obj.created_at,
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
              obj.created_at = new Date(obj.created_at)
              .toISOString().substring(0, 10);

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
    'projects.created_at as created_at',
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
          project.created_at = parseInt(project.created_at, 10);
          project.updated_at = Date.now();

          delete project.ownerId;

          const oldId = project.id;
          delete project.id;

          knex('projects').update({newest: false}).where({id: oldId})
          .then(function() {
            knex('projects').insert(project).returning('id')
            .then(function(id) {
              project.id = id[0];
              project.owner = user.username;

              project.created_at = new Date(project.created_at)
              .toISOString().substring(0, 10);
              project.updated_at = new Date(project.updated_at)
              .toISOString().substring(0, 10);

              knex('projectslugs').where({project: oldId})
              .then(function(existingSlugObjs) {
                const existingSlugs = existingSlugObjs.map(function(slug) {
                  return slug.name;
                });

                knex.transaction(function(trx) {
                  // trx can be used just like knex, but every call is
                  // temporary until trx.commit() is called. Until then,
                  // they're stored separately, and, if something goes wrong,
                  // can be rolled back without side effects.

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
                      delete project.id;

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
                      delete project.id;
                      trx.commit();
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
              const err = errors.errorObjectNotFound('slug', req.params.slug);
              return res.status(err.status).send(err);
            }

            trx('projectslugs').where('project', project.id).del()
            .then(function() {
              trx('userroles').where('project', project.id).del()
              .then(function() {
                trx.commit();
                return res.send();
              }).catch(function(error) {
                trx.rollback();
                const err = errors.errorServerError(error);
                return res.status(err.status).send(err);
              });
            }).catch(function(error) {
              trx.rollback();
              const err = errors.errorServerError(error);
              return res.status(err.status).send(err);
            });
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
    });
  });
};
