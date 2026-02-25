const { AppError } = require('../../shared/errors');

class RegisterUserUseCase {
  constructor({ userRepository, passwordService }) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute(input) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email already in use', 409);
    }

    const passwordHash = await this.passwordService.hash(input.password);

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

module.exports = RegisterUserUseCase;
