const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const { stuffRoutes } = require('./routes/stuff');
const { userRoutes } = require('./routes/users');

const app = express();

mongoose.connect(process.env.MONGO_SRV, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
  useCreateIndex: true
})
  .then(mongooseSuccess)
  .catch(mongooseError);

app.use(cors());
app.use(bodyParser.json());
app.use((req, _res, next) => {
  console.log(req.method, req.path);
  next();
});
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/stuff', stuffRoutes);
app.use('/api/auth', userRoutes);

/**
 * @returns {Function}
 */
function cors() {
  return (_req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      next();
  }
}

/**
 * Mongoose success and error promise handlers
 */
function mongooseSuccess() {
  console.log('Successfully connected to MongoDB Atlas!');
}
function mongooseError(error) {
  console.groupCollapsed();
  console.log('Unable to connect to MongoDB Atlas!');
  console.error(error);
  console.log('Are you sure you\'re connected to the internet?');
  console.groupEnd();
}

module.exports = app;