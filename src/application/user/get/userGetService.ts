import { UserGetCommand } from '#/application/user/get/userGetCommand';
import { UserId } from '#/domain/models/user/userId';
import { UserData } from '#/application/user/userData';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { UserRepositoryInterface } from '#/domain/models/user/userRepositoryInterface';
import { UserGetServiceInterface } from '#/application/user/get/userGetServiceInterface';
import { UserNotFoundRepositoryError } from '#/repository/error/error';
import {
  ArgumentApplicationError,
  UserNotFoundApplicationError,
} from '#/application/error/error';
import { UnknownError } from '#/util/error';

export class UserGetService implements UserGetServiceInterface {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  private static getIdentifier(props: {
    userId?: string;
    mailAddress?: string;
  }) {
    if (typeof props.userId === 'string' && props.mailAddress == null) {
      return new UserId(props.userId);
    } else if (typeof props.mailAddress === 'string' && props.userId == null) {
      return new MailAddress(props.mailAddress);
    }
    throw new ArgumentApplicationError('user get command is invalid');
  }

  async handle(command: UserGetCommand): Promise<UserData> {
    const userId = command.getId();
    const mailAddress = command.getMailAddress();

    const identifier = UserGetService.getIdentifier({ userId, mailAddress });

    const response = await this.userRepository
      .get(identifier)
      .catch((error: Error) => error);
    if (response instanceof Error) {
      const error = response;
      if (error instanceof UserNotFoundRepositoryError) {
        throw new UserNotFoundApplicationError(identifier, error);
      }
      throw new UnknownError('unknown error', error);
    }
    const user = response;

    return new UserData(user);
  }
}
