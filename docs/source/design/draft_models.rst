.. _draft-models:

Draft Data Models
=================

Below are the database models to be used in TimeSync's api.

Create/Modify Projecs:
----------------------

.. code-block:: python

    name            (str)
    owner/admin     (str)       (modifiable)
    uri             (str)
    slug            (str/null)

Create/Modify Activity:
-----------------------

.. code-block:: python

    name    (str)
    slug    (str)

Submit Time:
------------

.. code-block:: python

    project_name:   slug/fuzzy      (str)
    duration:       minutes         (int)
    user:           username        (str)
    activity:       slug            (str/null)
    notes:          notes           (str)
    issue_uri:      uri             (str)
    date:           iso date        (str)

User:
-----

.. code-block:: python

    # This is currently unplanned. We will address this in a future meeting.
