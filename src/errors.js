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
     * param server_error (string): The error message (e.g. a SQL error).
     */
    errorServerError: function(server_error) {
        if (process.env.DEBUG) {
            return createError(500, 'Server error', server_error);
        } else {
            return createError(500, 'Server error', 'Unexpected server error.');
        }
    },

    /*
     * Error 3: Invalid foreign key. Client POSTed a valid object which
     * references a
     * non-existent one.
     *
     * param object_type (string): The name of the supplied object's type.
     * param foreign_key (string): The name of the invalid key.
     */
    errorInvalidForeignKey: function(object_type, foreign_key) {
        return createError(409, 'Invalid foreign key', 'The ' + object_type +
            ' does not contain a valid ' + foreign_key + ' reference.');
    },

    /*
     * Error 4: Bad object. Variant 1: Unknown field. Client POSTed an object
     * with an
     * unknown field.
     *
     * param object_type (string): The name of the supplied object's type.
     * param field_name (string): The name of the unrecognized field.
     */
    errorBadObjectUnknownField: function(object_type, field_name) {
        return createError(400, 'Bad object', object_type +
            ' does not have a ' + field_name + ' field');
    },

    /*
     * Error 4: Bad object. Variant 2: Missing field. Client POSTed an object
     * which did not contain a required field.
     *
     * param object_type (string): The name of the supplied object's type.
     * param field_name (string): The name of the missing field.
     */
    errorBadObjectMissingField: function(object_type, field_name) {
        return createError(400, 'Bad object', 'The ' + object_type +
            ' is missing a ' + field_name);
    },

    /*
     * Error 4: Bad object. Variant 3: Invalid field. Client POSTed an object
     * with all the correct fields, but with an invalid value for one field
     * (e.g. a string for a time).
     *
     * param object_type (string): The name of the supplied object's type.
     * param field_name (string): The name of the field with the invalid value.
     * param expected_type (string): The actual type that the field should
     *    contain.
     * param received_type (string): The type of the value received in the
     *    field.
     */
    errorBadObjectInvalidField: function(object_type, field_name, expected_type,
    received_type) {
        return createError(400, 'Bad object', 'Field ' + field_name + ' of ' +
            object_type + ' should be a ' + expected_type +
            ' but was received as ' + received_type);
    },

    /*
     * Error 5: Invalid identifier. The given slug or ID is not of the correct
     * format to be valid, and therefore could never point to a valid object.
     *
     * param expected_type (string): Either 'slug' or 'ID' depending on which
     *    was expected.
     * param received_identifier(string): The value that was received from the
     *    client.
     */
    errorInvalidIdentifier: function(expected_type, received_identifier) {
        return createError(400, 'The provided identifier was invalid',
            'Expected ' + expected_type + ' but received ' +
            received_identifier);
    }

};
