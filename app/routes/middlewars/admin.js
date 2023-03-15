module.exports.adminMiddleware = async(req, res, next) => {
  if (!req.isAdmin) {
    res.send(403).json({ message: 'Permision denied'});
  } else {
    next();
  }
};