module.exports = {
  development: {
    /*client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    }*/
    client: 'pg',
    connection: {
      /*host: '172.17.42.1',
      port: '5432',
      user: 'thai',
      password: 'password1'*/
      process.env.PG_CONNECTION_STRING
    }
  },

  mocha: {
    /*client: 'sqlite3',
    connection: {
      filename: ':memory:'
    }*/
    client: 'pg',
    connection: {
      /*host: '172.17.42.1',
      port: '5432',
      user: 'thai',
      password: 'password1'*/
      process.env.PG_CONNECTION_STRING
    }
  },

  production: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING
  },
};
