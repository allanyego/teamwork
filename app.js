const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
// const boom = require('express-boom');
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

// app.use(boom());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/v1', apiRouter);
app.use((_req, res) => {
  res.status(404);
});

app.use((err, req, res) => {
  if (err) {
    console.log('An error occurred', err.message);
    res.status(500).json({
      status: 'error',
      error: 'Something went wrong, try again later.',
    });
  }
});

module.exports = app;
