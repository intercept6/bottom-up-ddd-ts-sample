import { CircleRepositoryInterface } from '../../../domain/models/circles/circle-repository-interface';
import { Circle } from '../../../domain/models/circles/circle';

export class CircleRepositoryStub implements CircleRepositoryInterface {
  async delete(): Promise<void> {
    throw new Error('circle repository class method delete is not mocked');
  }

  async register(): Promise<void> {
    throw new Error('circle repository class method register is not mocked');
  }

  async update(): Promise<void> {
    throw new Error('circle repository class method update is not mocked');
  }

  async get(): Promise<Circle> {
    throw new Error('circle repository class method get is not mocked');
  }
}
