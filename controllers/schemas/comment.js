const Joi = require('@hapi/joi');

const commentEdit = Joi.object({
  id: Joi.string().guid({ version: 'uuidv1' }).required(),
  comment: Joi.string().required(),
})
  .without('id', 'userId');

const gifCommentAdd = Joi.object({
  comment: Joi.string().required(),
  gif: Joi.string().guid({ version: 'uuidv1' }).required(),
  userId: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', ['gif', 'userId']);

const articleCommentAdd = Joi.object({
  comment: Joi.string().required(),
  article: Joi.string().guid({ version: 'uuidv1' }).required(),
  userId: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .without('id', ['article', 'userId']);

module.exports = {
  commentEdit,
  gifCommentAdd,
  articleCommentAdd,
};
