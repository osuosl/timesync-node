var sqlFixtures = require('sql-fixtures');
var knexfile = require('../knexfile');

var test_data = require('../tests/fixtures/test_data');

sqlFixtures.create(knexfile.development, test_data).then(function () {
  process.exit(0);
});
