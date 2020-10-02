import { UserRegisterCommand } from './userRegisterCommand';
import { MailAddress } from '../../../domain/models/users/mailAddress';
import { User } from '../../../domain/models/users/user';
import { UserName } from '../../../domain/models/users/userName';
import { UserDuplicateApplicationError } from '../../errors/applicationErrors';
import { UserService } from '../../../domain/models/services/userService';
import { UserRepositoryInterface } from '../../../domain/models/users/userRepositoryInterface';
import { UserRegisterServiceInterface } from './userRegisterServiceInterface';
import { UserData } from '../userData';

export class UserRegisterService implements UserRegisterServiceInterface {
  private readonly userRepository: UserRepositoryInterface;
  private readonly userService: UserService;

  constructor(props: { readonly userRepository: UserRepositoryInterface }) {
    this.userRepository = props.userRepository;
    this.userService = new UserService(this.userRepository);
  }

  async handle(command: UserRegisterCommand) {
    const userName = command.getName();
    const mailAddress = command.getMailAddress();

    const newUserName = new UserName(userName);
    if (await this.userService.unique(newUserName)) {
      throw new UserDuplicateApplicationError(newUserName);
    }

    const newMailAddress = new MailAddress(mailAddress);
    if (await this.userService.unique(newMailAddress)) {
      throw new UserDuplicateApplicationError(newMailAddress);
    }

    const user = new User(newUserName, newMailAddress);

    await this.userRepository.create(user);
    return new UserData(user);
  }
}
