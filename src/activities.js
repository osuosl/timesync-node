module.exports = function(app) {
    var knex = app.get('knex');
    var errors = require('./errors');

    app.get(app.get('version') + '/activities', function (req, res) {

        knex('activities').then(function(activities) {
            knex('activityslugs').then(function(activityslugs) {
                if (activities.length === 0) {
                    return res.send([]);
                }

                var id_activity_map = {};
                activities.forEach(function(activity) {
                    activity.slugs = [];
                    id_activity_map[activity.id] = activity;
                });
                activityslugs.forEach(function(slug) {
                    id_activity_map[slug.activity].slugs.push(slug.name);
                });

                return res.send(activities);
            });
        });
    });

    app.get(app.get('version') + '/activities/:slug', function (req, res) {

        /*
        * Gets an activity and list of slugs from a slug.
        *
        * First selects an activity from the name of a slug (from the URI).
        * Then selects all slug names which match that activity.
        * Resulting table will look like this:
        *
        * +----+-------------+-------------+
        * | id |     name    |     name    |
        * +----+-------------+-------------+
        * |  4 | development |     dev     |
        * |  4 | development | development |
        * |  4 | development |    coding   |
        * |  4 | development | programming |
        * +----+-------------+-------------+
        */
        activitySubquery = knex('activityslugs').select('activity')
            .where('name', req.params.slug);
        slugsSubquery = knex('activities').select('id').where('id', '=', activitySubquery);

        knex('activityslugs')
        .select('activities.id as id', 'activities.name as name', 'activityslugs.name as slug')
        .where('activity', '=', slugsSubquery)
        .innerJoin('activities', 'activityslugs.activity', 'activities.id')
        .then(function(results) {

            if(results.length !== 0) {
                activity = {id: results[0].id, name: results[0].name, slugs: []};

                results.forEach(function(row) {
                    activity.slugs.push(row.slug);
                })
                res.send(activity);
            } else {
                return res.status(404).send(
                    errors.errorInvalidSlug(req.params.slug + " is not a valid activity slug."));
            }

        });
    });
};
