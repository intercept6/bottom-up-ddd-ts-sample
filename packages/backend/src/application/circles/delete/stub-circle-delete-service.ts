import { CircleDeleteServiceInterface } from './circleDeleteServiceInterface';

export class StubCircleDeleteService implements CircleDeleteServiceInterface {
  async handle(): Promise<void> {
    throw new Error('circle delete service class method handle is not mocked');
  }
}
