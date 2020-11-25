import { UserRepositoryInterface } from '../users/user-repository-interface';
import { UserName } from '../users/user-name';
import { MailAddress } from '../users/mail-address';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { UnknownDomainError } from '../../errors/domain-errors';

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
      throw new UnknownDomainError(error);
    }

    return true;
  }
}
