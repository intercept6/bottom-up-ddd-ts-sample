import { Circle } from '#/domain/models/circle/circle';
import { CircleId } from '#/domain/models/circle/circleId';
import { CircleName } from '#/domain/models/circle/circleName';
import { UserId } from '#/domain/models/user/userId';

export type CircleFactoryInterface = {
  create: {
    (circleId: CircleId): Promise<Circle>;
    (circleName: CircleName, owner: UserId): Promise<Circle>;
  };
};
