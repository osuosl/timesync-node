module.exports = {
  development: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING
  },

  mocha: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING
  },

  production: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING
  },
};

