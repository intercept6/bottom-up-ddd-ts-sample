import { RegisterCircleServiceInterface } from './register-circle-service-interface';
import { CircleData } from '../circle-data';

export class RegisterCircleServiceStub
  implements RegisterCircleServiceInterface {
  async handle(): Promise<CircleData> {
    throw new Error(
      'circle register service class method handle is not mocked'
    );
  }
}
