import { UpdateUserServiceInterface } from './update-user-service-interface';

export class UpdateUserServiceStub implements UpdateUserServiceInterface {
  async handle(): Promise<void> {
    throw new Error("Update user service class's handle method is not mocked");
  }
}
