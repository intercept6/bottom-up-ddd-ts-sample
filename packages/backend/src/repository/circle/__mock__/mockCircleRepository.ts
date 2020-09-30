import { CircleRepositoryInterface } from '../../../domain/models/circle/circleRepositoryInterface';
import { Circle } from '../../../domain/models/circle/circle';

/* eslint-disable no-unreachable */
export class MockCircleRepository implements CircleRepositoryInterface {
  async delete() {
    throw new Error('circle repository class method delete is not mocked');
  }

  async create() {
    throw new Error('circle repository class method create is not mocked');
  }

  async update() {
    throw new Error('circle repository class method update is not mocked');
  }

  async get() {
    throw new Error('circle repository class method get is not mocked');
    return {} as Circle;
  }
}
