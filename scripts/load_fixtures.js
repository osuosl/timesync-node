var sqlFixtures = require('sql-fixtures');
var knexfile = require('../knexfile');

var testData = require('../tests/fixtures/test_data');

sqlFixtures.create(knexfile.development, testData).then(function() {
  process.exit(0);
});
