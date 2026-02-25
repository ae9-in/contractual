const pool = require('../infrastructure/db/pool');
const MySqlUserRepository = require('../infrastructure/repositories/MySqlUserRepository');
const MySqlJobRepository = require('../infrastructure/repositories/MySqlJobRepository');
const MySqlProposalRepository = require('../infrastructure/repositories/MySqlProposalRepository');
const BcryptPasswordService = require('../infrastructure/services/BcryptPasswordService');
const JwtTokenService = require('../infrastructure/services/JwtTokenService');

const RegisterUserUseCase = require('../application/use-cases/RegisterUserUseCase');
const LoginUserUseCase = require('../application/use-cases/LoginUserUseCase');
const CreateJobUseCase = require('../application/use-cases/CreateJobUseCase');
const ListOpenJobsUseCase = require('../application/use-cases/ListOpenJobsUseCase');
const SubmitProposalUseCase = require('../application/use-cases/SubmitProposalUseCase');
const ListBusinessProposalsUseCase = require('../application/use-cases/ListBusinessProposalsUseCase');

const userRepository = new MySqlUserRepository({ db: pool });
const jobRepository = new MySqlJobRepository({ db: pool });
const proposalRepository = new MySqlProposalRepository({ db: pool });
const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService();

module.exports = {
  userRepository,
  tokenService,
  registerUserUseCase: new RegisterUserUseCase({ userRepository, passwordService }),
  loginUserUseCase: new LoginUserUseCase({ userRepository, passwordService, tokenService }),
  createJobUseCase: new CreateJobUseCase({ jobRepository }),
  listOpenJobsUseCase: new ListOpenJobsUseCase({ jobRepository }),
  submitProposalUseCase: new SubmitProposalUseCase({ jobRepository, proposalRepository }),
  listBusinessProposalsUseCase: new ListBusinessProposalsUseCase({ jobRepository, proposalRepository }),
};
