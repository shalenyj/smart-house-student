const userRoutes = require('./user');
const setupRoutes = require('./setup');
const { authMiddleware } = require('./middlewars/auth');

module.exports = app => {
  app.use('/', userRoutes);
  app.use('/setup', authMiddleware, setupRoutes);
};
