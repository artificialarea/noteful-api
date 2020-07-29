const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures');
const supertest = require('supertest');
const { expect } = require('chai');
const { connect } = require('../src/app');

describe(`Folders Endpoints`, () => {

    let db;
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    });
    after('disconnect from db', () => db.destroy());

    // Due to tables related via foreign keys, it is no longer possible to TRUNCATE just a single table
    // before('clean the table', () => db('folders').truncate());
    // afterEach('cleanup', () => db('folders').truncate());

    // Soooo, need to truncate all the tables at the same time
    // plus need to reset RESTART the sequence generatator to generate a primary key
    before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))
    afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'))
    // then in every beforeEach hook that is used to load data, ensure that folders (with no foreign key) is loaded first

    describe('GET /folders', () => {

        context(`Given no folders`, () => {
            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/folders')
                    .expect(200, [])
            });
        });

        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders into db', () => {
                return db  
                    .into('folders')
                    .insert(testFolders)
            })


            it(`responds with 200 and all of the folders`, () => {
                return supertest(app)
                    .get('/folders')
                    .expect(200, testFolders)
            });
        });

        context(`Given an cross-site scriping (XSS) attack folder`, () => {
            const testFolders = makeFoldersArray();
            const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

            beforeEach('insert folders into db', () => {
                return db  
                    .into('folders')
                    .insert(maliciousFolder)
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get('/folders')
                    .expect(200)
                    .expect(res => {
                        console.log(res.body)
                        expect(res.body[0].name).to.eql(expectedFolder.name)
                    })
            });
        });
    })
});
