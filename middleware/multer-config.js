const multer = require('multer');

const MIME_TYPES = {
  'image/gif': 'gif',
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!MIME_TYPES[file.mimetype]) {
    return cb(null, false);
  }

  return cb(null, true);
};

const onError = (err, next) => {
  next(err);
};

module.exports = {
  multer: multer({
    storage,
    fileFilter,
    onError,
  }).single('image'),
};
