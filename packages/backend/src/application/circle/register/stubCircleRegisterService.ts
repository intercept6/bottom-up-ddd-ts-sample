import { CircleRegisterServiceInterface } from './circleRegisterServiceInterface';
import { CircleData } from '../circleData';

export class StubCircleRegisterService
  implements CircleRegisterServiceInterface {
  async handle(): Promise<CircleData> {
    throw new Error(
      'circle register service class method handle is not mocked'
    );
  }
}
