
const bcrypt = require('bcrypt');

const schema = require('./schemas/user');
const { sign } = require('./helpers/sign');
const User = require('./models/user');

const stripPassword = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  gender: user.gender,
  username: user.username,
  phone: user.phone,
  role: user.role,
  department: user.department,
  address: user.address,
  type: user.type,
  createdAt: user.create_at,
  updatedAt: user.updated_at,
});

async function signin(req, res) {
  console.log('Req body signin', req.body);
  const { error } = schema.signin.validate(req.body);
  if (error) {
    return res.status(422).json({
      status: 'error',
      error: error.message,
    });
  }

  const [user] = await User.find({
    email: req.body.email,
    username: req.body.username,
  });

  if (!user) {
    return res.status(404).json({
      status: 'error',
      error: 'No user by that email found',
    });
  }

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (valid) {
    const token = sign(user);
    delete user.password;

    return res.json({
      status: 'success',
      data: { ...stripPassword(user), token },
    });
  }
  return res.status(401).json({
    status: 'error',
    error: 'Invalid authentication credentials.',
  });
}

async function register(req, res, next) {
  if (!res.locals.isAdmin) {
    return res.status(401).json({
      status: 'error',
      error: 'Insufficient privileges to create account.',
    });
  }
  const { error } = schema.register.validate(req.body);

  if (error) {
    return res.status(422).json({
      status: 'error',
      error: error.message,
    });
  }

  const [user] = await User.find(req.body);
  if (user) {
    return res.json({
      status: 'error',
      error: 'We already have a user by that username or email',
    });
  }

  const {
    password, ...rest
  } = req.body;
  const hashedPassword = await bcrypt.hash(password, 1);

  try {
    const newUser = await User.create({ ...rest, password: hashedPassword });
    return res.status(201).json({
      status: 'success',
      data: stripPassword(newUser),
    });
  } catch (e) {
    return next(e);
  }
}

const edit = async (req, res, next) => {
  const { error } = schema.edit.validate(req.body);

  if (error) {
    return res.status(422).json({
      status: 'error',
      error: error.message,
    });
  }

  const [user] = await User.find(req.body);
  if (user && user.id !== req.params.id) {
    return res.json({
      status: 'error',
      error: 'We already have a user by that username or email',
    });
  }

  try {
    const updatedUser = await User.update({
      ...user, ...req.body,
    });
    return res.json({
      status: 'success',
      data: stripPassword(updatedUser),
    });
  } catch (e) {
    return next(e);
  }
};

module.exports = {
  signin,
  register,
  edit,
};
