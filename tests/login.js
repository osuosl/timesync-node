var passport = require('passport');
var chai = require('chai');
chai.use(require('chai-passport-strategy'));

module.exports = function(expect, local_passport, knex) {

    describe('Local successful login', function() {

        it('should return user', function(done) {
            chai.passport.use(local_passport)
            .success(function(user, info) {
                expect(user).to.be.an.object;
                expect(user.username).to.equal('tschuy');
                done();
            })
            .req(function(req) {
                req.body = {};
                req.body.username = 'tschuy';
                req.body.password = 'password';
            })
            .authenticate();

        });

        it('returns invalid username message', function(done) {
            chai.passport.use(local_passport)
            .fail(function(challenge) {
                expect(challenge.message).to.equal('Incorrect username.');
                done();
            })
            .req(function(req) {
                req.body = {};
                req.body.username = 'notauser';
                req.body.password = 'password';
            })
            .authenticate();
        });

        it('returns invalid password message', function(done) {
            chai.passport.use(local_passport)
            .fail(function(challenge) {
                expect(challenge.message).to.equal('Incorrect password.');
                done();
            })
            .req(function(req) {
                req.body = {};
                req.body.username = 'tschuy';
                req.body.password = 'pass';
            })
            .authenticate();
        });

        it('returns missing user/pass message', function(done) {
            chai.passport.use(local_passport)
            .fail(function(challenge) {
                expect(challenge.message).to.equal('Missing credentials');
                done();
            })
            .req(function(req) {
                req.body = {};
            })
            .authenticate();
        });
    });
}
