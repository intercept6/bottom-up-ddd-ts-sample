import { UserRepositoryInterface } from '#/domain/models/user/userRepositoryInterface';
import { UnknownError } from '#/util/error';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { UserNotFoundRepositoryError } from '#/repository/error/error';

export class UserService {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async unique(userName: UserName): Promise<boolean>;
  async unique(mailAddress: MailAddress): Promise<boolean>;
  async unique(arg1: UserName | MailAddress): Promise<boolean> {
    const response = await this.userRepository
      .get(arg1)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;
      if (error instanceof UserNotFoundRepositoryError) {
        return false;
      }
      throw new UnknownError('unknown error', error);
    }

    return true;
  }
}
