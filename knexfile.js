module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    }
  },

  mocha: {
    client: 'sqlite3',
    connection: {
      filename: './test.sqlite3'
    }
  }
};
