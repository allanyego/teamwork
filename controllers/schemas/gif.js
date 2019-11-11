const Joi = require('@hapi/joi');

const edit = Joi.object({
  category: Joi.string().guid({ version: 'uuidv1' }),
  title: Joi.string(),
  image: Joi.any(), // Consider changing this later
})
  .or('category', 'title', 'image')
  .without('id', 'userId');

const add = Joi.object({
  category: Joi.string().guid({ version: 'uuidv1' }),
  title: Joi.string().required(),
  image: Joi.any().required(), // Consider changing this later
  userId: Joi.string().guid({ version: 'uuidv1' }).required(),
})
  .and('title', 'image', 'userId')
  .without('id', 'user');

module.exports = {
  edit,
  add,
};
