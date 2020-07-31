const path = require('path')
const express = require('express');
const xss = require('xss'); // for sanitisation purposes
const NotesService = require('./notes.service');

const notesRouter = express.Router();
const jsonParser = express.json();

/* 
CURRENTLY LIVE WORKS BUT TEST FAILS 
REFACTOR so that the property name of notes foreign key is changes
with a ternary conditional depending on the environment? 
e.g. 
process.env.DB_URL = notes.folderId
process.env.TEST_DB_URL = notes.folder_id
?????????

PSEUDOCODE
if (process.env.DB_URL) {
    folderType = folderId
} else if (process.env.TEST_DB_URL) {
    folderType = folder_id
}
*/

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderId: note.folder_id,  
    // `${folderType}`: note.folder_id,  // SEE ABOVE ^^
    content: xss(note.content)
});

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
            .then(notes => {
                res.json(notes.map(serializeNote)) // Verify no need for // **** Id
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, folderId, content } = req.body;  // **** Id
        const newNote = { name, folder_id: folderId, content }; // **** Id  CAN'T USE DESTUCTURED OBJECT , NEED TO BREAK OUT EACH PROP 

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        // newNote.content = content; // add field, if has value (not required)
        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next)
    })


notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note doesn't exist`}
                    })
                }
                res.note = note;
                next();
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.status(200).json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })



module.exports = notesRouter;