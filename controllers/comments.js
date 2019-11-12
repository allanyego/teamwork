const schema = require('./schemas/comment');
const Article = require('./models/article');
const Gif = require('./models/gif');

/**
 * POST a new comment
 */
async function create(req, res, next) {
  const { gif, article } = req.body;

  let joiRes;
  let PostModel;
  if (article) {
    joiRes = schema.articleAdd.validate(req.body);
    PostModel = Article;
  } else {
    joiRes = schema.gifAdd.validate(req.body);
    PostModel = Gif;
  }

  if (joiRes.error) {
    return res.boom.badData(joiRes.error.message);
  }

  const aPost = PostModel.findById(gif || article);

  if (!aPost(req.params)) {
    return res.boom.notFound(
      `The specified ${article ? 'article' : 'gif'} does not exist.`,
    );
  }

  try {
    const newComment = await Comment.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: newComment,
    });
  } catch (e) {
    return next(e);
  }
}

/**
 * GET all comments (most probably by user or post)
 */
function find(req, res) {
  const { user, gif, article } = req.query;
  const resComments = Comment.find({ userId: user, gif, article });

  return res.json({
    status: 'success',
    data: resComments,
  });
}

/**
 * GET comment by id
 */
function findById(req, res) {
  const theComment = Comment.findById(req.params.id);

  if (!theComment) {
    return res.boom.notFound('No comment found by that identifier');
  }
  return res.json({
    status: 'success',
    data: theComment,
  });
}

/**
 * DELETE comment
 */
async function destroy(req, res, next) {
  const theComment = Comment.findById(req.params.id);

  if (!theComment) {
    return res.boom.notFound('No comment found by that identifier');
  }

  try {
    await Comment.destory(req.body.id);
    return res.status(204).json({
      status: 'success',
      data: 'Comment destroyed successfully.',
    });
  } catch (e) {
    return next(e);
  }
}

/**
 * EDIT comment
 */
function edit(req, res, next) {
  const { error } = schema.edit.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }

  const aComment = Comment.findById(req.params.id);
  if (!aComment) {
    return res.boom.notFound('No comment found by that identifier.');
  }

  try {
    const opts = { ...req.body, ...req.params };
    const updatedComment = Comment.update(opts);

    return res.status(200).json({
      status: 'success',
      data: updatedComment,
    });
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  create,
  find,
  findById,
  edit,
  destroy,
};
