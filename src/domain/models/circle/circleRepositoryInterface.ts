import { Circle } from '#/domain/models/circle/circle';
import { CircleId } from '#/domain/models/circle/circleId';
import { CircleName } from '#/domain/models/circle/circleName';

export type CircleRepositoryInterface = {
  create: (circle: Circle) => Promise<void>;
  get: (identifier: CircleId | CircleName) => Promise<Circle>;
  update: (circle: Circle) => Promise<void>;
  delete: (circle: Circle) => Promise<void>;
};
