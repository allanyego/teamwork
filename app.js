const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const boom = require('express-boom');
// const cors = require('cors');

const { apiRouter } = require('./routes/');

/**
 * @returns {Function}
 */
function cors() {
  return (_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  };
}

const app = express();

app.use((req, res, next) => {
  console.log('I am getting a request', req.path);
  next();
});

app.use(boom());
app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/v1', apiRouter);
app.use((_req, res) => {
  res.boom.notFound();
});

app.use((err, req, res) => {
  if (err) {
    console.log('There was an error', err);
    res.json({
      status: 'error',
      error: err.message,
    });
  }
});

module.exports = app;
