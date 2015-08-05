.. _draft-models:

=================
Draft Data Models
=================

Below are the database models to be used in TimeSync.

Projects:
---------

.. code-block:: python

    id, # auto-incrementing primary key
    name, # string
    owner, # foreign key to User id
    uri # nullable string

ProjectSlugs:
-------------

.. code-block:: python

    id, # auto-incrementing primary key
    project, # foreign key to Project id
    slug # string

Activities:
-----------

.. code-block:: python

    id, # auto-incrementing primary key
    name # string

ActivitySlugs:
--------------

.. code-block:: python

    id, # auto-incrementing primary key
    activity, # foreign key to Activity id
    slug # string

Times:
---------

.. code-block:: python

    id, # auto-incrementing primary key
    project, # foreign key to Project id
    duration, # number of seconds
    user, # foreign key to User id
    activity, # foreign key to Activity id
    notes, # string
    issue_uri, # string
    date_worked # datetime

User:
-----

.. code-block:: python

    # This is currently unplanned. We will address this in a future meeting.
    id # auto-incrementing primary key
