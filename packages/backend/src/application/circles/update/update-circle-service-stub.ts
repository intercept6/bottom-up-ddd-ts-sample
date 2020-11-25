import { UpdateCircleServiceInterface } from './updateCircleServiceInterface';

export class UpdateCircleServiceStub implements UpdateCircleServiceInterface {
  async handle(): Promise<void> {
    throw new Error('circle update service class method handle is not mocked');
  }
}
