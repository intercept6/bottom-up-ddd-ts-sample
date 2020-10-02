import { CircleUpdateServiceInterface } from './circleUpdateServiceInterface';

export class StubCircleUpdateService implements CircleUpdateServiceInterface {
  async handle() {
    throw new Error('circle update service class method handle is not mocked');
  }
}
