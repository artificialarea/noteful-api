# Noteful API

## Deploy Server and Database to Production (Heroku)

Assignment per [**Node & Postgres Checkpoint 20**](https://courses.thinkful.com/node-postgres-v1/checkpoint/20#assignment) ...with guidance from [**Checkpoint 7: Deploy a Server**](https://courses.thinkful.com/node-postgres-v1/checkpoint/7)

<br /> 

## Notable migration production issue (and resolution)

As happened earlier with [blogful-api](https://github.com/artificialarea/blogful-api/blob/master/README.md) & [bookmarks-server](https://github.com/artificialarea/bookmarks-server/blob/master/README.md) exercises — reached an impasse at the stage of trying to run migrations on the heroku-postresql.

**`$ npm run migrate:production`** kept failing at the `noteful-api migrate script` =/

The error in full...
```
➜  blogful-api git:(master) npm run migrate:production
Running npm run migrate on ⬢ shielded-woodland-48221... up, run.9816 (Free)

> blogful-api@1.0.0 migrate /app
> postgrator --config postgrator-config.js

sh: 1: postgrator: not found
npm ERR! code ELIFECYCLE
npm ERR! syscall spawn
npm ERR! file sh
npm ERR! errno ENOENT
npm ERR! blogful-api@1.0.0 migrate: `postgrator --config postgrator-config.js`
npm ERR! spawn ENOENT
npm ERR! 
npm ERR! Failed at the blogful-api@1.0.0 migrate script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /app/.npm/_logs/2020-08-02T22_21_05_392Z-debug.log
➜  blogful-api git:(master)
```

<br />

Thanks to a long troubleshooting session with Jonathan Huxhold @ ThinkfulChat earlier, the issue was eventually resolved with the following alterations below...

### Alterations 

**1) `packgage.json "scripts"`**

* Originally:
`"migrate:production": "heroku run npm run migrate"`

* Update, per ThinkChat suggestion:
`"migrate:production": "env SSL=true NODE_TLS_REJECT_UNAUTHORIZED=0 DATABASE_URL=$(heroku config:get DATABASE_URL) npm run migrate"`

* I subsequently tried to revert back to the original after initial migration done but migrate:production failed again, so returning to the convoluted command with SSL.

**2) `postgrator-config.js`**

* Add `"ssl": !!process.env.SSL` to the `module.export` properties.

_Jonathan said, "I think postgrator does something under the hood to accommodate ssl settings on db up in the environment. The double bang (!!) casts a truthy or falsy value to a boolean true or false. So by adding it as an actual postgrator config value, it was able to establish the connection."_

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
