import { UserUpdateServiceInterface } from './userUpdateServiceInterface';
import { UserUpdateCommand } from './userUpdateCommand';

export class StubUserUpdateService implements UserUpdateServiceInterface {
  async handle(_command: UserUpdateCommand) {
    throw new Error('user update service class method handle is not mocked');
  }
}
