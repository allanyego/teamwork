const express = require('express');

const {
  create,
  find,
  findById,
  edit,
  destroy,
} = require('../controllers/gifs');

// const commentCtrl = require('../controllers/comments');

const { auth } = require('../middleware/auth');
const { multer } = require('../middleware/multer-config');

const gifRouter = express.Router();

gifRouter.get('/', find);
gifRouter.get('/:id', findById);
// gifRouter.post('/:id/comment', commentCtrl.create);
gifRouter.post('/', auth, multer, create);
gifRouter.patch('/:id', auth, multer, edit);
gifRouter.delete('/:id', auth, destroy);

module.exports = {
  gifRouter,
};
