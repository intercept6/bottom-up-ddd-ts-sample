import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { User } from '#/domain/models/user/user';
import { generateUuid } from '#/util/uuid';
import { ArgumentApplicationError } from '#/application/error/error';

export class Circle {
  private readonly circleId: CircleId;
  private readonly circleName: CircleName;
  private readonly owner: User;
  private readonly members: User[];

  constructor(
    circleId: CircleId,
    circleName: CircleName,
    owner: User,
    members: User[]
  );

  constructor(circleName: CircleName, owner: User, members: User[]);
  constructor(
    arg1: CircleId | CircleName,
    arg2: CircleName | User,
    arg3: User | User[],
    arg4?: User[]
  ) {
    if (
      arg1 instanceof CircleId &&
      arg2 instanceof CircleName &&
      arg3 instanceof User &&
      arg4 instanceof Array
    ) {
      this.circleId = arg1;
      this.circleName = arg2;
      this.owner = arg3;
      this.members = arg4;
    } else if (
      arg1 instanceof CircleName &&
      arg2 instanceof User &&
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

  getMembers() {
    return this.members;
  }
}
