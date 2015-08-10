module.exports = function(expect, app) {
    var helpers = require('../src/helpers')(app);
    describe('checkUser', function() {
        it('Returns user ID if username == user', function(done) {
            helpers.checkUser('tschuy', 'tschuy').then(function(userID) {
                expect(userID).to.equal(2);
                done();
            });
        });
        // Later: Include a test that checks if username is admin
        it('Returns false if username !== user', function(done) {
            helpers.checkUser('notauser', 'tschuy').then()
            .catch(function(err) {
                expect(err).to.be.an('undefined');
                done();
            });
        });
    });

    describe('validateFields', function() {
        it('returns field when field is missing if required', function(done) {
            var obj = {string: 'string', array: []};
            var fields = [
              {name: 'string', type: 'string', required: true},
              {name: 'array', type: 'array', required: true},
              {name: 'integer', type: 'number', required: true},
            ];

            var validation = helpers.validateFields(obj, fields);

            var expectedReturn = {
                name: 'integer',
                type: 'number',
                actualType: 'undefined'
            };

            expect(validation).to.deep.equal(expectedReturn);
            done();
        });

        it('returns field if field is of wrong type', function(done)  {
            var obj = {string: 'string', array: [], integer: 'string'};
            var fields = [
                {name: 'string', type: 'string', required: true},
                {name: 'array', type: 'array', required: true},
                {name: 'integer', type: 'number', required: true},
            ];

            var validation = helpers.validateFields(obj, fields);

            var expectedReturn = {
                name: 'integer',
                type: 'number',
                actualType: 'string'
            };

            expect(validation).to.deep.equal(expectedReturn);
            done();
        });

        it('returns nothing when field is missing if not req', function(done)  {
            var obj = {string: 'string', array: []};
            var fields = [
                {name: 'string', type: 'string', required: true},
                {name: 'array', type: 'array', required: true},
                {name: 'integer', type: 'number', required: false},
            ];

            var validation = helpers.validateFields(obj, fields);

            expect(validation).to.be.an('undefined');
            done();
        });

        it('returns nothing when fields are good', function(done)  {
            var obj = {string: 'string', array: [], integer: 1};
            var fields = [
                {name: 'string', type: 'string'},
                {name: 'array', type: 'array'},
                {name: 'integer', type: 'number'},
            ];

            var validation = helpers.validateFields(obj, fields, false);

            expect(validation).to.be.an('undefined');
            done();
        });
    });

    describe('validateSlug', function() {
        it('returns true for proper slug', function(done) {
            expect(helpers.validateSlug('kitten')).to.equal(true);
            done();
        });

        var properSlug = 'returns true for proper slug ';
        it(properSlug + 'with hyphen', function(done) {
            expect(helpers.validateSlug('kitten-be-cool')).to.equal(true);
            done();
        });

        it(properSlug + 'with hyphens and numbers', function(done) {
            expect(helpers.validateSlug('a1-b2-c3')).to.equal(true);
            done();
        });

        it(properSlug + 'starting with nums', function(done) {
            expect(helpers.validateSlug('123abc')).to.equal(true);
            done();
        });

        it(properSlug + 'with only one letter', function(done) {
            expect(helpers.validateSlug('a')).to.equal(true);
            done();
        });

        it(properSlug + 'starting with number-hyphen', function(done) {
            expect(helpers.validateSlug('1-23abc')).to.equal(true);
            done();
        });

        it(properSlug + 'starting with number-letter-hyphen', function(done) {
            expect(helpers.validateSlug('1a-23abc')).to.equal(true);
            done();
        });

        it('returns false for empty string', function(done) {
            expect(helpers.validateSlug('')).to.equal(false);
            done();
        });

        it('returns false for only-numbers', function(done) {
            expect(helpers.validateSlug('123')).to.equal(false);
            done();
        });

        it('returns false for null input', function(done) {
            expect(helpers.validateSlug(null)).to.equal(false);
            done();
        });

        it('returns false for beginning hyphen', function(done) {
            expect(helpers.validateSlug('-a')).to.equal(false);
            done();
        });

        it('returns false for ending hyphen', function(done) {
            expect(helpers.validateSlug('a-')).to.equal(false);
            done();
        });

        it('returns false for undefined input', function(done) {
            expect(helpers.validateSlug(undefined)).to.equal(false);
            done();
        });

        it('returns false with non-alphanumeric input', function(done) {
            expect(helpers.validateSlug('a2-$c')).to.equal(false);
            done();
        });

        it('returns false for slugs with multiple hyphens in a row',
        function(done) {
            expect(helpers.validateSlug('a1b2--c3')).to.equal(false);
            done();
        });
    });

    describe('checkProject', function() {
        it('returns a project ID for proper slug', function(done) {
            helpers.checkProject('ganeti-webmgr').then(function(project) {
                expect(project).to.equal(1);
                done();
            });
        });

        it('throws when passed undefined', function(done) {
            helpers.checkProject(undefined).then().catch(function(err) {
                // this means that the time.slug was undefined
                expect(err).to.deep.equal({type: 'invalid', value: undefined});
                done();
            });
        });

        it('throws when passed a nonexistent slug', function(done) {
            helpers.checkProject('dogs').then().catch(function(err) {
                expect(err).to.deep.equal({type: 'nonexistent', value: 'dogs'});
                done();
            });
        });

        it('throws when passed a null slug', function(done) {
            helpers.checkProject(null).then().catch(function(err) {
                expect(err).to.deep.equal({type: 'invalid', value: null});
                done();
            });
        });

        it('throws when passed a bad slug', function(done) {
            helpers.checkProject('#!^kittens').then().catch(function(err) {
                expect(err).to.deep.equal(
                    {type: 'invalid', value: '#!^kittens'});
                done();
            });
        });
    });

    describe('getType', function() {

        it('returns "array" for an array', function(done) {
            expect(helpers.getType([])).to.equal('array');
            done();
        });

        it('returns "string" for a string', function(done) {
            expect(helpers.getType('')).to.equal('string');
            done();
        });

        it('returns "undefined" for undefined', function(done) {
            expect(helpers.getType(undefined)).to.equal('undefined');
            done();
        });

        it('returns "null" for null', function(done) {
            expect(helpers.getType(null)).to.equal('null');
            done();
        });

        it('returns "number" for int', function(done) {
            expect(helpers.getType(12)).to.equal('number');
            done();
        });

        it('returns "number" for float', function(done) {
            expect(helpers.getType(12.2)).to.equal('number');
            done();
        });
    });
};
