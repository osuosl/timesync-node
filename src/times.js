'use strict';

module.exports = function(app) {
  const knex = app.get('knex');
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const passport = require('passport');

  app.get(app.get('version') + '/times', function(req, res) {
    let activitiesList = req.query.activity;
    if (typeof activitiesList === 'string') {
      activitiesList = [activitiesList];
    }

    // select all activities, no matter what
    // activities other than those specified are needed in case the time entries
    // have other activities as well
    knex('activities').then(function(activities) {
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
      }

      let selectedActivities = activities;
      if (activitiesList !== undefined) {
        selectedActivities = selectedActivities.filter(function(activity) {
          return activitiesList.indexOf(activity.slug) !== -1;
        });
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
          });
          timesQ = timesQ.whereIn('id', validTimesActivities.map(function(ta) {
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

  app.get(app.get('version') + '/times/:id', function(req, res) {
    if (isNaN(req.params.id)) { // isNaN can check if a string is a number
      const err = errors.errorInvalidIdentifier('ID', req.params.id);
      return res.status(err.status).send(err);
    }

    knex('times').where({id: req.params.id}).then(function(timeList) {
      // get the matching time entry
      if (timeList.length === 1) {
        const time = timeList[0];

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

  app.post(app.get('version') + '/times', function(req, res, next) {
    passport.authenticate('local', function(autherr, user, info) {
      if (!user) {
        const err = errors.errorAuthenticationFailure(info.message);
        return res.status(err.status).send(err);
      }

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
        const err = errors.errorBadObjectInvalidField('time', 'issue_uri', 'URI',
        'invalid URI ' + time.issue_uri);
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
          helpers.checkActivities(time.activities).then(function(activityIds) {
            const createdAt = new Date().toISOString().substring(0, 10);
            const insertion = {
              duration: time.duration,
              user: userId,
              project: projectId,
              notes: time.notes,
              issue_uri: time.issue_uri,
              date_worked: time.date_worked,
              created_at: createdAt,
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
        }).catch(function() {
          const err = errors.errorInvalidForeignKey('time', 'project');
          return res.status(err.status).send(err);
        });
      }).catch(function() {
        const err = errors.errorAuthorizationFailure(user.username,
          'create time entries for ' + time.user);
        return res.status(err.status).send(err);
      });
    })(req, res, next);
  });
};
