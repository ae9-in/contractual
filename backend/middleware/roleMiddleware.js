const ApiError = require('../utils/ApiError');

function roleMiddleware(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new ApiError(403, 'Forbidden'));
    }
    return next();
  };
}

module.exports = roleMiddleware;
