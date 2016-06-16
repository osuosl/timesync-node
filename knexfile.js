'use strict';

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',
    },
  },

  development_pg: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
  },

  mocha_sqlite: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
  },

  mocha: {
    client: 'pg',
    connection: process.env.TEST_PG_CONNECTION_STRING,
  },

  production_pg: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
  },

  production_mysql: {
    client: 'mysql',
    connection: process.env.MYSQL_CONNECTION_STRING,
  },

  production_sqlite: {
    client: 'sqite3',
    connection: {
      filename: process.env.SQLITE_CONNECTION_FILE,
    },
  },
};
