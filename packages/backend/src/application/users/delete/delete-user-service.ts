import { DeleteUserCommand } from './delete-user-command';
import { UserId } from '../../../domain/models/users/user-id';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { Logger } from '../../../util/logger';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { DeleteUserServiceInterface } from './delete-user-service-interface';
import { UnknownApplicationError } from '../../errors/application-errors';

export class DeleteUserService implements DeleteUserServiceInterface {
  private readonly userRepository: UserRepositoryInterface;

  constructor(props: { readonly userRepository: UserRepositoryInterface }) {
    this.userRepository = props.userRepository;
  }

  async handle(command: DeleteUserCommand): Promise<void> {
    const targetId = new UserId(command.getUserId());
    const response = await this.userRepository
      .get(targetId)
      .catch((error: Error) => {
        return error;
      });

    if (response instanceof Error) {
      const error = response;
      // 対象が見つからなかった場合も削除成功とする
      if (error instanceof UserNotFoundRepositoryError) {
        Logger.debug(error);
        return;
      }
      throw new UnknownApplicationError(error);
    }

    await this.userRepository.delete(response).catch((error: Error) => {
      throw new UnknownApplicationError(error);
    });
  }
}
