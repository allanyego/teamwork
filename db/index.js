require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool();

pool.connect((err) => {
  if (err) {
    console.log('DB error', err.message);
    console.log('Are you sure your DB server is up?');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
