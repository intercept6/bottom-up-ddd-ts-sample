import { UserName } from '../../../domain/models/users/user-name';
import { UserService } from '../../../domain/models/services/user-service';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { UserId } from '../../../domain/models/users/user-id';
import { UpdateUserCommand } from './update-user-command';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { UpdateUserServiceInterface } from './update-user-service-interface';
import {
  UnknownApplicationError,
  UserDuplicateApplicationError,
  UserNotFoundApplicationError,
} from '../../errors/application-errors';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';

export class UpdateUserService implements UpdateUserServiceInterface {
  private readonly userRepository: UserRepositoryInterface;
  private readonly userService: UserService;

  constructor(props: { readonly userRepository: UserRepositoryInterface }) {
    this.userRepository = props.userRepository;
    this.userService = new UserService(this.userRepository);
  }

  async handle(command: UpdateUserCommand): Promise<void> {
    const targetId = new UserId(command.getId());
    const user = await this.userRepository
      .get(targetId)
      .catch((error: Error) => error);

    if (user instanceof Error) {
      const error = user;
      if (error instanceof UserNotFoundRepositoryError) {
        throw new UserNotFoundApplicationError(targetId, error);
      }
      throw new UnknownApplicationError(error);
    }

    const name = command.getName();
    if (name != null) {
      const newUserName = new UserName(name);
      user.changeName(newUserName);
      if (
        await this.userService.unique(newUserName).catch((error: Error) => {
          throw new UnknownApplicationError(error);
        })
      ) {
        throw new UserDuplicateApplicationError(newUserName);
      }
    }

    const mailAddress = command.getMailAddress();
    if (mailAddress != null) {
      const newMailAddress = new MailAddress(mailAddress);
      user.changeMailAddress(newMailAddress);
      if (
        await this.userService.unique(newMailAddress).catch((error: Error) => {
          throw new UnknownApplicationError(error);
        })
      ) {
        throw new UserDuplicateApplicationError(newMailAddress);
      }
    }

    await this.userRepository.update(user).catch((error: Error) => {
      throw new UnknownApplicationError(error);
    });
  }
}
