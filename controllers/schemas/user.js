const Joi = require('@hapi/joi');

// accepts name only as letters and converts to uppercase
// const name = Joi.string().regex(/^[A-Z]+$/).uppercase();

// accepts ages greater than 6
// value could be in one of these forms: 15, '15', '15y', '15yr', '15yrs'
// all string ages will be replaced to strip off non-digits
// const ageSchema = Joi.alternatives().try([
//   Joi.number().integer().greater(6).required(),
//   Joi.string().replace(/^([7-9]|[1-9]\d+)(y|yr|yrs)?$/i, '$1').required(),
// ]);

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

  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict(),

  token: [
    Joi.string(),
    Joi.number(),
  ],

  // birth_year: Joi.number()
  //   .integer(),
  // // .min(1900)
  // // .max(2013),

  email: Joi.string()
    .email(/* { minDomainSegments: 2, tlds: { allow: ['com', 'net'] } } */),

  address: Joi.string().min(4),

  type: Joi.allow('user', 'admin').default('user'),

})
  .with('password', 'confirmPassword')
  // firstname and lastname must always appear together
  .and('firstname', 'lastname', 'email');

// password and confirmPassword must contain the same value
const signin = Joi.object({
  id: Joi.string().guid({ version: 'uuidv1' }).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(7).required().strict(),
});

// export the schemas
module.exports = {
  register,
  signin,
};
