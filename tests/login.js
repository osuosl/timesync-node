var chai = require('chai');
chai.use(require('chai-passport-strategy'));

module.exports = function(expect, localPassport) {

    describe('Local successful login', function() {

        it('should return user', function(done) {
            chai.passport.use(localPassport)
            .success(function(user) {
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
            chai.passport.use(localPassport)
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
            chai.passport.use(localPassport)
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
            chai.passport.use(localPassport)
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
};
