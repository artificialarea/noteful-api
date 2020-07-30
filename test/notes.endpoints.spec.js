const knex = require('knex');
const app = require('../src/app');
const { makeNotesArray, makeMaliciousNote } = require('./notes.fixtures');
const { makeFoldersArray } = require('./folders.fixtures')
const supertest = require('supertest');
const { expect } = require('chai');

describe(`Notes Endpoints`, () => {

    let db;
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    });
    after('disconnect from db', () => db.destroy());

    // see comments in folders.endpoints.spec.js as to why..
    before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

    describe(`GET /notes`, () => {
        
        context(`Given no notes`, () => {
            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/notes')
                    .expect(200, [])
            })
        })

        context(`Given there are notes in the database`, () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray();

            beforeEach('insert notes (and folders) into db', () => {
                return db  
                    .into('folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('notes')
                            .insert(testNotes)
                    })
            })

            it(`responds with 200 and all of the folders`, () => {
                return supertest(app)
                    .get('/notes')
                    .expect(200, testNotes)
            });
        })

        context(`Given a cross-site scripting (XSS) attack note`, () => {
            const testFolders = makeFoldersArray();
            const { maliciousNote, expectedNote } = makeMaliciousNote();

            beforeEach('insert malicious note (and folders) into db', () => {
                return db  
                    .into('folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('notes')
                            .insert(maliciousNote)
                    })
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get('/notes')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedNote.name)
                    })
            });
        });

    });

    describe('GET /notes/:note_id', () => {

        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                return supertest(app)
                    .get(`/notes/12312`)
                    .expect(404, { error: { message: `Note doesn't exist`} })
            });
        });

        context(`Given there are notes in the database`, () => {
            const testNotes = makeNotesArray();
            const testFolders = makeFoldersArray();

            beforeEach('insert folders into db', () => {
                return db  
                    .into('folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('notes')
                            .insert(testNotes)
                    })
            })

            it(`responds with 200 and the specified note`, () => {
                const noteId = 2;
                const expectedNote = testNotes[noteId - 1];
                return supertest(app)
                    .get(`/notes/${noteId}`)
                    .expect(200, expectedNote)
            });
        });

        context(`Given a cross-site scripting (XSS) attack note`, () => {
            const { maliciousNote, expectedNote } = makeMaliciousNote();
            const testFolders = makeFoldersArray();

            beforeEach('insert folders into db', () => {
                return db  
                    .into('folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('notes')
                            .insert(maliciousNote)
                    })
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get('/notes')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedNote.name)
                    })
            
            });
        });
    });

    describe('POST /notes', () => {

        context(`Given folder.id is available for notes.folder_id foreign key`, () => {

            const testFolders = makeFoldersArray();
            beforeEach('insert folders (associated with newNote foreign key folder_id)', () => {
                return db   
                    .into('folders')
                    .insert(testFolders)
            })

            it(`creates a note, responding with 201 and the new article`, function() {
                this.retries(3);    // repeats test to ensure that actual and expected date_published timestamps match. //  NOTE: "as we need the reference to 'this' in the retries method to be the 'it' block, so need to change from an arrow function to an expression." (QUESTIOIN: but isn't this now a function declaration?)
                const newNote = {
                    name: 'Test new note',
                    folder_id: 1,
                    content: 'Testing new note with some content lorem ipsum style...'
                };
                return supertest(app)
                    .post('/notes')
                    .send(newNote)
                    .expect(201)
                    .expect(res => {
                        // console.log('res.body: ', res.body)
                        // console.log('newNote: ', newNote)
                        expect(res.body.name).to.eql(newNote.name)
                        expect(res.body.folder_id).to.eql(newNote.folder_id)
                        expect(res.body.content).to.eql(newNote.content)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/notes/${res.body.id}`)
                        const expected = new Date().toLocaleString();
                        const actual = new Date(res.body.modified).toLocaleString();
                        expect(actual).to.eql(expected)
                    })
                    .then(postRes => {   // TODO once getById done
                        return supertest(app)
                            .get(`/notes/${postRes.body.id}`)
                            .expect(postRes.body)
                    })
            });

            it(`Removes cross-site scripting (XSS) attack from response`, () => {
                const { maliciousNote, expectedNote } = makeMaliciousNote();
                return supertest(app)
                    .post('/notes')
                    .send(maliciousNote)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedNote.name)
                        expect(res.body.content).to.eql(expectedNote.content)
                    })
            });
        
        });

    })

    describe('DELETE /notes/:note_id', () => {

        context(`Given that note doesn't exist`, () => {
            it(`responds with 404`, () => {
                const noteId = 1232123123;
                return supertest(app)
                    .delete(`/notes/${noteId}`)
                    .expect(404, { error: { message: `Note doesn't exist` } })
            });
        })

        context(`Given the note is in the database`, () => {
            const testFolders = makeFoldersArray();
            const testNotes = makeNotesArray();

            beforeEach('insert notes (and folders) into db', () => {
                return db  
                    .into('folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('notes')
                            .insert(testNotes)
                    })
            })

            it(`responds with 204 and removes note`, () => {
                const idToDelete = 2;
                const expectedNotes = testNotes.filter(note => note.id !== idToDelete)

                return supertest(app)
                    .delete(`/notes/${idToDelete}`)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get('/notes')
                            .expect(expectedNotes)
                    })
            });


        
        });

    })

});