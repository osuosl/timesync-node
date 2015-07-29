var passport = require('passport');
var chai = require('chai');
chai.use(require('chai-passport-strategy'));

module.exports = function(expect, request, baseUrl, local_passport) {
    describe('Password-based login strategy', function() {
        var user
          , info;

        before(function(done) {
          chai.passport.use(local_passport)
            .success(function(u, i) {
              user = u;
              info = i;
              done();
            })
            .req(function(req) {
                req.body = {};
                req.body.username = 'tschuy';
                req.body.password = 'password';
            })
            .authenticate();
        });

        it('should supply user', function(done) {
            expect(user).to.be.an.object;
            expect(user.username).to.equal('tschuy');
            done();
        });
    });
}
