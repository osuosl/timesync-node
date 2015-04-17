.. _draft-api:

Draft API
=========
Below is the api specs for the Time Sync project.


Format
------
Responses will be returned in standard JSON format. An attempt will be made to
keep the structure simple. Https will be used for all endpoints. Null values
will be sent with the JSON null value.


Versions
--------
The API will be versioned with simple integers, 1, 2, 3, ...

ex: https://timesync.osuosl.org/1/projects


Errors
------
Errors will be returned only when an error has occurred. They will consist
of an errno, an error category, and an error text. The existence of the 'error'
key indicates an error.

ex:

.. code:: json

    {
        'error': "Database save failed",
        'errno': 2,
        'text': sql_error
    }

Possible errors can include objects not found, invalid foreign keys, and
invalid names, etc.


GET Endpoints
-------------
*/projects*

.. code:: json

    [
      {
         "uri":"https://code.osuosl.org/projects/ganeti-webmgr",
         "name":"Ganeti Web Manager",
         "slug":"gwm",
         "owner": 2,
         "id": 1
      },
      {...},
      ...
    ]

*/projects/<project_id>*

.. code:: json

    {
       "uri":"https://code.osuosl.org/projects/ganeti-webmgr",
       "name":"Ganeti Web Manager",
       "slug":"gwm",
       "owner": 2,
       "id": 1
    }

*/activities*

.. code:: json
    [
        {
           "name":"Documentation",
           "slug":"doc",
           "id": 1
        },
        {...}
    ]

*/activities/id*

.. code:: json

    {
       "name":"Documentation",
       "slug":"doc",
       "id": 1
    }

*/time*

.. code:: json

    [
      {
        "duration":12,
        "user": 2,
        "project": 3,
        "activity": 2,
        "notes":"",
        "issue_uri":"https://github.com/osu-cass/whats-fresh-api/issues/56",
        "date_worked":null,
        "created_at":null,
        "updated_at":null,
        "id": 1
      },
      {...}
    ]

*/time/id*

.. code:: json

    {
      "duration":12,
      "user": 2,
      "project": 3,
      "activity": 2,
      "notes":"",
      "issue_uri":"https://github.com/osu-cass/whats-fresh-api/issues/56",
      "date_worked":null,
      "created_at":null,
      "updated_at":null,
      "id": 1
    }

POST Endpoints
--------------

To add a new object, POST to */<object name>/add* with a JSON body.


*/projects/add*

.. code:: json

    {
       "uri":"https://code.osuosl.org/projects/ganeti-webmgr",
       "name":"Ganeti Web Manager",
       "slug":"gwm",
       "owner": 2,
       "id": 1
    }

*/activities/add*

.. code:: json

    {
       "name":"Documentation",
       "slug":"doc",
       "id": 1
    }

*/time/add*

.. code:: json

    {
      "duration":12,
      "user": 2,
      "project": 3,
      "activity": 2,
      "notes":"",
      "issue_uri":"https://github.com/osu-cass/whats-fresh-api/issues/56",
      "date_worked":null,
      "created_at":null,
      "updated_at":null,
      "id": 1
    }

To update an existing object, POST to */<object name>/update* with a JSON body.
The body only needs to contain the part that is being updated.


*/projects/1*

.. code:: json

    {
       "name":"Ganeti Webmgr",
       "slug":"ganeti-webmgr",
    }

*/activities/1*

.. code:: json

    {
       "slug":"docu"
    }

*/time/1*

.. code:: json

    {
      "duration":20,
      "date_worked":"2015-04-17"
    }

The error bodies for update and add endpoints will respond with an error
message that shows an invalid field. Once the endpoint encounters a single
bad field, it will stop attempting to validate and return immediately.


DELETE Endpoints
----------------

A DELETE request sent to any object's endpoint will result in a DELETE of the
object. For instance, DELETE-ing /activities/1 will return a 200 and delete the
object.

The response body upon success will be empty.

Upon an error, it will return a 404, with an Object Not Found error.

.. code:: json

    {
        error: "Object not found",
        errno: 1,
        text: "Invalid activity"
    }
