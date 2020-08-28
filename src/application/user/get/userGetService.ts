import { UserGetCommand } from '#/application/user/get/userGetCommand';
import { UserId } from '#/domain/models/user/userId';
import { UserData } from '#/application/user/userData';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { UserRepository } from '#/repository/user/userRepositoryInterface';

export class UserGetService {
  constructor(private readonly userRepository: UserRepository) {}

  async handle(command: UserGetCommand) {
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
}
