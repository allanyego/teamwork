const uuid = require('uuid/v1');
const bcrypt = require('bcrypt');

const { query } = require('../db');
const schema = require('./schemas/user');
const { sign } = require('./helpers/sign');

// const jwt = require('jsonwebtoken');

async function signin(req, res, next) {
  const { error, value } = schema.signinSchema.validate(req.body);
  if (error) {
    console.log('JOI ERROR', error.message);
    return res.boom.badData(error.message);
  }
  console.log('VALUE***\n', value);
  const string = 'SELECT * FROM users where email = $1 LIMIT 1';
  const values = [req.body.email];
  try {
    const result = await query(string, values);
    if (!result.rows.length) {
      return res.status(204).json({
        status: 'error',
        error: 'No user by that email found',
      });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) {
      const token = sign(user);
      return res.json({
        status: 'success',
        data: {
          ...user, token,
        },
      });
    }
    return res.boom.unauthorized('Invalid authentication credentials.');
  } catch (e) {
    return next(e);
  }
}

async function register(req, res, next) {
  const { error, value } = schema.register.validate(req.body);
  console.log('Value***', value);
  if (error) {
    return res.boom.badData(error.message);
  }

  const insertQuery = 'INSERT INTO users'
    + '(id, first_name, last_name, email, username, role, department, password)'
    + ' VALUES($1,$2,$3,$4,$5,$6,$7,$8)';
  const {
    firstName, lastName, username, email,
    role, department, password,
  } = req.body;
  const hashedPassword = await bcrypt.hash(password, 1);
  const values = [uuid(), firstName, lastName, email, username, role, department, hashedPassword];

  const users = await query(
    'SELECT * FROM users WHERE username=$1 OR email=$2',
    [username, email],
  );

  if (users.rows.length) {
    return res.json({
      status: 'error',
      error: 'We already have a user by that username or email',
    });
  }


  try {
    const newUser = await query(insertQuery, values);
    const token = sign(newUser);
    return res.json({
      status: 'error',
      data: {
        ...newUser.rows[0], token,
      },
    });
  } catch (err) {
    return next(err);
  }
}

function edit(_req, res) {
  res.boom.notImplemented();
}

module.exports = {
  signin,
  register,
  edit,
};
