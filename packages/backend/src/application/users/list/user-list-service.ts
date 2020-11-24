import { UserListCommand } from './user-list-command';
import { UserData } from '../user-data';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { UserListServiceInterface } from './user-list-service-interface';
import { UnknownError } from '../../../util/error';

export class UserListService implements UserListServiceInterface {
  private readonly userRepository: UserRepositoryInterface;

  constructor(props: { readonly userRepository: UserRepositoryInterface }) {
    this.userRepository = props.userRepository;
  }

  async handle(command: UserListCommand): Promise<UserData[]> {
    const limit = command.getLimit() ?? 10;
    const nextToken = command.getNextToken();

    const users = await this.userRepository
      .list({ limit, nextToken })
      .catch((error: Error) => error);
    if (users instanceof Error) {
      throw new UnknownError('unknown error', users);
    }
    return users.map((user) => new UserData(user));
  }
}
