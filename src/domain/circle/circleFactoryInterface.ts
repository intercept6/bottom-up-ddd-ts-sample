import { Circle } from '#/domain/circle/circle';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { UserId } from '#/domain/models/user/userId';

export type CircleFactoryInterface = {
  create: {
    (circleId: CircleId): Promise<Circle>;
    (circleName: CircleName, owner: UserId): Promise<Circle>;
  };
};
