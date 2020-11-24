import { UserListServiceInterface } from './user-list-service-interface';
import { UserData } from '../user-data';

export class StubUserListService implements UserListServiceInterface {
  async handle(): Promise<UserData[]> {
    throw new Error('user list service class method handle is not mocked');
  }
}
