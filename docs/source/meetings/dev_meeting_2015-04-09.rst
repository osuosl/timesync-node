.. _dev-meeting-2015-04-09:

Dev Meeting: Time Sync
======================
2015-04-09
----------

TODO:
-----
* Sketch out an api, define what it does, how it stores, etc.
* Create action items

Discussion
----------

Jack says we should do the web interface first, then the CLI. The API comes
both but the web api is easier to test.

Dean disagrees, just the api is a better thing to get done first and shoot for
a cli product becuase that'll get used more. Testing for a web interface will
be a lot of front end testing.

Jack clarifies that it's just easier to test/implement a web interface.

Ian drew things on the whiteboard about storage:

**Tables:**

* Duration: int, minutes
* Activity: docs, code, ticket
* Project: pgd, what's fresh, working waterfrons, orvsd
* Project Categories: GSOC
* Issue URI: Arbitrary URI
* Time Entries

Then Jack drew some things in the whiteboard:

Time Entries
* duration
* user
* project(dropdown)
* activity(dropdown)
* notes(optional)
* issue_uri(optional)
* date_worked
* created
* modified

Api
---

Given the above, what does the api look like?

Evan drew some stuff on the whitebord.

* Submit Time
    * project name; slug/fuzzy (str)
    * duration: minutes (int)
    * user: ~some auth backend~ username (str) perhaps SSH keys, oauth
    * activity: slig (str/null)
    * notes: notes (str)
    * issue_uri: uri (str)
    * date_worked: iso standard date (str)
* project list
* activity list
* Create/modify Project:
    * name (str)
    * owner/admin (str), modifiable
    * uri (str)
    * slug (str)
* create/modify activity:
    * name (str)
    * slug (str)

Evan added to the tables on the whiteboard:

Project
* name
* slug
* uri
* owner

Activity
* name
* slug

User(?)

Action Items
------------
1. Create Repo
2. Create draft documentation
3. What to use (werkzug, flask, django, sandman)
    * werkzug - very barebones
    * flask - slightly more than werkzug, some batteries included
    * django - all the stuff
        * django rest-api
    * sandman - flask + a little more (dean's proposition)
    * go? (this caused a big debate)
    * javascript? (nodejs + express)
    * **Radical Idea** pair off and quickly write/demo an something. 1week till
      check-in, decide by 3weeks. 50% time working on this.
4. Explore JS implementation (Dean + Lucy + Eli + Ian + Evan)
5. Explore GO implementation (Jack + Ian)
6. Explore Python implementation (Dean + Lucy + Eli + Megan)

We'll have testing from the ground up, keep that in mind.

We'll use the best auth method devoid of the framework/langauge we use. If it's
painful it's painful.
