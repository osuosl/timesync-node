'use strict';

module.exports = function(expect, app) {
  const helpers = require('../src/helpers')(app);
  describe('checkUser', function() {
    it('Returns user ID if username == user', function(done) {
      helpers.checkUser('admin1', 'admin1').then(function(userID) {
        expect(userID).to.equal(2);
        done();
      });
    });

    // Later: Include a test that checks if username is admin
    it('Returns false if username !== user', function(done) {
      helpers.checkUser('notauser', 'admin1').then().catch(function(err) {
        expect(err).to.deep.equal({type: 'invalid', value: 'notauser'});
        done();
      });
    });
  });

  describe('validateFields', function() {
    it('returns field when field is missing if required', function(done) {
      const obj = {string: 'string', array: []};
      const fields = [
        {name: 'string', type: 'string', required: true},
        {name: 'array', type: 'array', required: true},
        {name: 'integer', type: 'number', required: true},
      ];

      const validation = helpers.validateFields(obj, fields);

      const expectedReturn = {
        name: 'integer',
        type: 'number',
        required: true,
        missing: true,
      };

      expect(validation).to.deep.equal(expectedReturn);
      done();
    });

    it('returns field if field is of wrong type', function(done) {
      const obj = {string: 'string', array: [], integer: 'string'};
      const fields = [
        {name: 'string', type: 'string', required: true},
        {name: 'array', type: 'array', required: true},
        {name: 'integer', type: 'number', required: false},
      ];

      const validation = helpers.validateFields(obj, fields);

      const expectedReturn = {
        name: 'integer',
        type: 'number',
        required: false,
        actualType: 'string',
        missing: false,
      };

      expect(validation).to.deep.equal(expectedReturn);
      done();
    });

    it('returns nothing when field is missing if not req', function(done) {
      const obj = {string: 'string', array: []};
      const fields = [
        {name: 'string', type: 'string', required: true},
        {name: 'array', type: 'array', required: true},
        {name: 'integer', type: 'number', required: false},
      ];

      const validation = helpers.validateFields(obj, fields);

      expect(validation).to.be.a('null');
      done();
    });

    it('returns nothing when fields are good', function(done) {
      const obj = {string: 'string', array: [], integer: 1};
      const fields = [
        {name: 'string', type: 'string'},
        {name: 'array', type: 'array'},
        {name: 'integer', type: 'number'},
      ];

      const validation = helpers.validateFields(obj, fields, false);

      expect(validation).to.be.a('null');
      done();
    });
  });

  describe('validateSlug', function() {
    it('returns true for proper slug', function(done) {
      expect(helpers.validateSlug('kitten')).to.equal(true);
      done();
    });

    const properSlug = 'returns true for proper slug ';
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

    it('returns false for slugs with several hyphens in a row', function(done) {
      expect(helpers.validateSlug('a1b2--c3')).to.equal(false);
      done();
    });
  });

  describe('checkProject', function() {
    it('returns a project ID for proper slug', function(done) {
      helpers.checkProject('p1').then(function(project) {
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
        expect(err).to.deep.equal({type: 'invalid', value: '#!^kittens'});
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

  describe('checkActivities', function() {
    it('returns a list of activities IDs for proper slugs', function(done) {
      helpers.checkActivities(['docs', 'dev']).then(function(activities) {
        expect(activities).to.deep.have.same.members([1, 2]);
        done();
      });
    });

    it('throws when passed undefined', function(done) {
      helpers.checkActivities(undefined).then().catch(function(err) {
        expect(err).to.deep.equal({type: 'invalid', value: undefined});
        done();
      });
    });

    it('throws when passed a list containing bad slugs', function(done) {
      helpers.checkActivities(['docs', 'dev', 'cats', 'dogs']).then()
      .catch(function(err) {
        expect(err).to.deep.equal({
          type: 'nonexistent',
          value: ['cats', 'dogs'],
        });
        done();
      });
    });

    it('throws when passed a null slug', function(done) {
      helpers.checkActivities(null).then().catch(function(err) {
        expect(err).to.deep.equal({type: 'invalid', value: null});
        done();
      }).catch(function(error) {
        expect(error).to.equal({}); // Obviously will fail, but gives an error
        done();
      });
    });
  });

  describe('validateUUID', function() {
    it('returns true for a valid UUID', function(done) {
      const val = helpers.validateUUID('986fe650-4bef-4e36-a99d-ad880b7f6cad');
      expect(val).to.equal(true);
      done();
    });

    it('returns false for an invalid UUID', function(done) {
      const val = helpers.validateUUID('986fe6504bef-4e36-a99d-!@ad880b7f6cad');
      expect(val).to.equal(false);
      done();
    });

    it('returns false for a non-string UUID', function(done) {
      const val = helpers.validateUUID(0x986fe6504bef4e36a99dad880b7f6cad);
      expect(val).to.equal(false);
      done();
    });

    it('returns false for null', function(done) {
      const val = helpers.validateUUID(null);
      expect(val).to.equal(false);
      done();
    });
  });

  describe('validateDate', function() {
    it('returns true for a valid date', function(done) {
      const val = helpers.validateDate('2016-02-10');
      expect(val).to.equal(true);
      done();
    });

    it('returns false for an invalid date', function(done) {
      const val = helpers.validateDate('2016/03/18');
      expect(val).to.equal(false);
      done();
    });

    it('returns false for a non-string date', function(done) {
      const val = helpers.validateDate(1388534400000);
      expect(val).to.equal(false);
      done();
    });

    it('returns false for null', function(done) {
      const val = helpers.validateDate(null);
      expect(val).to.equal(false);
      done();
    });
  });
};
