var helper = require('../src/helpers');

module.exports = function(expect) {
    describe('check_project helper function', function() {
        it('Returns true when passed valid project slug', function(done) {
            expect(helper.check_project('gwm')).to.equal(true);
            done();
        });

        it('Returns false when passed invalid project slug', function(done) {
            expect(helper.check_project('notaproject')).to.equal(false);
            done();
        });

        it('Returns false when passed null project slug', function(done) {
            expect(helper.check_project(null)).to.equal(false);
            done();
        });
    });
};
