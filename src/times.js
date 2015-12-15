'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const authRequest = require('./authenticatedRequest');
  const uuid = require('uuid');

  function compileTime(time, project, activities, res) {
    if (!time) {
      const err = errors.errorObjectNotFound('time');
      res.status(err.status);
      return err;
    }

    const fields = ['created_at', 'updated_at', 'deleted_at', 'date_worked'];

    fields.map(function(f) {
      if (time[f]) {
        if (typeof time[f] === 'number') {
          time[f] = new Date(parseInt(time[f], 10)).toISOString()
                    .substring(0, 10);
        } else if (typeof time[f] === 'string') {
          time[f] = time[f];
        } else {
          time[f] = null;
        }
      }
    });

    time.project = project;
    time.activities = activities;

    delete time.activity;
    delete time.id;
    delete time.newest;

    return time;
  }

  function compileTimesQueryPromise(req, res, additional) {
    return new Promise(function(resolve, reject) {
      const knex = app.get('knex');
      // Selects a mostly compiled list of times
      // includes duplicate entries for 'activity' field, fixed in processing.
      let timesQ = knex('times').select(
          'users.username as user',
          'times.duration as duration',
          'projectslugs.name as project',
          'times.notes as notes',
          'times.date_worked as date_worked',
          'times.created_at as created_at',
          'times.updated_at as updated_at',
          'times.deleted_at as deleted_at',
          'times.uuid as uuid',
          'times.revision as revision',
          'times.issue_uri as issue_uri',
          'times.newest as newest',
          'activities.slug as activity')
        .join('users', 'times.user', 'users.id')
        .join('projects', 'times.project', 'projects.id')
        .join('projectslugs', 'times.project', 'projectslugs.project')
        .join('timesactivities', 'timesactivities.time', 'times.id')
        .join('activities', 'timesactivities.activity', 'activities.id')
        .orderBy('times.revision', 'desc');

      if (additional) { timesQ = timesQ.andWhere(additional); }

      const flags = {};
      if (req.query) {
        // Query for soft-deleted times when include_deleted=true or if the
        // param is passed (and not set to anything)
        if (req.query.include_deleted === 'false' ||
            req.query.include_deleted === undefined) {
          timesQ = timesQ.where({'times.deleted_at': null});
        }

        // The start or end query parameters were passed
        if (req.query.start || req.query.end) {
          let range = [];
          // The start param is a string with non-zero length
          if (helpers.getType(req.query.start) === 'string' &&
              req.query.start.length) {
            // Set it to the start element of range
            range[0] = req.query.start;
          // The multiple starts were passed
          } else if (helpers.getType(req.query.start) === 'array' &&
                     helpers.getType(req.query.start[0]) === 'string') {
            // Pick the first one passed and set it range's start element
            range[0] = req.query.start[0];
          // Set the start val to undefined and will be set to a sane default
          } else { range[0] = undefined; }

          // The start end param is a string with non-zero length
          if (helpers.getType(req.query.end) === 'string' &&
              req.query.end.length) {
            // Set range's end element to the value
            range[1] = req.query.end;
          // User passed multiple end values
          } else if (helpers.getType(req.query.end) === 'array' &&
                     helpers.getType(req.query.end[0]) === 'string') {
            // Set range's end value to the first end given
            range[1] = req.query.end[0];
          // Set to undefined to later be set to a sane value
          } else { range[1] = undefined; }

          const currDate = new Date().getTime();
          // If the value is undefined, leave it as such
          if (range[0] === undefined) {
            // Run a regex test on the times in the query parameter
          } else if (!/\d{4}-\d{2}-\d{2}/.test(range[0]) ||
                    (new Date(range[0]).getTime() > currDate)) {
            const err = errors.errorBadQueryValue('start', req.query.start);
            reject(res.status(err.status).send(err));
          }
          // If the value is undefined, leave it as such
          if (range[1] === undefined) {
            // Run a regex test on the times in the query parameter
          } else if (!(/\d{4}-\d{2}-\d{2}/.test(range[1]))) {
            const err = errors.errorBadQueryValue('end', req.query.end);
            reject(res.status(err.status).send(err));
          }

          // The dates must be good, so map an actual date type to them
          range = range.map(function(d) { return new Date(d).getTime(); });

          if (range[0] > range[1]) {
            const err = errors.errorBadQueryValue('start', req.query.start);
            reject(res.status(err.status).send(err));
          }

          // Both end and start are specified
          if (!isNaN(range[0]) && !isNaN(range[1])) {
            // Test that the times submitted were valid within the range of
            // possible dates.
            if (!range[0] || range[0] > Date.now()) {
              const err = errors.errorBadQueryValue('start', req.query.start);
              reject(res.status(err.status).send(err));
            }
            if (!range[1]) {
              const err = errors.errorBadQueryValue('end', req.query.end);
              reject(res.status(err.status).send(err));
            }

            // Set the date worked to be within the range
            timesQ = timesQ.whereBetween('date_worked', range);
          } else {
            // One of the the processed times not NaN
            if (!isNaN(range[0])) {
              timesQ = timesQ.andWhere('date_worked', '>=', range[0]);
            } else if (!isNaN(range[1])) {
              timesQ = timesQ.andWhere('date_worked', '<=', range[1]);
            }
          }
        }

        // The user query param is passed
        if (req.query.user && req.query.user.length) {
          let userArr = null;
           // It is a string,
          if (typeof req.query.user === 'string') {
            // append it to the timesQ query
            userArr = [req.query.user];
          // It is an array
          } else if (helpers.getType(req.query.user) === 'array' &&
                      // with string elements
                      helpers.getType(req.query.user[0]) === 'string') {
            // Append the array to the timesQ query
            userArr = req.query.user;
          }

          if (userArr) {
            // Check that the user we just parsed is in the database
            knex('users').whereIn('username', userArr).then(function(x) {
              if (x.length !== 0) {
                // append it to the timesQ query
                timesQ = timesQ.whereIn('users.username', userArr);

                flags.userSet = true;
                if (flags.userSet && flags.projectSet && flags.activitySet) {
                  resolve(timesQ);
                }
              } else {
                // Send an error if the user is not found in the database
                const err = errors.errorBadQueryValue('user', req.query.user);
                reject(res.status(err.status).send(err));
              }
            }).catch(function(error) {
              const err = errors.errorServerError(error);
              reject(res.status(err.status).send(err));
            });
          }
        } else {
          flags.userSet = true;
        }

        // The project param is passed
        if (req.query.project && req.query.project.length) {
          let projectArr = null;
          // It is a srting
          if (typeof req.query.project === 'string') {
            projectArr = [req.query.project];
          // It is an array
          } else if (helpers.getType(req.query.project) === 'array' &&
                    // With string elements
                    helpers.getType(req.query.project[0]) === 'string') {
            // append the query to the timesQ query
            projectArr = req.query.project;
          }

          if (projectArr) {
            // Check that the user we just parsed is in the database
            knex('projectslugs').whereIn('name', projectArr).then(function(x) {
              if (x.length !== 0) {
                const ids = x.map(function(s) {
                  return s.project;
                });
                knex('projectslugs').whereIn('project', ids).then(function(y) {
                  const slugs = y.map(function(s) {
                    return s.name;
                  });
                  // append it to the timesQ query
                  timesQ = timesQ.whereIn('projectslugs.name', slugs);

                  flags.projectSet = true;
                  if (flags.userSet && flags.projectSet && flags.activitySet) {
                    resolve(timesQ);
                  }
                });
              } else {
                // Send an error if the user is not found in the database
                const err = errors.errorBadQueryValue('project',
                                                      req.query.project);
                reject(res.status(err.status).send(err));
              }
            }).catch(function(error) {
              const err = errors.errorServerError(error);
              reject(res.status(err.status).send(err));
            });
          }
        } else {
          flags.projectSet = true;
        }

        // The activity query parameter is passed
        if (req.query.activity && req.query.activity.length) {
          let activityArr = null;
          // It is a string
          if (typeof req.query.activity === 'string') {
            // Append it to the timesQ query
            activityArr = [req.query.activity];
          // It is an array
          } else if (helpers.getType(req.query.activity) === 'array' &&
                     // With string elements
                     helpers.getType(req.query.activity[0]) === 'string') {
            // Append it to the time timesQ query
            activityArr = req.query.activity;
          }

          if (activityArr) {
            // Check that the user we just parsed is in the database
            knex('activities').whereIn('slug', activityArr).then(function(x) {
              const ids = x.map(function(y) {
                return y.id;
              });
              if (x.length !== 0) {
                // append it to the timesQ query
                knex('timesactivities')
                .whereIn('activity', ids)
                .map(function(y) {
                  return y.time;
                }).then(function(y) {
                  timesQ = timesQ.whereIn('times.id', y);

                  flags.activitySet = true;
                  if (flags.userSet && flags.projectSet && flags.activitySet) {
                    resolve(timesQ);
                  }
                });
              } else {
                // Send an error if the user is not found in the database
                const err = errors.errorBadQueryValue('activity',
                                                      req.query.activity);
                reject(res.status(err.status).send(err));
              }
            }).catch(function(error) {
              const err = errors.errorServerError(error);
              reject(res.status(err.status).send(err));
            });
          }
        } else {
          flags.activitySet = true;
        }
      }

      if (flags.userSet && flags.projectSet && flags.activitySet) {
        resolve(timesQ);
      }
    });
  }

  function timesMetadata(times) {
    const info = {};
    // Filter out all non-string projects
    info.project = times.filter(function(t) {
      return t.project && typeof(t.project) === 'string';
    // map info.project to the project slugs of this set of times
    }).map(function(t) {
      return t.project;
    // Removes duplicates
    }).filter(function(t, index, self) {
      return index === self.indexOf(t);
    }).sort();

    // Filter out all non-string activities
    info.activities = times.filter(function(t) {
      return t.activity && typeof(t.activity) === 'string';
    // map info.activities to the activities of this set of times
    }).map(function(t) {
      return t.activity;
    // Removes duplicates
    }).filter(function(t, index, self) {
      return index === self.indexOf(t);
    });
    return info;
  }

  authRequest.get(app, app.get('version') + '/times',
  function(req, res) {
    // Include_revisions is an included param or is explicityly set to true
    if (req.query.include_revisions === '' ||
        req.query.include_revisions === 'true') {
      compileTimesQueryPromise(req, res).then(function(times) {
        const timesCopy = JSON.parse(JSON.stringify(times));
        return res.send(times.filter(function(time) {
          return time.newest;
        }).map(function(time) {
          const childTimes = timesCopy.filter(function(t) {
            return t.uuid === time.uuid;
          });
          const childMeta = timesMetadata(childTimes);
          const childTime = compileTime(time, childMeta.project,
                                        childMeta.activities, res);

          childTime.parents = timesCopy.filter(function(pTime) {
            return (pTime.uuid === childTime.uuid) && !(pTime.newest);
          }).map(function(pTime) {
            const pTimes = timesCopy.filter(function(pt) {
              return pt.uuid === time.uuid;
            });
            const pMeta = timesMetadata(pTimes);
            return JSON.stringify(compileTime(pTime, pMeta.project,
                                              pMeta.activities, res));
          }).filter(function(pTime, index, self) {
            return self.indexOf(pTime) === index;
          }).map(function(pTime) {
            return JSON.parse(pTime);
          });
          return JSON.stringify(childTime);
        }).filter(function(time, index, self) {
          return self.indexOf(time) === index;
        }).map(function(time) {
          return JSON.parse(time);
        }));
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    // Include_revisions is set to false or not an included param
    } else {
      compileTimesQueryPromise(req, res, {'times.newest': true})
      .then(function(times) {
        const timesUUIDs = times.map(function(t) {
          return t.uuid;
        }).filter(function(t, i, self) {
          return self.indexOf(t) === i;
        });

        return res.send(timesUUIDs.map(function(tUUID) {
          const selectedTimes = times.filter(function(t) {
            return tUUID === t.uuid;
          });
          const meta = timesMetadata(selectedTimes);
          return compileTime(selectedTimes[0], meta.project, meta.activities,
                             res);
        }));
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }
  });

  authRequest.get(app, app.get('version') + '/times/:uuid',
  function(req, res) {
    if (!helpers.validateUUID(req.params.uuid)) {
      const err = errors.errorInvalidIdentifier('UUID', req.params.uuid);
      return res.status(err.status).send(err);
    }

    // I appologize for the following if-block and all of it's tom-foolery.
    // - Elijah
    if (req.query.include_revisions === '' ||
        req.query.include_revisions === 'true') {
      compileTimesQueryPromise(req, res, {'times.uuid': req.params.uuid})
      .then(function(times) {
        // Generate a list of all children from the database
        const childTimes = times.filter(function(time) {
          return time.newest;
        });
        // Generate the project and activity slugs for a given child
        const childMetadata = timesMetadata(childTimes);
        // Map the processed child info to the DB object
        const childTime = compileTime(childTimes[0], childMetadata.project,
                                      childMetadata.activities, res);

        // Generate a list of parent times
        const parentTimes = times.filter(function(p) {
          return p.revision !== childTime.revision && !p.newest;
        });

        // Get the highest revision number,
        // this helps us find the number of target parents we will have
        // i.e., numRevisions - 2
        const numRevisions = parentTimes[0].revision;
        // Initialize the childTime.parents to an empty array, in case there
        // are no revisions
        childTime.parents = [];
        // For all revisions
        for (let i = 1; i <= numRevisions; i++) {
          // Generate a list of parent times of that revision
          const pCurr = parentTimes.filter(function(p) {
            return p.revision === i;
          });
          // Generate the metadata for that revision
          const pCurrMeta = timesMetadata(pCurr);
          // Push the compiled parent time onto the lits of parents.
          childTime.parents.push(compileTime(pCurr[0], pCurrMeta.project,
                                 pCurrMeta.activities, res));
        }

        return res.send(childTime);
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    } else {
      compileTimesQueryPromise(req, res, {'times.newest': true,
                                          'times.uuid': req.params.uuid})
      .then(function(times) {
        const metadata = timesMetadata(times);
        return res.send(compileTime(times.pop(), metadata.project,
                                    metadata.activities, res));
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    }
  });

  authRequest.post(app, app.get('version') + '/times',
  function(req, res, user) {
    const knex = app.get('knex');
    const time = req.body.object;

    // Test existence and datatypes
    const badField = helpers.validateFields(time, [
      {name: 'duration', type: 'number', required: true},
      {name: 'project', type: 'string', required: true},
      {name: 'user', type: 'string', required: true},
      {name: 'issue_uri', type: 'string', required: false},
      {name: 'activities', type: 'array', required: true},
      {name: 'date_worked', type: 'string', required: true},
    ]);

    if (badField) {
      if (badField.actualType === 'undefined') {
        const err = errors.errorBadObjectMissingField('time',
        badField.name);
        return res.status(err.status).send(err);
      }
      const err = errors.errorBadObjectInvalidField('time',
      badField.name, badField.type, badField.actualType);
      return res.status(err.status).send(err);
    }

    // Test duration value
    if (time.duration < 0) {
      const err = errors.errorBadObjectInvalidField('time', 'duration',
      'positive number', 'negative number');
      return res.status(err.status).send(err);
    }

    // Test validity of project slug
    if (!helpers.validateSlug(time.project)) {
      const err = errors.errorBadObjectInvalidField('time', 'project', 'slug',
      'invalid slug ' + time.project);
      return res.status(err.status).send(err);
    }

    // Test each activity
    /* eslint-disable prefer-const */
    for (let activity of time.activities) {
      /* eslint-enable prefer-const */
      if (helpers.getType(activity) !== 'string') {
        const err = errors.errorBadObjectInvalidField('time', 'activities',
        'slugs', 'array containing at least 1 ' + helpers.getType(activity));
        return res.status(err.status).send(err);
      } else if (!helpers.validateSlug(activity)) {
        const err = errors.errorBadObjectInvalidField('time', 'activities',
        'slugs', 'array containing at least 1 invalid slug');
        return res.status(err.status).send(err);
      }
    }

    // Test issue URI value
    if (time.issue_uri && !validUrl.isWebUri(time.issue_uri)) {
      const err = errors.errorBadObjectInvalidField('time', 'issue_uri',
              'URI', 'invalid URI ' + time.issue_uri);
      return res.status(err.status).send(err);
    }

    // Test date worked value
    if (!/\d{4}-\d{2}-\d{2}/.test(time.date_worked) ||
    !Date.parse(time.date_worked)) {
      const err = errors.errorBadObjectInvalidField('time', 'date_worked',
      'ISO-8601 date', time.date_worked);
      return res.status(err.status).send(err);
    }

    // Finish checks for user, project, and activity
    helpers.checkUser(user.username, time.user).then(function(userId) {
      helpers.checkProject(time.project).then(function(projectId) {
        knex('userroles').where({user: userId, project: projectId})
        .then(function(roles) {
          if (roles.length === 0 || roles[0].member === false) {
            const err = errors.errorAuthorizationFailure(user.username,
              'create time entries for project ' + time.project + '.');
            return res.status(err.status).send(err);
          }
          helpers.checkActivities(time.activities)
          .then(function(activityIds) {
            time.uuid = uuid.v4();
            time.revision = 1;
            const insertion = {
              duration: time.duration,
              user: userId,
              project: projectId,
              notes: time.notes,
              issue_uri: time.issue_uri,
              date_worked: new Date(time.date_worked).getTime(),
              created_at: Date.now(),
              uuid: time.uuid,
              revision: 1,
            };

            knex.transaction(function(trx) {
              // trx can be used just like knex, but every call is temporary
              // until trx.commit() is called. Until then, they're stored
              // separately, and, if something goes wrong, can be rolled back
              // without side effects.
              trx('times').insert(insertion).returning('id')
              .then(function(timeIds) {
                const timeId = timeIds[0];

                const taInsertion = [];
                /* eslint-disable prefer-const */
                for (let activityId of activityIds) {
                  /* eslint-enable prefer-const */
                  taInsertion.push({
                    time: timeId,
                    activity: activityId,
                  });
                }

                trx('timesactivities').insert(taInsertion).then(function() {
                  trx.commit();
                  return res.send(JSON.stringify(time));
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
          }).catch(function() {
            const err = errors.errorInvalidForeignKey('time', 'activities');
            return res.status(err.status).send(err);
          });
        }).catch(function(error) {
          const err = errors.errorServerError(error);
          return res.status(err.status).send(err);
        });
      }).catch(function() {
        const err = errors.errorInvalidForeignKey('time', 'project');
        return res.status(err.status).send(err);
      });
    }).catch(function() {
      const err = errors.errorAuthorizationFailure(user.username,
        'create time entries for ' + time.user);
      return res.status(err.status).send(err);
    });
  });

  // Patch times
  authRequest.post(app, app.get('version') + '/times/:uuid',
  function(req, res, user) {
    const knex = app.get('knex');
    if (!helpers.validateUUID(req.params.uuid)) {
      const err = errors.errorInvalidIdentifier('UUID', req.params.uuid);
      return res.status(err.status).send(err);
    }

    const obj = req.body.object;

    // Test duration value
    if (obj.duration !== undefined &&
            helpers.getType(obj.duration) === 'object') {
      const err = errors.errorBadObjectInvalidField('time', 'duration',
      'number', 'object');
      return res.status(err.status).send(err);
    }

    // Duration always ends up a string for some reason
    if (obj.duration !== undefined) {
      obj.duration = Number(obj.duration);
    }

    // Test existence and datatypes
    const fields = [
      {name: 'duration', type: 'number', required: false},
      {name: 'project', type: 'string', required: false},
      {name: 'activities', type: 'array', required: false},
      {name: 'user', type: 'string', required: false},
      {name: 'issue_uri', type: 'string', required: false},
      {name: 'date_worked', type: 'string', required: false},
      {name: 'notes', type: 'string', required: false},
    ];

    const fieldNames = fields.map(function(field) {
      return field.name;
    });

    /* eslint-disable prefer-const */
    for (let field in obj) {
    /* eslint-enable prefer-const */
      if (fieldNames.indexOf(field) < 0) {
        const err = errors.errorBadObjectUnknownField('time', field);
        return res.status(err.status).send(err);
      }
    }

    // Test fields
    const validationFailure = helpers.validateFields(obj, fields);
    if (validationFailure) {
      const err = errors.errorBadObjectInvalidField('time',
        validationFailure.name, validationFailure.type,
        validationFailure.actualType);
      return res.status(err.status).send(err);
    }

    // Test duration value again
    if (obj.duration !== undefined && obj.duration < 0) {
      const err = errors.errorBadObjectInvalidField('time', 'duration',
      'positive integer', 'negative integer');
      return res.status(err.status).send(err);
    }

    // Test each activity
    if (obj.activities !== undefined) {
      /* eslint-disable prefer-const */
      for (let activity of obj.activities) {
        /* eslint-enable prefer-const */
        if (helpers.getType(activity) !== 'string') {
          const err = errors.errorBadObjectInvalidField('time', 'activities',
          'slugs', 'array containing at least 1 ' +
          helpers.getType(activity));
          return res.status(err.status).send(err);
        } else if (!helpers.validateSlug(activity)) {
          const err = errors.errorBadObjectInvalidField('time', 'activities',
          'slugs', 'array containing at least 1 invalid slug');
          return res.status(err.status).send(err);
        }
      }
    }

    // Test issue URI value
    if (obj.issue_uri !== undefined &&
            !validUrl.isWebUri(obj.issue_uri)) {
      const err = errors.errorBadObjectInvalidField('time', 'issue_uri',
              'URI', 'invalid URI ' + obj.issue_uri);
      return res.status(err.status).send(err);
    }

    // Test date worked value
    if (obj.date_worked !== undefined &&
        (!/\d{4}-\d{2}-\d{2}/.test(obj.date_worked) ||
        !Date.parse(obj.date_worked))) {
      const err = errors.errorBadObjectInvalidField('time', 'date_worked',
      'ISO-8601 date', obj.date_worked);
      return res.status(err.status).send(err);
    }

    // Test notes value
    if (obj.notes !== undefined && helpers.getType(obj.notes) !== 'string') {
      const err = errors.errorBadObjectInvalidField('time', 'notes',
      'string', helpers.getType(obj.notes));
      return res.status(err.status).send(err);
    }

    knex('times').where({uuid: req.params.uuid, newest: true})
    .update({newest: false}).then(function() {
      // retrieves the time from the database
      knex('times').select(
        'times.duration as duration',
        'times.user as user',
        'times.project as project',
        'times.notes as notes',
        'times.issue_uri as issue_uri',
        'times.date_worked as date_worked',
        'times.created_at as created_at',
        'times.updated_at as updated_at',
        'times.id as id',
        'times.uuid as uuid',
        'times.revision as revision',
        'users.username as owner',
        'projectslugs.name as projectName')
      .where('times.uuid', '=', req.params.uuid)
      .innerJoin('users', 'users.id', 'times.user')
      .innerJoin('projectslugs', 'projectslugs.id',
                 'times.project')
      .orderBy('times.revision', 'desc')
      .then(function(time) {
        if (user.username !== time[0].owner) {
          const err = errors.errorAuthorizationFailure(user.username,
            'create objects for ' + time[0].owner);
          return res.status(err.status).send(err);
        }

        const username = obj.user || time[0].owner;
        helpers.checkUser(username, username).then(function(userId) {
          if (userId !== undefined) {
            time[0].user = userId;
          } else {
            time[0].user = time[0].user;
          }

          const projectName = obj.project || time[0].projectName;
          helpers.checkProject(projectName).then(function(projectId) {
            time[0].project = projectId || time[0].project;
            time[0].duration = obj.duration || time[0].duration;
            time[0].notes = obj.notes || time[0].notes;
            time[0].issue_uri = obj.issue_uri || time[0].issue_uri;
            // created_at is returned as string by postgres
            time[0].created_at = parseInt(time[0].created_at, 10);
            time[0].updated_at = Date.now();
            time[0].revision += 1;
            delete time[0].owner;
            delete time[0].projectName;

            if (obj.date_worked) {
              time[0].date_worked = Date.parse(obj.date_worked);
            } else {
              time[0].date_worked = parseInt(time[0].date_worked, 10);
            }

            const oldId = time[0].id;
            delete time[0].id;

            const activityList = obj.activities || [];
            helpers.checkActivities(activityList).then(function(activityIds) {
              knex.transaction(function(trx) {
                // trx can be used just like knex, but every call is temporary
                // until trx.commit() is called. Until then, they're stored
                // separately, and, if something goes wrong, can be rolled back
                // without side effects.

                trx('times').insert(time[0]).returning('id').then(function(id) {
                  time[0].id = id[0];

                  if (helpers.getType(obj.activities) !== 'array' ||
                  obj.activities.length) {
                    if (!obj.activities) {
                      trx('timesactivities').select('activity')
                      .where('time', oldId).then(function(activities) {
                        const taInsertion = [];
                        /* eslint-disable prefer-const */
                        for (let activity of activities) {
                          /* eslint-enable prefer-const */
                          taInsertion.push({
                            time: time[0].id,
                            activity: activity.activity,
                          });
                        }

                        trx('timesactivities').insert(taInsertion)
                        .then(function() {
                          trx.commit();
                          return res.send(time);
                        }).catch(function(error) {
                          trx.rollback();
                          const err = errors.errorServerError(error);
                          return res.status(err.status).send(err);
                        });
                      }).catch(function(error) {
                        const err = errors.errorServerError(error);
                        return res.status(err.status).send(err);
                      });
                    } else {
                      const taInsertion = [];
                      /* eslint-disable prefer-const */
                      for (let activity of activityIds) {
                        /* eslint-enable prefer-const */
                        taInsertion.push({
                          time: time[0].id,
                          activity: activity,
                        });
                      }

                      trx('timesactivities').insert(taInsertion)
                      .then(function() {
                        return res.send(time);
                      }).catch(function(error) {
                        trx.rollback();
                        const err = errors.errorServerError(error);
                        return res.status(err.status).send(err);
                      });
                    }
                  } else {
                    return res.send(time);
                  }
                }).catch(function(error) {
                  trx.rollback();
                  const err = errors.errorServerError(error);
                  return res.status(err.status).send(err);
                });
              }).catch(function(error) {
                const err = errors.errorServerError(error);
                return res.status(err.status).send(err);
              });
            }).catch(function() {
              const err = errors.errorInvalidForeignKey('time',
                      'activities');
              return res.status(err.status).send(err);
            });
          }).catch(function() {
            const err = errors.errorInvalidForeignKey('time', 'project');
            return res.status(err.status).send(err);
          });
        }).catch(function() {
          const err = errors.errorInvalidForeignKey('time', 'user');
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

  app.delete(app.get('version') + '/times/:uuid', function(req, res) {
    const knex = app.get('knex');
    if (!helpers.validateUUID(req.params.uuid)) {
      const err = errors.errorInvalidIdentifier('uuid', req.params.uuid);
      return res.status(err.status).send(err);
    }

    knex('times').select('id').where('uuid', req.params.uuid).first()
    .then(function(time) {
      if (!time) {
        const err = errors.errorObjectNotFound('uuid', req.params.uuid);
        return res.status(err.status).send(err);
      }

      knex.transaction(function(trx) {
        trx('times').where('uuid', req.params.uuid).first()
        .orderBy('revision', 'desc')
        .update({'deleted_at': Date.now()})
        .then(function(numObj) {
          if (numObj >= 1) {
            trx.commit();
            return res.send();
          }

          trx.rollback();
          const err = errors.errorObjectNotFound('uuid', req.params.uuid);
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
  });
};
