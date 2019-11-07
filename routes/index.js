const express = require('express');

const articleCtrl = require('../controllers/articles');
const gifCtrl = require('../controllers/gifs');
const { articlesRouter } = require('./articles');
const { authRouter } = require('./auth');
const { gifRouter } = require('./gifs');

const apiRouter = express.Router();

apiRouter.use('/feed', (req, res) => {
  const { type } = req.query;
  if (type === 'gif') {
    return gifCtrl.find(req, res);
  }

  return articleCtrl.find(req, res);
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/gifs', gifRouter);
apiRouter.use('/articles', articlesRouter);

module.exports = {
  apiRouter,
};
