// const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const { query, pool } = require('../db');
const { dataUri } = require('./helpers/data-uri');
const schema = require('./schemas/gif');

/**
 * POST a new gif post
 */
async function create(req, res, next) {
  const { error/* , */ } = schema.add.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }

  const file = dataUri(req).content;
  try {
    const image = await cloudinary.uploader.upload(file);
    const insertQuery = 'INSERT INTO gifs'
      + '(id, category, title, image, user)'
      + ' VALUES($1,$2,$3,$4)';
    const {
      category, title, user,
    } = req.body;
    const values = [image.public_id, category, title, image.secure_url, user];

    try {
      const newGif = await query(insertQuery, values);
      return res.status(201).json({
        status: 'success',
        data: newGif.rows[0],
      });
    } catch (err) {
      return next(err);
    }
  } catch (e) {
    return next(e);
  }
}

/**
 * GET all gif posts
 */
async function find(req, res, next) {
  const findQuery = 'SELECT g.id, g.title, g.image, g.user, c.id, c.name, '
    + 'u.id, u.username FROM gifs g JOIN category ON (g.category=c.id) JOIN '
    + 'users ON (g.user=u.id) ORDERBY createdAt DESC';

  try {
    const gifs = await query(findQuery);
    // Map each gif object assigning new cloudinary url
    return res.json({
      status: 'success',
      data: gifs,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET gif post by id
 */
async function findById(req, res, next) {
  const findQuery = 'SELECT g.id, g.title, g.image, g.user, c.id, c.name, '
    + 'u.id, u.username FROM gifs g JOIN category ON (g.category=c.id) JOIN '
    + 'users ON (g.user=u.id) where (g.id=$1) LIMIT 1';

  try {
    const gif = await query(findQuery, [req.params.id]);
    if (!gif.rows.length) {
      return res.boom.noFound('No gif by that identifier.');
    }

    return res.json({
      status: 'success',
      data: gif.rows[0],
    });
  } catch (err) {
    return next(err);
  }
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
    const updateQuery = 'UPDATE gifs SET id=$1, category=$4, title=$2, '
      + 'image=$3 where (id=$4)';
    const {
      category, title,
    } = req.body;
    const values = [
      publicId || gif.id,
      category, title,
      secureUrl || gif.image];

    const newGif = await query(updateQuery, values);
    return res.json({
      status: 'success',
      data: newGif.rows[0],
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE gif post
 */
async function destroy(req, res) {
  const theGif = await query('SELECT * FROM gif WHERE id=$1', [req.params.id]);
  if (!theGif.rows.length) {
    return res.boom.notFound('No gif by that identifier');
  }

  await cloudinary.uploader.destroy(req.params.id);
  // A transaction for cascaded deletion of a gif and its related
  // entities
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete entries from flag-related tables
    await client.query(
      'DELETE FROM comment_flags WHERE comment IN SELECT comment FROM '
      + 'gif_comments WHERE (gif=$1)', [req.params.id],
    );
    await client.query(
      'DELETE FROM flags f WHERE id IN (SELECT cf.flag FROM '
      + 'comments c JOIN comment_flags cf ON (c.id=cf.comment) '
      + 'JOIN article_comments ac ON (ac.comment=c.id) WHERE '
      + '(ac.gif=$1)', [req.params.id],
    );

    // Delete entries from comment-related tables
    await client.query(
      'DELETE FROM gif_comments WHERE (comment=$1)', [req.params.id],
    );
    await client.query(
      'DELETE FROM comments WHERE id IN SELECT comment FROM gif_comments '
      + 'WHERE (gif=$1)', [req.params.id],
    );

    // Delete entries in related flag tables
    await client.query(
      'DELETE FROM gif_flags WHERE gif (gif=$1)', [req.params.id],
    );
    await client.query(
      'DELETE FROM flags f WHERE id IN (SELECT gf.flag FROM '
      + 'gifs g JOIN gif_flags gf ON (g.id=gf.gif)  WHERE '
      + '(g.id=$1)', [req.params.id],
    );
    // Delete the gif entry
    await client.query(
      'DELETE FROM flags f WHERE id IN (SELECT cf.flag FROM '
      + 'comments c JOIN comment_flags cf ON (c.id=cf.comment) '
      + 'JOIN article_comments ac ON (ac.comment=c.id) WHERE '
      + '(ac.article=$1)', [req.params.id],
    );

    return await client.query('COMMIT');
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
