import { CircleUpdateServiceInterface } from './circleUpdateServiceInterface';

export class StubCircleUpdateService implements CircleUpdateServiceInterface {
  async handle(): Promise<void> {
    throw new Error('circle update service class method handle is not mocked');
  }
}
