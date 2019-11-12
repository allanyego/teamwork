const { query, pool } = require('../../db');

/**
 * GET gif post by id
 */
const findById = (id) => new Promise((resolve, reject) => {
  const fetchGifQuery = 'SELECT g.id, g.title, g.image, g.created_at, '
    + 'g.updated_at, u.id as u_id, u.username, c.id as cat_id, c.name as '
    + 'cat_name FROM gifs g JOIN users u ON (u.id=g.user_id) JOIN '
    + 'categories c ON (c.id=g.category) WHERE (g.id=$1) LIMIT 1';
  query(fetchGifQuery, [id], (err, resp) => {
    if (err) {
      return reject(err);
    }

    if (!resp.rows.length) {
      return null;
    }

    const [gif] = resp.rows || [];
    const {
      u_id: userId, username, cat_id: categoryId, cat_name: categoryName,
      created_at: createdAt, updated_at: updatedAt,
      ...rest
    } = gif;

    return resolve({
      ...rest,
      createdAt,
      updatedAt,
      user: {
        id: userId, username,
      },
      category: {
        id: categoryId, name: categoryName,
      },
    });
  });
});

/**
 * POST a new gif
 */
const create = async ({
  id, category, image, title, userId,
}) => {
  const insertNewGifQuery = 'INSERT INTO gifs'
    + '(id, category, title, image, user_id)'
    + ' VALUES($1,$2,$3,$4,$5)';
  await query(insertNewGifQuery, [id, category, title, image, userId]);
  const newGif = await findById(id);
  return newGif;
};

/**
 * GET gif post by id
 */
const find = async ({ category }) => {
  const values = [];
  let findQuery = 'SELECT g.id, g.title, g.image, g.created_at, g.updated_at, '
    + ' c.id as cat_id, c.name AS cat_name, u.id as u_id, u.username FROM '
    + 'gifs g JOIN categories c ON (g.category=c.id) JOIN users u ON '
    + '(g.user_id=u.id)';

  if (category) {
    findQuery += ' WHERE (c.name=$1)';
    values.push(category);
  }
  findQuery += ' ORDER BY g.created_at DESC';

  const foundGifs = await query(findQuery, values);
  // Map through each row and returning a nested object
  const resGifs = foundGifs.rows.map((row) => {
    const {
      u_id: userId, username, cat_id: categoryId, cat_name: categoryName,
      updated_at: updatedAt, created_at: createdAt,
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
  return resGifs;
};

const update = async ({
  oldId, newId, title, image,
}) => {
  const updateQuery = 'UPDATE gifs SET id=$1, title=$2, '
  + 'image=$3 WHERE (id=$4)';
  await query(updateQuery, [newId, title, image, oldId]);
  const theUpdatedGif = await findById(newId);
  return theUpdatedGif;
};

const destory = async (id) => {
  // A transaction for cascaded deletion of a gif and its related
  // entities
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete related flags
    await client.query(
      'DELETE FROM flags f WHERE f.id IN (SELECT gf.flag FROM '
      + 'gif_flags gf WHERE (gf.gif=$1))',
      [id],
    );

    // Delete related comments
    await client.query(
      'DELETE FROM comments c WHERE c.id IN (SELECT comment FROM '
      + 'gif_comments gc WHERE (gc.gif=$1))',
      [id],
    );

    // Delete from gifs, cascades to delete comments and flags entries from the
    // gif_comments and gif_flags tables repectively
    await client.query(
      'DELETE FROM gifs WHERE (id=$1)', [id],
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.release();
  }
};

module.exports = {
  create,
  find,
  findById,
  update,
  destory,
};
