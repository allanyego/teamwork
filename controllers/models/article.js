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
      + 'AS categoryname, u.id as userid, u.username FROM articles a JOIN categories c'
      + ' ON (a.category=c.id) JOIN users u ON (a.user_id=u.id) WHERE (a.id=$1) '
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

const find = async () => new Promise((resolve, reject) => {
  // Room for improvement here with query/path parameters
  const findQuery = 'SELECT a.id, a.title, a.text, c.id as categoryid, c.name '
    + 'AS categoryname, u.id as userid, u.username FROM gifs g JOIN categories c'
    + ' ON (a.category=c.id) JOIN users u ON (a.user_id=u.id) ORDER BY '
    + 'a.created_at DESC';

  query(findQuery, (err, articles) => {
    if (err) {
      return reject(err);
    }

    const resArticles = articles.map((row) => {
      const {
        userid, username, categoryid, categoryname, ...rest
      } = row;
      return {
        ...rest,
        category: { name: categoryname, id: categoryid },
        user: { username, id: userid },
      };
    });
    return resolve(resArticles);
  });
});

const findById = (id) => new Promise((resolve, reject) => {
  const findQuery = 'SELECT a.id, a.title, a.text, c.id as categoryid, c.name '
    + 'AS categoryname, u.id as userid, u.username FROM gifs g JOIN categories c'
    + ' ON (a.category=c.id) JOIN users u ON (a.user_id=u.id) WHERE (a.id=$1) '
    + 'LIMIT 1';
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
        userid, username, categoryid, categoryname, ...rest
      } = rows[0];
      return resolve({
        ...rest,
        category: { name: categoryname, id: categoryid },
        user: { username, id: userid },
      });
    },
  );
});

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
  destroy,
  create,
};
