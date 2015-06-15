module.exports = function(app) {
  var knex = app.get('knex');

  app.get(app.get('version') + '/activities', function (req, res) {
    knex('activities').then(function (activities) {
      var count = 0;
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
    });
  });
}
