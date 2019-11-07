const express = require('express');

const {
  create,
  find,
  findById,
  edit,
  destroy,
} = require('../controllers/gifs');

const commentCtrl = require('../controllers/comments');

// const { auth } = require('../middleware/auth');
const { multer } = require('../middleware/multer-config');

const gifRouter = express.Router();

gifRouter.get('/', find);
gifRouter.get('/:id', findById);
gifRouter.post('/:id/comment', commentCtrl.create);
gifRouter.post('/', multer, create);
gifRouter.patch('/:id', multer, edit);
gifRouter.delete('/:id', destroy);

module.exports = {
  gifRouter,
};
