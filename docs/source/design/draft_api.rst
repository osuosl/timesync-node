.. _draft-api:

Draft API
=========
Below is the api specs for the Time Sync project.


Format
------
Responses will be returned in standard JSON format. An attempt will be made to
keep the structure simple. HTTPS will be used for all endpoints. Null values
will be sent with the JSON null value.


Versions
--------
The API will be versioned with the letter 'v' followed by monotonically
increasing integers ('v1', 'v2', 'v3', etc.)

For example: https://timesync.osuosl.org/v1/projects

GET Endpoints
-------------
*/projects*

.. code:: json

    [
      {
         "uri":"https://code.osuosl.org/projects/ganeti-webmgr",
         "name":"Ganeti Web Manager",
         "slugs":[<slugs>],
         "owner": <username>,
         "id": 1
      },
      {...},
      ...
    ]

*/projects/<slug>*

.. code:: json

    {
       "uri":"https://code.osuosl.org/projects/ganeti-webmgr",
       "name":"Ganeti Web Manager",
       "slugs":[<slugs>],
       "owner": <username>,
       "id": 1
    }

*/activities*

.. code:: json
    [
        {
           "name":"Documentation",
           "slugs":[<slugs>],
           "id": 1
        },
        {...}
    ]

*/activities/<slug>*

.. code:: json

    {
       "name":"Documentation",
       "slugs":[<slugs>],
       "id": 1
    }

*/times*

.. code:: json

    [
      {
        "duration":12,
        "user": <username>,
        "project": [<slugs>],
        "activity": [<slugs>],
        "notes":"",
        "issue_uri":"https://github.com/osu-cass/whats-fresh-api/issues/56",
        "date_worked": 2014-04-17,
        "created_at": 2014-04-17,
        "updated_at":null,
        "id": 1
      },
      {...}
    ]

*/times/<time entry id>*

.. code:: json

    {
      "duration":12,
      "user": <username>,
      "project": [<slugs>],
      "activity": [<slugs>],
      "notes":"",
      "issue_uri":"https://github.com/osu-cass/whats-fresh-api/issues/56",
      "date_worked":null,
      "created_at":2014-04-17,
      "updated_at":2014-04-17,
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
       "slugs":[<slugs>],
       "owner": <username>
    }

*/activities/add*

.. code:: json

    {
       "name":"Documentation",
       "slugs":[<slugs>]
    }

*/times/add*

.. code:: json

    {
      "duration":12,
      "user": <username>,
      "project": <slug>,
      "activity": <slug>,
      "notes":"",
      "issue_uri":"https://github.com/osu-cass/whats-fresh-api/issues/56",
      "date_worked":null,
      "created_at":null,
      "updated_at":null
    }

To update an existing object, POST to */<object name>/<id>* with a JSON body.
The body only needs to contain the part that is being updated.


*/projects/<slug>*

.. code:: json

    {
       "name":"Ganeti Webmgr",
       "slugs":[<slugs>],
    }

*/activities/<slug>*

.. code:: json

    {
       "slugs":[<slugs>]
    }

*/times/<id>*

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

Upon an error, it will return an Object Not Found error with a 404 status code.

.. code:: json

    {
        error: "Object not found",
        errno: 1,
        text: "Invalid activity"
    }
