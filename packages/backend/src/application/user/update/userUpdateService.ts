import { UserName } from '../../../domain/models/user/userName';
import { UserService } from '../../../domain/models/services/userService';
import { UserRepositoryInterface } from '../../../domain/models/user/userRepositoryInterface';
import { UserId } from '../../../domain/models/user/userId';
import { UserUpdateCommand } from './userUpdateCommand';
import { MailAddress } from '../../../domain/models/user/mailAddress';
import { UserUpdateServiceInterface } from './userUpdateServiceInterface';
import {
  UserDuplicateApplicationError,
  UserNotFoundApplicationError,
} from '../../error/error';
import { UserNotFoundRepositoryError } from '../../../repository/error/error';
import { UnknownError } from '../../../util/error';

export class UserUpdateService implements UserUpdateServiceInterface {
  private readonly userRepository: UserRepositoryInterface;
  private readonly userService: UserService;

  constructor(props: { readonly userRepository: UserRepositoryInterface }) {
    this.userRepository = props.userRepository;
    this.userService = new UserService(this.userRepository);
  }

  async handle(command: UserUpdateCommand) {
    const targetId = new UserId(command.getId());
    const response = await this.userRepository
      .get(targetId)
      .catch((error: Error) => error);

    if (response instanceof Error) {
      const error = response;
      if (error instanceof UserNotFoundRepositoryError) {
        throw new UserNotFoundApplicationError(targetId, error);
      }
      throw new UnknownError('unknown error', error);
    }

    const user = response;

    const name = command.getName();
    if (name != null) {
      const newUserName = new UserName(name);
      user.changeName(newUserName);
      if (await this.userService.unique(newUserName)) {
        throw new UserDuplicateApplicationError(newUserName);
      }
    }

    const mailAddress = command.getMailAddress();
    if (mailAddress != null) {
      const newMailAddress = new MailAddress(mailAddress);
      user.changeMailAddress(newMailAddress);
      if (await this.userService.unique(newMailAddress)) {
        throw new UserDuplicateApplicationError(newMailAddress);
      }
    }

    await this.userRepository.update(user);
  }
}
