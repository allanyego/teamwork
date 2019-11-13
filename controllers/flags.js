const schema = require('./schemas/flag');
const Article = require('./models/article');
const Gif = require('./models/gif');
const Flag = require('./models/flag');
const Comment = require('./models/comment');

/**
 * POST a new flag
 */
async function create(req, res, next) {
  const { gif, article, comment } = req.body;

  let joiRes;
  let PostModel;
  if (article) {
    joiRes = schema.articleAdd.validate(req.body);
    PostModel = Article;
  } else if (gif) {
    joiRes = schema.gifAdd.validate(req.body);
    PostModel = Gif;
  } else if (comment) {
    joiRes = schema.commentAdd.validate(req.body);
    PostModel = Comment;
  } else {
    return res.boom.badData('Please check your data and try again.');
  }

  if (joiRes.error) {
    return res.boom.badData(joiRes.error.message);
  }

  const aPost = await PostModel.findById(article || gif || comment);
  if (!aPost) {
    let post;
    if (article) {
      post = 'article';
    } else if (gif) {
      post = 'gif';
    } else {
      post = 'comment';
    }
    return res.boom.notFound(
      `The specified ${post} does not exist.`,
    );
  }

  if (article) {
    const a = await Flag.find({ article, userId: req.body.userId });

    if (a.length) {
      return res.json({
        status: 'error',
        error: 'You can only flag an article once.',
      });
    }
  }
  if (gif) {
    const g = await Flag.find({ gif, userId: req.body.userId });
    if (g.length) {
      return res.json({
        status: 'error',
        error: 'You can only flag a gif once.',
      });
    }
  }
  if (comment) {
    const c = await Flag.find({ comment, userId: req.body.userId });
    if (c.length) {
      return res.json({
        status: 'error',
        error: 'You can only flag a comment once.',
      });
    }
  }

  try {
    const newFlag = await Flag.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: newFlag,
    });
  } catch (e) {
    console.log('Error', e);
    return next(e);
  }
}

/**
 * GET all flags (most probably by user or post)
 */
async function find(req, res) {
  const { gif, article } = req.query;
  const resFlags = await Flag.find({ gif, article });

  return res.json({
    status: 'success',
    data: resFlags,
  });
}

/**
 * GET flag by id
 */
async function findById(req, res) {
  const theFlag = await Flag.findById(req.params.id);

  if (!theFlag) {
    return res.boom.notFound('No flag found by that identifier');
  }
  return res.json({
    status: 'success',
    data: theFlag,
  });
}

/**
 * EDIT flag
 */
async function edit(req, res, next) {
  if (!res.locals.isAdmin) {
    return res.boom.unauthorized('Insufficient privileges to edit a flag.');
  }

  const { error } = schema.edit.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }

  const aFlag = await Flag.findById(req.params.id);
  if (!aFlag) {
    return res.boom.notFound('No flag found by that identifier.');
  }

  try {
    const opts = { ...req.body, ...req.params };
    const updatedFlag = await Flag.update(opts);

    return res.status(200).json({
      status: 'success',
      data: updatedFlag,
    });
  } catch (e) {
    return next(e);
  }
}

/**
 * DELETE flag
 */
// async function destroy(req, res, next) {
//   const theFlag = await Flag.findById(req.params.id);
//
//   if (!theFlag) {
//     return res.boom.notFound('No flag found by that identifier');
//   }
//
//   try {
//     await Flag.destory(req.body.id);
//     return res.status(204).json({
//       status: 'success',
//       data: 'Flag destroyed successfully.',
//     });
//   } catch (e) {
//     return next(e);
//   }
// }

module.exports = {
  create,
  find,
  findById,
  edit,
  // destroy,
};
