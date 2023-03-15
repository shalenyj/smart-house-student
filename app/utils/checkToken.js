const jwt = require('jsonwebtoken');

const isTokenValid = token => new Promise((resolve, reject) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      reject(err);
    } else {
      resolve(decoded);
    }
  });
});

module.exports = isTokenValid;
