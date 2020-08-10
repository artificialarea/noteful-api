# Noteful API

**Demo via client:** https://noteful-client.artificialarea.vercel.app/


<br />

<br />

<hr />

# Iterations

## Deploy Server and Database to Production (Heroku)

Assignment per [**Node & Postgres Checkpoint 20**](https://courses.thinkful.com/node-postgres-v1/checkpoint/20#assignment) ...with guidance from [**Checkpoint 7: Deploy a Server**](https://courses.thinkful.com/node-postgres-v1/checkpoint/7)

Completed assignment, but due to production migration issue have to migrate/seed heroku postgresql database tables via psql/dBeaver, not via `npm run deploy`.

## Notable migration production issue (and resolution)

As happened earlier with [blogful-api](https://github.com/artificialarea/blogful-api/blob/master/README.md) & [bookmarks-server](https://github.com/artificialarea/bookmarks-server/blob/master/README.md) exercises — reached an impasse at the stage of trying to run migrations on the heroku-postresql.

**`$ npm run migrate:production`** kept failing at the `noteful-api migrate script` =/

Eventually, thanks to my chum Nathan, deduced that the source of the migration issue was that I erroneously installed `postgrator` as a dependency instead of `postgrator-cli`

Sequence:

To fix `sh: 1: postgrator: not found error`
```
$ npm uninstall postgrator 
$ npm uninstall postgrator-cli 
$ npm install postgrator-cli@3.2.0
```
Drop existing tables from the database in psql first.
Login to heroku database psql
```
$ heroku pg:psql
```
Drop the tables
```
DROP TABLE notes;
DROP TABLE folders;
DROP TABLE schemaversion;
```
Exit psql, commit changes to git, then push to heroku
```
$ git push heroku master
```
Run the migrations
```
$ npm run migrate:production
```
Seed the database
```
$ heroku pg:psql -f ./seeds/seed.noteful_notes.sql
```

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

To simpify refactoring, opted to make modifications on the api side. 
* **`branch: 02_sync-with-react_v2-santize`** The Express router middleware handles the translations of the name of the notes folder id between client and server in `notes.router` via a `serializeNote` expression prior to sending response back to client... and via `sanitizeNote` expression in the `notes.endpoints.spec` tests. 
* **`branch: **02_synch-with-react_v1-handler`** Prior to that, I had a more convoluted solution via a context-esque `handler` component. 

<br />

## Guidance
Checkpoint 19: Add Relationships to Blogful...
* [Walk-thru](https://courses.thinkful.com/node-postgres-v1/checkpoint/19)
* [myRepo: blogful-api](https://github.com/artificialarea/blogful-api)

<hr />

initialized via my [Express-Boilerplate](https://github.com/artificialarea/express-boilerplate)
