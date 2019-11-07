const Joi = require('@hapi/joi');

const edit = Joi.object({
  id: Joi.string().guid({ version: 'uuidv1' }).required(),
  status: Joi.string().allow('resolved').required(),
})
  .without('id', 'user');

const gifAdd = Joi.object({
  feedback: Joi.string().required(),
  gif: Joi.string().guid({ version: 'uuidv1' }).required(),
  user: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', ['gif', 'user']);

const articleAdd = Joi.object({
  feedback: Joi.string().required(),
  article: Joi.string().guid({ version: 'uuidv1' }).required(),
  user: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', ['article', 'user']);

module.exports = {
  edit,
  gifAdd,
  articleAdd,
};
