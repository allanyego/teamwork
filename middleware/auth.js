const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.APP_SECRET);
    const { userId, admin } = decodedToken;

    if (req.body.userId && req.body.userId !== userId) {
      res.boom.unauthorized('Invalid user ID');
    } else {
      res.locals.isAdmin = !!admin;
      next();
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  auth,
};
