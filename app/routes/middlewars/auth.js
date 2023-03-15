const checkToken = require('../../utils/checkToken');

module.exports.authMiddleware = async(req, res, next) => {
  const token = req.get('Authorization');
  if(!token){
    res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const olnyToken = token.split(' ').pop();
    const { email, isAdmin } = await checkToken(olnyToken);
    if(!email){
      return res.status(401).json({ message: 'Incorrect token type'});
    }
    req.email = email;
    req.isAdmin = isAdmin;
    next();
  } catch(err){
    if(err.name === 'TokenExpiredError'){
      res.status(401).json({ message: 'Unauthorized' });
    }
    console.log(err);
    res.status(500).json({ message: 'Unexpected error, details at logs' });
  }
};