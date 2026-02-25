const { AppError } = require('../../shared/errors');

class LoginUserUseCase {
  constructor({ userRepository, passwordService, tokenService }) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async execute(input) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const valid = await this.passwordService.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.tokenService.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

module.exports = LoginUserUseCase;
