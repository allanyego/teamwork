require('dotenv').config();
const { Pool } = require('pg');

let pool;
const { NODE_ENV, DATABASE_URL } = process.env;
if (NODE_ENV === 'production' && DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: true,
  });
} else {
  pool = new Pool();
}

pool.connect((err) => {
  if (err) {
    console.log('DB error', err.message);
    console.log('Are you sure your DB server is up?');
  }
});

module.exports = {
  query: (text, params, cb) => pool.query(text, params, cb),
  pool,
};
