import { ListUserServiceInterface } from './list-user-service-interface';
import { UserData } from '../user-data';

export class ListUserServiceStub implements ListUserServiceInterface {
  async handle(): Promise<UserData[]> {
    throw new Error("List user service class's handle method is not mocked");
  }
}
