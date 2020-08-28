import { UserGetCommand } from '#/application/user/get/userGetCommand';
import { UserId } from '#/domain/models/user/userId';
import { UserData } from '#/application/user/userData';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { userRepositoryInterface } from '#/repository/user/userRepositoryInterface';
import { UserGetServiceInterface } from '#/application/user/get/userGetServiceInterface';

export class UserGetService implements UserGetServiceInterface {
  constructor(private readonly userRepository: userRepositoryInterface) {}

  async handle(command: UserGetCommand): Promise<UserData> {
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
