import { CircleFactoryInterface } from '../../../domain/models/circle/circleFactoryInterface';
import { Circle } from '../../../domain/models/circle/circle';

export class StubCircleFactory implements CircleFactoryInterface {
  async create(): Promise<Circle> {
    throw new Error('circle factory class method create is not mocked');
  }
}
