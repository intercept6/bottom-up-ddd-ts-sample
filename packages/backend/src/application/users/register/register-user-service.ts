import { RegisterUserCommand } from './register-user-command';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { User } from '../../../domain/models/users/user';
import { UserName } from '../../../domain/models/users/user-name';
import {
  UnknownApplicationError,
  UserDuplicateApplicationError,
} from '../../errors/application-errors';
import { UserService } from '../../../domain/models/services/user-service';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { RegisterUserServiceInterface } from './register-user-service-interface';
import { UserData } from '../user-data';

export class RegisterUserService implements RegisterUserServiceInterface {
  private readonly userRepository: UserRepositoryInterface;
  private readonly userService: UserService;

  constructor(props: { readonly userRepository: UserRepositoryInterface }) {
    this.userRepository = props.userRepository;
    this.userService = new UserService(this.userRepository);
  }

  async handle(command: RegisterUserCommand): Promise<UserData> {
    const userName = command.getName();
    const mailAddress = command.getMailAddress();

    const newUserName = new UserName(userName);
    if (
      await this.userService.unique(newUserName).catch((error: Error) => {
        throw new UnknownApplicationError(error);
      })
    ) {
      throw new UserDuplicateApplicationError(newUserName);
    }

    const newMailAddress = new MailAddress(mailAddress);
    if (
      await this.userService.unique(newMailAddress).catch((error: Error) => {
        throw new UnknownApplicationError(error);
      })
    ) {
      throw new UserDuplicateApplicationError(newMailAddress);
    }

    const user = new User(newUserName, newMailAddress);

    await this.userRepository.register(user).catch((error: Error) => {
      throw new UnknownApplicationError(error);
    });
    return new UserData(user);
  }
}
