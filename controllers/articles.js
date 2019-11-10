const schema = require('./schemas/article');
const Article = require('./models/article');

/**
 * POST a new gif post
 */
async function create(req, res, next) {
  const { error/* , */ } = schema.add.validate(req.body);
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
 * GET all gif posts
 */
async function find(req, res, next) {
  try {
    const articles = await Article.find();

    return res.json({
      status: 'success',
      data: articles,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET gif post by id
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
 * EDIT gif post
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
//
// /**
//  * DELETE gif post
//  */
// async function destroy(req, res) {
//   const theGif = await query('SELECT * FROM gif WHERE id=$1', [req.params.id]);
//   if (!theGif.rows.length) {
//     return res.boom.notFound('No gif by that identifier');
//   }
//
//   await cloudinary.uploader.destroy(req.params.id);
//   // A transaction for cascaded deletion of a gif and its related
//   // entities
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//
//     // Delete entries from flag-related tables
//     await client.query(
//       'DELETE FROM comment_flags WHERE comment IN SELECT comment FROM '
//       + 'gif_comments WHERE (gif=$1)', [req.params.id],
//     );
//     await client.query(
//       'DELETE FROM flags f WHERE id IN (SELECT cf.flag FROM '
//       + 'comments c JOIN comment_flags cf ON (c.id=cf.comment) '
//       + 'JOIN article_comments ac ON (ac.comment=c.id) WHERE '
//       + '(ac.gif=$1)', [req.params.id],
//     );
//
//     // Delete entries from comment-related tables
//     await client.query(
//       'DELETE FROM gif_comments WHERE (comment=$1)', [req.params.id],
//     );
//     await client.query(
//       'DELETE FROM comments WHERE id IN SELECT comment FROM gif_comments '
//       + 'WHERE (gif=$1)', [req.params.id],
//     );
//
//     // Delete entries in related flag tables
//     await client.query(
//       'DELETE FROM gif_flags WHERE gif (gif=$1)', [req.params.id],
//     );
//     await client.query(
//       'DELETE FROM flags f WHERE id IN (SELECT gf.flag FROM '
//       + 'gifs g JOIN gif_flags gf ON (g.id=gf.gif)  WHERE '
//       + '(g.id=$1)', [req.params.id],
//     );
//     // Delete the gif entry
//     await client.query(
//       'DELETE FROM flags f WHERE id IN (SELECT cf.flag FROM '
//       + 'comments c JOIN comment_flags cf ON (c.id=cf.comment) '
//       + 'JOIN article_comments ac ON (ac.comment=c.id) WHERE '
//       + '(ac.article=$1)', [req.params.id],
//     );
//
//     return await client.query('COMMIT');
//   } catch (e) {
//     await client.query('ROLLBACK');
//     throw e;
//   } finally {
//     await client.release();
//   }
// }

module.exports = {
  create,
  find,
  findById,
  edit,
  // destroy,
};
