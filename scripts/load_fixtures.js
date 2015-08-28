'use strict';

const sqlFixtures = require('sql-fixtures');
const knexfile = require('../knexfile');

const testData = require('../tests/fixtures/test_data');
const env = process.env.NODE_ENV || 'development';

sqlFixtures.create(knexfile[env], testData).then(function quit() {
    process.exit(0);
  }
);
