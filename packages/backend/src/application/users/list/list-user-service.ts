import { ListUserCommand } from './list-user-command';
import { UserData } from '../user-data';
import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { ListUserServiceInterface } from './list-user-service-interface';
import { UnknownApplicationError } from '../../errors/application-errors';

export class ListUserService implements ListUserServiceInterface {
  private readonly userRepository: UserRepositoryInterface;

  constructor(props: { readonly userRepository: UserRepositoryInterface }) {
    this.userRepository = props.userRepository;
  }

  async handle(command: ListUserCommand): Promise<UserData[]> {
    const limit = command.getLimit() ?? 10;
    const nextToken = command.getNextToken();

    const users = await this.userRepository
      .list({ limit, nextToken })
      .catch((error: Error) => {
        throw new UnknownApplicationError(error);
      });

    return users.map((user) => new UserData(user));
  }
}
