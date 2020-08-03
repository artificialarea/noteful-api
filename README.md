# Noteful API

## Deploy Server and Database to Production (Heroku)

Per Checkpoint 20: https://courses.thinkful.com/node-postgres-v1/checkpoint/20#assignment

with guidance from **Checkpoint 7: Deploy a Server**: https://courses.thinkful.com/node-postgres-v1/checkpoint/7

<br />

## Add relationships to Noteful
**Pair: Alen + Sacha**

Per assignment: https://courses.thinkful.com/node-postgres-v1/checkpoint/19#assignment

**associated client**: https://github.com/artificialarea/noteful-client-reprised

<br />

## Database Schema
![Noteful API Entity Relationship Diagram](/migrations/erd-noteful.png)

**NOTE! `folderid -vs- folderId`** In the original Noteful JSON Server the foreign key column name in the `notes` table is `folderId`.

Unfortunately, cannot replicate `folderId` in Postgres, because PostgreSQL converts all table column names into lowercase; so the foreign key in the database is `folderid`.

To simpify refactoring, opted to make modifications on the api side. The Express router middleware 
handles the translations of the name of the notes folder id between client and server in `notes.router` via a `serializeNote` expression prior to sending response back to client... and via `sanitizeNote` expression in the `notes.endpoints.spec` tests.

<br />

## Guidance
Checkpoint 19: Add Relationships to Blogful...
* [Walk-thru](https://courses.thinkful.com/node-postgres-v1/checkpoint/19)
* [myRepo: blogful-api](https://github.com/artificialarea/blogful-api)

<hr />

initialized via my [Express-Boilerplate](https://github.com/artificialarea/express-boilerplate)
