import { CircleFactoryInterface } from '../../../domain/models/circles/circle-factory-interface';
import { Circle } from '../../../domain/models/circles/circle';

export class CircleFactoryStub implements CircleFactoryInterface {
  async create(): Promise<Circle> {
    throw new Error('circle factory class method create is not mocked');
  }
}
