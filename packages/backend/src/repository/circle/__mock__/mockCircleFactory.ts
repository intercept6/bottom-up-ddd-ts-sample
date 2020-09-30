import { CircleFactoryInterface } from '../../../domain/models/circle/circleFactoryInterface';
import { Circle } from '../../../domain/models/circle/circle';

/* eslint-disable no-unreachable */
export class MockCircleFactory implements CircleFactoryInterface {
  async create() {
    throw new Error('circle factory class method create is not mocked');
    return {} as Circle;
  }
}
