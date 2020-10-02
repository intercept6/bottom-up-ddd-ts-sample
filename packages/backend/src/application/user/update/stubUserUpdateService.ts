import { UserUpdateServiceInterface } from './userUpdateServiceInterface';

export class StubUserUpdateService implements UserUpdateServiceInterface {
  async handle() {
    throw new Error('user update service class method handle is not mocked');
  }
}
