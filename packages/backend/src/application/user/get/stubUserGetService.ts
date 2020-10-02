import { UserGetServiceInterface } from './userGetServiceInterface';
import { UserData } from '../userData';

export class StubUserGetService implements UserGetServiceInterface {
  async handle(): Promise<UserData> {
    throw new Error('user get service class method handle is not mocked');
  }
}
