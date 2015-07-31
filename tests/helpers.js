<<<<<<< HEAD
// test/helpers.js

var helper = require('../src/helpers');

module.exports = function(expect) {
    // This line exists to please the linters and tests
    // Remove it when you write real tests.
    expect(helper);
    // I don't know where any of these parameters are supposed to go .___.
    describe('checkUser helper function', function() {
        it('Returns true if username == user',
            function(done, res, err, username) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(res.body));
                var projUser = jsonBody.name;
                expect(err).to.be(null);
                expect(username).to.eql(projUser);
                done();
            });
        it('Returns false if username !== user', function(done, res, err) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(res.body));
                var projUser = jsonBody.name;
                expect(err).to.be(null);
                expect('notauser').to.not.eql(projUser);
                done();
        });
    });
};
