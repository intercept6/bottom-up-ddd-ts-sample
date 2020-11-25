import { GetUserCommand } from './get-user-command';
import { UserId } from '../../../domain/models/users/user-id';
import { UserData } from '../user-data';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { GetUserServiceInterface } from './get-user-service-interface';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import {
  ArgumentApplicationError,
  UnknownApplicationError,
  UserNotFoundApplicationError,
} from '../../errors/application-errors';

export class GetUserService implements GetUserServiceInterface {
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

  async handle(command: GetUserCommand): Promise<UserData> {
    const userId = command.getUserId();
    const mailAddress = command.getMailAddress();

    const identifier = GetUserService.getIdentifier({ userId, mailAddress });

    const user = await this.userRepository
      .get(identifier)
      .catch((error: Error) => {
        if (error instanceof UserNotFoundRepositoryError) {
          throw new UserNotFoundApplicationError(identifier, error);
        }
        throw new UnknownApplicationError(error);
      });
    return new UserData(user);
  }
}
