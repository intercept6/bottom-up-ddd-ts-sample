import { CircleGetServiceInterface } from './circle-get-service-interface';
import { CircleData } from '../circle-data';

export class StubCircleGetService implements CircleGetServiceInterface {
  async handle(): Promise<CircleData> {
    throw new Error('circle get service class method handle is not mocked');
  }
}
