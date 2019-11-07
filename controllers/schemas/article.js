const Joi = require('@hapi/joi');

const editSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv1' }).required(),
  category: Joi.string().guid({ version: 'uuidv1' }),
  title: Joi.string(),
  text: Joi.string(),
})
  .or('category', 'title', 'text')
  .without('id', 'user');

const addSchema = Joi.object({
  category: Joi.string().guid({ version: 'uuidv1' }),
  title: Joi.string().required(),
  text: Joi.string().required(),
  user: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .and('title', 'text', 'user')
  .without('id', 'user');

module.exports = {
  editSchema,
  addSchema,
};
