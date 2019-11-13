const express = require('express');

const {
  create,
  edit,
  find,
  findById,
  destroy,
} = require('../controllers/articles');

const commentCtrl = require('../controllers/comments');
const flagCtrl = require('../controllers/flags');
const { auth } = require('../middleware/auth');

const articlesRouter = express.Router();

articlesRouter.get('/', find);
articlesRouter.get('/:id', findById);
articlesRouter.post('/:id/comment', auth, commentCtrl.create);
articlesRouter.post('/:id/flag', auth, flagCtrl.create);
articlesRouter.post('/', auth, create);
articlesRouter.patch('/:id', auth, edit);
articlesRouter.delete('/:id', auth, destroy);

module.exports = {
  articlesRouter,
};
