// test/helpers.js

var helper = require('../src/helpers');

module.exports = function(expect) {
    describe('checkUser', function() {
        it('Returns success message if username == user', function(done) {
            helper.checkUser(['deanj']).then(function(req, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(res.body));
                var projUser = jsonBody.name;
                expect('deanj').to.eql(projUser);
                done();
            });
        });
        // Include test that checks if username is admin 
        it('Returns error message if username !== user', function(done) {
            helper.checkUser(['notauser']).then(function(req, res) {
                var jsonBody = JSON.parse(String.fromCharCode.apply(res.body));
                var projUser = jsonBody.name;
                expect('notauser').to.not.eql(projUser);
                done();
            });
        });
    });
};
