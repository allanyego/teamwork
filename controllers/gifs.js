const cloudinary = require('cloudinary').v2;

const { dataUri } = require('./helpers/data-uri');
const schema = require('./schemas/gif');
const Gif = require('./models/gif');
const Category = require('./models/category');

/**
 * POST a new gif post
 */
async function create(req, res, next) {
  const { error/* , */ } = schema.add.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }

  const isCategory = await Category.findById(req.body.category);
  if (!isCategory) {
    return res.boom.badData('The specified category does not exist.');
  }


  const file = dataUri(req).content;
  try {
    const image = await cloudinary.uploader.upload(file);

    const {
      category, title, userId,
    } = req.body;

    const newGifDetails = {
      id: image.public_id,
      image: image.secure_url,
      category,
      title,
      userId,
    };

    try {
      const theNewGif = await Gif.create(newGifDetails);
      return res.status(201).json({
        status: 'success',
        data: theNewGif,
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
  try {
    const { category } = req.query;
    const gifs = await Gif.find({ category });
    return res.json({
      status: 'success',
      data: gifs,
    });
  } catch (e) {
    return next(e);
  }
}

async function findById(req, res, next) {
  try {
    const gif = await Gif.findById(req.params.id);
    if (!gif) {
      return res.boom.noFound('No gif by that identifier.');
    }
    return res.status(200).json({
      status: 'success',
      data: gif,
    });
  } catch (e) {
    return next(e);
  }
}

/**
 * EDIT gif post
 */
async function edit(req, res, next) {
  const aGif = await Gif.findById(req.params.id);
  if (!aGif) {
    return res.boom.notFound('No gif by that identifier');
  }

  const { error/* , */ } = schema.edit.validate(req.body);
  if (error) {
    return res.boom.badData(error.message);
  }

  if (aGif.user.id !== req.body.userId) {
    return res.json({
      status: 'error',
      error: 'You can only edit your articles.',
    });
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
      return next(e);
    }
  }

  try {
    const { title } = req.body;
    const newGifDetails = {
      newId: publicId || aGif.id,
      title: title || aGif.title,
      image: secureUrl || aGif.image,
      oldId: aGif.id,
    };

    const theUpdatedGif = await Gif.update(newGifDetails);

    return res.status(200).json({
      status: 'success',
      data: theUpdatedGif,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE gif post
 */
async function destroy(req, res, next) {
  const theGif = await Gif.findById(req.params.id);
  if (!theGif) {
    return res.boom.notFound('No gif by that identifier');
  }

  if (!res.locals.userId) {
    return res.boom.unauthorized();
  }

  if (res.locals.userId !== theGif.user.id) {
    return res.json({
      status: 'error',
      error: 'You can only destory your own gifs.',
    });
  }

  try {
    await cloudinary.uploader.destroy(req.params.id);

    await Gif.destory(req.params.id);
    return res.status(204).json({
      status: 'success',
      data: 'The gif was deleted successfully.',
    });
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  create,
  find,
  findById,
  edit,
  destroy,
};
