const express = require('express');

const {
  create,
  edit,
  find,
  findById,
  destroy,
} = require('../controllers/articles');

// const commentCtrl = require('../controllers/comments');
const { auth } = require('../middleware/auth');

const articlesRouter = express.Router();

articlesRouter.get('/', find);
articlesRouter.get('/:id', findById);
// articlesRouter.post('/:id/comment', commentCtrl.create);
articlesRouter.post('/', auth, create);
articlesRouter.patch('/:id', auth, edit);
articlesRouter.delete('/:id', auth, destroy);

module.exports = {
  articlesRouter,
};
