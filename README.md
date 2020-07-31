# Noteful API

**Pair: Alen + Sacha**

Per assignment: https://courses.thinkful.com/node-postgres-v1/checkpoint/19#assignment


<br />

## Database Schema
![Noteful API Entity Relationship Diagram](/migrations/erd-noteful.png)

**NOTE! `folderId -vs- folder_id`** In the original Noteful JSON Server the foreign key property name in the `notes` table is `folderId`.

Unfortunately, cannot replicate `folderId` in Postgres, because PostgreSQL converts all table column names into lowercase; so the foreign key in the database is `folder_id`.

To simpify the refactoring, opted to make adjustments to this API, not the React client. 

Because the `express.Router` is middleware interface between Client and Server, set up a conditional in `notes.router.js` to adjust the name of the foreign key in the response of the `serializeNote` depending if it's a npm test or the react client, indicated by a `Helper` module.

`Helper.stateOfDatabase == 'test' ? 'folder_id' : 'folderId'` in which api response will be `folder_id` for test scenarios, else `folderId` for react client.

<br />

<hr />

initialized via my [Express-Boilerplate](https://github.com/artificialarea/express-boilerplate)
