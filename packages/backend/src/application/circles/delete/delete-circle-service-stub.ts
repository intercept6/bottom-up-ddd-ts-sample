import { DeleteCircleServiceInterface } from './delete-circle-service-interface';

export class DeleteCircleServiceStub implements DeleteCircleServiceInterface {
  async handle(): Promise<void> {
    throw new Error(
      "Delete circle service class's handle method is not mocked"
    );
  }
}
