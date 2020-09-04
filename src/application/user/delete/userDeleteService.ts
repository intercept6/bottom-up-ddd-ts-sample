import { UserDeleteCommand } from '#/application/user/delete/userDeleteCommand';
import { UserId } from '#/domain/models/user/userId';
import { UnknownException, UserNotFoundException } from '#/util/error';
import { systemLog } from '#/util/systemLog';
import { UserRepositoryInterface } from '#/repository/user/userRepositoryInterface';
import { UserDeleteServiceInterface } from '#/application/user/delete/userDeleteServiceInterface';

export class UserDeleteService implements UserDeleteServiceInterface {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async handle(command: UserDeleteCommand) {
    const targetId = new UserId(command.getUserId());
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
