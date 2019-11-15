const express = require('express');

const articleCtrl = require('../controllers/articles');
const gifCtrl = require('../controllers/gifs');
const { articlesRouter } = require('./articles');
const { authRouter } = require('./auth');
const { gifRouter } = require('./gifs');
const { commentsRouter } = require('./comments');

const apiRouter = express.Router();

apiRouter.use((req, res, next) => {
  console.log(req.method, req.path);
  console.log('Body', req.body);
  next();
});

apiRouter.use('/feed', (req, res, next) => {
  const { type } = req.query;
  if (type === 'gif') {
    return gifCtrl.find(req, res, next);
  }

  return articleCtrl.find(req, res, next);
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/gifs', gifRouter);

module.exports = {
  apiRouter,
};
