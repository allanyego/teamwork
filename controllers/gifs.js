const cloudinary = require('cloudinary').v2;

const { query, pool } = require('../db');
const { dataUri } = require('./helpers/data-uri');
const schema = require('./schemas/gif');

/**
 * POST a new gif post
 */
async function create(req, res, next) {
  const isCategory = async ({ category }) => {
    const categories = await query(
      'SELECT * FROM categories WHERE (id=$1)',
      [category],
    );
    return !!categories.rows.length;
  };

  const { error/* , */ } = schema.add.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }

  if (!isCategory(req.body)) {
    return res.boom.badData('The specified category does not exist.');
  }

  const file = dataUri(req).content;
  try {
    const image = await cloudinary.uploader.upload(file);
    const insertNewGifQuery = 'INSERT INTO gifs'
      + '(id, category, title, image, user_id)'
      + ' VALUES($1,$2,$3,$4,$5)';
    const {
      category, title, userId,
    } = req.body;
    const values = [image.public_id, category, title, image.secure_url, userId];
    const fetchNewGifQuery = 'SELECT g.id, g.title, g.image, u.id as userid,'
      + ' u.username, c.id as categoryid, c.name as categoryname FROM gifs g'
      + ' JOIN users u ON'
      + ' (u.id=g.user_id) JOIN categories c ON (c.id=g.category) WHERE (g.id=$1)';

    try {
      await query(insertNewGifQuery, values);

      const theNewGif = await query(fetchNewGifQuery, [image.public_id]);
      const {
        userid, username, categoryid, categoryname, ...rest
      } = theNewGif.rows[0];

      return res.status(201).json({
        status: 'success',
        data: {
          ...rest,
          user: {
            id: userid, username,
          },
          category: {
            id: categoryid, name: categoryname,
          },
        },
      });
    } catch (err) {
      console.log('ERROR', err);
      return next(err);
    }
  } catch (e) {
    console.log('ERROR', e);
    return next(e);
  }
}

/**
 * GET all gif posts
 */
async function find(req, res, next) {
  const findQuery = 'SELECT g.id, g.title, g.image, g.created_at, g.updated_at, '
    + ' c.id as cat_id, c.name AS cat_name, u.id as u_id, u.username FROM '
    + 'gifs g JOIN categories c ON (g.category=c.id) JOIN users u ON '
    + '(g.user_id=u.id) ORDER BY g.created_at DESC';

  try {
    const foundGifs = await query(findQuery);
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
    return res.json({
      status: 'success',
      data: resGifs,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET gif post by id
 */
async function findById(req, res) {
  const fetchGifQuery = 'SELECT g.id, g.title, g.image, g.created_at, '
    + 'g.updated_at, u.id as u_id, u.username, c.id as cat_id, c.name as '
    + 'cat_name FROM gifs g JOIN users u ON (u.id=g.user_id) JOIN '
    + 'categories c ON (c.id=g.category) WHERE (g.id=$1) LIMIT 1';
  const theGif = await query(fetchGifQuery, [req.params.id]);

  if (!theGif.rows.length) {
    return res.boom.noFound('No gif by that identifier.');
  }

  const {
    u_id: userId, username, cat_id: categoryId, cat_name: categoryName,
    created_at: createdAt, updated_at: updatedAt,
    ...rest
  } = theGif.rows[0];

  return res.status(200).json({
    status: 'success',
    data: {
      ...rest,
      createdAt,
      updatedAt,
      user: {
        id: userId, username,
      },
      category: {
        id: categoryId, name: categoryName,
      },
    },
  });
}

/**
 * EDIT gif post
 */
async function edit(req, res, next) {
  const theGif = await query('SELECT * FROM gif WHERE id=$1', [req.params.id]);
  if (!theGif.rows.length) {
    return res.boom.notFound('No gif by that identifier');
  }

  const { error/* , */ } = schema.edit.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }

  const gif = theGif.rows[0];
  let publicId;
  let secureUrl;

  if (req.file) {
    const file = dataUri(req).content;
    await cloudinary.uploader.destroy(gif.id);

    try {
      const image = await cloudinary.uploader.upload(file);
      publicId = image.public_id;
      secureUrl = image.secure_url;
    } catch (e) {
      return next(e);
    }
  }

  try {
    const updateQuery = 'UPDATE gifs SET id=$1, category=$2, title=$3, '
      + 'image=$4 WHERE (id=$5)';
    const {
      category, title,
    } = req.body;
    const values = [
      publicId || gif.id,
      category || gif.category,
      title || gif.title,
      secureUrl || gif.image,
      req.params.id,
    ];

    await query(updateQuery, values);

    const fetchUpdatedGifQuery = 'SELECT g.id, g.title, g.image, u.id as userid,'
      + ' u.username, c.id as categoryid, c.name as categoryname FROM gifs g'
      + ' JOIN users u ON'
      + ' (u.id=g.user_id) JOIN categories c ON (c.id=g.category) WHERE (g.id=$1)';
    const theUpdatedGif = await query(fetchUpdatedGifQuery, [req.params.id]);
    const {
      userid, username, categoryid, categoryname, ...rest
    } = theUpdatedGif.rows[0];

    return res.status(200).json({
      status: 'success',
      data: {
        ...rest,
        user: {
          id: userid, username,
        },
        category: {
          id: categoryid, name: categoryname,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE gif post
 */
async function destroy(req, res) {
  const theGif = await query('SELECT * FROM gifs WHERE (id=$1)', [req.params.id]);
  if (!theGif.rows.length) {
    return res.boom.notFound('No gif by that identifier');
  }

  await cloudinary.uploader.destroy(req.params.id);
  // A transaction for cascaded deletion of a gif and its related
  // entities
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    try {
      // Delete related flags
      await client.query(
        'DELETE FROM flags f WHERE f.id IN (SELECT gf.flag FROM '
        + 'gif_flags gf WHERE (gf.gif=$1))',
        [req.params.id],
      );
    } catch (e) {
      console.log('Deleting flags error', e);
      throw e;
    }

    try {
      // Delete related comments
      await client.query(
        'DELETE FROM comments c WHERE c.id IN (SELECT comment FROM '
        + 'gif_comments gc WHERE (gc.gif=$1))',
        [req.params.id],
      );
    } catch (e) {
      console.log('Deleting comments error', e);
      throw e;
    }

    try {
      // Delete from gifs, cascades to delete comments and flags entries from the
      // gif_comments and gif_flags tables repectively
      await client.query(
        'DELETE FROM gifs WHERE (id=$1)', [`${req.params.id}`],
      );
    } catch (e) {
      console.log('Deleting gifs error', e);
      throw e;
    }

    await client.query('COMMIT');

    return res.json({
      status: 'success',
      data: 'The gif was deleted successfully.',
    });
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
