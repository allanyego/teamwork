const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const token = authorizationHeader.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.APP_SECRET);
      const { userId, admin } = decodedToken;

      if (req.body.userId && req.body.userId !== userId) {
        res.boom.unauthorized('Invalid user ID');
      } else {
        res.locals.isAdmin = !!admin;
        res.locals.userId = userId;
        next();
      }
    } else {
      res.boom.unauthorized('You need to set the authorization header');
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  auth,
};
