const Joi = require('@hapi/joi');

const editSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv1' }).required(),
  name: Joi.string().required(),
})
  .with('id', 'name');

const addSchema = Joi.object({
  name: Joi.string().required(),
  user: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', 'user');

module.exports = {
  editSchema,
  addSchema,
};
