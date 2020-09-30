import { UserRepositoryInterface } from '../../../domain/models/user/userRepositoryInterface';
import { User } from '../../../domain/models/user/user';

/* eslint-disable no-unreachable */
export class MockUserRepository implements UserRepositoryInterface {
  async delete() {
    throw new Error('user repository class method delete is not mocked');
  }

  async create() {
    throw new Error('user repository class method create is not mocked');
  }

  async update() {
    throw new Error('user repository class method update is not mocked');
  }

  async get() {
    throw new Error('user repository class method get is not mocked');
    return {} as User;
  }

  async batchGet() {
    throw new Error('user repository class method batchGet is not mocked');
    return [] as User[];
  }
}
