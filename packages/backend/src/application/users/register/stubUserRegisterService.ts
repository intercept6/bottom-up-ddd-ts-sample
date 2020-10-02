import { UserRegisterServiceInterface } from './userRegisterServiceInterface';
import { UserData } from '../userData';

export class StubUserRegisterService implements UserRegisterServiceInterface {
  async handle(): Promise<UserData> {
    throw new Error('user register service class method handle is not mocked');
  }
}
