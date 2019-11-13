const schema = require('./schemas/article');
const Article = require('./models/article');

/**
 * POST a new article post
 */
async function create(req, res, next) {
  const { error } = schema.add.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }

  try {
    const newArticle = await Article.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: newArticle,
    });
  } catch (e) {
    return next(e);
  }
}

/**
 * GET all article posts
 */
async function find(req, res, next) {
  try {
    const { category } = req.query;
    const articles = await Article.find({ category });

    return res.json({
      status: 'success',
      data: articles,
    });
  } catch (err) {
    console.log('Error in find', err);
    return next(err);
  }
}

/**
 * GET article post by id
 */
async function findById(req, res, next) {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.boom.notFound('No article by that identifier.');
    }

    return res.json({
      status: 'success',
      data: article,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * EDIT article post
 */
async function edit(req, res, next) {
  const anArticle = await Article.findById(req.params.id);
  if (!anArticle) {
    return res.boom.notFound('No article by that identifier');
  }

  const { error/* , */ } = schema.edit.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }

  try {
    const {
      category: { id: category },
      ...rest
    } = anArticle;
    const newArticleDetails = {
      ...rest, category, ...req.body,
    };

    const updatedArticle = await Article.update(newArticleDetails);
    return res.json({
      status: 'success',
      data: updatedArticle,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE article post
 */
async function destroy(req, res) {
  const theGif = await Article.findById(req.params.id);
  if (!theGif) {
    return res.boom.notFound('No gif by that identifier');
  }

  if (!res.locals.userId) {
    return res.boom.unauthorized();
  }
  if (res.locals.userId !== theGif.user.id && !res.locals.isAdmin) {
    return res.boom.unauthorized('Not owner and not admin.');
  }

  await Article.destroy(req.params.id);
  return res.status(204).json({
    status: 'success',
    data: 'Article was destroyed successfully.',
  });
}


module.exports = {
  create,
  find,
  findById,
  edit,
  destroy,
};
