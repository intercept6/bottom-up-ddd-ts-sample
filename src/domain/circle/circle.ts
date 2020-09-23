import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { CircleFullApplicationError } from '#/application/error/error';
import { UserId } from '#/domain/models/user/userId';

export class Circle {
  private readonly circleId: CircleId;
  private circleName: CircleName;
  private ownerId: UserId;
  private members: UserId[];

  private constructor(
    circleId: CircleId,
    circleName: CircleName,
    ownerId: UserId,
    members: UserId[]
  ) {
    this.circleId = circleId;
    this.circleName = circleName;
    this.ownerId = ownerId;
    this.members = members;
  }

  /**
   * サークルのドメインオブジェクトを生成する。
   * リポジトリ層からのみとテスト時のみに使用する事が許可されます。
   * @param circleId
   * @param circleName
   * @param owner
   * @param members
   */
  static create(
    circleId: CircleId,
    circleName: CircleName,
    owner: UserId,
    members: UserId[]
  ) {
    return new Circle(circleId, circleName, owner, members);
  }

  getCircleId() {
    return this.circleId;
  }

  getCircleName() {
    return this.circleName;
  }

  getOwner() {
    return this.ownerId;
  }

  private countMembers() {
    return this.members.length + 1;
  }

  private isFull(addMembers?: number) {
    if (addMembers) {
      return this.countMembers() + addMembers >= 30;
    }
    return this.countMembers() >= 30;
  }

  join(userIds: UserId[]) {
    if (this.isFull(userIds.length)) {
      throw new CircleFullApplicationError(this.circleId);
    }
    this.members = this.members.concat(userIds);
  }

  getMembers() {
    return this.members;
  }

  changeCircleName(newCircleName: CircleName) {
    this.circleName = newCircleName;
  }

  changeOwnerId(newOwnerId: UserId) {
    this.ownerId = newOwnerId;
  }
}
