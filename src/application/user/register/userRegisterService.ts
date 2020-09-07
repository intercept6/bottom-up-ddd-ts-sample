import { UserRegisterCommand } from '#/application/user/register/userRegisterCommand';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserDuplicateException } from '#/util/error';
import { UserService } from '#/domain/models/services/userService';
import { UserRepositoryInterface } from '#/domain/models/user/userRepositoryInterface';
import { UserRegisterServiceInterface } from '#/application/user/register/userRegisterServiceInterface';
import { UserData } from '#/application/user/userData';

export class UserRegisterService implements UserRegisterServiceInterface {
  private readonly userService: UserService;

  constructor(private readonly userRepository: UserRepositoryInterface) {
    this.userService = new UserService(userRepository);
  }

  async handle(command: UserRegisterCommand) {
    const userName = command.getName();
    const mailAddress = command.getMailAddress();

    const newUserName = new UserName(userName);
    if (await this.userService.unique(newUserName)) {
      throw new UserDuplicateException(newUserName);
    }

    const newMailAddress = new MailAddress(mailAddress);
    if (await this.userService.unique(newMailAddress)) {
      throw new UserDuplicateException(newMailAddress);
    }

    const user = new User(newUserName, newMailAddress);

    await this.userRepository.create(user);
    return new UserData(user);
  }
}
