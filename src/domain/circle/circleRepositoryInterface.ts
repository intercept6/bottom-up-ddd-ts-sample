import { Circle } from '#/domain/circle/circle';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';

export type CircleRepositoryInterface = {
  create: (circle: Circle) => Promise<void>;
  get: (identifier: CircleId | CircleName) => Promise<Circle>;
  update: (circle: Circle) => Promise<void>;
  delete: (circle: Circle) => Promise<void>;
};
