module.exports = {

  // strip non-alphanumeric, non-hyphens
  'createSlugFrom': function(name) {
      return name.toLowerCase()
              .replace(/ /g, '-')
              .replace(/[^\w-]+/g, '');
  },

  'errorObjectNotFound': function(object) {
      return {
          'error': "Object not found",
          'errno': 1,
          'text': "Invalid " + object + " id"
      };
  },

  'errorDatabaseSaveFailed': function(sql_error) {
      return {
          'error': "Database save failed",
          'errno': 2,
          'text': sql_error
      };
  },

  'errorInvalidForeignKey': function(object) {
      return {
          'error': "Invalid foreign key",
          'errno': 3,
          'text': "Invalid " + object + " id"
      };
  },

  'errorNoNameProvided': function(error) {
      return {
          'error': "No Name provided",
          'errno': 4,
          'text': error
      };
  },

  'errorInvalidValue': function(error) {
      return {
          'error': "The provided value wasn't valid",
          'errno': 5,
          'text': error
      };
  },

  'errorInvalidSlug': function(error) {
      return {
          'error': "The provided slug wasn't valid",
          'errno': 6,
          'text': error
      };
  },

  'errorExistingSlug': function(error) {
      return {
          'error': "The provided slug already exists",
          'errno': 7,
          'text': error
      };
  }

};
