const { registerSchema, loginSchema } = require('../../application/dtos/auth.dto');
const { registerUserUseCase, loginUserUseCase } = require('../../config/container');

class AuthController {
  async register(req, res, next) {
    try {
      const payload = registerSchema.parse(req.body);
      const user = await registerUserUseCase.execute(payload);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const payload = loginSchema.parse(req.body);
      const result = await loginUserUseCase.execute(payload);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
