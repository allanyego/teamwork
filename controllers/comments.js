const schema = require('./schemas/comment');
const Article = require('./models/article');
const Gif = require('./models/gif');
const Comment = require('./models/comment');

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
  } else if (gif) {
    joiRes = schema.gifAdd.validate(req.body);
    PostModel = Gif;
  } else {
    return res.status(422).json({
      status: 'error',
      error: 'Please check your data and try again.',
    });
  }

  if (joiRes.error) {
    return res.status(422).json({
      status: 'error',
      error: joiRes.error.message,
    });
  }

  // if (req.body.userId !== res.locals.userId) {
  //   return res.status(200).json({
  //     status: 'error',
  //     error: 'You can not post comments for yourself',
  //   });
  // }

  const aPost = await PostModel.findById(gif || article);
  if (!aPost) {
    return res.status(404).json({
      status: 'error',
      error: `The specified ${article ? 'article' : 'gif'} does not exist.`,
    });
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
 * GET all comments (by user or post)
 */
async function find(req, res) {
  const {
    user, gif, article, count,
  } = req.query;
  const resComments = await Comment.find({
    userId: user, gif, article, count,
  });

  return res.json({
    status: 'success',
    data: resComments,
  });
}

/**
 * GET comment by id
 */
async function findById(req, res) {
  const theComment = await Comment.findById(req.params.id);

  if (!theComment) {
    return res.status(404).json({
      status: 'console.error();',
      error: 'No comment found by that identifier',
    });
  }
  return res.json({
    status: 'success',
    data: theComment,
  });
}

/**
 * EDIT comment
 */
async function edit(req, res, next) {
  const { error } = schema.edit.validate(req.body);
  if (error) {
    return res.status(422).json({
      status: 'error',
      error: error.message,
    });
  }

  const aComment = await Comment.findById(req.params.id);
  if (!aComment) {
    return res.status(404).json({
      status: 'error',
      error: 'No comment found by that identifier.',
    });
  }

  try {
    const opts = { ...req.body, ...req.params };
    const updatedComment = await Comment.update(opts);

    return res.status(200).json({
      status: 'success',
      data: updatedComment,
    });
  } catch (e) {
    return next(e);
  }
}

/**
 * DELETE comment
 */
async function destroy(req, res, next) {
  const theComment = await Comment.findById(req.params.id);

  if (!theComment) {
    return res.status(404).json({
      status: 'error',
      error: 'No comment found by that identifier',
    });
  }

  if (!res.locals.userId) {
    return res.status(401).json({
      status: 'error',
      error: 'Insufficient credentials.',
    });
  }
  if (res.locals.userId !== theComment.user.id && !res.locals.isAdmin) {
    return res.status(401).son({
      status: 'error',
      error: 'Not owner and not admin',
    });
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

module.exports = {
  create,
  find,
  findById,
  edit,
  destroy,
};
