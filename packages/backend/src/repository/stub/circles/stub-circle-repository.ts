import { CircleRepositoryInterface } from '../../../domain/models/circles/circle-repository-interface';
import { Circle } from '../../../domain/models/circles/circle';

export class StubCircleRepository implements CircleRepositoryInterface {
  async delete() {
    throw new Error('circle repository class method delete is not mocked');
  }

  async create() {
    throw new Error('circle repository class method create is not mocked');
  }

  async update() {
    throw new Error('circle repository class method update is not mocked');
  }

  async get(): Promise<Circle> {
    throw new Error('circle repository class method get is not mocked');
  }
}