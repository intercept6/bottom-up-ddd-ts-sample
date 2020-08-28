import { UserDeleteCommand } from '#/application/user/delete/userDeleteCommand';
import { UserId } from '#/domain/models/user/userId';
import { UnknownException, UserNotFoundException } from '#/util/error';
import { systemLog } from '#/util/systemLog';
import { UserRepository } from '#/repository/user/userRepositoryInterface';

export class UserDeleteService {
  constructor(private readonly userRepository: UserRepository) {}

  async handle(command: UserDeleteCommand) {
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
