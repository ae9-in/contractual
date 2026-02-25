const { AppError } = require('../../shared/errors');
const { tokenService, userRepository } = require('../../config/container');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401);
    }

    const token = authHeader.slice(7);
    const payload = tokenService.verify(token);
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new AppError('Unauthorized', 401);
    }

    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    next();
  } catch (error) {
    next(new AppError('Unauthorized', 401));
  }
}

module.exports = authMiddleware;
