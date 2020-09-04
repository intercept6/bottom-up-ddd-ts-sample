import type { UserRepositoryInterface } from '#/repository/user/userRepositoryInterface';
import { UnknownException, UserNotFoundException } from '#/util/error';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';

export class UserService {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async unique(userName: UserName): Promise<boolean>;
  async unique(mailAddress: MailAddress): Promise<boolean>;
  async unique(arg1: UserName | MailAddress): Promise<boolean> {
    const response = await this.userRepository
      .find(arg1)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;
      if (error instanceof UserNotFoundException) {
        return false;
      }
      throw new UnknownException(error);
    }

    return true;
  }
}
