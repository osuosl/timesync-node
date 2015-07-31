function createError(status, name, text) {
    return {
        status: status,
        error: name,
        text: text
    };
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
            return createError(500, 'Server error', serverError);
        } else {
            return createError(500, 'Server error', 'Unexpected server error.');
        }
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
        return createError(400, 'Bad object', objectType +
            ' does not have a ' + fieldName + ' field');
    },

    /*
     * Error 4: Bad object. Variant 2: Missing field. Client POSTed an object
     * which did not contain a required field.
     *
     * param objectType (string): The name of the supplied object's type.
     * param fieldName (string): The name of the missing field.
     */
    errorBadObjectMissingField: function(objectType, fieldName) {
        return createError(400, 'Bad object', 'The ' + objectType +
            ' is missing a ' + fieldName);
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
            objectType + ' should be a ' + expectedType +
            ' but was received as ' + receivedType);
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
    errorInvalidIdentifier: function(expectedType, receivedIdentifier) {
        return createError(400, 'The provided identifier was invalid',
            'Expected ' + expectedType + ' but received ' +
            receivedIdentifier);
    },

    /* Error 6: Authentication failed due to an invalid username. */
    errorInvalidUsername: function(username) {
        return createError(401, 'Invalid username',
            username + " is not a valid username")
    },

    /*
     * Error 7: Authentication failure. The token, password, etc. was not
     * valid. Due to the numerous auth types, it takes a string from the auth
     * strategy and returns that.
    */
    errorAuthenticationFailure: function(strategyFailure) {
        return createError(401, 'Authentication failure', strategyFailure)
    },

};
