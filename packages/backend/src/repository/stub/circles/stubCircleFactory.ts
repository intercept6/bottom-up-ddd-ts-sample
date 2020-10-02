import { CircleFactoryInterface } from '../../../domain/models/circles/circleFactoryInterface';
import { Circle } from '../../../domain/models/circles/circle';

export class StubCircleFactory implements CircleFactoryInterface {
  async create(): Promise<Circle> {
    throw new Error('circle factory class method create is not mocked');
  }
}
