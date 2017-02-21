'use strict';

function createError(status, name, text, values) {
  const err = {
    status: status,
    error: name,
    text: text,
  };

  if (values) {
    err.values = values;
  }

  return err;
}

module.exports = {

  /*
  * Helper function to determine if a given slug is valid or not.
  */
  isInvalidSlug: function(slug) {
    return !slug.match(/^([a-zA-Z0-9\-_]*)$/);
  },

  /*
  * Error 1: Object not found. Valid identifier, but does not point to a real
  * object.
  *
  * param object (string): The name of the requested object type.
  */
  errorObjectNotFound: function(object) {
    return createError(404, 'Object not found', 'Nonexistent ' + object);
  },

  /*
  * Error 2: Server error. Error on the server that is not the client's
  * fault.
  *
  * param serverError (string): The error message (e.g. a SQL error).
  */
  errorServerError: function(serverError) {
    if (process.env.DEBUG) {
      return createError(500, 'Server error', JSON.stringify(serverError));
    }
    return createError(500, 'Server error', 'Unexpected server error.');
  },

  /*
  * Error 3: Invalid foreign key. Client POSTed a valid object which
  * references a
  * non-existent one.
  *
  * param objectType (string): The name of the supplied object's type.
  * param foreignKey (string): The name of the invalid key.
  */
  errorInvalidForeignKey: function(objectType, foreignKey) {
    return createError(409, 'Invalid foreign key', 'The ' + objectType +
    ' does not contain a valid ' + foreignKey + ' reference.');
  },

  /*
  * Error 4: Bad object. Variant 1: Unknown field. Client POSTed an object
  * with an
  * unknown field.
  *
  * param objectType (string): The name of the supplied object's type.
  * param fieldName (string): The name of the unrecognized field.
  */
  errorBadObjectUnknownField: function(objectType, fieldName) {
    return createError(400, 'Bad object', objectType + ' does not have a ' +
    fieldName + ' field');
  },

  /*
  * Error 4: Bad object. Variant 2: Missing field. Client POSTed an object
  * which did not contain a required field.
  *
  * param objectType (string): The name of the supplied object's type.
  * param fieldName (string): The name of the missing field.
  */
  errorBadObjectMissingField: function(objectType, fieldName) {
    return createError(400, 'Bad object', 'The ' + objectType + ' is missing ' +
    'a ' + fieldName);
  },

  /*
  * Error 4: Bad object. Variant 3: Invalid field. Client POSTed an object
  * with all the correct fields, but with an invalid value for one field
  * (e.g. a string for a time).
  *
  * param objectType (string): The name of the supplied object's type.
  * param fieldName (string): The name of the field with the invalid value.
  * param expectedType (string): The actual type that the field should
  *    contain.
  * param receivedType (string): The type of the value received in the
  *    field.
  */
  errorBadObjectInvalidField: function(objectType, fieldName, expectedType,
    receivedType) {
    return createError(400, 'Bad object', 'Field ' + fieldName + ' of ' +
    objectType + ' should be ' + expectedType + ' but was sent as ' +
    receivedType);
  },

  /*
  * Error 4: Bad object. Variant 4: invalid object. Client POSTed an object
  * which could not be parsed as valid JSON, and the server is unable to
  * interpret the object at all.
  */
  errorBadObjectInvalidObject: function() {
    return createError(400, 'Bad object', 'The request body could not be ' +
    'parsed as valid JSON');
  },

  /*
  * Error 5: Invalid identifier. The given slug or ID is not of the correct
  * format to be valid, and therefore could never point to a valid object.
  *
  * param expectedType (string): Either 'slug' or 'ID' depending on which
  *    was expected.
  * param receivedIdentifier(string): The value that was received from the
  *    client.
  */
  errorInvalidIdentifier: function(expectedType, receivedIdentifiers) {
    let message;
    let identifiers;
    if (!Array.isArray(receivedIdentifiers)) {
      message = 'Expected ' + expectedType + ' but received ' +
      receivedIdentifiers;
      identifiers = [receivedIdentifiers];
    } else {
      message = 'Expected ' + expectedType + ' but received: ' +
      receivedIdentifiers.join(', ');
      identifiers = receivedIdentifiers;
    }

    return createError(400, 'The provided identifier was invalid', message,
    identifiers);
  },

  /* Error 6: Authentication failed due to an invalid username. */
  errorInvalidUsername: function(username) {
    return createError(401, 'Invalid username', username + ' is not a valid ' +
    'username');
  },

  /*
  * Error 7: Authentication failure. The token, password, etc. was not
  * valid. Due to the numerous auth types, it takes a string from the auth
  * strategy and returns that.
  */
  errorAuthenticationFailure: function(strategyFailure) {
    return createError(401, 'Authentication failure', strategyFailure);
  },

  /*
  * Error 8: Slugs already exist. Used when a new object is being created,
  but the object being created uses existing slugs.
  */
  errorSlugsAlreadyExist: function(slugs) {
    let message;
    if (slugs.length === 1) {
      message = 'slug ' + slugs[0] + ' already exists';
    } else {
      message = 'slugs ' + slugs.join(', ') + ' already exist';
    }

    return createError(409, 'The slug provided already exists', message, slugs);
  },

  /*
  * Error 9: Authorization failure. Used when a user attempts to do something
  they aren't allowed to do, but is properly authenticated.
  */
  errorAuthorizationFailure: function(user, activity) {
    return createError(401, 'Authorization failure', user +
    ' is not authorized to ' + activity);
  },

  /*
  * Error 10: Request failure. Used when a user attempts to GET, POST,
  * DELETE, etc. an object that is not allowed.
  *
  * Note. Before calling this error in your code, set the 'Allow' header
  *       with - res.setHeader('Allow: ', 'methods allowed')
  *
  * param objectType (string): The name of the supplied object type
  */
  errorRequestFailure: function(objectType) {
    return createError(405, 'Method not allowed', 'The method specified ' +
    'is not allowed for the ' + objectType + ' identified');
  },

  /*
   * Error 11: Authorization type failure. Used when a user attempts to use an
    invalid or unsupported authentication type.
   */
  errorAuthenticationTypeFailure: function(authType) {
    return createError(401, 'Bad query value', authType + ' is not a valid ' +
    'authentication type');
  },

  /*
  * Error 11: Bad query value. Used when a user attempts to query a time with
  * a bad parameter.
  *
  * param delete (string): The name of the requested field
  * param value (string): The invalid query obtained from the user -
  *   contain this in double quotes
  */
  errorBadQueryValue: function(key, value) {
    return createError(400, 'Bad query value', 'Parameter ' + key +
    ' contained invalid value ' + value);
  },

  /*
  * Error 12: Usernames already exist. Used when a new user is being created,
  but the username already belongs to a user.
  */
  errorUsernameAlreadyExists: function(name) {
    return createError(409, 'Username already exists', 'username ' + name +
    ' already exists', [name]);
  },

  /*
   * Helper function to ensure HTTP status is sent and prevent repeated send
   */
  send: function(error, res) {
    if (!res.finished) {
      return res.status(error.status).send(error);
    }

    return null;
  },
};
