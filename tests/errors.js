var errors = require('../src/errors');

module.exports = function(expect) {
    describe('6: errorInvalidUsername', function() {
        it('returns invalid username error', function(done) {
            err = errors.errorInvalidUsername('bob');
            expect(err.status).to.equal(401);
            expect(err.error).to.equal('Invalid username');
            expect(err.text).to.equal('bob is not a valid username');
            done();
        });
    });

    describe('7: errorAuthenticationFailure', function() {
        it('returns authentication failure block', function(done) {
            err = errors.errorAuthenticationFailure('Invalid key');
            expect(err.status).to.equal(401);
            expect(err.error).to.equal('Authentication failure');
            expect(err.text).to.equal('Invalid key');
            done();
        });
    });
};
