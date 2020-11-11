import { UserUpdateServiceInterface } from './user-update-service-interface';
import { UserUpdateCommand } from './user-update-command';

export class StubUserUpdateService implements UserUpdateServiceInterface {
  async handle(_command: UserUpdateCommand) {
    throw new Error('user update service class method handle is not mocked');
  }
}
