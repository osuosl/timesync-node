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
            var users_done = false,
                activities_done = false,
                projects_done = false;

            knex('users').select('id', 'username').then(function(users) {

                var id_user_map = {};
                for (var i = 0, len = users.length; i < len; i++) {
                    id_user_map[users[i].id] = users[i].username;
                }

                for (i = 0, len = times.length; i < len; i++) {
                    times[i].user = id_user_map[times[i].user];
                }

                users_done = true;
                if (activities_done && projects_done) {
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

                    var time_activity_map = {};
                    for (var i = 0, len = timesactivities.length; i < len;
                    i++) {
                        if (time_activity_map[timesactivities[i].time] ===
                        undefined) {
                            time_activity_map[timesactivities[i].time] = [];
                        }

                        for (var j = 0, length = activities.length; j < length;
                        j++) {
                            if (activities[j].id ===
                            timesactivities[i].activity) {
                                time_activity_map[timesactivities[i].time]
                                    .push(activities[j].slug);
                                break;
                            }
                        }
                    }

                    for (i = 0, len = times.length; i < len; i++) {
                        if (times[i].activities === undefined) {
                            times[i].activities = [];
                        }

                        times[i].activities = time_activity_map[times[i].id];
                    }

                    activities_done = true;
                    if (users_done && projects_done) {
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

                    var id_project_map = {};
                    for (var i = 0, len = projects.length; i < len; i++) {
                        projects[i].slugs = [];
                        id_project_map[projects[i].id] = projects[i];
                    }

                    for (i = 0, len = slugs.length; i < len; i++) {
                        id_project_map[slugs[i].project].slugs.push(
                            slugs[i].name);
                    }

                    for (i = 0, len = times.length; i < len; i++) {
                        times[i].project = id_project_map[times[i].project]
                            .slugs;
                    }

                    projects_done = true;
                    if (activities_done && users_done) {
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

        knex('times').where({id: req.params.id}).then(function(time_list) {
            if (time_list.length === 1) {
                time = time_list[0];

                knex('users').where({id: time.user}).select('username')
                .then(function(user) {
                    time.user = user[0].username;

                    knex('activityslugs').where({activity: time.activity})
                    .select('name').then(function(slugs) {
                        time.activity = [];
                        for (var i = 0, len = slugs.length; i < len; i++) {
                            time.activities.push(slugs[i].slug);
                        }

                        knex('projectslugs').where({project: time.project})
                        .select('name').then(function(slugs) {
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
