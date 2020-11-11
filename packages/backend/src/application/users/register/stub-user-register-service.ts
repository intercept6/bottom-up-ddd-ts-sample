import { UserRegisterServiceInterface } from './user-register-service-interface';
import { UserData } from '../user-data';

export class StubUserRegisterService implements UserRegisterServiceInterface {
  async handle(): Promise<UserData> {
    throw new Error('user register service class method handle is not mocked');
  }
}
