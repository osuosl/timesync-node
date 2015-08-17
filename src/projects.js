'use strict';

module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');
    var helpers = require('./helpers')(app);
    var validUrl = require('valid-url');

    app.get(app.get('version') + '/projects', function(req, res) {
        knex('projects').then(function(projects) {
            if (projects.length === 0) {
                return res.send([]);
            }

            // only return the project once both
            // users and slugs have finished processing
            var usersDone = false,
                slugsDone = false;

            knex('users').then(function(users) {
                var idUserMap = {};
                for (var i = 0, len = users.length; i < len; i++) {
                    // make a map of every user id to their username
                    idUserMap[users[i].id] = users[i].username;
                }

                for (i = 0, len = projects.length; i < len; i++) {
                    // using that user id, get the username and set it
                    // to the project owner
                    projects[i].owner = idUserMap[projects[i].owner];
                }

                // processing finished. Return if slugs are also finished
                usersDone = true;
                if (slugsDone) {
                    return res.send(projects);
                }

            }).catch(function(error) {
                var err = errors.errorServerError(error);
                return res.status(err.status).send(err);
            });

            knex('projectslugs').then(function(slugs) {

                var idProjectMap = {};
                for (var i = 0, len = projects.length; i < len; i++) {
                    // add slugs field to every project
                    projects[i].slugs = [];
                    /* make a map of every project id to the whole project
                       this is used to allow us to add slugs to projects
                       by project id */
                    idProjectMap[projects[i].id] = projects[i];
                }

                for (i = 0, len = slugs.length; i < len; i++) {
                    // add slugs to project by project id
                    idProjectMap[slugs[i].project].slugs.push(slugs[i].name);
                }

                // processing finished. Return if users are also finished
                slugsDone = true;
                if (usersDone) {
                    return res.send(projects);
                }

            }).catch(function(error) {
                var err = errors.errorServerError(error);
                return res.status(err.status).send(err);
            });

        }).catch(function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });
    });

    app.get(app.get('version') + '/projects/:slug', function(req, res) {

        if (errors.isInvalidSlug(req.params.slug)) {
            var err = errors.errorInvalidIdentifier('slug', req.params.slug);
            return res.status(err.status).send(err);
        }

        /*
        * Gets an project and list of slugs from a slug.
        *
        * First selects an project from the name of a slug (from the URI).
        * Then selects all slug names which match that project.
        * Resulting table will look like this:
        *
        * +----+---------+----------------------+-------------+
        * | id |   name  |          uri         |     slug    |
        * +----+---------+----------------------+-------------+
        * |  4 | Example | http://example.com/1 |      ex     |
        * |  4 | Example | http://example.com/1 |   example   |
        * |  4 | Example | http://example.com/1 |    sample   |
        * |  4 | Example | http://example.com/1 |   Beispiel  |
        * +----+---------+----------------------+-------------+
        *
        * Equivalent SQL:
        *       SELECT projects.id AS id, projects.name AS name,
        *              projects.uri AS uri, users.username AS owner,
        *              projectslugs.name AS slug FROM projectslugs
        *       INNER JOIN projects ON projectslugs.project = projects.id
        *       INNER JOIN users ON users.id = projects.owner
        *       WHERE projectslugs.project =
        *               (SELECT id FROM projects WHERE id =
        *                   (SELECT project FROM projectslugs
        *                    WHERE name = $slug)
        *               )
        */
        var projectSubquery = knex('projectslugs').select('project')
        .where('name', req.params.slug);
        var slugsSubquery = knex('projects').select('id').where(
            'id', '=', projectSubquery);

        knex('projectslugs')
        .select('projects.id as id', 'projects.name as name',
            'projects.uri as uri', 'users.username as owner',
            'projectslugs.name as slug')
        .where('projectslugs.project', '=', slugsSubquery)
        .innerJoin('projects', 'projectslugs.project', 'projects.id')
        .innerJoin('users', 'users.id', 'projects.owner')
        .then(function(results) {

            if (results.length !== 0) {
                /* manually create our project object from
                   the results. All results should be the same, save
                   the slug, so just create it from the first one
                   */
                let project = {id: results[0].id, name: results[0].name,
                           owner: results[0].owner, uri: results[0].uri,
                           slugs: []};

                for (var i = 0, len = results.length; i < len; i++) {
                    // add slugs to project
                    project.slugs.push(results[i].slug);
                }

                res.send(project);
            } else {
                var err = errors.errorObjectNotFound('project');
                return res.status(err.status).send(err);
            }

        }).catch(function(error) {
            var err = errors.errorServerError(error);
            return res.status(err.status).send(err);
        });
    });

    app.post(app.get('version') + '/projects', function(req, res) {
        var obj = req.body.object;

        // run various checks

        // check validity of uri
        if (obj.uri && !validUrl.isWebUri(obj.uri)) {
            let err = errors.errorInvalidIdentifier('uri', obj.uri);
            return res.status(err.status).send(err);
        }

        // check existence of slugs
        if (!obj.slugs) {
            let err = errors.errorBadObjectMissingField('project', 'slug');
            return res.status(err.status).send(err);
        }

        // check existence of name
        if (!obj.name) {
            let err = errors.errorBadObjectMissingField('project', 'name');
            return res.status(err.status).send(err);
        }

        // check validity of slugs
        var invalidSlugs = obj.slugs.filter(function(slug) {
            return !helpers.validateSlug(slug);
        });

        if (invalidSlugs.length) {
            let err = errors.errorInvalidIdentifier('slug', invalidSlugs);
            return res.status(err.status).send(err);
        }

        // check validity of owner -- it must match the submitting user
        // if checkUser fails, the user submitting the request doesn't match
        helpers.checkUser(req.body.auth.user, obj.owner).then(function(userId) {

            // select any slugs that match the ones submitted
            // this is to check that none of the submitted slugs are currently
            // in use.
            knex('projectslugs').where('name', 'in', obj.slugs)
            .then(function(slugs) {

                // if any slugs match the slugs passed to us, error out
                if (slugs.length) {
                    let err = errors.errorSlugsAlreadyExist(
                        slugs.map(function(slug) {
                            return slug.name;
                        })

                    );
                    return res.status(err.status).send(err);
                }

                // create object to insert into database
                var insertion = {uri: obj.uri, owner: userId, name: obj.name};

                knex('projects').insert(insertion).then(function(project) {
                    // project is a list containing the ID of the
                    // newly created project
                    project = project[0];
                    var projectSlugs = obj.slugs.map(function(slug) {
                        return {name: slug, project: project};
                    });

                    knex('projectslugs').insert(projectSlugs).then(function() {
                        obj.id = project;
                        res.send(JSON.stringify(obj));
                    });
                });

            });
        }).catch(function(err) {
            // checkUser failed, meaning the user is not authorized
            err = errors.errorAuthorizationFailure(
                req.body.auth.user, 'create objects for ' + obj.owner);
            return res.status(err.status).send(err);
        });
    });

    app.delete(app.get('version') + '/projects/:slug', function(req, res) {
        if (!helpers.validateSlug(req.params.slug)) {
            var err = errors.errorInvalidIdentifier('slug', req.params.slug);
            return res.status(err.status).send(err);
        }

        // delete matching project
        knex('times').where('project', '=', function() {
            this.table('projects').select('id').where('id', '=', function() {
                this.table('projectslugs').select('project').where('name',
                        req.params.slug);
            });
        }).then(function(times) {

            if (times.length > 0) {
                res.set('Allow', 'GET, POST');
                let err = errors.errorRequestFailure('project');
                return res.status(err.status).send(err);
            } else {
                knex('projects').select('id').where('id', '=',
                        function() {
                    this.table('projectslugs').select('project').where('name',
                            req.params.slug);
                }).del().then(function(numObj) {

                    /* When deleting something from the table, the number of
                       objects deleted is returned. So to confirm that deletion
                       was successful, make sure that the number returned is at
                       least one. */
                    if (numObj >= 1) {
                        return res.send();
                    }

                    var err = errors.errorObjectNotFound('slug',
                            req.params.slug);
                    return res.status(err.status).send(err);
                }).catch(function(error) {
                    var err = errors.errorServerError(error);
                    return res.status(err.status).send(err);
                });
            }
        });
    });
};
