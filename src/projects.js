'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const authRequest = require('./authenticatedRequest');
  const uuid = require('uuid');
  const log = app.get('log');

  function constructProject(inProject, roles, res, slugs) {
    if (!inProject) {
      return errors.errorObjectNotFound('project');
    }

    // manually create our project object from inProject.
    const outProject = {
      name: inProject.name,
      uri: inProject.uri,
      uuid: inProject.uuid,
      default_activity: inProject.default_activity,
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

    if (roles && roles.length > 0) {
      outProject.users = {};
      /* eslint-disable prefer-const */
      for (let role of roles) {
      /* eslint-enable prefer-const */
        outProject.users[role.user] = {
          member: !!role.member, // Use !! because they may be stored as numbers
          spectator: !!role.spectator, // !! operator forces to boolean type
          manager: !!role.manager,
        };
      }
    }

    return outProject;
  }

  function compileProjectsQueryPromise(req, res, additional) {
    return new Promise(function(resolve, reject) {
      const knex = app.get('knex');
      let projectsQ = knex('projects');

      projectsQ = projectsQ.select(
        // Select the 'slugs' to be the projectslugs name
        'projectslugs.name as slug',
        // Explicitly select everything else from projects
        'projects.uri as uri',
        'projects.name as name',
        'projects.uuid as uuid',
        'activities.slug as default_activity',
        'projects.revision as revision',
        'projects.deleted_at as deleted_at',
        'projects.updated_at as updated_at',
        'projects.created_at as created_at',
        'projects.newest as newest',
        'projects.id as id') // id will be stripped in constructProject() anyway
      // Order them from most recently updated to last updated
      .orderBy('projects.revision')
      // Do a left join so we keep projects without a slug field
      // https://en.wikipedia.org/wiki/Join_(SQL)#Left_outer_join for more info.
      .leftOuterJoin('projectslugs', 'projects.id', 'projectslugs.project')
      .leftOuterJoin('activities', 'projects.default_activity', 'activities.id')
      ;
      // Yes this code is duplicated in both GET endpoints. If you have strong
      // feelings about this, change it. kthnkxby

      if (additional) { projectsQ = projectsQ.andWhere(additional); }

      if (req.query) {
        // Query for soft-deleted projects when include_deleted=true or if the
        // param is passed (and not set to anything)
        if (req.query.include_deleted === 'false' ||
            req.query.include_deleted === undefined) {
          projectsQ = projectsQ.where({'projects.deleted_at': null});
        }

        if (req.query.user && req.query.user.length) {
          let userArr = null;
           // It is a string,
          if (typeof req.query.user === 'string') {
            // append it to the projectsQ query
            userArr = [req.query.user];
          // It is an array
          } else if (helpers.getType(req.query.user) === 'array' &&
                      // with string elements
                      helpers.getType(req.query.user[0]) === 'string') {
            // Append the array to the projectsQ query
            userArr = req.query.user;
          }

          if (userArr) {
            // Check that the user we just parsed is in the database
            knex('users').whereIn('username', userArr).map(function(y) {
              return y.id;
            }).then(function(x) {
              if (x.length !== 0) {
                // append it to the timesQ query
                knex('userroles').whereIn('user', x).map(function(y) {
                  return y.project;
                }).then(function(y) {
                  projectsQ = projectsQ.whereIn('projects.id', y);

                  resolve(projectsQ);
                });
              } else {
                // Send an error if the user is not found in the database
                reject(errors.errorBadQueryValue('user', req.query.user));
              }
            }).catch(function(error) {
              log.error(req, 'Error selecting users for filter: ' + error);
              reject(errors.errorServerError(error));
            });
          } else {
            reject(errors.errorBadQueryValue('user', req.query.user));
          }
        } else {
          resolve(projectsQ);
        }
      } else {
        resolve(projectsQ);
      }
    });
  }

  authRequest.get(app, app.get('version') + '/projects',
  function(req, res) {
    const knex = app.get('knex');
    // The 'include_revisions' query  parameter was included
    if (req.query.include_revisions === 'true' ||
        req.query.include_revisions === '') {
      compileProjectsQueryPromise(req, res).then(function(projects) {
        if (projects.length === 0) {
          return res.send([]);
        }

        knex('userroles').select(
          'users.username as user',
          'userroles.project as project',
          'userroles.member as member',
          'userroles.spectator as spectator',
          'userroles.manager as manager')
        .innerJoin('users', 'users.id', 'userroles.user')
        .then(function(userroles) {
          return res.send(projects.filter(function(proj) {
            return proj.newest;
          }).map(function(proj) {
            const slugs = projects.filter(function(p) {
              return p.uuid === proj.uuid && p.slug;
            }).map(function(p) {
              return p.slug;
            });

            const roles = userroles.filter(function(role) {
              return role.project === proj.id;
            });

            const child = constructProject(proj, roles, res, slugs);
            if (child.error) {
              return errors.send(child, res);
            }

            child.parents = projects.filter(function(p) {
              return p.uuid === proj.uuid && !p.newest;
            }).map(function(p) {
              const val = constructProject(p, [], res);
              if (val.error) {
                return errors.send(val, res);
              }

              return val;
            });

            return JSON.stringify(child);
          }).filter(function(proj, index, self) {
            return index === self.indexOf(proj);
          }).map(function(proj) {
            return JSON.parse(proj);
          }));
        }).catch(function(error) {
          log.error(req, 'Error requesting user roles: ' + error);
          return errors.send(errors.errorServerError(error), res);
        });
      }).catch(function(error) {
        return errors.send(error, res);
      });
    } else {
      compileProjectsQueryPromise(req, res, {'projects.newest': true})
      .then(function(projects) {
        if (projects.length === 0) {
          return res.send([]);
        }
        knex('userroles').select(
          'users.username as user',
          'userroles.project as project',
          'userroles.member as member',
          'userroles.spectator as spectator',
          'userroles.manager as manager')
        .innerJoin('users', 'users.id', 'userroles.user')
        .then(function(userroles) {
          return res.send(projects.map(function(proj) {
            const slugs = projects.filter(function(p) {
              return p.uuid === proj.uuid && p.slug;
            }).map(function(p) {
              return p.slug;
            });

            const roles = userroles.filter(function(role) {
              return role.project === proj.id;
            });

          // This return -> filter -> map perform the following action
          // Compiled and stringify a list of compiled times
            return JSON.stringify(constructProject(proj, roles, res, slugs));
          }).filter(function(proj, index, self) {
          // Check for duplicate entries created by the above map
          // (you cannot do this comparison on objects since javascript looks at
          // memory when doing indexOf, not string equality.
            return index === self.indexOf(proj);
          }).map(function(proj) {
          // Convert the stringified, non-duplicated, objects back into native
          // javascript objects.
            const obj = JSON.parse(proj);
            if (obj.error) {
              return errors.send(obj, res);
            }
            return obj;
          }));
        }).catch(function(error) {
          log.error(req, 'Error requesting user roles: ' + error);
          return errors.send(errors.errorServerError(error), res);
        });
      }).catch(function(error) {
        return errors.send(error, res);
      });
    }
  });

  authRequest.get(app, app.get('version') + '/projects/:slug',
  function(req, res) {
    const knex = app.get('knex');
    if (errors.isInvalidSlug(req.params.slug)) {
      return errors.send(errors.errorInvalidIdentifier('slug', req.params.slug),
        res);
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
      'activities.slug as default_activity',
      'projects.revision as revision',
      'projects.deleted_at as deleted_at',
      'projects.updated_at as updated_at',
      'projects.created_at as created_at',
      'projects.newest as newest',
      'projects.id as id')
    // Order them from most recently updated to last updated
    .orderBy('revision', 'desc')
    // Do a left join so we keep projects without a slug field
    // https://en.wikipedia.org/wiki/Join_(SQL)#Left_outer_join for more info.
    .leftOuterJoin('projectslugs', 'projects.id', 'projectslugs.project')
    .leftOuterJoin('activities', 'projects.default_activity', 'activities.id')
    // Matching on the uuid subquery (comments above)
    .where({'projects.uuid': uuidSubquery});

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

        knex('userroles').select(
          'users.username as user',
          'userroles.project as project',
          'userroles.member as member',
          'userroles.spectator as spectator',
          'userroles.manager as manager')
        .innerJoin('users', 'users.id', 'userroles.user')
        .then(function(userroles) {
          return res.send(project.filter(function(proj) {
            return proj.newest;
          }).map(function(proj) {
            const roles = userroles.filter(function(role) {
              return role.project === proj.id;
            });

            const child = constructProject(proj, roles, res, slugs);
            if (child.error) {
              return errors.send(child, res);
            }

            child.parents = project.filter(function(p) {
              // We only want to process old revisions
              return !p.newest && p.revision !== child.revision;
            }).map(function(p) {
              const val = constructProject(p, [], res);
              if (val.error) {
                return errors.send(val, res);
              }

              return val;
            });
            return child;
          // Since map's return a list and we only want the first element...
          }).pop());
        }).catch(function(error) {
          log.error(req, 'Error requesting user roles: ' + error);
          return errors.send(errors.errorServerError(error), res);
        });
      }).catch(function(error) {
        log.error(req, 'Error requesting project: ' + error);
        return errors.send(errors.errorServerError(error), res);
      });

    // The 'include_revisions' query  parameter was *not* included
    } else {
      projectQ.andWhere({'projects.newest': true}).then(function(project) {
        if (!project || project.length === 0) {
          return errors.send(errors.errorObjectNotFound('project'), res);
        }

        const slugs = project.filter(function(proj) {
          return proj.slug;
        }).map(function(proj) {
          return proj.slug;
        });

        knex('userroles').select(
          'users.username as user',
          'userroles.project as project',
          'userroles.member as member',
          'userroles.spectator as spectator',
          'userroles.manager as manager')
        .innerJoin('users', 'users.id', 'userroles.user')
        .where('userroles.project', project[0].id)
        .then(function(roles) {
          // Since we have a list of slugs, but they're all mostly the same, we
          // pass project.pop() and the slugs lis to constructProject
          const val = constructProject(project.pop(), roles, res, slugs);
          if (val.error) {
            return errors.send(val, res);
          }

          return res.send(val);
        }).catch(function(error) {
          log.error(req, 'Error requesting user roles: ' + error);
          return errors.send(errors.errorServerError(error));
        });
      }).catch(function(error) {
        log.error(req, 'Error requesting project: ' + error);
        return errors.send(errors.errorServerError(error));
      });
    }
  });

  authRequest.post(app, app.get('version') + '/projects',
  function(req, res, user) {
    const knex = app.get('knex');
    const obj = req.body.object;

    if (!user.site_manager && !user.site_admin) {
      return errors.send(errors.errorAuthorizationFailure(user.username,
          'create projects'), res);
    }

    // run various checks
    // valid keys
    const validKeys = ['name', 'uri', 'slugs', 'users', 'default_activity'];
    /* eslint-disable prefer-const */
    for (let key in obj) {
      /* eslint-enable prefer-const */
      // indexOf returns -1 if the parameter is not in the array,
      // so this returns true if the slug is not in slugNames
      if (validKeys.indexOf(key) === -1) {
        return errors.send(errors.errorBadObjectUnknownField('project', key),
          res);
      }
    }

    // check field types
    const fields = [
      {name: 'name', type: 'string', required: true},
      {name: 'uri', type: 'string', required: false},
      {name: 'slugs', type: 'array', required: true},
      {name: 'users', type: 'object', required: false},
      {name: 'default_activity', type: 'string', required: false},
    ];

    // validateFields takes the object to check fields on,
    // and an array of field names and types
    const validationFailure = helpers.validateFields(obj, fields);
    if (validationFailure) {
      let err;
      if (validationFailure.missing) {
        err = errors.errorBadObjectMissingField('project',
          validationFailure.name);
      } else {
        if (validationFailure.name !== 'default_activity' ||
            validationFailure.actualType !== 'null') {
          err = errors.errorBadObjectInvalidField('project',
            validationFailure.name, validationFailure.type,
            validationFailure.actualType);
        }
      }
      if (err) {
        return errors.send(err, res);
      }
    }

    // check validity of uri syntax
    if (obj.uri && !validUrl.isWebUri(obj.uri)) {
      return errors.send(errors.errorBadObjectInvalidField('project', 'uri',
        'uri', 'non-uri string'), res);
    }

    // check validity of slugs
    const invalidSlugs = obj.slugs.filter(function(slug) {
      return !helpers.validateSlug(slug);
    });

    if (invalidSlugs.length) {
      return errors.send(errors.errorBadObjectInvalidField('project', 'slugs',
      'slugs', 'non-slug strings'), res);
    }

    // select any slugs that match the ones submitted
    // this is to check that none of the submitted slugs are
    // currently in use.
    knex('projectslugs').where('name', 'in', obj.slugs)
    .then(function(slugs) {
      // if any slugs match the slugs passed to us, error out
      if (slugs.length) {
        return errors.send(errors.errorSlugsAlreadyExist(slugs.map(
          function(slug) {
            return slug.name;
          }).sort()
        ), res);
      }

      const activity = obj.default_activity ? [obj.default_activity] : [];
      helpers.checkActivities(activity).then(function(activityId) {
        knex('projects').where('name', obj.name).then(function(existing) {
          if (existing.length) {
            const err = errors.errorBadObjectInvalidField('project', 'name',
              'unique name', 'name which already exists');
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
            default_activity: activityId[0] || null,
            created_at: obj.created_at,
            revision: 1,
          };

          knex.transaction(function(trx) {
            /* 'You take the trx.rollback(), the story ends. You wake up in your
                bed and none of the database calls ever happened. You take the
                trx.commit(), you stay in wonderland, and everything is saved to
                the database.' */

            // trx can be used just like knex, but every call is temporary until
            // commit() is called. Until then, they're stored separately, and,
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
                if (obj.users) {
                  trx('users').select('username', 'id')
                  .whereIn('username', Object.keys(obj.users))
                  .then(function(userIds) {
                    const roles = [];
                    /* eslint-disable prefer-const */
                    /* eslint-disable guard-for-in */
                    for (let userObj of userIds) {
                    /* eslint-enable prefer-const */
                      const role = obj.users[userObj.username];
                      const newRole = {
                        user: userObj.id,
                        project: project,
                        member: role.member,
                        spectator: role.spectator,
                        manager: role.manager,
                      };
                      roles.push(newRole);
                    }
                    /* eslint-enable guard-for-in */

                    trx('userroles').insert(roles).then(function() {
                      obj.created_at = new Date(obj.created_at)
                      .toISOString().substring(0, 10);

                      /* eslint-disable prefer-const */
                      /* eslint-disable guard-for-in */
                      for (let username in obj.users) {
                        let flag = false;
                        for (let userId of userIds) {
                        /* eslint-enable prefer-const */
                          if (userId.username === username) {
                            flag = true;
                            break;
                          }
                        }

                        if (!flag) {
                          delete obj.users[username];
                        }
                      }
                      /* eslint-enable guard-for-in */

                      trx.commit();
                      return res.send(JSON.stringify(obj));
                    }).catch(function(error) {
                      log.error(req, 'Error creating user roles for project: ' +
                                                                        error);
                      trx.rollback();
                    });
                  }).catch(function(error) {
                    log.error(req, 'Error requesting users for project ' +
                                                            'roles: ' + error);
                    trx.rollback();
                  });
                } else {
                  obj.created_at = new Date(obj.created_at)
                  .toISOString().substring(0, 10);

                  trx.commit();
                  return res.send(JSON.stringify(obj));
                }
              }).catch(function(error) {
                log.error(req, 'Error inserting new project slugs: ' + error);
                trx.rollback();
              });
            }).catch(function(error) {
              log.error(req, 'Error creating updated project: ' + error);
              trx.rollback();
            });
          }).catch(function(error) {
            log.error(req, 'Rolling back transaction.');
            return errors.send(errors.errorServerError(error), res);
          });
        }).catch(function(error) {
          log.error(req, 'Error checking names\' existence: ' + error);
          return errors.send(errors.errorServerError(error), res);
        });
      }).catch(function() {
        return errors.send(errors.errorInvalidForeignKey('project', 'activity'),
          res);
      });
    }).catch(function(error) {
      log.error(req, 'Error checking slugs\' existence: ' + error);
      return errors.send(errors.errorServerError(error), res);
    });
  });

  authRequest.post(app, app.get('version') + '/projects/:slug',
  function(req, res, user) {
    const knex = app.get('knex');
    const obj = req.body.object;

    // valid keys
    const validKeys = ['name', 'uri', 'slugs', 'users', 'default_activity'];
    /* eslint-disable prefer-const */
    for (let key in obj) {
      /* eslint-enable prefer-const */
      // indexOf returns -1 if the parameter is not in the array,
      // so this returns true if the slug is not in slugNames
      if (validKeys.indexOf(key) === -1) {
        return errors.send(errors.errorBadObjectUnknownField('project', key),
          res);
      }
    }

    // check string fields
    const fields = [
      {name: 'name', type: 'string', required: false},
      {name: 'uri', type: 'string', required: false},
      {name: 'slugs', type: 'array', required: false},
      {name: 'users', type: 'object', required: false},
      {name: 'default_activity', type: 'string', required: false},
    ];

    // validateFields takes the object to check fields on,
    // and an array of field names and types
    const validationFailure = helpers.validateFields(obj, fields);
    if (validationFailure) {
      let err;
      if (validationFailure.missing) {
        err = errors.errorBadObjectMissingField('project',
          validationFailure.name);
      } else {
        if (validationFailure.name !== 'default_activity' ||
            validationFailure.actualType !== 'null') {
          err = errors.errorBadObjectInvalidField('project',
            validationFailure.name, validationFailure.type,
            validationFailure.actualType);
        }
      }
      if (err) {
        return errors.send(err, res);
      }
    }

    // check validity of uri syntax
    if (obj.uri && !validUrl.isWebUri(obj.uri)) {
      return errors.send(errors.errorBadObjectInvalidField('project', 'uri',
        'uri', 'string'), res);
    }

    // check validity of slugs
    if (obj.slugs) {
      if (obj.slugs.length) {
        const invalidSlugs = obj.slugs.filter(function(slug) {
          return !helpers.validateSlug(slug);
        });

        if (invalidSlugs.length) {
          return errors.send(errors.errorBadObjectInvalidField('project',
            'slugs', 'slugs', 'non-slug strings'), res);
        }
      } else { // Slugs was passed as an empty array
        return errors.send(errors.errorBadObjectInvalidField('project', 'slugs',
          'array of slugs', 'empty array'), res);
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
    'activities.slug as default_activity_name',
    'projects.created_at as created_at')
    .where('projects.id', '=', projectIdQuery)
    .leftJoin('activities', 'activities.id', 'projects.default_activity')
    .then(function(project) {
      // project contains all of the information about the project the
      // user is updating

      if (!project) {
        return errors.send(errors.errorObjectNotFound('project'), res);
      }

      const defaultActivityName = project.default_activity_name;
      delete project.default_activity_name;

      // access userroles, check if user is participating in project
      knex('userroles').first().where({user: user.id, project: project.id})
      .then(function(roles) {
        if ((!roles || !roles.manager) &&
                                      !user.site_manager && !user.site_admin) {
          return errors.send(errors.errorAuthorizationFailure(user.username,
            'make changes to ' + project.name), res);
        }

        const update = function(activityId) {
          knex('projects').where('name', obj.name).then(function(names) {
            if (obj.name !== project.name && names.length) {
              const err = errors.errorBadObjectInvalidField('project', 'name',
                'unique name', 'name which already exists');
              return res.status(err.status).send(err);
            }

            knex('projectslugs').where('name', 'in', obj.slugs)
            .then(function(slugs) {
              // slugs contains all of the slugs named by the user that
              // currently exist in the database. This list is used to
              // check that they're not overlapping with existing slugs.

              // final check: do any of the slugs POSTed to this
              // endpoint already belong to some other project?

              const overlappingSlugs = slugs.filter(function(slug) {
                return slug.project !== project.id;
              });

              if (overlappingSlugs.length) {
                return errors.send(errors.errorSlugsAlreadyExist(
                  overlappingSlugs.map(function(slug) {
                    return slug.name;
                  }).sort()), res);
              }

              // all checks have passed

              // modify the project object gotten from the database
              // and then reinsert it into the database

              // when using knex.update() I have better luck updating
              // the entire object, even fields that aren't changed
              project.uri = obj.uri || project.uri;
              project.name = obj.name || project.name;
              project.default_activity =
                helpers.getType(activityId) === 'array' ?
                activityId[0] :
                activityId;
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
                    project.default_activity = obj.default_activity ||
                                                      defaultActivityName;

                    if (obj.users) {
                      trx('userroles').where({project: oldId})
                      .del().then(function() {
                        const newRoles = [];
                        trx('users').select('username', 'id')
                        .whereIn('username', Object.keys(obj.users))
                        .then(function(userIds) {
                          /* eslint-disable prefer-const */
                          /* eslint-disable guard-for-in */
                          for (let userObj of userIds) {
                          /* eslint-enable prefer-const */
                            const role = obj.users[userObj.username];
                            const newRole = {
                              user: userObj.id,
                              project: projID,
                              member: role.member,
                              spectator: role.spectator,
                              manager: role.manager,
                            };
                            newRoles.push(newRole);
                          }

                          /* eslint-enable guard-for-in */
                          trx('userroles').insert(newRoles).then(function() {
                            trx('projectslugs').where({project: oldId})
                            .then(function(existingSlugObjs) {
                              const existingSlugs = existingSlugObjs.map(
                              function(slug) {
                                return slug.name;
                              });

                              if (helpers.getType(obj.slugs) === 'array') {
                                const newSlugs = [];

                                trx('projectslugs').del()
                                .where({project: oldId}).then(function() {
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
                                    log.error(req, 'Error inserting slugs: ' +
                                                                        error);
                                    trx.rollback();
                                  });
                                }).catch(function(error) {
                                  log.error(req, 'Error deleting old slugs: ' +
                                                                        error);
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
                                  log.error(req, 'Error updating slugs: ' +
                                                                        error);
                                  trx.rollback();
                                });
                              }
                            }).catch(function(error) {
                              log.error(req, 'Error retrieving existing ' +
                                                            'slugs: ' + error);
                              trx.rollback();
                            });
                          }).catch(function(error) {
                            log.error(req, 'Error adding user roles: ' + error);
                            trx.rollback();
                          });
                        }).catch(function(error) {
                          log.error(req, 'Error retrieving users for roles: ' +
                                                                        error);
                          trx.rollback();
                        });
                      }).catch(function(error) {
                        log.error(req, 'Error deleting old user roles: ' +
                                                                        error);
                        trx.rollback();
                      });
                    } else {
                      trx('userroles').where({project: oldId})
                      .update({project: projID}).then(function() {
                        trx('projectslugs').where({project: oldId})
                        .then(function(existingSlugObjs) {
                          const existingSlugs = existingSlugObjs.map(
                          function(slug) {
                            return slug.name;
                          });

                          if (helpers.getType(obj.slugs) === 'array') {
                            const newSlugs = [];

                            trx('projectslugs').del().where({project: oldId})
                            .then(function() {
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
                                log.error(req, 'Error inserting slugs: ' +
                                          error);
                                trx.rollback();
                              });
                            }).catch(function(error) {
                              log.error(req, 'Error deleting old slugs: ' +
                                        error);
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
                              log.error(req, 'Error updating slugs: ' + error);
                              trx.rollback();
                            });
                          }
                        }).catch(function(error) {
                          log.error(req, 'Error retrieving existing slugs: ' +
                                                                        error);
                          trx.rollback();
                        });
                      }).catch(function(error) {
                        log.error(req, 'Error transferring user roles: ' +
                                                                        error);
                        trx.rollback();
                      });
                    }
                  }).catch(function(error) {
                    log.error(req, 'Error inserting new project: ' + error);
                    trx.rollback();
                  });
                }).catch(function(error) {
                  log.error(req, 'Error updating old project: ' + error);
                  trx.rollback();
                });
              }).catch(function(error) {
                log.error(req, 'Rolling back transaction.');
                return errors.send(errors.errorServerError(error), res);
              });
            }).catch(function(error) {
              log.error(req, 'Error checking slugs: ' + error);
              return errors.send(errors.errorServerError(error), res);
            });
          }).catch(function(error) {
            log.error(req, 'Error checking name: ' + error);
            return errors.send(errors.errorServerError(error), res);
          });
        };

        if (obj.default_activity) {
          helpers.checkActivities([obj.default_activity]).then(update)
          .catch(function() {
            return errors.send(errors.errorInvalidForeignKey('project',
              'activity'), res);
          });
        } else if (obj.default_activity === null) {
          update(null);
        } else {
          update(project.default_activity);
        }
      }).catch(function(error) {
        log.error(req, 'Error requesting user roles for update: ' + error);
        return errors.send(errors.errorServerError(error), res);
      });
    }).catch(function(error) {
      log.error(req, 'Error requesting project for update: ' + error);
      return errors.send(errors.errorServerError(error), res);
    });
  });

  authRequest.delete(app, app.get('version') + '/projects/:slug',
  function(req, res, user) {
    const knex = app.get('knex');

    knex('userroles').first().where('user', user.id).andWhere('project',
      knex('projectslugs').select('id').where('name', req.params.slug)
    ).then(function(roles) {
      if ((!roles || !roles.manager) &&
                                      !user.site_manager && !user.site_admin) {
        return errors.send(errors.errorAuthorizationFailure(user.username,
            'delete project ' + req.params.slug), res);
      }

      if (!helpers.validateSlug(req.params.slug)) {
        return errors.send(errors.errorInvalidIdentifier('slug',
          req.params.slug), res);
      }

      // Get project id
      knex('projectslugs').select('projects.id as id', 'projects.name as name')
      .first().where('projectslugs.name', req.params.slug)
      .innerJoin('projects', 'projectslugs.project', 'projects.id')
      .then(function(project) {
        if (!project) {
          return errors.send(errors.errorObjectNotFound('slug',
            req.params.slug), res);
        }

        // Get times associated with project
        knex('times').where('project', '=', project.id)
        .whereNull('deleted_at').where('newest', true).then(function(times) {
          // If there are times associated, return an error
          if (times.length > 0) {
            res.set('Allow', 'GET, POST');
            return errors.send(errors.errorRequestFailure('project'), res);
            // Otherwise delete project
          }


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
            return errors.send(errors.errorServerError(error), res);
          });
        }).catch(function(error) {
          log.error(req, 'Error checking if project has any times: ' + error);
          return errors.send(errors.errorServerError(error), res);
        });
      }).catch(function(error) {
        log.error(req, 'Error selecting project to delete: ' + error);
        return errors.send(errors.errorServerError(error), res);
      });
    }).catch(function(error) {
      log.error(req, 'Error requesting user roles.');
      return errors.send(errors.errorServerError(error), res);
    });
  });
};
