import { CircleRegisterServiceInterface } from './circle-register-service-interface';
import { CircleData } from '../circle-data';

export class StubCircleRegisterService
  implements CircleRegisterServiceInterface {
  async handle(): Promise<CircleData> {
    throw new Error(
      'circle register service class method handle is not mocked'
    );
  }
}
