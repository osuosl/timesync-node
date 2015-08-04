module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');

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
                project = {id: results[0].id, name: results[0].name,
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
        res.send({});
    });
};
