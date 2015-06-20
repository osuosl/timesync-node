Errors
======
Revised proposal for error types and levels from the Timesync API.

Errors will consist of an error number which matches the HTTP status code to be returned,
an error name, and a further informational text. The existence of the 'error'
key indicates an error.

The following error codes will exist:

1. Object not found

To be returned if the server receives a valid key (e.g. Time ID or Activity Slug) which
does not match an object in the database.

.. code:: json
    {
        'status': 404,
        'error': "Object not found",
        'text': "Nonexistent " + object
    }

2. Server error

A generic catch-all for when there is a server error outside of the client's control.
This may be the result of an uncaught exception, a database error, or any other condition
which renders the server unable to process a valid request.

.. code:: json

    {
        'status': 500,
        'error': "Server error",
        'text': server_error (e.g. exception text or sql error)
    }

3. Invalid foreign key

A client attempts to make a POST request to create or update an object, but the new object
sent by the client contains a foreign key parameter which does not point to a valid object
in the database. (E.g. the client sends a new time which does not have a valid project.)

.. code:: json

    {
        'status': 409
        'error': "Invalid foreign key",
        'text': "The " + object_type + " does not contain a valid " + foreign_key + " reference"
    }

4. Bad object

A client attempts to make a POST request to create or update an object, but the new object
sent by the client contains a non-existent key, lacks a necessary key, or contains an invalid
value for a key (e.g. a time with a string in the duration field.)

.. code:: json

    {
        'status': 400
        'error': "Bad object",
        'text': object_type + " does not have a " + field_name + " field" ||
                "The " + object_type + " is missing a " + field_name ||
                "Field " + field_name + " of " + object_type + " should be " +
                    expected_type + " but was sent as " + received_type
    }

5. Invalid identifier

This error would be returned when an identifier field (e.g. time ID or activity slug) is
malformed or otherwise not valid for use. This is to be distinguished from Object not found:
Object not found occurs when a perfectly valid, well-formed identifier is supplied, but
no object matching the identifier could be found; an identifier is considered invalid if
it does not match the expected format (e.g. a slug with special characters or a non-numeric
ID field).

.. code:: json

    {
        'status': 400
        'error': "The provided identifier was invalid",
        'text': "Expected " + (slug|id) + " but received " + received_identifier
    }
