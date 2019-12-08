const uuid = require('uuid/v1');

const { query, pool } = require('../../db');
const Gif = require('./gif');
const Article = require('./article');

const getArticleOrGif = async (id) => {
  const { rows: [gifComment] } = await query(
    'SELECT * FROM gif_comments WHERE (comment=$1)',
    [id],
  );

  let gif;
  let article;
  if (gifComment) {
    gif = await Gif.findById(gifComment.gif);
  } else {
    const { rows: [articleComment] } = await query(
      'SELECT * FROM article_comments WHERE (comment=$1)',
      [id],
    );
    article = await Article.findById(articleComment.article);
  }
  return { article, gif };
};

/**
 * GET comment by id
 */
async function findById(id) {
  const commentQuery = 'SELECT com.id, com.comment, com.created_at, '
    + 'com.updated_at, u.id as u_id, u.username FROM comments com JOIN '
    + 'users u ON (u.id=com.user_id) WHERE (com.id=$1)'
    + ' LIMIT 1';
  const { rows: [theGif] } = await query(commentQuery, [id]);

  if (!theGif) {
    return null;
  }

  let rGif;
  let rArticle;
  const { article, gif } = await getArticleOrGif(id);
  if (article) {
    rArticle = {
      id: article.id,
      title: article.title,
    };
  } else {
    rGif = {
      id: gif.id,
      title: gif.title,
      image: gif.image,
    };
  }

  const {
    u_id: userId, username, created_at: createdAt, updated_at: updatedAt,
    ...rest
  } = theGif;

  return {
    ...rest,
    createdAt,
    updatedAt,
    user: {
      id: userId, username,
    },
    article: rArticle,
    gif: rGif,
  };
}

/**
 * POST a new comment
 */
async function create({
  gif, article, comment, userId,
}) {
  const client = await pool.connect();
  // Convenience ID to help in queries
  const commentId = uuid();

  try {
    await client.query('BEGIN');

    const insertCommentQuery = 'INSERT INTO comments(id, comment, user_id)'
      + ' VALUES($1,$2,$3)';
    const values = [commentId, comment, userId];
    await client.query(insertCommentQuery, values);

    // Query string to insert into respective gif|article_comments table
    let insertIntermediaryQuery;
    if (article) {
      insertIntermediaryQuery = 'INSERT INTO article_comments(article, comment)'
        + ' VALUES($1,$2)';
    } else {
      insertIntermediaryQuery = 'INSERT INTO gif_comments(gif, comment)'
        + ' VALUES($1,$2)';
    }

    const commentValues = [article || gif, commentId];
    await client.query(insertIntermediaryQuery, commentValues);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.release();
  }

  const newComment = await findById(commentId);
  return newComment;
}

/**
 * GET all comments
 */
async function find({
  userId, gif, article, findFlagged, count,
}) {
  let isWhered = false;
  const values = [];
  let varCounter = 1;
  let commentsQuery = 'SELECT id FROM comments';

  if (findFlagged) {
    commentsQuery += ' JOIN comment_flags cf ON (cf.comment=id) JOIN flags f '
      + 'ON (f.id=cf.flag) WHERE (status=$1)';
    values.push('pending');
  } else {
    if (userId) {
      commentsQuery += ` WHERE (user_id=$${varCounter})`;
      values.push(userId);
      isWhered = true;
      varCounter += 1;
    }
    if (gif || article) {
      const post = {
        id: gif || article,
        table: gif ? 'gif_comments' : 'article_comments',
        field: gif ? 'gif' : 'article',
      };

      if (count) {
        commentsQuery = `SELECT count(*) FROM ${post.table} WHERE (${post.field}=$1)`;
        values.length = 0;
        values.push(gif || article);
      } else {
        commentsQuery += `${isWhered ? ' AND' : ' WHERE'} id IN (SELECT comment
          FROM ${post.table} WHERE (${post.field}=$${varCounter}))`;
        values.push(post.id);
      }
    }
  }

  const foundComments = await query(commentsQuery, values);
  if (count) {
    const [data] = foundComments.rows;
    return data;
  }
  // Map through each row and return a nested object
  return foundComments.rows.map(async (row) => {
    const comment = await findById(row.id);
    return comment;
  });
}

/**
 * EDIT comment
 */
async function edit({ id, comment }) {
  const updateQuery = 'UPDATE comments SET comment=$1 WHERE (id=$2)';
  await query(updateQuery, [comment, id]);
  const updatedComment = await findById(id);
  return updatedComment;
}

/**
 * DELETE comment
 */
async function destroy(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete related flags
    await client.query(
      'DELETE FROM flags f WHERE f.id IN (SELECT cf.flag FROM '
      + 'comment_flags cf WHERE (cf.comment=$1))',
      [id],
    );

    // Delete the comment cascades to delete related entries in gif_comments,
    // article_comments and comment_flags tables
    await client.query(
      'DELETE FROM comments WHERE (id=$1)',
      [id],
    );

    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.release();
  }
}

module.exports = {
  create,
  find,
  findById,
  edit,
  destroy,
};
