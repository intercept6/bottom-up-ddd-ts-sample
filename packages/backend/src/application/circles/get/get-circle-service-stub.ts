import { GetCircleServiceInterface } from './get-circle-service-interface';
import { CircleData } from '../circle-data';

export class GetCircleServiceStub implements GetCircleServiceInterface {
  async handle(): Promise<CircleData> {
    throw new Error('circle get service class method handle is not mocked');
  }
}
