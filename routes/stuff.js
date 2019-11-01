const express = require('express');

const { 
    postThing,
    getThings,
    getThing,
    putThing,
    deleteThing
} = require('../controllers/stuff');
const { auth } = require('../middleware/auth');
const { multer } = require('../middleware/multer-config');

const stuffRoutes = express.Router();

stuffRoutes.post('/', auth, multer, postThing);
stuffRoutes.get('/', auth, getThings);
stuffRoutes.get('/:id', auth, getThing);
stuffRoutes.put('/:id', auth, multer, putThing);
stuffRoutes.delete('/:id', auth, deleteThing);

module.exports = {
    stuffRoutes
};