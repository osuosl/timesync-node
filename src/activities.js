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
}
