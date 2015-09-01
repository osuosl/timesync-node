'use strict';

module.exports = function(app) {
  const knex = app.get('knex');
  const errors = require('./errors');
  const helpers = require('./helpers')(app);
  const validUrl = require('valid-url');
  const passport = require('passport');

  app.get(app.get('version') + '/times', function(req, res) {
    knex('times').then(function(times) {
      if (times.length === 0) {
        return res.send([]);
      }

      let usersDone = false;
      let activitiesDone = false;
      let projectsDone = false;

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

      knex('timesactivities').then(function(timesActivities) {
        knex('activities').then(function(activities) {
          if (activities.length === 0) {
            return res.send([]);
          }

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
        }).catch(function(error) {
          const err = errors.errorServerError(error);
          return res.status(err.status).send(err);
        });
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
          knex('userroles').where({user: userId, project: projectId}).then(function(roles) {
            if (roles.length === 0 || roles[0].member === false) {
              const err = errors.errorAuthorizationFailure(user.username,
                'create time entries for project ' + time.project + '.');
              return res.status(err.status).send(err);
            }
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
    })(req, res, next);
  });

  // Patch times
  app.post(app.get('version') + '/times/:id', function(req, res, next) {
    //console.log('1');
    Array.prototype.diff = function(a) {
      return this.filter(function(i) {return a.indexOf(i) < 0;});
    };
    //console.log('2');
    passport.authenticate('local', function(autherr, user, info) {
      if (!user) {
        let err = errors.errorAuthenticationFailure(info.message);
        return res.status(err.status).send(err);
      }

      //console.log('3');
      var obj = req.body.object;
      if (obj.duration !== undefined) {
        obj.duration = Number(obj.duration);
      }

      // Test existence and datatypes
      let fields = [
        {name: 'duration', type: 'number', required: false},
        {name: 'project', type: 'string', required: false},
        {name: 'activities', type: 'array', required: false},
        {name: 'user', type: 'string', required: false},
        {name: 'issue_uri', type: 'string', required: false},
        {name: 'date_worked', type: 'string', required: false},
      ];

      //console.log('4');
      let validationFailure = helpers.validateFields(obj, fields);
      if (validationFailure) {
        let err = errors.errorBadObjectInvalidField('time',
          validationFailure.name, validationFailure.type,
          validationFailure.actualType);
        return res.status(err.status).send(err);
      }

      //console.log('5');
      // Test duration value
      if (obj.duration !== undefined && obj.duration < 0) {
        let err = errors.errorBadObjectInvalidField('time', 'duration',
        'positive integer', 'negative integer');
        return res.status(err.status).send(err);
      } else if (obj.duration !== undefined && helpers.getType(obj.duration) === 'object') {
        let err = errors.errorBadObjectInvalidField('time', 'duration',
        'number', 'object');
        return res.status(err.status).send(err);
      } else if (obj.duration !== undefined && isNaN(obj.duration)) {
        let err = errors.errorBadObjectInvalidField('time', 'duration',
        'number', 'object');
        return res.status(err.status).send(err);
      }

      //console.log('6');
      //Test each activity
      if (obj.activities !== undefined) {
        for (let activity of obj.activities) {
          if (!helpers.checkActivities(activity)){
            console.log('1');
            let err = errors.errorInvalidForeignKey('time', 'activity');
            return res.status(err.status.send(err));
          } else if (helpers.getType(activity) !== 'string') {
            console.log('2');
            let err = errors.errorBadObjectInvalidField('time', 'activities',
            'slugs', 'array containing at least 1 ' + helpers.getType(activity));
            return res.status(err.status).send(err);
          } else if (!helpers.validateSlug(activity)) {
            console.log('3');
            let err = errors.errorBadObjectInvalidField('time', 'activities',
            'slugs', 'array containing at least 1 invalid slug');
            return res.status(err.status).send(err);
          }
        }
      }

      //console.log('7');
      //Test issue URI value
      if (obj.issue_uri !== undefined && !validUrl.isWebUri(obj.issue_uri)) {
        let err = errors.errorBadObjectInvalidField('time', 'issue_uri', 'URI',
        'invalid URI ' + obj.issue_uri);
        return res.status(err.status).send(err);
      }

      //console.log('8');
      //Test date worked value
      console.log(obj.date_worked);
      if (obj.date_worked !== undefined && !Date.parse(obj.date_worked)) {
        let err = errors.errorBadObjectInvalidField('time', 'date_worked',
        'ISO-8601 date', obj.date_worked);
        return res.status(err.status).send(err);
      }

      if (obj.notes !== undefined && helpers.getType(obj.notes) !== 'string') {
        let err = errors.errorBadObjectInvalidField('time', 'notes', 
        'string', helpers.getType(obj.notes));
        return res.status(err.status).send(err);
      }

      if (obj.key !== undefined) {
        let err = errors.errorBadObjectUnknownField('time', 'key');
        return res.status(err.status).send(err);
      }

      //console.log('9');
      //Finish checks for user, project, and activity
      /*
      if (obj.user !== undefined) {
        knex('users').where('username', '=', obj.user).then(function (dohicky) {
          if (dohicky.length < 1) {
            let err = errors.errorInvalidForeignKey('time', 'user');
            //console.log(user, err);
            return res.status(err.status).send(err);
          }
        });
      }
      */

      /*
      console.log(obj.project, helpers.checkProject(obj.project));
      helpers.checkProject(obj.project).then(function (whatever) {
        console.log(whatever);
      });
      */

      if (obj.project !== undefined) {
        //console.log(obj.project);
        helpers.checkProject(obj.project).then(function(project) {
          return;
        }).catch(function() {
          let err = errors.errorInvalidForeignKey('time', 'project');
          return res.status(err.status).send(err);
        });
      }

      /*
      //console.log('10');
      if (obj.activities !== undefined) {
        helpers.checkActivities(obj.activities).then(function() {
          return;
        }).catch(function() {
          let err = errors.errorInvalidForeignKey('time', 'activities');
          return res.status(err.status).send(err);
        });
      }
      */


      //console.log('11');
      // retrieves the time from the database
      
      knex('times').select('times.duration as duration', 'times.user as user',
              'times.project as project', 'times.notes as notes',
              'times.issue_uri as issue_uri',
              'times.date_worked as date_worked',
              'times.created_at as created_at',
              'times.updated_at as updated_at', 'times.id as id',
              'users.username as owner')
          .where('times.id', '=', req.params.id).innerJoin('users', 'users.id',
                  'times.user')
          .then(function(time) {
        //console.log('12');
        if (user.username !== time[0].owner) {
          let err = errors.errorAuthorizationFailure(user.username,
            'create objects for ' + time[0].owner);
          return res.status(err.status).send(err);
        }

        //console.log('13');
        knex('users').select('id').where('username', '=', obj.user).then(function (userId) {
          //console.log('14');
          var activityIds;
          if (obj.activities !== undefined) {
            helpers.checkActivities(obj.activities).then(function (aIds) {
              activityIds = aIds;
            });
          }

          //console.log('15');
          if (userId[0] !== undefined) {
            time[0].user = userId[0].id;
          } else {
            time[0].user = time[0].user;
          }
          //console.log('16');
          knex('projectslugs').select('project').where('name', '=', obj.project).then(function (projectId) {
            //console.log('17');
            if (projectId[0] !== undefined) {
              time[0].project = projectId[0].project;
            } else {
              time[0].project = time[0].project;
            }
            //console.log('18');
            time[0].duration = obj.duration || time[0].duration;
            time[0].notes = obj.notes || time[0].notes;
            time[0].issue_uri = obj.issue_uri || time[0].issue_uri;
            time[0].date_worked = obj.date_worked || time[0].date_worked;
            time[0].created_at = obj.created_at || time[0].created_at;
            time[0].updated_at = new Date().toISOString().substring(0,10);
            delete time[0].owner;

            //console.log('19');
            knex('times').where({id: time[0].id}).update(time[0]).then(function (thingy) {
              //console.log('20');
              //console.log(time);
              res.send(time);
              //console.log('21');
              if (activityIds !== undefined) {
                knex('timesactivities').where('time', '=', time[0].id).then(function (tas) {
                  //console.log('22');
                  var taIds = [];
                  for (let ta of tas) {
                    taIds.push(ta.activity);
                  }

                  //console.log('23');
                  var unmatchedTas = taIds.diff(activityIds);
                  var unmatchedActivities = activityIds.diff(taIds);

                  //console.log('24');
                  var taInsertion = [];
                  for (let activityId of unmatchedActivities) {
                    taInsertion.push({
                      time: time[0].id,
                      activity: activityId,
                    });
                  }

                  //console.log('25');
                  knex('timesactivities').where('id', 'in', unmatchedTas).del().then(function (thingy) {
                    //console.log('26');
                    knex('timesactivities').insert(taInsertion).then(function () {
                      //console.log('27');
                      return;
                    });
                  });
                  knex('times').select('created_at').where('id', '=', time[0].id).del().then(function () {
                    //console.log('28');
                    knex('times').select('updated_at').where('id', '=', time[0].id).del().then(function () {
                      //console.log('29');
                      return;
                    });
                  });
                });
              }
            });
          });
        });
      });
    })(req, res, next);
  });
};
