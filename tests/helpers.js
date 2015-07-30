var helper = require('../src/helpers');

module.exports = function(expect) {
    describe('checkProject helper function', function() {
        it('Returns true when passed valid project slug', function(done) {
            expect(helper.checkProject('gwm')).to.equal(true);
            done();
        });

        it('Returns false when passed invalid project slug', function(done) {
            expect(helper.checkProject('notaproject')).to.equal(false);
            done();
        });

        it('Returns false when passed null project slug', function(done) {
            expect(helper.checkProject(null)).to.equal(false);
            done();
        });
    });
};
