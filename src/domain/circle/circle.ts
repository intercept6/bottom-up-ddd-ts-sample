import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { CircleFullApplicationError } from '#/application/error/error';
import { UserId } from '#/domain/models/user/userId';

export class Circle {
  private readonly circleId: CircleId;
  private circleName: CircleName;
  private ownerId: UserId;
  private readonly members: UserId[];

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

  changeCircleName(newCircleName: CircleName) {
    this.circleName = newCircleName;
  }

  changeOwnerId(newOwnerId: UserId) {
    this.ownerId = newOwnerId;
  }
}
