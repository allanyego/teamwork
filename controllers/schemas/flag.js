const Joi = require('@hapi/joi');

const edit = Joi.object({
  id: Joi.string().guid({ version: 'uuidv1' }).required(),
  status: Joi.string().allow('resolved', 'revoked').required(),
})
  .without('id', 'userId');

const gifAdd = Joi.object({
  feedback: Joi.string().required(),
  gif: Joi.string().required(),
  userId: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', ['gif', 'userId']);

const articleAdd = Joi.object({
  feedback: Joi.string().required(),
  article: Joi.string().guid({ version: 'uuidv1' }).required(),
  userId: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', ['article', 'userId']);

const commentAdd = Joi.object({
  feedback: Joi.string().required(),
  comment: Joi.string().guid({ version: 'uuidv1' }).required(),
  userId: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', ['article', 'userId']);

module.exports = {
  edit,
  gifAdd,
  articleAdd,
  commentAdd,
};
