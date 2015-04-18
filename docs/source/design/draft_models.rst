.. _draft-models:

Draft Data Models
=================

Below are the database models to be used in TimeSync.

Projects:
---------

.. code-block:: python

    id              (int)       (pk)
    name            (str)
    owner/admin     (int)       (foreign key to users)
    uri             (str/null)
    slug            (str)

Create/Modify Activity:
-----------------------

.. code-block:: python

    id      (int)       (pk)
    name    (str)
    slug    (str)

Submit Time:
------------

.. code-block:: python

    id          (int) (pk)
    project     (int) (foreign key to projects)
    duration    (int) (seconds)
    user        (int) (foreign key to users)
    activity    (int) (foreign key to activities)
    notes       (str)
    issue_uri   (str)
    date_worked (datetime)

User:
-----

.. code-block:: python

    # This is currently unplanned. We will address this in a future meeting.
    id  auto-increment  (int)
