module.exports = {
  development: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING
  },

  mocha: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
    pool: { min: 1, max: 1 }
  },

  production: {
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING
  },
};
