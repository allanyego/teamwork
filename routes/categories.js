const express = require('express');

const {
  create,
  find,
} = require('../controllers/categories');

// const flagCtrl = require('../controllers/flags');
const { auth } = require('../middleware/auth');

const categoriesRouter = express.Router();

categoriesRouter.get('/', find);
// commentsRouter.get('/:id', findById);
categoriesRouter.post('/', auth, create);
// commentsRouter.patch('/:id', auth, edit);
// commentsRouter.delete('/:id', auth, destroy);

module.exports = {
  categoriesRouter,
};
