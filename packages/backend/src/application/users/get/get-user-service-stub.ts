import { GetUserServiceInterface } from './get-user-service-interface';
import { UserData } from '../user-data';

export class GetUserServiceStub implements GetUserServiceInterface {
  async handle(): Promise<UserData> {
    throw new Error("Get user service class's handle method is not mocked");
  }
}
