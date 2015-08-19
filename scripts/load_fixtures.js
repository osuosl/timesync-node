const sqlFixtures = require('sql-fixtures');
const knexfile = require('../knexfile');

const testData = require('../tests/fixtures/test_data');

sqlFixtures.create(knexfile.development, testData).then(function quit() {
    process.exit(0);
  }
);
