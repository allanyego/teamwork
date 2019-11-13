const uuid = require('uuid/v1');

const { query, pool } = require('../../db');

const create = async (article) => new Promise((resolve, reject) => {
  const {
    title, text, userId, category,
  } = article;
  const articleId = uuid();
  const createQuery = 'INSERT INTO articles(id,category,title,text,user_id) VALUES'
    + '($1,$2,$3,$4,$5)';

  query(createQuery, [articleId, category, title, text, userId], async (err) => {
    if (err) {
      return reject(err);
    }
    const findUpdatedQuery = 'SELECT a.id, a.title, a.text, c.id as categoryid, c.name '
      + 'AS categoryname, u.id as userid, u.username FROM articles a JOIN categories c '
      + 'ON (a.category=c.id) JOIN users u ON (a.user_id=u.id) WHERE (a.id=$1) '
      + 'LIMIT 1';

    const { rows } = await query(
      findUpdatedQuery,
      [articleId],
    );
    const {
      userid, username, categoryid, categoryname, ...rest
    } = rows[0];
    return resolve({
      ...rest,
      category: { name: categoryname, id: categoryid },
      user: { username, id: userid },
    });
  });
});

const find = async ({ category }) => new Promise((resolve, reject) => {
  const values = [];
  let findQuery = 'SELECT a.id, a.title, a.text, a.created_at, a.updated_at, '
    + 'c.id as cat_id, c.name AS cat_name, u.id as u_id, u.username '
    + 'FROM articles a JOIN categories c ON (a.category=c.id) JOIN users u ON '
    + '(a.user_id=u.id)';

  if (category) {
    findQuery += ' WHERE (c.name=$1)';
    values.push(category);
  }

  findQuery += ' ORDER BY a.created_at DESC';

  query(findQuery, values, (err, { rows }) => {
    if (err) {
      console.log('Query error', err);
      return reject(err);
    }

    const resArticles = rows.map((row) => {
      const {
        u_id: userId, username, cat_id: categoryId, cat_name: categoryName,
        created_at: createdAt, updated_at: updatedAt,
        ...rest
      } = row;
      return {
        ...rest,
        createdAt,
        updatedAt,
        category: { name: categoryName, id: categoryId },
        user: { username, id: userId },
      };
    });
    return resolve(resArticles);
  });
});

const findById = (id) => new Promise((resolve, reject) => {
  const findQuery = 'SELECT a.id, a.title, a.text, a.created_at, a.updated_at, '
    + 'u.id AS u_id, u.username, c.id AS cat_id, c.name AS cat_name FROM '
    + 'articles a JOIN users u ON (u.id=a.user_id) JOIN categories c ON '
    + '(c.id=a.category) WHERE (a.id=$1) LIMIT 1';
  query(
    findQuery,
    [id],
    (err, { rows }) => {
      if (err) {
        return reject(err);
      }
      if (!rows.length) {
        resolve(null);
      }
      const {
        u_id: userId, username, cat_id: categoryId, cat_name: categoryName,
        create_at: createdAt, updated_at: updatedAt,
        ...rest
      } = rows[0];

      return resolve({
        ...rest,
        createdAt,
        updatedAt,
        category: { name: categoryName, id: categoryId },
        user: { id: userId, username },

      });
    },
  );
});

const update = async ({
  id, text, title, category,
}) => {
  const updateQuery = 'UPDATE articles SET category=$1, title=$2, text=$3 '
    + 'WHERE (id=$4)';
  const values = [category, title, text, id];

  await query(updateQuery, values);
  const updatedArticle = await findById(id);
  return updatedArticle;
};
const destroy = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete related flags
    await client.query(
      'DELETE FROM flags f WHERE f.id IN (SELECT af.flag FROM '
        + 'article_flags af WHERE (af.article=$1))',
      [id],
    );

    // Delete related comments
    await client.query(
      'DELETE FROM comments c WHERE c.id IN (SELECT comment FROM '
      + 'article_comments ac WHERE (ac.article=$1))',
      [id],
    );

    // Delete from articles, cascades to delete comments and flags entries
    // from the article_comments and article_flags tables repectively
    await client.query(
      'DELETE FROM articles WHERE (id=$1)', [`${id}`],
    );

    await client.query('COMMIT');

    return Promise.resolve(true);
  } catch (e) {
    await client.query('ROLLBACK');
    return Promise.reject(e);
  } finally {
    await client.release();
  }
};

module.exports = {
  find,
  findById,
  update,
  destroy,
  create,
};
