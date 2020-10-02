import { UserDeleteCommand } from './userDeleteCommand';
import { UserId } from '../../../domain/models/users/userId';
import { UnknownError } from '../../../util/error';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repositoryErrors';
import { Logger } from '../../../util/logger';
import { UserRepositoryInterface } from '../../../domain/models/users/userRepositoryInterface';
import { UserDeleteServiceInterface } from './userDeleteServiceInterface';

export class UserDeleteService implements UserDeleteServiceInterface {
  private readonly userRepository: UserRepositoryInterface;

  constructor(props: { readonly userRepository: UserRepositoryInterface }) {
    this.userRepository = props.userRepository;
  }

  async handle(command: UserDeleteCommand) {
    const targetId = new UserId(command.getUserId());
    const response = await this.userRepository
      .get(targetId)
      .catch((error: Error) => {
        return error;
      });

    if (response instanceof Error) {
      // 対象が見つからなかった場合も削除成功とする
      if (response instanceof UserNotFoundRepositoryError) {
        Logger.debug(response);
        return;
      }
      throw new UnknownError('unknown error', response);
    }

    await this.userRepository.delete(response);
  }
}
