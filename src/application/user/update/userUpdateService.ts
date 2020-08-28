import { UserName } from '#/domain/models/user/userName';
import { UserService } from '#/domain/models/services/userService';
import type { UserRepository } from '#/repository/user/userRepositoryInterface';
import { UserId } from '#/domain/models/user/userId';
import { UserUpdateCommand } from '#/application/user/update/userUpdateCommand';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { UserDuplicateException } from '#/util/error';

export class UserUpdateService {
  private readonly userService: UserService;

  constructor(private readonly userRepository: UserRepository) {
    this.userService = new UserService(userRepository);
  }

  async handle(command: UserUpdateCommand) {
    const targetId = new UserId(command.getId());
    const user = await this.userRepository.find(targetId);

    const name = command.getName();
    if (name != null) {
      const newUserName = new UserName(name);
      user.changeName(newUserName);
    }

    const mailAddress = command.getMailAddress();
    if (mailAddress != null) {
      const newMailAddress = new MailAddress(mailAddress);
      user.changeMailAddress(newMailAddress);
      if (await this.userService.exists(user)) {
        throw new UserDuplicateException(newMailAddress);
      }
    }

    await this.userRepository.save(user);
  }
}