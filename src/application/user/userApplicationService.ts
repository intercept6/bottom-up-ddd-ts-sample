import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserService } from '#/domain/models/services/userService';
import type { UserRepository } from '#/repository/user/userRepositoryInterface';
import { UserId } from '#/domain/models/user/userId';
import { UserData } from '#/application/user/userData';
import { UserUpdateCommand } from '#/application/user/userUpdateCommand';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { UserRegisterCommand } from '#/application/user/userRegisterCommand';
import { UserDeleteCommand } from '#/application/user/userDeleteCommand';
import { systemLog } from '#/util/systemLog';
import {
  UnknownException,
  UserDuplicateException,
  UserNotFoundException,
} from '#/util/error';
import { UserGetCommand } from '#/application/user/userGetCommand';

export class UserApplicationService {
  private readonly userService: UserService;

  constructor(private readonly userRepository: UserRepository) {
    this.userService = new UserService(userRepository);
  }

  async register(command: UserRegisterCommand) {
    const userName = command.getName();
    const mailAddress = command.getMailAddress();

    const newMailAddress = new MailAddress(mailAddress);
    const user = new User(new UserName(userName), newMailAddress);

    if (await this.userService.exists(user)) {
      throw new UserDuplicateException(newMailAddress);
    }

    await this.userRepository.save(user);
  }

  async get(command: UserGetCommand) {
    if (command.getId() != null) {
      const targetId = new UserId(command.getId() as string);
      const user = await this.userRepository.find(targetId);

      return new UserData(user);
    } else {
      const targetMailAddress = new MailAddress(
        command.getMailAddress() as string
      );
      const user = await this.userRepository.find(targetMailAddress);

      return new UserData(user);
    }
  }

  async update(command: UserUpdateCommand) {
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

  async delete(command: UserDeleteCommand) {
    const targetId = new UserId(command.getId());
    const response = await this.userRepository
      .find(targetId)
      .catch((error: Error) => {
        return error;
      });

    // 対象が見つからなかったため退会成功とする
    if (response instanceof Error) {
      if (response instanceof UserNotFoundException) {
        systemLog('WARN', response.message);
        return;
      }
      throw new UnknownException(response);
    }

    await this.userRepository.delete(response);
  }
}
