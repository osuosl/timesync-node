var DATABASE_SAVE_ERROR = 19;

module.exports = {

  // strip non-alphanumeric, non-hyphens
  function createSlugFrom(name) {
      return name.toLowerCase()
              .replace(/ /g, '-')
              .replace(/[^\w-]+/g, '');
  }

  function errorObjectNotFound(object) {
      return JSON.stringify({
          'error': "Object not found",
          'errno': 1,
          'text': "Invalid " + object
      });
  }

  function errorDatabaseSaveFailed(sql_error) {
      return JSON.stringify({
          'error': "Database save failed",
          'errno': 2,
          'text': sql_error
      });
  }

  function errorInvalidForeignKey(object) {
      return JSON.stringify({
          'error': "Invalid foreign key",
          'errno': 3,
          'text': "Invalid " + object
      });
  }

  function errorNoNameProvided(error) {
      return JSON.stringify({
          'error': "No Name provided",
          'errno': 4,
          'text': error
      });
  }

  function errorInvalidValue(error) {
      return JSON.stringify({
          'error': "The provided value wasn't valid",
          'errno': 5,
          'text': error
      });
  }

}
