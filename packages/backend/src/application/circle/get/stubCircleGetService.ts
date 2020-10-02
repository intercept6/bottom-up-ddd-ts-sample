import { CircleGetServiceInterface } from './circleGetServiceInterface';
import { CircleData } from '../circleData';

export class StubCircleGetService implements CircleGetServiceInterface {
  async handle(): Promise<CircleData> {
    throw new Error('circle get service class method handle is not mocked');
  }
}
