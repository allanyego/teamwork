const schema = require('./schemas/article');
const Article = require('./models/article');
const Category = require('./models/category');

/**
 * POST a new article post
 */
async function create(req, res, next) {
  const { error } = schema.add.validate(req.body);
  if (error) {
    return res.status(422).json({
      status: 'error',
      error: error.message,
    });
  }

  if (req.body.userId !== res.locals.userId) {
    return res.status(200).json({
      status: 'error',
      error: 'You can only post articles for yourself',
    });
  }

  const isCategory = await Category.findById(req.body.category);
  if (!isCategory) {
    return res.status(404).json({
      status: 'error',
      error: 'The specified category does not exist.',
    });
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
      return res.status(404).json({
        status: 'error',
        error: 'No article by that identifier.',
      });
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
    return res.status(404).json({
      status: 'error',
      error: 'No article by that identifier',
    });
  }

  const { error/* , */ } = schema.edit.validate(req.body);
  if (error) {
    return res.status(422).json({
      status: 'error',
      error: error.message,
    });
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
    return res.status(422).json({
      status: 'error',
      error: 'No gif by that identifier',
    });
  }

  if (!res.locals.userId) {
    return res.status(401).json({
      status: 'error',
      error: 'Insufficient previleges to perform delete.',
    });
  }
  if (res.locals.userId !== theGif.user.id && !res.locals.isAdmin) {
    return res.status(401).json({
      status: 'error',
      error: 'Not owner and not admin.',
    });
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
