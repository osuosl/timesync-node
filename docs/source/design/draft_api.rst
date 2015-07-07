.. _draft-api:

Draft API
=========
Below is the api specs for the Time Sync project.


Connection
----------
All requests will be made via HTTPS. Available methods are GET to request an object, POST
to create a new object, PUT to update an object, PATCH to update part of an object and
DELETE to remove an object.


Format
------
Responses will be returned in standard JSON format. Multiple results will be sent as a
list of JSON objects. Order of results is not guaranteed. Single results will be a single
JSON object.


Versions
--------
The API will be versioned with the letter 'v' followed by increasing integers

For example: https://timesync.osuosl.org/v1/projects

Versions will be updated any time there is a significant change to the public API (not to
the implementation).

GET Endpoints
-------------
*/projects*

.. code:: json

    [
      {
         "uri":"https://code.osuosl.org/projects/ganeti-webmgr",
         "name":"Ganeti Web Manager",
         "slugs":["gwm"],
         "owner": "example-user",
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
       "slugs":["ganeti"],
       "owner": "example-user",
       "id": 1
    }

*/activities*

.. code:: json

    [
        {
           "name":"Documentation",
           "slugs":["docs"],
           "id": 1
        },
        {...}
    ]

*/activities/<slug>*

.. code:: json

    {
       "name":"Documentation",
       "slugs":["doc"],
       "id": 1
    }

*/times*

.. code:: json

    [
      {
        "duration":12,
        "user": "example-user",
        "project": "ganeti",
        "activity": "docs",
        "notes":"Worked on documentation toward settings configuration.",
        "issue_uri":"https://github.com/osuosl/ganeti_webmgr/issues/40",
        "date_worked":2014-04-17,
        "created_at":2014-04-17,
        "updated_at":null,
        "id": 1
      },
      {...}
    ]

*/times/<time entry id>*

.. code:: json

    {
      "duration":12,
      "user": "example-user",
      "project": "gwm",
      "activity": "doc",
      "notes":"Worked on documentation toward settings configuration.",
      "issue_uri":"https://github.com/osuosl/ganeti_webmgr/issues/40",
      "date_worked":2014-06-12,
      "created_at":2014-06-12,
      "updated_at":2014-06-13,
      "id": 1
    }

POST Endpoints
--------------

To add a new object, POST to */<object name>/add* with a JSON body.


*/projects/add*

.. code:: json

    {
       "uri":"https://code.osuosl.org/projects/timesync",
       "name":"Timesync API",
       "slugs":["timesync", "time"],
       "owner": "example-2"
    }

*/activities/add*

.. code:: json

    {
       "name":"Quality Assurance/Testing",
       "slugs":["qa", "test"]
    }

*/times/add*

.. code:: json

    {
      "duration":12,
      "user": "example-2",
      "project": "",
      "activity": "gwm",
      "notes":"",
      "issue_uri":"https://github.com/osu-cass/whats-fresh-api/issues/56",
      "date_worked":null,
      "created_at":2014-09-18,
      "updated_at":null
    }

To update an existing object, PUT to */<object name>/<id>* with a JSON body.

If you are sending a partial object to */<object name>/<id>*, send via PATCH request.

If the partial object contains a list of slugs, the field will be overwritten with the
new list, not merged. If the client intends to add or change a slug, it must send the
complete list with this change.

*/projects/<slug>*

.. code:: json

    {
       "name":"Ganeti Webmgr",
       "slugs":["webmgr"],
    }

*/activities/<slug>*

.. code:: json

    {
       "slugs":["testing"]
    }

*/times/<id>*

.. code:: json

    {
      "duration":20,
      "date_worked":"2015-04-17"
    }

In the case of a foreign key (such as project on a time) that does not point to a valid
object or a malformed object sent in the request, an Object Not Found or Malformed Object
error (respectively) will be returned, validation will return immediately, and the object
will not be saved.


DELETE Endpoints
----------------

A DELETE request sent to any object's endpoint (e.g. */projects/<slug>*) will result in the
deletion of the object from the records. It is up to the implementation to decide whether
to use hard or soft deletes. What is important is that the object will not be included in
requests to retrieve lists of objects, and attempts to access the object will fail.
Future attempts to POST an object with that ID/slug should succeed, and completely overwrite
the deleted object, if it still exists in the database. To an end user, it should appear
as though the object truly does not exist.

If the object exists, the API will return a 200 OK status with an empty response body.

If the object does not exist, the API will return an Object Not Found error (see error docs).

In case of any other error, the API will return a Server Error (see error docs).
