module.exports = function(app) {
  var knex = app.get('knex');
  var errors = require('./errors');

  app.get(app.get('version') + '/activities', function (req, res) {
    knex('activities').then(function (activities) {
      var count = 0;
      if (activities.length === 0) {
        return res.send([]);
      }
      activities.forEach(function(activity) {
        knex('activityslugs').where({'activity': activity.id}).select('name').then(function(slugs) {
          activity.slugs = [];
          slugs.forEach(function(slug) {
            activity.slugs.push(slug.name);
          });
          count++;
          if (count == activities.length) {
            return res.send(activities);
          }
        });
      });
    });
  });

  app.get(app.get('version') + '/activities/:slug', function (req, res) {
    knex('activityslugs').where({'name': req.params.slug}).then(function(activity_slug) {
      if(activity_slug.length !== 0) {
        knex('activities').where({'id': activity_slug[0].activity}).then(function (activity_list) {
          knex('activityslugs').where({'activity': activity_slug[0].activity}).select('name').then(function(slugs) {
            activity = activity_list[0];
            activity.slugs = [];
            slugs.forEach(function(slug) {
              activity.slugs.push(slug.name);
            });
            return res.send(activity);
          });
        });
      } else {
        return res.status(404).send(
          errors.errorInvalidSlug(req.params.slug + " is not a valid activity slug."));
      }
    });
  });
};
