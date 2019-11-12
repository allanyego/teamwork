const express = require('express');

const {
  // edit,
  // find,
  // findById,
  destroy,
} = require('../controllers/comments');

const flagCtrl = require('../controllers/flags');
const { auth } = require('../middleware/auth');

const commentsRouter = express.Router();

// commentsRouter.get('/', find);
// commentsRouter.get('/:id', findById);
commentsRouter.post('/:id/flag', auth, flagCtrl.create);
// commentsRouter.patch('/:id', auth, edit);
commentsRouter.delete('/:id', auth, destroy);

module.exports = {
  commentsRouter,
};
