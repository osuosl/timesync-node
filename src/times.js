module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');

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
            }).error(function(error) {
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
                }).error(function(error) {
                    var err = errors.errorServerError(error);
                    return res.status(err.status).send(err);
                });
            }).error(function(error) {
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
                }).error(function(error) {
                    var err = errors.errorServerError(error);
                    return res.status(err.status).send(err);
                });

            }).error(function(error) {
                var err = errors.errorServerError(error);
                return res.status(err.status).send(err);
            });

        }).error(function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });
    });

    app.get(app.get('version') + '/times/:id', function(req, res) {

        if (isNaN(req.params.id)) { //isNaN can check if a string is a number
            var err = errors.errorInvalidIdentifier('ID', req.params.slug);
            return res.status(err.status).send(err);
        }

        knex('times').where({id: req.params.id}).then(function(timeList) {
            // get the matching time entry
            if (timeList.length === 1) {
                time = timeList[0];

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

                        }).error(function(error) {
                            var err = errors.errorServerError(error);
                            return res.status(err.status).send(err);
                        });

                    }).error(function(error) {
                        var err = errors.errorServerError(error);
                        return res.status(err.status).send(err);
                    });

                }).error(function(error) {
                    var err = errors.errorServerError(error);
                    return res.status(err.status).send(err);
                });

            } else {
                var err = errors.errorObjectNotFound('time');
                return res.status(err.status).send(err);
            }

        }).error(function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });
    });
};
