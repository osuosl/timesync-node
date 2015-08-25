'use strict';

module.exports = function(app) {
  const knex = app.get('knex');
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const authPost = require('./authenticatedPost');
  const uuid = require('uuid');

  app.get(app.get('version') + '/times', function(req, res) {
    let activitiesList = req.query.activity;
    if (typeof activitiesList === 'string') {
      activitiesList = [activitiesList];
    }

    let usersList = req.query.user;
    if (typeof usersList === 'string') {
      usersList = [usersList];
    }

    let userQuery = knex('users');
    if (usersList !== undefined) {
      userQuery = userQuery.whereIn('username', usersList);
    }

    userQuery.then(function(userObj) {
      let timesQ = knex('times');
      if (usersList !== undefined) {
        const usernames = userObj.map(function(user) {
          return user.username;
        });
        /* eslint-disable prefer-const */
        for (let user of usersList) {
        /* eslint-enable prefer-const */
          if (usernames.indexOf(user) === -1) {
            /* indexOf returns a -1 if the item does not exist in the array
               So, if the username is invalid, return a BadQueryValue error */
            const err = errors.errorBadQueryValue('user', usersList);
            return res.status(err.status).send(err);
          }
        }
        // Map username to its user id, get time entries that match the user id
        timesQ = timesQ.whereIn('user', userObj.map(function(userObjQ) {
          return userObjQ.id;
        }));
      }

      // select all activities, no matter what
      // activities other than those specified are needed in case the time
      // entries have other activities as well
      knex('activities').then(function(activities) {
        let selectedActivities = activities;
        if (activitiesList !== undefined) {
          const activitySlugs = activities.map(function(activity) {
            return activity.slug;
          });
          /* eslint-disable prefer-const */
          for (let activity of activitiesList) {
            /* eslint-enable prefer-const */
            if (activitySlugs.indexOf(activity) === -1) {
              const err = errors.errorBadQueryValue('activity', activity);
              return res.status(err.status).send(err);
            }
          }

      selectedActivities = selectedActivities.map(function(activity) {
        return activity.id;
      });

      // select all timesactivities
      // this can't be limited by the activities the user selected in case
      // a time entry has multiple activities
      knex('timesactivities').then(function(timesActivities) {
        let timesQ = knex('times');
        if (activitiesList !== undefined) {
          const validTimesActivities = timesActivities.filter(function(ta) {
            return selectedActivities.indexOf(ta.activity) !== -1;
        }

        selectedActivities = selectedActivities.map(function(activity) {
          return activity.id;
        });

        // select all timesactivities
        // this can't be limited by the activities the user selected in case
        // a time entry has multiple activities
        knex('timesactivities').then(function(timesActivities) {
          if (activitiesList !== undefined) {
            const validTimesActivities = timesActivities.filter(function(ta) {
              return selectedActivities.indexOf(ta.activity) !== -1;
            });
            timesQ = timesQ.whereIn('id',
            validTimesActivities.map(function(ta) {
              return ta.time;
            }));
          }

          let activitiesDone = false;
          let projectsDone = false;
          let usersDone = false;

          timesQ.then(function(times) {
            if (times.length === 0) {
              return res.send([]);
            }

            knex('users').select('id', 'username').then(function(users) {
              const idUserMap = {};
              for (let i = 0, len = users.length; i < len; i++) {
                // make a map of every user id to their username
                idUserMap[users[i].id] = users[i].username;
              }

              for (let i = 0, len = times.length; i < len; i++) {
                // using that user id, get the username and set it
                // to the time user
                times[i].user = idUserMap[times[i].user];
              }

              // processing finished. Return if others are also finished
              usersDone = true;
              if (activitiesDone && projectsDone) {
                return res.send(times);
              }
            }).catch(function(error) {
              const err = errors.errorServerError(error);
              return res.status(err.status).send(err);
            });

            knex('projects').then(function(projects) {
              if (projects.length === 0) {
                return res.send([]);
              }

              knex('projectslugs').then(function(slugs) {
                const idProjectMap = {};
                for (let i = 0, len = projects.length; i < len; i++) {
                  projects[i].slugs = [];
                  // make a map of every project id to the project object
                  idProjectMap[projects[i].id] = projects[i];
                }

                for (let i = 0, len = slugs.length; i < len; i++) {
                  // add every slug to its relevant project
                  idProjectMap[slugs[i].project].slugs.push(slugs[i].name);
                }

                for (let i = 0, len = times.length; i < len; i++) {
                  // set the project field of the time entry to
                  // the list of slugs
                  times[i].project = idProjectMap[times[i].project]
                  .slugs;
                }

                // processing finished. Return if others are also finished
                projectsDone = true;
                if (activitiesDone && usersDone) {
                  res.send(times);
                }
              }).catch(function(error) {
                const err = errors.errorServerError(error);
                return res.status(err.status).send(err);
              });
            }).catch(function(error) {
              const err = errors.errorServerError(error);
              return res.status(err.status).send(err);
            });

            // create a map of times to activities
            // contents: for each time entry, a list
            const timeActivityMap = {};
            for (let i = 0, len = timesActivities.length; i < len; i++) {
              // if we've not added the current time entry to the
              // map, add it now
              if (timeActivityMap[timesActivities[i].time] === undefined) {
                timeActivityMap[timesActivities[i].time] = [];
              }

              for (let j = 0, length = activities.length; j < length; j++) {
                if (activities[j].id === timesActivities[i].activity) {
                  /* if the activity matches the timeActivity,
                  add it to the timeActivityMap's list
                  of activities */
                  timeActivityMap[timesActivities[i].time]
                  .push(activities[j].slug);
                  break;
                }
              }
            }

            for (let i = 0, len = times.length; i < len; i++) {
              if (times[i].activities === undefined) {
                times[i].activities = [];
              }

              // set the time's activities to the list generated
              // above
              times[i].activities = timeActivityMap[times[i].id];
            }

            // processing finished. Return if others are also finished
            activitiesDone = true;
            if (usersDone && projectsDone) {
              return res.send(times);
            }
          });
        });
      }).catch(function(error) {
        const err = errors.errorServerError(error);
        return res.status(err.status).send(err);
      });
    });

  app.get(app.get('version') + '/times/:uuid', function(req, res) {
    if (!helpers.validateUUID(req.params.uuid)) {
      const err = errors.errorInvalidIdentifier('UUID', req.params.uuid);
      return res.status(err.status).send(err);
    }

    knex('times').first().where({uuid: req.params.uuid})
    .orderBy('revision', 'desc').then(function(time) {
      // get the matching time entry
      if (time) {
        knex('users').where({id: time.user}).select('username')
        .then(function(user) {
          // set its user
          time.user = user[0].username;

          knex('activities').select('slug').where('id', 'in',
          knex('timesactivities').select('activity').where({time: time.id}))
          .then(function(slugs) {
            // and get all matching timeActivities

            time.activities = [];
            for (let i = 0, len = slugs.length; i < len; i++) {
              // add a list containing all activities
              time.activities.push(slugs[i].slug);
            }

            knex('projectslugs').where({project: time.project}).select('name')
            .then(function(projectSlugs) {
              // lastly, set the project
              time.project = [];
              for (let i = 0, len = projectSlugs.length; i < len; i++) {
                time.project.push(projectSlugs[i].name);
              }

              return res.send(time);
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
      } else {
        const err = errors.errorObjectNotFound('time');
        return res.status(err.status).send(err);
      }
    }).catch(function(error) {
      const err = errors.errorServerError(error);
      return res.status(err.status).send(err);
    });
  });

  authPost(app, app.get('version') + '/times', function(req, res, user) {
    const time = req.body.object;

    // Test existence and datatypes
    const badField = helpers.validateFields(time, [
      {name: 'duration', type: 'number', required: true},
      {name: 'project', type: 'string', required: true},
      {name: 'activities', type: 'array', required: true},
      {name: 'user', type: 'string', required: true},
      {name: 'issue_uri', type: 'string', required: false},
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
    if (!Date.parse(time.date_worked)) {
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
            const createdAt = new Date().toISOString().substring(0, 10);
            const insertion = {
              duration: time.duration,
              user: userId,
              project: projectId,
              notes: time.notes,
              issue_uri: time.issue_uri,
              date_worked: time.date_worked,
              created_at: createdAt,
              uuid: time.uuid,
              revision: 1,
            };

            knex('times').insert(insertion).then(function(timeIds) {
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

              knex('timesactivities').insert(taInsertion).then(function() {
                time.id = timeId;
                return res.send(JSON.stringify(time));
              }).catch(function(error) {
                knex('times').del().where({id: timeId}).then(function() {
                  const err = errors.errorServerError(error);
                  return res.status(err.status).send(err);
                });
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
  authPost(app, app.get('version') + '/times/:uuid', function(req, res, user) {
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
    if (obj.date_worked !== undefined && !Date.parse(obj.date_worked)) {
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

    // retrieves the time from the database
    knex('times').select('times.duration as duration', 'times.user as user',
            'times.project as project', 'times.notes as notes',
            'times.issue_uri as issue_uri',
            'times.date_worked as date_worked',
            'times.created_at as created_at',
            'times.updated_at as updated_at', 'times.id as id',
            'times.uuid as uuid', 'times.revision as revision',
            'users.username as owner', 'projectslugs.name as projectName')
    .where('times.uuid', '=', req.params.uuid).innerJoin('users', 'users.id',
                'times.user').innerJoin('projectslugs', 'projectslugs.id',
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
          time[0].date_worked = obj.date_worked || time[0].date_worked;
          time[0].updated_at = new Date().toISOString().substring(0, 10);
          time[0].revision += 1;
          delete time[0].owner;
          delete time[0].projectName;

          const oldId = time[0].id;
          delete time[0].id;

          const activityList = obj.activities || [];
          helpers.checkActivities(activityList).then(function(activityIds) {
            knex('times').where({id: oldId})
            .update({'deleted_at': Date.now()}).then(function() {
              knex('times').insert(time[0]).then(function(id) {
                time[0].id = id[0];

                if (helpers.getType(obj.activities) !== 'array' ||
                obj.activities.length) {
                  if (!obj.activities) {
                    knex('timesactivities').select('activity')
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

                      knex('timesactivities').insert(taInsertion)
                      .then(function() {
                        return res.send(time);
                      }).catch(function(error) {
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

                    knex('timesactivities').insert(taInsertion)
                    .then(function() {
                      return res.send(time);
                    }).catch(function(error) {
                      const err = errors.errorServerError(error);
                      return res.status(err.status).send(err);
                    });
                  }
                } else {
                  return res.send(time);
                }
              }).catch(function(error) {
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
  });
};
