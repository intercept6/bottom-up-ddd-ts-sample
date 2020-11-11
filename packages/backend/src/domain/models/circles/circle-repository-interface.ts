import { Circle } from './circle';
import { CircleId } from './circle-id';
import { CircleName } from './circle-name';

export type CircleRepositoryInterface = {
  create: (circle: Circle) => Promise<void>;
  get: (identifier: CircleId | CircleName) => Promise<Circle>;
  update: (circle: Circle) => Promise<void>;
  delete: (circle: Circle) => Promise<void>;
};
