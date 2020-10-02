import { Circle } from './circle';
import { CircleId } from './circleId';
import { CircleName } from './circleName';
import { UserId } from '../users/userId';

export type CircleFactoryInterface = {
  create: {
    (circleId: CircleId): Promise<Circle>;
    (circleName: CircleName, owner: UserId): Promise<Circle>;
  };
};
