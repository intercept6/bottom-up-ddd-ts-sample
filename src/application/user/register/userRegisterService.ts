import { UserRegisterCommand } from '#/application/user/register/userRegisterCommand';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserDuplicateException } from '#/util/error';
import { UserService } from '#/domain/models/services/userService';
import { UserRepository } from '#/repository/user/userRepositoryInterface';

export class UserRegisterService {
  private readonly userService: UserService;

  constructor(private readonly userRepository: UserRepository) {
    this.userService = new UserService(userRepository);
  }

  async handle(command: UserRegisterCommand) {
    const userName = command.getName();
    const mailAddress = command.getMailAddress();

    const newMailAddress = new MailAddress(mailAddress);
    const user = new User(new UserName(userName), newMailAddress);

    if (await this.userService.exists(user)) {
      throw new UserDuplicateException(newMailAddress);
    }

    await this.userRepository.save(user);
  }
}
