import { UserGetServiceInterface } from './user-get-service-interface';
import { UserData } from '../user-data';

export class StubUserGetService implements UserGetServiceInterface {
  async handle(): Promise<UserData> {
    throw new Error('user get service class method handle is not mocked');
  }
}
