import { Circle } from './circle';
import { CircleId } from './circle-id';
import { CircleName } from './circle-name';
import { UserId } from '../users/user-id';

export type CircleFactoryInterface = {
  create: {
    (circleId: CircleId): Promise<Circle>;
    (circleName: CircleName, owner: UserId): Promise<Circle>;
  };
};
