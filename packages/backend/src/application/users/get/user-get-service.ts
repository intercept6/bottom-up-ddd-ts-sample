import { UserGetCommand } from './user-get-command';
import { UserId } from '../../../domain/models/users/user-id';
import { UserData } from '../user-data';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { UserGetServiceInterface } from './user-get-service-interface';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import {
  ArgumentApplicationError,
  UserNotFoundApplicationError,
} from '../../errors/application-errors';
import { UnknownError } from '../../../util/error';

export class UserGetService implements UserGetServiceInterface {
  private readonly userRepository: UserRepositoryInterface;

  constructor(props: { readonly userRepository: UserRepositoryInterface }) {
    this.userRepository = props.userRepository;
  }

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
    const userId = command.getUserId();
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
    return new UserData(response);
  }
}
