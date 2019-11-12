const Joi = require('@hapi/joi');

const commentEdit = Joi.object({
  comment: Joi.string().required(),
})
  .without('comment', 'userId');

const gifAdd = Joi.object({
  comment: Joi.string().required(),
  gif: Joi.string().required(),
  userId: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', ['gif', 'userId']);

const articleAdd = Joi.object({
  comment: Joi.string().required(),
  article: Joi.string().guid({ version: 'uuidv1' }).required(),
  userId: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', ['article', 'userId']);

module.exports = {
  commentEdit,
  gifAdd,
  articleAdd,
};
