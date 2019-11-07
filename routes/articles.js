const express = require('express');

const {
  create,
  edit,
  find,
  findById,
  destroy,
} = require('../controllers/articles');

const commentCtrl = require('../controllers/comments');
// const { auth } = require('../middleware/auth');

const articlesRouter = express.Router();

articlesRouter.get('/', find);
articlesRouter.get('/:id', findById);
articlesRouter.post('/:id/comment', commentCtrl.create);
articlesRouter.post('/', create);
articlesRouter.patch('/:id', edit);
articlesRouter.delete('/:id', destroy);

module.exports = {
  articlesRouter,
};
