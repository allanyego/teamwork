const express = require('express');

const authRouter = express.Router();
const { signin, register, edit } = require('../controllers/users');
const { auth } = require('../middleware/auth');

authRouter.post('/create-user', auth, register);
authRouter.post('/signin', signin);
authRouter.put('/:id', auth, edit);

module.exports = {
  authRouter,
};
