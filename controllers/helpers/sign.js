const jsonwebtoken = require('jsonwebtoken');

const sign = (user) => {
  const admin = user.type === 'admin';

  return jsonwebtoken.sign(
    { userId: user.id, admin },
    process.env.APP_SECRET,
    { expiresIn: '24h' },
  );
};

module.exports = {
  sign,
};
