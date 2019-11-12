const uuid = require('uuid/v1');

const { query, pool } = require('../../db');
const Gif = require('./gif');
const Article = require('./article');
const Comment = require('./comment');

const getArticleOrGifOrComment = async (id) => {
  const { rows: [flagGif] } = await query(
    'SELECT * FROM gif_flags WHERE (flag=$1)',
    [id],
  );

  if (flagGif) {
    const gif = await Gif.findById(flagGif.gif);
    return { gif };
  }

  const { rows: [flagArticle] } = await query(
    'SELECT * FROM article_flags WHERE (flag=$1)',
    [id],
  );
  if (flagArticle) {
    const article = await Article.findById(flagArticle.article);
    return { article };
  }

  const { rows: [flagComment] } = await query(
    'SELECT * FROM comment_flags WHERE (flag=$1)',
    [id],
  );
  const comment = await Comment.findById(flagComment.comment);
  return { comment };
};

/**
 * GET comment by id
 */
async function findById(id) {
  const commentQuery = 'SELECT f.id, f.status, f.feedback, f.created_at, '
    + 'f.updated_at, u.id as u_id, u.username FROM flags f JOIN '
    + 'users u ON (u.id=f.user_id) WHERE (f.id=$1)'
    + ' LIMIT 1';
  const { rows: [theFlag] } = await query(commentQuery, [id]);

  if (!theFlag) {
    return null;
  }

  let rGif;
  let rArticle;
  let rComment;
  const { article, gif, comment } = await getArticleOrGifOrComment(id);
  if (article) {
    rArticle = {
      id: article.id,
      title: article.title,
    };
  } else if (gif) {
    rGif = {
      id: gif.id,
      title: gif.title,
      image: gif.image,
    };
  } else {
    rComment = {
      id: comment.id,
      image: comment.image,
    };
  }

  const {
    u_id: userId, username, created_at: createdAt, updated_at: updatedAt,
    ...rest
  } = theFlag;

  return {
    ...rest,
    createdAt,
    updatedAt,
    user: {
      id: userId, username,
    },
    article: rArticle,
    gif: rGif,
    comment: rComment,
  };
}

/**
 * POST a new flag
 */
async function create({
  gif, article, comment, feedback, userId,
}) {
  const client = await pool.connect();
  // Convenience ID to help in queries
  const flagId = uuid();

  try {
    await client.query('BEGIN');

    const insertFlagQuery = 'INSERT INTO flags(id, feedback, user_id)'
      + ' VALUES($1,$2,$3)';
    const values = [flagId, feedback, userId];
    await client.query(insertFlagQuery, values);

    // Query string to insert into respective gif|article_comments table
    let insertIntermediaryQuery;
    if (article) {
      insertIntermediaryQuery = 'INSERT INTO article_flags(article, flag)'
        + ' VALUES($1,$2)';
    } else if (gif) {
      insertIntermediaryQuery = 'INSERT INTO gif_flags(gif, flag)'
        + ' VALUES($1,$2)';
    } else {
      insertIntermediaryQuery = 'INSERT INTO comment_flags(comment, flag)'
        + ' VALUES($1,$2)';
    }

    const flagValues = [article || gif || comment, flagId];
    await client.query(insertIntermediaryQuery, flagValues);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.release();
  }

  const newFlag = await findById(flagId);
  return newFlag;
}

/**
 * GET all flags (by gif | article | comment)
 */
async function find({
  gif, article, comment, userId,
}) {
  // Room for improvement, consider queries for revoked or resolved
  // flags
  const values = [];
  let isWhered = false;
  let varCounter = 1;
  let flagsQuery = 'SELECT id FROM flags';
  let post;
  if (userId) {
    flagsQuery += ` WHERE (user_id=$${varCounter})`;
    values.push(userId);
    isWhered = true;
    varCounter += 1;
  }

  if (gif || article || comment) {
    if (gif) {
      post = {
        id: gif,
        table: 'gif_flags',
        field: 'gif',
      };
    } else if (article) {
      post = {
        id: article,
        table: 'article_flags',
        field: 'article',
      };
    } else {
      post = {
        id: comment,
        table: 'comment_flags',
        field: 'comment',
      };
    }

    flagsQuery += ` ${isWhered ? 'AND' : 'WHERE'} id IN (SELECT flag FROM
      ${post.table} WHERE (${post.field}=$${varCounter}))`;
    values.push(post.id);
  }

  const foundFlags = await query(flagsQuery, values);
  // Map through each row and returning a nested object
  return foundFlags.rows.map(async (row) => {
    const flag = await findById(row.id);
    return flag;
  });
}

/**
 * EDIT flag
 */
async function edit({ id, status }) {
  const updateQuery = 'UPDATE flags SET status=$1 WHERE (id=$2)';
  await query(updateQuery, [status, id]);
  const updatedComment = await findById(id);
  return updatedComment;
}

/**
 * DELETE flag
 * Not implemented
 */
// async function destroy(id) {
//
// }

module.exports = {
  create,
  find,
  findById,
  edit,
};
