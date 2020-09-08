import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { generateUuid } from '#/util/uuid';
import {
  ArgumentApplicationError,
  CircleFullApplicationError,
} from '#/application/error/error';
import { UserId } from '#/domain/models/user/userId';

export class Circle {
  private readonly circleId: CircleId;
  private readonly circleName: CircleName;
  private readonly owner: UserId;
  private readonly members: UserId[];

  constructor(
    circleId: CircleId,
    circleName: CircleName,
    owner: UserId,
    members: UserId[]
  );

  constructor(circleName: CircleName, owner: UserId, members: UserId[]);
  constructor(
    arg1: CircleId | CircleName,
    arg2: CircleName | UserId,
    arg3: UserId | UserId[],
    arg4?: UserId[]
  ) {
    if (
      arg1 instanceof CircleId &&
      arg2 instanceof CircleName &&
      arg3 instanceof UserId &&
      arg4 instanceof Array
    ) {
      this.circleId = arg1;
      this.circleName = arg2;
      this.owner = arg3;
      this.members = arg4;
    } else if (
      arg1 instanceof CircleName &&
      arg2 instanceof UserId &&
      arg3 instanceof Array &&
      arg4 == null
    ) {
      this.circleId = new CircleId(generateUuid());
      this.circleName = arg1;
      this.owner = arg2;
      this.members = arg3;
    } else {
      throw new ArgumentApplicationError(
        'Circleのコンストラクタが意図せぬ引数で呼び出されました'
      );
    }
  }

  getCircleId() {
    return this.circleId;
  }

  getCircleName() {
    return this.circleName;
  }

  getOwner() {
    return this.owner;
  }

  private countMembers() {
    return this.members.length + 1;
  }

  private isFull() {
    return this.countMembers() >= 30;
  }

  join(userId: UserId) {
    if (this.isFull()) {
      throw new CircleFullApplicationError(this.circleId);
    }
    this.members.push(userId);
  }

  getMembers() {
    return this.members;
  }
}
