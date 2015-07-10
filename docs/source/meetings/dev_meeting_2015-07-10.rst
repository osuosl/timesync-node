.. _dev-meeting-2015-07-10:

2015-07-10
==========

Database
--------

1. Remove activityslugs table
2. Add activity.slug field

Api
---

* Standardize HTTP methods:
    * ``GET`` for get
    * ``POST`` for adding and editing
    * ``DELETE`` for deleting
* For adding, ``POST`` to ``/projects`` instead of ``/projects/add``. Same for
    ``/times`` and ``/activities``.
* Query parameters:
    * Query parameters only for ``/times`` at present.
    * ``?user=U1&user=U2&activity=A1&activity=A2&project=P1&project=P2``
        * ``(U1 || U2) && (P1 || P2) && (A1 || A2)``
    * Example query: ``/times?user=pop&user=tschuy&activity=meetings&activity=planning&project=timesync&project=pgd``
        * should return all meetings and planning done for timesync or pgd done by tschuy or pop

tschuy will be assigning issues. mrsj is working on updating model
documentation. thai is working on API documentation changes.