function createError(name, number, text) {
    return {
        'error': name,
        'errno': number,
        'text': text
    };
}

module.exports = {

    /*
     * Uncertain of this function's purpose. We don't use it anywhere.
     *      - Tristan
     */
    // strip non-alphanumeric, non-hyphens
    'createSlugFrom': function(name) {
        return name.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
    },

    'errorObjectNotFound': function(object) {
        return createError('Object not found', 1, 'Invalid ' + object + ' id');
    },

    'errorDatabaseSaveFailed': function(sql_error) {
        return createError('Database save failed', 2, sql_error);
    },

    'errorInvalidForeignKey': function(object) {
        return createError('Invalid foreign key', 3, 'Invalid ' + object + ' id');
    },

    'errorNoNameProvided': function(error) {
        return createError('No Name provided', 4, error);
    },

    'errorInvalidValue': function(error) {
        return createError('The provided value wasn\'t valid', 5, error);
    },

    'errorInvalidSlug': function(error) {
        return createError('The provided slug wasn\'t valid', 6, error);
    }

};
