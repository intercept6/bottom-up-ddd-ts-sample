import { CircleDeleteServiceInterface } from './circleDeleteServiceInterface';

export class StubCircleDeleteService implements CircleDeleteServiceInterface {
  async handle() {
    throw new Error('circle delete service class method handle is not mocked');
  }
}
