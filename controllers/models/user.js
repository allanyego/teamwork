const uuid = require('uuid/v1');

const { query } = require('../../db');

const create = async (user) => new Promise((resolve, reject) => {
  const userId = uuid();
  const insertQuery = 'INSERT INTO users'
    + '(id, first_name, last_name, email, username, gender, role, department, password)'
    + ' VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)';
  const {
    firstName, lastName, username, gender, email,
    role, department, password: hashedPassword,
  } = user;
  const values = [
    userId, firstName, lastName, email, username, gender, role, department, hashedPassword,
  ];
  query(insertQuery, values, (err) => {
    if (err) {
      return reject(err);
    }

    return query(
      'SELECT * FROM users WHERE (id=$1)',
      [userId],
      (_err, usersRes) => {
        const [theUser] = usersRes.rows;
        resolve(theUser);
      },
    );
  });
});

const find = async (opts) => {
  const { email, username } = opts;
  let findQuery = 'SELECT * FROM users';
  const values = [];
  let varCounter = 1;
  let isWhered = false;

  if (email) {
    findQuery += ` WHERE (email=$${varCounter})`;
    values.push(email);
    isWhered = true;
    varCounter += 1;
  }
  if (username) {
    findQuery += `${isWhered ? ' AND' : ' WHERE'} (username=$${varCounter})`;
    values.push(username);
    isWhered = true;
    varCounter += 1;
  }

  return new Promise((resolve, reject) => {
    query(findQuery, values, (err, { rows }) => {
      if (err) {
        return reject(err);
      }
      return resolve(rows);
    });
  });
};

const findById = (id) => new Promise((resolve, reject) => {
  query(
    'SELECT * FROM users WHERE (id=$1) LIMIT 1',
    [id],
    (err, { rows }) => {
      if (err) {
        return reject(err);
      }
      return resolve(rows[0]);
    },
  );
});

module.exports = {
  create,
  find,
  findById,
};
