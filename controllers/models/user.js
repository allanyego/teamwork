const uuid = require('uuid/v1');

const { query } = require('../../db');

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

const create = async (user) => new Promise((resolve, reject) => {
  const userId = uuid();
  const insertQuery = 'INSERT INTO users'
    + '(id, first_name, last_name, email, username, gender, role, department, password, type)'
    + ' VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)';
  const {
    firstName, lastName, username, gender, email,
    role, department, password: hashedPassword, type,
  } = user;
  const values = [
    userId, firstName, lastName, email, username, gender, role, department, hashedPassword,
    type,
  ];
  query(insertQuery, values, (err) => {
    if (err) {
      return reject(err);
    }

    return findById(userId)
      .then(resolve)
      .catch(reject);
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
    findQuery += `${isWhered ? ' OR' : ' WHERE'} (username=$${varCounter})`;
    values.push(username);
    isWhered = true;
    varCounter += 1;
  }

  return new Promise((resolve, reject) => {
    query(findQuery, values, (err, { rows }) => {
      if (err) {
        return reject(err);
      }

      return resolve(Array.from(rows));
    });
  });
};

const update = async (user) => new Promise((resolve, reject) => {
  const insertQuery = 'UPDATE users SET '
    + 'first_name=$1, last_name=$2, email=$3, username=$4, role=$5, '
    + 'department=$6, type=$7 WHERE (id=$8)';

  const {
    firstName, lastName, username, email, type,
    role, department, id,
  } = user;
  const values = [
    firstName, lastName, email, username, role, department, type, id,
  ];
  query(insertQuery, values, (err) => {
    if (err) {
      return reject(err);
    }

    return findById(id)
      .then(resolve)
      .catch(reject);
  });
});

module.exports = {
  findById,
  create,
  find,
  update,
};
