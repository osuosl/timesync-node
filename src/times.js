'use strict';

module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');
    var helpers = require('./helpers')(app);
    var validUrl = require('valid-url');
    var passport = require('passport');

    app.get(app.get('version') + '/times', function(req, res) {

        knex('times').then(function(times) {

            if (times.length === 0) {
                return res.send([]);
            }

            var usersDone = false,
                activitiesDone = false,
                projectsDone = false;

            knex('users').select('id', 'username').then(function(users) {

                var idUserMap = {};
                for (var i = 0, len = users.length; i < len; i++) {
                    // make a map of every user id to their username
                    idUserMap[users[i].id] = users[i].username;
                }

                for (i = 0, len = times.length; i < len; i++) {
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
                var err = errors.errorServerError(error);
                return res.status(err.status).send(err);
            });

            knex('timesactivities').then(function(timesActivities) {
                knex('activities').then(function(activities) {
                    if (activities.length === 0) {
                        return res.send([]);
                    }

                    // create a map of times to activities
                    // contents: for each time entry, a list
                    var timeActivityMap = {};
                    for (var i = 0, len = timesActivities.length; i < len;
                    i++) {
                        // if we've not added the current time entry to the
                        // map, add it now
                        if (timeActivityMap[timesActivities[i].time] ===
                        undefined) {
                            timeActivityMap[timesActivities[i].time] = [];
                        }

                        for (var j = 0, length = activities.length; j < length;
                        j++) {
                            if (activities[j].id ===
                            timesActivities[i].activity) {
                                /* if the activity matches the timeActivity,
                                   add it to the timeActivityMap's list
                                   of activities */
                                timeActivityMap[timesActivities[i].time]
                                    .push(activities[j].slug);
                                break;
                            }
                        }
                    }

                    for (i = 0, len = times.length; i < len; i++) {
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
                    var err = errors.errorServerError(error);
                    return res.status(err.status).send(err);
                });
            }).catch(function(error) {
                var err = errors.errorServerError(error);
                return res.status(err.status).send(err);
            });

            knex('projects').then(function(projects) {
                if (projects.length === 0) {
                    return res.send([]);
                }

                knex('projectslugs').then(function(slugs) {

                    var idProjectMap = {};
                    for (var i = 0, len = projects.length; i < len; i++) {
                        projects[i].slugs = [];
                        // make a map of every project id to the project object
                        idProjectMap[projects[i].id] = projects[i];
                    }

                    for (i = 0, len = slugs.length; i < len; i++) {
                        // add every slug to its relevant project
                        idProjectMap[slugs[i].project].slugs.push(
                            slugs[i].name);
                    }

                    for (i = 0, len = times.length; i < len; i++) {
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
                    var err = errors.errorServerError(error);
                    return res.status(err.status).send(err);
                });

            }).catch(function(error) {
                var err = errors.errorServerError(error);
                return res.status(err.status).send(err);
            });

        }).catch(function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });
    });

    app.get(app.get('version') + '/times/:id', function(req, res) {

        if (isNaN(req.params.id)) { //isNaN can check if a string is a number
            var err = errors.errorInvalidIdentifier('ID', req.params.id);
            return res.status(err.status).send(err);
        }

        knex('times').where({id: req.params.id}).then(function(timeList) {
            // get the matching time entry
            if (timeList.length === 1) {
                let time = timeList[0];

                knex('users').where({id: time.user}).select('username')
                .then(function(user) {
                    // set its user
                    time.user = user[0].username;

                    knex('activities').select('slug').where('id', 'in',
                    knex('timesactivities').select('activity')
                    .where({time: time.id})).then(function(slugs) {
                        // and get all matching timeActivities

                        time.activities = [];
                        for (var i = 0, len = slugs.length; i < len; i++) {
                            // add a list containing all activities
                            time.activities.push(slugs[i].slug);
                        }

                        knex('projectslugs')
                        .where({project: time.project}).select('name')
                        .then(function(slugs) {
                            // lastly, set the project
                            time.project = [];
                            for (var i = 0, len = slugs.length; i < len; i++) {
                                time.project.push(slugs[i].name);
                            }

                            return res.send(time);

                        }).catch(function(error) {
                            var err = errors.errorServerError(error);
                            return res.status(err.status).send(err);
                        });

                    }).catch(function(error) {
                        var err = errors.errorServerError(error);
                        return res.status(err.status).send(err);
                    });

                }).catch(function(error) {
                    var err = errors.errorServerError(error);
                    return res.status(err.status).send(err);
                });

            } else {
                var err = errors.errorObjectNotFound('time');
                return res.status(err.status).send(err);
            }

        }).catch(function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });
    });

    app.post(app.get('version') + '/times', function(req, res, next) {
        passport.authenticate('local', function(autherr, user, info) {
            if (!user) {
                let err = errors.errorAuthenticationFailure(info.message);
                return res.status(err.status).send(err);
            }

            var time = req.body.object;

            // Test duration
            if (!time.duration) {
                let err = errors.errorBadObjectMissingField('time', 'duration');
                return res.status(err.status).send(err);
            }

            if (typeof time.duration !== 'number') {
                let err = errors.errorBadObjectInvalidField('time', 'duration',
                    'positive number', typeof time.duration);
                return res.status(err.status).send(err);
            }

            if (time.duration < 0) {
                let err = errors.errorBadObjectInvalidField('time', 'duration',
                    'positive number', 'negative number');
                return res.status(err.status).send(err);
            }

            //Test existence and type of project
            if (!time.project) {
                let err = errors.errorBadObjectMissingField('time', 'project');
                return res.status(err.status).send(err);
            }

            if (helpers.getType(time.project) !== 'string') {
                let err = errors.errorBadObjectInvalidField('time', 'project',
                    'slug', helpers.getType(time.project));
                return res.status(err.status).send(err);
            }

            //Test existence and type of activities
            if (!time.activities) {
                let err = errors.errorBadObjectMissingField('time',
                                                            'activities');
                return res.status(err.status).send(err);
            }

            if (helpers.getType(time.activities) !== 'array') {
                let err = errors.errorBadObjectInvalidField('time',
                    'activities', 'slugs', helpers.getType(time.project));
                return res.status(err.status).send(err);
            }

            for (let activity of time.activities) {
                if (helpers.getType(activity) !== 'string') {
                    let err = errors.errorBadObjectInvalidField('time',
                        'activities', 'slugs', 'array containing at least 1 ' +
                        helpers.getType(activity));
                    return res.status(err.status).send(err);
                }
            }

            //Test existence and type of user
            if (!time.user) {
                let err = errors.errorBadObjectMissingField('time', 'user');
                return res.status(err.status).send(err);
            }

            if (helpers.getType(time.user) !== 'string') {
                let err = errors.errorBadObjectInvalidField('time', 'user',
                    'username', helpers.getType(time.user));
                return res.status(err.status).send(err);
            }

            //Test issue URI
            //jscs:disable
            if (time.issue_uri && helpers.getType(time.issue_uri) !== 'string') {
                let err = errors.errorBadObjectInvalidField('time', 'issue_uri',
                    'URI', helpers.getType(time.issue_uri));
                return res.status(err.status).send(err);
            }

            if (time.issue_uri && !validUrl.isWebUri(time.issue_uri)) {
                let err = errors.errorBadObjectInvalidField('time', 'issue_uri',
                    'URI', 'invalid URI ' + time.issue_uri);
                return res.status(err.status).send(err);
            }
            //jscs:enable

            //Test date worked
            //jscs:disable
            if (!time.date_worked) {
                let err = errors.errorBadObjectMissingField('time',
                                                            'date_worked');
                return res.status(err.status).send(err);
            }

            if (helpers.getType(time.date_worked) !== 'string') {
                let err = errors.errorBadObjectInvalidField('time', 'date_worked',
                    'ISO-8601 date', helpers.getType(time.date_worked));
                return res.status(err.status).send(err);
            }

            if (!Date.parse(time.date_worked)) {
                let err = errors.errorBadObjectInvalidField('time', 'date_worked',
                    'ISO-8601 date', time.date_worked);
                return res.status(err.status).send(err);
            }
            //jscs:enable

            helpers.checkUser(user.username, time.user).then(function(userId) {
                helpers.checkProject(time.project).then(function(projectId) {
                    helpers.checkActivities(time.activities)
                    .then(function(activityIds) {

                        let createdAt = new Date().toISOString()
                            .substring(0, 10);
                        let insertion = {
                            duration: time.duration,
                            user: userId,
                            project: projectId,
                            notes: time.notes,
                            //jscs:disable
                            issue_uri: time.issue_uri,
                            date_worked: time.date_worked,
                            created_at: createdAt
                            //jscs:enable
                        };

                        knex('times').insert(insertion).then(function(timeId) {

                            timeId = timeId[0];

                            let insertion = [];
                            for (let activityId of activityIds) {
                                insertion.push({
                                    time: timeId,
                                    activity: activityId
                                });
                            }

                            if (insertion.length === 0) {
                                time.id = timeId;
                                return res.send(time);
                            }

                            knex('timesactivities').insert(insertion).then(
                            function() {
                                time.id = timeId;
                                return res.send(JSON.stringify(time));
                            }).catch(function(error) {
                                knex('times').del().where({id: time}).then(
                                function() {
                                    let err = errors.errorServerError(error);
                                    return res.status(err.status).send(err);
                                });
                            });
                        }).catch(function(error) {
                            let err = errors.errorServerError(error);
                            return res.status(err.status).send(err);
                        });
                    }).catch(function() {
                        let err = errors.errorInvalidForeignKey(
                            'time', 'activities');
                        return res.status(err.status).send(err);
                    });
                }).catch(function() {
                    let err = errors.errorInvalidForeignKey('time', 'project');
                    return res.status(err.status).send(err);
                });
            }).catch(function() {
                let err = errors.errorAuthorizationFailure(
                    user.username, 'create time entries for ' + time.user);
                return res.status(err.status).send(err);
            });
        })(req, res, next);
    });
};
