'use strict';

module.exports = function(app) {
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const authRequest = require('./authenticatedRequest');
  const uuid = require('uuid');
  const log = app.get('log');

  function compileTime(inTime, project, activities) {
    if (!inTime) {
      return errors.errorObjectNotFound('time');
    }

    const outTime = {
      duration: inTime.duration,
      user: inTime.user,
      notes: inTime.notes,
      issue_uri: inTime.issue_uri,
      uuid: inTime.uuid,
      revision: inTime.revision,
      project: project.sort(),
      activities: activities.sort(),
    };

    const fields = ['created_at', 'updated_at', 'deleted_at', 'date_worked'];

    fields.forEach(function(f) {
      if (inTime[f]) {
        if (typeof inTime[f] === 'number') {
          outTime[f] = new Date(inTime[f]).toISOString().substring(0, 10);
        } else if (typeof inTime[f] === 'string') {
          if (inTime[f][4] === '-') {
            outTime[f] = inTime[f];
          } else {
            outTime[f] = new Date(parseInt(inTime[f], 10)).toISOString()
                         .substring(0, 10);
          }
        } else {
          outTime[f] = null;
        }
      } else {
        outTime[f] = null;
      }
    });

    return outTime;
  }

  function compileTimesQueryPromise(req, res, user, additional) {
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
        .join('projectslugs', 'times.project', 'projectslugs.project')
        .join('timesactivities', 'timesactivities.time', 'times.id')
        .join('activities', 'timesactivities.activity', 'activities.id')
        .orderBy('times.revision', 'desc');

      if (additional) { timesQ = timesQ.andWhere(additional); }

      if (!user.site_spectator && !user.site_admin) {
        const spectatorQ = knex('userroles').select('project')
                            .where('user', user.id).andWhere('spectator', true);
        timesQ = timesQ.where(function() {
          this.where('times.user', user.id)
          .orWhere('times.project', 'in', spectatorQ);
        });
      }

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

          // If the value is undefined, leave it as such
          if (range[0] === undefined) {
            // Run a regex test on the times in the query parameter
          } else if (!/\d{4}-\d{2}-\d{2}/.test(range[0])) {
            reject(errors.errorBadQueryValue('start', req.query.start));
          }
          // If the value is undefined, leave it as such
          if (range[1] === undefined) {
            // Run a regex test on the times in the query parameter
          } else if (!(/\d{4}-\d{2}-\d{2}/.test(range[1]))) {
            reject(errors.errorBadQueryValue('end', req.query.end));
          }

          // The dates must be good, so map an actual date type to them
          range = range.map(function(d) { return new Date(d).getTime(); });

          if (range[0] > range[1]) {
            reject(errors.errorBadQueryValue('start', req.query.start));
          }

          if (range[0] && range[0] > Date.now()) {
            reject(errors.errorBadQueryValue('start', req.query.start));
          }

          // Both end and start are specified
          if (!isNaN(range[0]) && !isNaN(range[1])) {
            // Test that the times submitted were valid within the range of
            // possible dates.
            if (!range[0]) {
              reject(errors.errorBadQueryValue('start', req.query.start));
            }
            if (!range[1]) {
              reject(errors.errorBadQueryValue('end', req.query.end));
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
                reject(errors.errorBadQueryValue('user', req.query.user));
              }
            }).catch(function(error) {
              log.error(req, 'Error selecting users for filter: ' + error);
              reject(errors.errorServerError(error));
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
            // Check that the project we just parsed is in the database
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
                }).catch(function(error) {
                  log.error(req, 'Error getting projects for filter: ' + error);
                  reject(errors.errorServerError(error));
                });
              } else {
                // Send an error if the user is not found in the database
                reject(errors.errorBadQueryValue('project',
                                                      req.query.project));
              }
            }).catch(function(error) {
              log.error(req, 'Error getting project slugs to filter: ' + error);
              reject(errors.errorServerError(error));
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
            // Check that the activity we just parsed is in the database
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
                }).catch(function(error) {
                  log.error(req, 'Error getting filter activities: ' + error);
                  reject(errors.errorServerError(error));
                });
              } else {
                // Send an error if the user is not found in the database
                reject(errors.errorBadQueryValue('activity',
                                                      req.query.activity));
              }
            }).catch(function(error) {
              log.error(req, 'Error retrieving activities: ' + error);
              reject(errors.errorServerError(error));
            });
          }
        } else {
          flags.activitySet = true;
        }
      }

      if (!req.query || (flags.userSet && flags.projectSet &&
                                                          flags.activitySet)) {
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
  function(req, res, user) {
    // Include_revisions is an included param or is explicityly set to true
    if (req.query.include_revisions === '' ||
        req.query.include_revisions === 'true') {
      // Here's what this block does in abstract terms:
      // 1 Get a list of times with compileTimesQueryPromise
      //   This is effectively a wrapper around a complex knex call
      // 2 Filter out the parent times so we only act on the child times
      // 3 Get a list of duplicate times for each child
      // 4 Fetch the metadata for a given child time
      // 5 compile that child time
      // 6 compile that child time's parent times
      //   [repeat steps 2-5 for parent times of the given child]
      // 7 return a stringified version of the parent
      // 8 filter out duplicate parent times for a given child
      // 9 parse the filtered list of non-duplicate times
      // 10 repeat steps 7-9 for each child time as well
      compileTimesQueryPromise(req, res, user).then(function(allTimesArray) {
        const allTimesCopy = JSON.parse(JSON.stringify(allTimesArray));
        return res.send(allTimesArray.filter(function(time) {
          return time.newest;
        }).map(function(time) {
          const childTimesArray = allTimesCopy.filter(function(childTime) {
            return childTime.uuid === time.uuid;
          });
          const childTimeMetadata = timesMetadata(childTimesArray);
          const childTime = compileTime(time, childTimeMetadata.project,
                                        childTimeMetadata.activities);
          if (childTime.error) {
            return errors.send(childTime, res);
          }

          childTime.parents = allTimesCopy.filter(function(parentTime) {
            return (parentTime.uuid === childTime.uuid) && !(parentTime.newest);
          }).map(function(parentTime) {
            const parentTimesArray = allTimesCopy.filter(
            function(parentTimeInner) {
              return parentTimeInner.uuid === childTime.uuid;
            });
            const parentTimeMetadata = timesMetadata(parentTimesArray);
            const parent = compileTime(parentTime,
                                      parentTimeMetadata.project,
                                      parentTimeMetadata.activities);
            if (parent.error) {
              return errors.send(parent, res);
            }
            return JSON.stringify(parent);
          }).filter(function(parentTime, index, self) {
            return self.indexOf(parentTime) === index;
          }).map(function(parentTime) {
            return JSON.parse(parentTime);
          });
          return JSON.stringify(childTime);
        }).filter(function(time, index, self) {
          return self.indexOf(time) === index;
        }).map(function(time) {
          return JSON.parse(time);
        }));
      }).catch(function(error) {
        return errors.send(error, res);
      });
    // Include_revisions is set to false or not an included param
    } else {
      // Similar story for the above, but we don't have the inner block that
      // deals with compiling the parent's field
      compileTimesQueryPromise(req, res, user, {'times.newest': true})
      .then(function(allTimesArray) {
        const allTimesCopy = JSON.parse(JSON.stringify(allTimesArray));
        return res.send(allTimesArray.filter(function(time) {
          return time.newest;
        }).map(function(time) {
          const childTimesArray = allTimesCopy.filter(function(childTime) {
            return childTime.uuid === time.uuid;
          });
          const childTimeMetadata = timesMetadata(childTimesArray);
          const child = compileTime(time, childTimeMetadata.project,
                                        childTimeMetadata.activities);
          if (child.error) {
            return errors.send(child, res);
          }

          return JSON.stringify(child);
        }).filter(function(time, index, self) {
          return self.indexOf(time) === index;
        }).map(function(time) {
          return JSON.parse(time);
        }));
      }).catch(function(error) {
        return errors.send(error, res);
      });
    }
  });

  authRequest.get(app, app.get('version') + '/times/:uuid',
  function(req, res, user) {
    if (!helpers.validateUUID(req.params.uuid)) {
      return errors.send(errors.errorInvalidIdentifier('UUID', req.params.uuid),
        res);
    }

    // I appologize for the following if-block and all of it's tom-foolery.
    // - Elijah
    if (req.query.include_revisions === '' ||
        req.query.include_revisions === 'true') {
      compileTimesQueryPromise(req, res, user, {'times.uuid': req.params.uuid})
      .then(function(times) {
        // Generate a list of all children from the database
        const childTimes = times.filter(function(time) {
          return time.newest;
        });
        // Generate the project and activity slugs for a given child
        const childMetadata = timesMetadata(childTimes);
        // Map the processed child info to the DB object
        const childTime = compileTime(childTimes[0], childMetadata.project,
                                      childMetadata.activities);
        if (childTime.error) {
          return errors.send(childTime, res);
        }

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

          /* jshint -W083 */
          /* eslint-disable no-loop-func */
          const pCurr = parentTimes.filter(function(p) {
            return p.revision === i;
          });
          /* eslint-enable no-loop-func */
          /* jshint +W083 */

          // Generate the metadata for that revision
          const pCurrMeta = timesMetadata(pCurr);
          // Push the compiled parent time onto the lits of parents.
          const parent = compileTime(pCurr[0], pCurrMeta.project,
                                 pCurrMeta.activities);
          if (parent.error) {
            return errors.send(parent, res);
          }

          childTime.parents.push(parent);
        }
        return res.send(childTime);
      }).catch(function(error) {
        return errors.send(error, res);
      });
    } else {
      compileTimesQueryPromise(req, res, user, {'times.newest': true,
                                          'times.uuid': req.params.uuid})
      .then(function(times) {
        const metadata = timesMetadata(times);
        const val = compileTime(times.pop(), metadata.project,
                                    metadata.activities);
        if (val.error) {
          return errors.send(val, res);
        }

        return res.send(val);
      }).catch(function(error) {
        return errors.send(error, res);
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
      {name: 'activities', type: 'array', required: false},
      {name: 'date_worked', type: 'string', required: true},
    ]);

    if (badField) {
      if (badField.missing) {
        return errors.send(errors.errorBadObjectMissingField('time',
        badField.name), res);
      }
      return errors.send(errors.errorBadObjectInvalidField('time',
        badField.name, badField.type, badField.actualType), res);
    }

    // Test duration value
    if (time.duration < 0) {
      return errors.send(errors.errorBadObjectInvalidField('time', 'duration',
        'positive number', 'negative number'), res);
    }

    // Test validity of project slug
    if (!helpers.validateSlug(time.project)) {
      return errors.send(errors.errorBadObjectInvalidField('time', 'project',
        'slug', 'invalid slug ' + time.project), res);
    }

    if (time.activities) {
      // Test each activity
      /* eslint-disable prefer-const */
      for (let activity of time.activities) {
        /* eslint-enable prefer-const */
        if (helpers.getType(activity) !== 'string') {
          return errors.send(errors.errorBadObjectInvalidField('time',
            'activities', 'slugs', 'array containing at least 1 ' +
            helpers.getType(activity)), res);
        } else if (!helpers.validateSlug(activity)) {
          return errors.send(errors.errorBadObjectInvalidField('time',
            'activities', 'slugs', 'array containing at least 1 invalid slug'),
            res);
        }
      }
    }

    // Test issue URI value
    if (time.issue_uri && !validUrl.isWebUri(time.issue_uri)) {
      return errors.send(errors.errorBadObjectInvalidField('time', 'issue_uri',
              'URI', 'invalid URI ' + time.issue_uri), res);
    }

    // Test date worked value
    if (!/\d{4}-\d{2}-\d{2}/.test(time.date_worked) ||
      !Date.parse(time.date_worked)) {
      return errors.send(errors.errorBadObjectInvalidField('time',
        'date_worked', 'ISO-8601 date', time.date_worked), res);
    }
    // Finish checks for user, project, and activity
    helpers.checkUser(user.username, time.user).then(function(userId) {
      helpers.checkProject(time.project).then(function(projectId) {
        const insert = function(activityIds) {
          knex('userroles').first().where({user: userId, project: projectId})
          .then(function(roles) {
            if ((!roles || roles.member === false) && !user.site_admin) {
              return errors.send(errors.errorAuthorizationFailure(user.username,
                'create time entries for project ' + time.project + '.'), res);
            }

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

                if (activityIds) {
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
                    log.error(req, 'Error creating activity references for ' +
                                                              'time: ' + error);
                    trx.rollback();
                  });
                } else {
                  trx.commit();
                  time.activities = time.activities.sort();
                  return res.send(JSON.stringify(time));
                }
              }).catch(function(error) {
                log.error(req, 'Error inserting updated time entry: ' + error);
                trx.rollback();
              });
            }).catch(function(error) {
              log.error(req, 'Rolling back transaction.');
              return errors.send(errors.errorServerError(error), res);
            });
          }).catch(function(error) {
            log.error(req, 'Error retrieving user roles: ' + error);
            return errors.send(errors.errorServerError(error), res);
          });
        };

        if (time.activities) {
          helpers.checkActivities(time.activities).then(insert)
          .catch(function() {
            return errors.send(errors.errorInvalidForeignKey('time',
              'activities'), res);
          });
        } else {
          knex('projects').select('default_activity').first()
          .where('id', projectId).then(function(activityId) {
            if (activityId.default_activity) {
              insert([activityId.default_activity]);
            } else {
              return errors.send(errors.errorBadObjectMissingField('time',
                                                            'activities'), res);
            }
          }).catch(function(error) {
            log.error(req, 'Error selecting default activity.');
            return errors.send(errors.errorServerError(error), res);
          });
        }
      }).catch(function() {
        return errors.send(errors.errorInvalidForeignKey('time', 'project'),
          res);
      });
    }).catch(function() {
      return errors.send(errors.errorAuthorizationFailure(user.username,
        'create time entries for ' + time.user), res);
    });
  });

  // Patch times
  authRequest.post(app, app.get('version') + '/times/:uuid',
  function(req, res, user) {
    const knex = app.get('knex');
    if (!helpers.validateUUID(req.params.uuid)) {
      return errors.send(errors.errorInvalidIdentifier('UUID', req.params.uuid),
        res);
    }

    const obj = req.body.object;

    // Test duration value
    if (obj.duration !== undefined &&
            helpers.getType(obj.duration) === 'object') {
      return errors.send(errors.errorBadObjectInvalidField('time', 'duration',
        'number', 'object'), res);
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
        return errors.send(errors.errorBadObjectUnknownField('time', field),
          res);
      }
    }

    // Test fields
    const validationFailure = helpers.validateFields(obj, fields);
    if (validationFailure) {
      return errors.send(errors.errorBadObjectInvalidField('time',
        validationFailure.name, validationFailure.type,
        validationFailure.actualType), res);
    }

    // Test duration value again
    if (obj.duration !== undefined && obj.duration < 0) {
      return errors.send(errors.errorBadObjectInvalidField('time', 'duration',
        'positive integer', 'negative integer'), res);
    }

    // Test each activity
    if (obj.activities !== undefined) {
      /* eslint-disable prefer-const */
      for (let activity of obj.activities) {
        /* eslint-enable prefer-const */
        if (helpers.getType(activity) !== 'string') {
          return errors.send(errors.errorBadObjectInvalidField('time',
            'activities', 'slugs', 'array containing at least 1 ' +
            helpers.getType(activity)), res);
        } else if (!helpers.validateSlug(activity)) {
          return errors.send(errors.errorBadObjectInvalidField('time',
            'activities', 'slugs', 'array containing at least 1 invalid slug'),
            res);
        }
      }
    }

    // Test issue URI value
    if (obj.issue_uri !== undefined &&
            !validUrl.isWebUri(obj.issue_uri)) {
      return errors.send(errors.errorBadObjectInvalidField('time', 'issue_uri',
              'URI', 'invalid URI ' + obj.issue_uri), res);
    }

    // Test date worked value
    if (obj.date_worked !== undefined &&
        (!/\d{4}-\d{2}-\d{2}/.test(obj.date_worked) ||
        !Date.parse(obj.date_worked))) {
      return errors.send(errors.errorBadObjectInvalidField('time',
        'date_worked', 'ISO-8601 date', obj.date_worked), res);
    }

    // Test notes value
    if (obj.notes !== undefined && helpers.getType(obj.notes) !== 'string') {
      return errors.send(errors.errorBadObjectInvalidField('time', 'notes',
        'string', helpers.getType(obj.notes)), res);
    }

    // retrieves the time from the database
    knex('times').first().select(
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
      'users.username as username',
      'projectslugs.name as projectSlug')
    .where('times.uuid', '=', req.params.uuid)
    .innerJoin('users', 'users.id', 'times.user')
    .innerJoin('projectslugs', 'projectslugs.project', 'times.project')
    .orderBy('times.revision', 'desc')
    .then(function(time) {
      if (!time) {
        return errors.send(errors.errorObjectNotFound('time'), res);
      }

      if ((user.username !== time.username) && !user.site_admin) {
        return errors.send(errors.errorAuthorizationFailure(user.username,
          'create objects for ' + time.username), res);
      }

      const username = obj.user || time.username;
      helpers.checkUser(username, username).then(function(userId) {
        if (userId !== undefined) {
          time.user = userId;
        } else {
          time.user = time.user;
        }

        const projectSlug = obj.project || time.projectSlug;
        helpers.checkProject(projectSlug).then(function(projectId) {
          time.project = projectId || time.project;
          time.duration = obj.duration || time.duration;
          time.notes = obj.notes || time.notes;
          time.issue_uri = obj.issue_uri || time.issue_uri;
          // created_at is returned as string by postgres
          time.created_at = parseInt(time.created_at, 10);
          time.updated_at = Date.now();
          time.revision += 1;
          delete time.username;
          delete time.projectSlug;

          if (obj.date_worked) {
            time.date_worked = Date.parse(obj.date_worked);
          } else {
            time.date_worked = parseInt(time.date_worked, 10);
          }

          const oldId = time.id;
          delete time.id;

          const activityList = obj.activities || [];
          helpers.checkActivities(activityList).then(function(activityIds) {
            knex.transaction(function(trx) {
              // trx can be used just like knex, but every call is temporary
              // until trx.commit() is called. Until then, they're stored
              // separately, and, if something goes wrong, can be rolled back
              // without side effects.

              trx('times').where({uuid: req.params.uuid, newest: true})
              .update({newest: false}).then(function() {
                trx('times').insert(time).returning('id').then(function(id) {
                  const timeID = id[0];

                  if (!obj.activities) {
                    trx('timesactivities').select('activity')
                    .where('time', oldId).then(function(activities) {
                      const taInsertion = [];
                      /* eslint-disable prefer-const */
                      for (let activity of activities) {
                        /* eslint-enable prefer-const */
                        taInsertion.push({
                          time: timeID,
                          activity: activity.activity,
                        });
                      }

                      trx('timesactivities').insert(taInsertion)
                      .then(function() {
                        trx.commit();
                        return res.send(time);
                      }).catch(function(error) {
                        log.error(req, 'Error copying old time activities: ' +
                                  error);
                        trx.rollback();
                      });
                    }).catch(function(error) {
                      log.error(req, 'Error retrieving old activities: ' +
                                error);
                      trx.rollback();
                    });
                  } else if (helpers.getType(obj.activities) === 'array') {
                    if (obj.activities.length) {
                      const taInsertion = [];
                      /* eslint-disable prefer-const */
                      for (let activity of activityIds) {
                        /* eslint-enable prefer-const */
                        taInsertion.push({
                          time: timeID,
                          activity: activity,
                        });
                      }

                      trx('timesactivities').insert(taInsertion)
                      .then(function() {
                        trx.commit();
                        return res.send(time);
                      }).catch(function(error) {
                        log.error(req, 'Error inserting new time activities: ' +
                                  error);
                        trx.rollback();
                      });
                    } else {
                      trx.commit();
                      return res.send(time);
                    }
                  }
                }).catch(function(error) {
                  log.error(req, 'Error inserting updated time: ' + error);
                  trx.rollback();
                });
              }).catch(function(error) {
                log.error(req, 'Error deprecating old time: ' + error);
                trx.rollback();
              });
            }).catch(function(error) {
              log.error(req, 'Rolling back transaction.');
              return errors.send(errors.errorServerError(error), res);
            });
          }).catch(function() {
            return errors.send(errors.errorInvalidForeignKey('time',
                    'activities'), res);
          });
        }).catch(function() {
          return errors.send(errors.errorInvalidForeignKey('time', 'project'),
            res);
        });
      }).catch(function() {
        return errors.send(errors.errorInvalidForeignKey('time', 'user'), res);
      });
    }).catch(function(error) {
      log.error(req, 'Error retrieving time to update: ' + error);
      return errors.send(errors.errorServerError(error), res);
    });
  });

  authRequest.delete(app, app.get('version') + '/times/:uuid',
  function(req, res, user) {
    const knex = app.get('knex');
    if (!helpers.validateUUID(req.params.uuid)) {
      return errors.send(errors.errorInvalidIdentifier('uuid', req.params.uuid),
        res);
    }

    knex('times').select('id', 'user').where('uuid', req.params.uuid).first()
    .then(function(time) {
      if (!time) {
        return errors.send(errors.errorObjectNotFound('uuid', req.params.uuid),
          res);
      }

      if (time.user !== user.id && !user.site_manager && !user.site_admin) {
        return errors.send(errors.errorAuthorizationFailure(user.username,
            'delete time ' + req.params.uuid), res);
      }

      knex.transaction(function(trx) {
        trx('times').where('uuid', req.params.uuid).first()
        .orderBy('revision', 'desc')
        .update({'deleted_at': Date.now()})
        .then(function() {
          trx.commit();
          return res.send();
        }).catch(function(error) {
          log.error(req, 'Error deleting time entry: ' + error);
          trx.rollback();
        });
      }).catch(function(error) {
        log.error(req, 'Rolling back transaction.');
        return errors.send(errors.errorServerError(error), res);
      });
    }).catch(function(error) {
      log.error(req, 'Error retrieving time to delete: ' + error);
      return errors.send(errors.errorServerError(error), res);
    });
  });
};
