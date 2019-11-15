const Joi = require('@hapi/joi');

const register = Joi.object({
  firstName: Joi.string().required().pattern(/[a-zA-Z]/),
  lastName: Joi.string().required().pattern(/[a-zA-Z]/),
  gender: Joi.allow('male', 'female').required(),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  role: Joi.string().required(),
  department: Joi.string().required(),

  password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/),

  // confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict(),

  // birth_year: Joi.number()
  //   .integer(),
  // // .min(1900)
  // // .max(2013),

  email: Joi.string().email().required(),

  address: Joi.string().min(4),

  type: Joi.allow('user', 'admin').default('user'),

})
  .and('username', 'lastName', 'email', 'password');

const signin = Joi.object({
  email: Joi.string().email().lowercase(),
  password: Joi.string().min(8).required().strict(),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30),
})

  .or('email', 'password');

const edit = Joi.object({
  firstName: Joi.string().pattern(/[a-zA-Z]/),
  lastName: Joi.string().pattern(/[a-zA-Z]/),
  // gender: Joi.allow('male', 'female').required(),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30),

  role: Joi.string(),
  department: Joi.string(),

  // Plan on using this for password changing
  // password: Joi.string()
  //   .pattern(/^[a-zA-Z0-9]{3,30}$/),

  // confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict(),

  email: Joi.string()
    .email(/* { minDomainSegments: 2, tlds: { allow: ['com', 'net'] } } */),

  address: Joi.string().min(4),

  type: Joi.allow('user', 'admin'),

})
  .or(
    'username', 'firstName', 'lastName', 'email', 'address', 'role',
    'department', 'type',
  );

// export the schemas
module.exports = {
  register,
  signin,
  edit,
};
