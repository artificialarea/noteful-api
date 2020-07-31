require('dotenv').config();
const path = require('path')
const express = require('express');
const xss = require('xss'); // for sanitisation purposes
const NotesService = require('./notes.service');

const notesRouter = express.Router();
const jsonParser = express.json();

// Helper module for defining value of 'folderType'
// Explanation in /test/helper.js
const Helper = require('../../test/helper') 
let folderType;

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    [folderType]: note.folder_id,
    content: xss(note.content)
});

notesRouter
    .route('/')
    .all((req, res, next) => {
        folderType = (Helper.stateOfDatabase == 'test' ? 'folder_id' : 'folderId')
        next();
    })
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {

        let name, folder_id, folderId, content;
        let newNote;

        if (folderType === 'folder_id') {               // FOR TEST
            name = req.body.name;
            folder_id = req.body.folder_id;             
            content = req.body.content;
            newNote = { name, folder_id, content };
        } else {                                        // FOR REACT
            name = req.body.name;
            folderId = req.body.folderId;
            content = req.body.content;
            newNote = { name, folder_id: folderId, content };
        }

        // // WORKS IN TEST
        // const { name, folder_id, content } = req.body;
        // const newNote = { name, folder_id, content };
        // // WORKS IN REACT
        // const { name, folderId, content } = req.body;
        // const newNote = { name, folder_id: folderId, content };

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

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
        folderType = (Helper.stateOfDatabase == 'test' ? 'folder_id' : 'folderId')

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