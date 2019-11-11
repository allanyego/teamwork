const cloudinary = require('cloudinary').v2;

const { query, pool } = require('../db');
const { dataUri } = require('./helpers/data-uri');
const schema = require('./schemas/gif');

/**
 * GET gif post by id
 */

const fbyId = async (id) => {
  const fetchGifQuery = 'SELECT g.id, g.title, g.image, g.created_at, '
    + 'g.updated_at, u.id as u_id, u.username, c.id as cat_id, c.name as '
    + 'cat_name FROM gifs g JOIN users u ON (u.id=g.user_id) JOIN '
    + 'categories c ON (c.id=g.category) WHERE (g.id=$1) LIMIT 1';
  const theGif = await query(fetchGifQuery, [id]);

  if (!theGif.rows.length) {
    return null;
  }

  const {
    u_id: userId, username, cat_id: categoryId, cat_name: categoryName,
    created_at: createdAt, updated_at: updatedAt,
    ...rest
  } = theGif.rows[0];

  return {
    ...rest,
    createdAt,
    updatedAt,
    user: {
      id: userId, username,
    },
    category: {
      id: categoryId, name: categoryName,
    },
  };
};

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

    try {
      await query(insertNewGifQuery, values);

      const theNewGif = await fbyId(image.public_id);
      return res.status(201).json({
        status: 'success',
        data: theNewGif,
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
  const { category } = req.query;
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

  try {
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
    return res.json({
      status: 'success',
      data: resGifs,
    });
  } catch (err) {
    return next(err);
  }
}

async function findById(req, res) {
  const gif = await fbyId(req.params.id);
  if (!gif) {
    return res.boom.noFound('No gif by that identifier.');
  }
  return res.status(200).json({
    status: 'success',
    data: gif,
  });
}

/**
 * EDIT gif post
 */
async function edit(req, res, next) {
  const aGif = await fbyId(req.params.id);
  if (!aGif) {
    return res.boom.notFound('No gif by that identifier');
  }

  const { error/* , */ } = schema.edit.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }


  let publicId;
  let secureUrl;

  if (req.file) {
    const file = dataUri(req).content;
    await cloudinary.uploader.destroy(aGif.id);

    try {
      const image = await cloudinary.uploader.upload(file);
      publicId = image.public_id;
      secureUrl = image.secure_url;
    } catch (e) {
      console.log('cloudinary error', e);
      return next(e);
    }
  }

  try {
    const updateQuery = 'UPDATE gifs SET id=$1, title=$2, '
      + 'image=$3 WHERE (id=$4)';
    const { title } = req.body;
    const theNewId = publicId || aGif.id;
    const values = [
      theNewId,
      title || aGif.title,
      secureUrl || aGif.image,
      aGif.id,
    ];
    // console.log('Will change ID from %s to %s', aGif.id, publicId);
    await query(updateQuery, values);
    const theUpdatedGif = await fbyId(theNewId);

    return res.status(200).json({
      status: 'success',
      data: theUpdatedGif,
    });
  } catch (err) {
    console.log('Update error', err);
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
