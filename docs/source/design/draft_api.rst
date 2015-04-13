.. _draft-api:

Draft API
=========
Below is the api specs for the Time Sync project.


Format
------
Responses will be returned in standard JSON format. An attempt will be made to
keep the structure simple. Https will be used for all endpoints.

Null values (optional fields that do not have data), will be empty strings: "".


Versions
--------
The API will be versioned with simple integers, 1, 2, 3, ...

ex: https://timesync.osuosl.org/1/projects


Errors
------
Error records will be returned in every message, and will consist of a
dictionary containing the error status, error name, error text, and error
level. The status field will indicate the presence of an error condition, and
should be checked before attempting to process the rest of the response.

ex:

.. code:: json

    error: {error_status: true, error_name: 'not_found_error', error_text: 'product with id=232 could not be found', error_level: 10}


External Fields
---------------
To allow for future expandability, a dictionary call ‘ext’ will be included
with every response. This dictionary will either contain no records, or will
contain additional first-class records that were not included in the original
specification. For instance, if a new attribute “color” is later added to the
product response, it can be included in the extended attributes array.
Applications can choose to discover/use these new fields or ignore them without
effecting backwards compatibility. Response validation should include the
presence of ext, but not its contents.


Endpoints
---------
*/project*

.. code:: json

    {
        error: {...},
        <project_slug>: {
                name: text,
                owner/admin: text,
                uri: text,
                slug: text or null,
        },
        <project_id>: {...},
        ...
    }

*/project/<project_slug>*

.. code:: json

    {
        error: {...},
        name: text,
        owner/admin: text,
        uri: text,
        slug: text or null,
    }

*/project/<project_slug>/activity*

.. code:: json

    {
        name: text,
        slug: text,
    }

*/users*

.. code:: json

    {... ? ...}

*/users/submit_time*

.. code:: json

    {
        project_name: text,
        duration: int,
        user: text,
        activity: text or null,
        notes: text,
        issue_uri: text,
        date: text,
    }
