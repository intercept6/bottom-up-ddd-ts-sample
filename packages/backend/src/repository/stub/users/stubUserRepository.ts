import { UserRepositoryInterface } from '../../../domain/models/user/userRepositoryInterface';
import { User } from '../../../domain/models/user/user';

export class StubUserRepository implements UserRepositoryInterface {
  async delete() {
    throw new Error('user repository class method delete is not mocked');
  }

  async create() {
    throw new Error('user repository class method create is not mocked');
  }

  async update() {
    throw new Error('user repository class method update is not mocked');
  }

  async get(): Promise<User> {
    throw new Error('user repository class method get is not mocked');
  }

  async batchGet(): Promise<User[]> {
    throw new Error('user repository class method batchGet is not mocked');
  }
}
