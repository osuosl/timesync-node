module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');

    app.get(app.get('version') + '/activities', function(req, res) {

        knex('activities').then(function(activities) {
            if (activities.length === 0) {
                return res.send([]);
            }

            knex('activityslugs').then(function(slugs) {

                var id_activity_map = {};
                for (var i = 0, len = activities.length; i < len; i++) {
                    activities[i].slugs = [];
                    id_activity_map[activities[i].id] = activities[i];
                }

                for (i = 0, len = slugs.length; i < len; i++) {
                    id_activity_map[slugs[i].activity].slugs.push(
                        slugs[i].name);
                }

                return res.send(activities);

            }).error(function(error) {
                var err = errorServerError(error);
                return res.status(err.status).send(err);
            });

        }).error(function(error) {
            var err = errorServerError(error);
            return res.status(err.status).send(err);
        });
    });

    app.get(app.get('version') + '/activities/:slug', function(req, res) {

        if (!errors.checkValidSlug(req.params.slug)) {
            var err = errors.errorInvalidIdentifier('slug', req.params.slug);
            return res.status(err.status).send(err);
        }

        /*
        * Gets an activity and list of slugs from a slug.
        *
        * First selects an activity from the name of a slug (from the URI).
        * Then selects all slug names which match that activity.
        * Resulting table will look like this:
        *
        * +----+-------------+-------------+
        * | id |     name    |     slug    |
        * +----+-------------+-------------+
        * |  4 | development |     dev     |
        * |  4 | development | development |
        * |  4 | development |    coding   |
        * |  4 | development | programming |
        * +----+-------------+-------------+
        *
        * Equivalent SQL:
        *       SELECT activities.id AS id, activities.name AS name,
        *           activityslugs.name AS slug
        *       FROM activityslugs
        *       INNER JOIN activities ON activityslugs.activity = activities.id
        *       WHERE activityslugs.activity =
        *               (SELECT id FROM activities WHERE id =
        *                   (SELECT activity FROM activityslugs
        *                    WHERE name = $slug)
        *               )
        */
        activitySubquery = knex('activityslugs').select('activity')
            .where('name', req.params.slug);
        slugsSubquery = knex('activities').select('id').where(
            'id', '=', activitySubquery);

        knex('activityslugs')
        .select('activities.id as id', 'activities.name as name',
            'activityslugs.name as slug')
        .where('activityslugs.activity', '=', slugsSubquery)
        .innerJoin('activities', 'activityslugs.activity', 'activities.id')
        .then(function(results) {

            if (results.length !== 0) {
                activity = {
                    id: results[0].id,
                    name: results[0].name,
                    slugs: []
                };

                for (var i = 0, len = results.length; i < len; i++) {
                    activity.slugs.push(results[i].slug);
                }

                res.send(activity);
            } else {
                var err = errors.errorObjectNotFound('activity');
                return res.status(err.status).send(err);
            }

        }).error(function(error) {
            var err = errorServerError(error);
            return res.status(err.status).send(err);
        });
    });
};
