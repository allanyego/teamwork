const express = require('express');

const authRouter = express.Router();
const { signin, register, edit } = require('../controllers/users');

authRouter.post('/create-user', register);
authRouter.post('/signin', signin);
authRouter.put('/:id', edit);

module.exports = {
  authRouter,
};
