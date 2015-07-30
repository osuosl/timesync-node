module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');

    app.get(app.get('version') + '/times', function(req, res) {

        knex('times').then(function(times) {

            if (times.length === 0) {
                return res.send([]);
            }

            /*
             * Get a map of user ids -> usernames, a map of activity ids ->
             * activity slug names, and a map of project ids -> project slug
             * names ( similarly to the code in activities.js and projects.js),
             * all asynchronously. Each of these activates a boolean flag when
             * they finish. When all booleans are raised, return the times.
             */
            var usersDone = false,
                activitiesDone = false,
                projectsDone = false;

            knex('users').select('id', 'username').then(function(users) {

                var idUserMap = {};
                for (var i = 0, len = users.length; i < len; i++) {
                    idUserMap[users[i].id] = users[i].username;
                }

                for (i = 0, len = times.length; i < len; i++) {
                    times[i].user = idUserMap[times[i].user];
                }

                usersDone = true;
                if (activitiesDone && projectsDone) {
                    return res.send(times);
                }
            }).error(function(error) {
                var err = errors.errorServerError(error);
                return res.status(err.status).send(err);
            });

            knex('timesactivities').then(function(timesactivities) {
                knex('activities').then(function(activities) {
                    if (activities.length === 0) {
                        return res.send([]);
                    }

                    var timeActivityMap = {};
                    for (var i = 0, len = timesactivities.length; i < len;
                    i++) {
                        if (timeActivityMap[timesactivities[i].time] ===
                        undefined) {
                            timeActivityMap[timesactivities[i].time] = [];
                        }

                        for (var j = 0, length = activities.length; j < length;
                        j++) {
                            if (activities[j].id ===
                            timesactivities[i].activity) {
                                timeActivityMap[timesactivities[i].time]
                                    .push(activities[j].slug);
                                break;
                            }
                        }
                    }

                    for (i = 0, len = times.length; i < len; i++) {
                        if (times[i].activities === undefined) {
                            times[i].activities = [];
                        }

                        times[i].activities = timeActivityMap[times[i].id];
                    }

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
                        idProjectMap[projects[i].id] = projects[i];
                    }

                    for (i = 0, len = slugs.length; i < len; i++) {
                        idProjectMap[slugs[i].project].slugs.push(
                            slugs[i].name);
                    }

                    for (i = 0, len = times.length; i < len; i++) {
                        times[i].project = idProjectMap[times[i].project]
                            .slugs;
                    }

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
            if (timeList.length === 1) {
                time = timeList[0];

                knex('users').where({id: time.user}).select('username')
                .then(function(user) {
                    time.user = user[0].username;

                    knex('activities').select('slug').where('id', 'in',
                    knex('timesactivities').select('activity')
                    .where({time: time.id})).then(function(slugs) {

                        time.activities = [];
                        for (var i = 0, len = slugs.length; i < len; i++) {
                            time.activities.push(slugs[i].slug);
                        }

                        knex('projectslugs')
                        .where({project: time.project}).select('name')
                        .then(function(slugs) {
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
