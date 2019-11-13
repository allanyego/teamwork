const Joi = require('@hapi/joi');

const edit = Joi.object({
  name: Joi.string().required(),
});

const add = Joi.object({
  name: Joi.string().required(),
  userId: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', 'user');

module.exports = {
  edit,
  add,
};
