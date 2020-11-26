import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { User } from '../../../domain/models/users/user';

export class UserRepositoryStub implements UserRepositoryInterface {
  async delete(): Promise<void> {
    throw new Error('user repository class method delete is not mocked');
  }

  async register(): Promise<void> {
    throw new Error('user repository class method register is not mocked');
  }

  async update(): Promise<void> {
    throw new Error('user repository class method update is not mocked');
  }

  async get(): Promise<User> {
    throw new Error('user repository class method get is not mocked');
  }

  async list(): Promise<User[]> {
    throw new Error('user repository class method list is not mocked');
  }

  async batchGet(): Promise<User[]> {
    throw new Error('user repository class method batchGet is not mocked');
  }
}
