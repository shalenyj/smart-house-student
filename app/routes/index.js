const userRoutes = require('./user');
const setupRoutes = require('./setup');
const reportRoutes = require('./report');

const { authMiddleware } = require('./middlewars/auth');
const { adminMiddleware } = require('./middlewars/admin');

module.exports = app => {
  app.use('/', userRoutes);
  app.use('/setup', authMiddleware, setupRoutes);
  app.use('/report', authMiddleware, adminMiddleware, reportRoutes)
};
