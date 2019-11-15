const express = require('express');

const authRouter = express.Router();
const { signin, register, edit } = require('../controllers/users');
const { auth } = require('../middleware/auth');

authRouter.post('/signin', signin);
authRouter.post('/create-user', auth, register);
authRouter.patch('/:id', auth, edit);

module.exports = {
  authRouter,
};
