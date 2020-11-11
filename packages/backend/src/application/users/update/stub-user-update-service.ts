import { UserUpdateServiceInterface } from './user-update-service-interface';

export class StubUserUpdateService implements UserUpdateServiceInterface {
  async handle(): Promise<void> {
    throw new Error('user update service class method handle is not mocked');
  }
}
