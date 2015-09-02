module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    }
    /*client: 'pg',
    connection: {
      //filename: './dev.sqlite3'
      host: '172.17.42.1',
      port: '5432',
      user: 'thai',
      password: 'password1'
    }*/
  },

  mocha: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    }
    /*client: 'pg',
    connection: {
      host: '172.17.42.1',
      port: '5432',
      user: 'thai',
      password: 'password1'
    }*/
  },

  production: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING
  },
};
