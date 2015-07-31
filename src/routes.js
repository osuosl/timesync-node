var passport = require('passport');

module.exports = function(app) {
    app.get(app.get('version') + '/', function(req, res) {
        res.send('hello javascript');
    });

    app.post(app.get('version') + '/', function(req, res) {
        res.send('hello javascript');
    });

    app.post('/login',
      passport.authenticate('local'),
      function(req, res) {
          console.log(req.user);
          // If this function gets called, authentication was successful.
          // `req.user` contains the authenticated user.
          res.redirect('/');
      }

    );
};
