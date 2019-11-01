const express = require('express');

const router = express.Router();
const { login, signup } = require('../controllers/users');

router.post('/signup', signup);
router.post('/login', login);

module.exports = {
    userRoutes: router
};