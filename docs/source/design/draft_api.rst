.. _draft-api:

=========
Draft API
=========
Below are the API specs for the TimeSync project.


Connection
----------
All requests will be made via HTTPS. Available methods are GET to request an
object, POST to create and/or edit a new object, and DELETE to remove an
object.


Format
------
Responses will be returned in standard JSON format. Multiple results will be
sent as a list of JSON objects. Order of results is not guaranteed. Single
results will be a single JSON object.


Versions
--------
The API will be versioned with the letter 'v' followed by increasing integers.

For example: https://timesync.osuosl.org/v1/projects

Versions will be updated any time there is a significant change to the public
API (not to the implementation).

GET Endpoints
-------------
*GET /projects*

.. code-block:: javascript

    [
      {
         "uri":"https://code.osuosl.org/projects/ganeti-webmgr",
         "name":"Ganeti Web Manager",
         "slugs":["gwm", "ganeti"],
         "owner": "example-user",
         "id": 1
      },
      {...},
      ...
    ]

*GET /projects/<slug>*

.. code-block:: javascript

    {
       "uri":"https://code.osuosl.org/projects/ganeti-webmgr",
       "name":"Ganeti Web Manager",
       "slugs":["ganeti", "gwm"],
       "owner": "example-user",
       "id": 1
    }

*GET /activities*

.. code-block:: javascript

    [
        {
           "name":"Documentation",
           "slugs":["docs", "doc"],
           "id": 1
        },
        {...}
    ]

*GET /activities/<slug>*

.. code-block:: javascript

    {
       "name":"Documentation",
       "slugs":["doc", "docs"],
       "id": 1
    }

*GET /times*

.. code-block:: javascript

    [
      {
        "duration":12,
        "user": "example-user",
        "project": "ganeti",
        "activities": ["docs", "planning"],
        "notes":"Worked on documentation toward settings configuration.",
        "issue_uri":"https://github.com/osuosl/ganeti_webmgr/issues/40",
        "date_worked":2014-04-17,
        "created_at":2014-04-17,
        "updated_at":null,
        "id": 1
      },
      {...}
    ]

*GET /times/<time entry id>*

.. code-block:: javascript

    {
      "duration":12,
      "user": "example-user",
      "project": "gwm",
      "activities": ["doc", "research"],
      "notes":"Worked on documentation toward settings configuration.",
      "issue_uri":"https://github.com/osuosl/ganeti_webmgr/issues/40",
      "date_worked":2014-06-12,
      "created_at":2014-06-12,
      "updated_at":2014-06-13,
      "id": 1
    }

POST Endpoints
--------------

To add a new object, POST to */<object name>/* with a JSON body.


*POST /projects/*

.. code-block:: javascript

    {
       "uri":"https://code.osuosl.org/projects/timesync",
       "name":"TimeSync API",
       "slugs":["timesync", "time"],
       "owner": "example-2"
    }

*POST /activities/*

.. code-block:: javascript

    {
       "name":"Quality Assurance/Testing",
       "slugs":["qa", "test"]
    }

*POST /times/*

.. code-block:: javascript

    {
      "duration":12,
      "user": "example-2",
      "project": "",
      "activities": ["gwm", "ganeti"],
      "notes":"",
      "issue_uri":"https://github.com/osu-cass/whats-fresh-api/issues/56",
      "date_worked":null,
      "created_at":2014-09-18,
      "updated_at":null
    }

Likewise, if you'd like to edit an existing object, POST to
*/<object name>/<slug>* (or for time objects, */times/<id>*) with a JSON body.
The object only needs to contain the part that is being updated.


*POST /projects/<slug>*

.. code-block:: javascript

    {
       "name":"Ganeti Webmgr",
       "slugs":["webmgr", "gwm"],
    }

*POST /activities/<slug>*

.. code-block:: javascript

    {
       "slugs":["testing", "test"]
    }

*POST /times/<id>*

.. code-block:: javascript

    {
      "duration":20,
      "date_worked":"2015-04-17"
    }

In the case of a foreign key (such as project on a time) that does not point to
a valid object or a malformed object sent in the request, an Object Not Found
or Malformed Object error (respectively) will be returned, validation will
return immediately, and the object will not be saved.


DELETE Endpoints
----------------

A DELETE request sent to any object's endpoint (e.g. */projects/<slug>*) will
result in the deletion of the object from the records. It is up to the
implementation to decide whether to use hard or soft deletes. What is important
is that the object will not be included in requests to retrieve lists of
objects, and attempts to access the object will fail. Future attempts to POST
an object with that ID/slug should succeed, and completely overwrite the
deleted object, if it still exists in the database. To an end user, it should
appear as though the object truly does not exist.

If the object exists, the API will return a 200 OK status with an empty
response body.

If the object does not exist, the API will return an Object Not Found error
(see error docs).

In case of any other error, the API will return a Server Error (see error docs).
