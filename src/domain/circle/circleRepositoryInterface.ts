import { Circle } from '#/domain/circle/circle';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';

export type CircleRepositoryInterface = {
  create: (circle: Circle) => Promise<void>;
  update: (circle: Circle) => Promise<void>;
  find: (identifier: CircleId | CircleName) => Promise<Circle>;
};
