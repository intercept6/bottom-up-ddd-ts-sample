import { DeleteUserServiceInterface } from './delete-user-service-interface';

export class DeleteUserServiceStub implements DeleteUserServiceInterface {
  async handle(): Promise<void> {
    throw new Error("Delete user service class's handle method is not mocked");
  }
}
