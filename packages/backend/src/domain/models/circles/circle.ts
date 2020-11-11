import { CircleId } from './circle-id';
import { CircleName } from './circle-name';
import { CircleMembersAreExceedApplicationError } from '../../../application/errors/application-errors';
import { UserId } from '../users/user-id';

export class Circle {
  private readonly circleId: CircleId;
  private circleName: CircleName;
  private ownerId: UserId;
  private memberIds: UserId[];

  private constructor(
    circleId: CircleId,
    circleName: CircleName,
    ownerId: UserId,
    memberIds: UserId[]
  ) {
    this.circleId = circleId;
    this.circleName = circleName;
    this.ownerId = ownerId;
    this.memberIds = memberIds;
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

  getOwnerId() {
    return this.ownerId;
  }

  private countMembers() {
    return this.memberIds.length + 1;
  }

  private isFull(addMembers?: number) {
    if (addMembers) {
      return this.countMembers() + addMembers >= 30;
    }
    return this.countMembers() >= 30;
  }

  joinMembers(userIds: UserId[]) {
    if (this.isFull(userIds.length)) {
      throw new CircleMembersAreExceedApplicationError(this.circleId);
    }
    this.memberIds = this.memberIds.concat(userIds);
  }

  getMemberIds() {
    return this.memberIds;
  }

  changeCircleName(newCircleName: CircleName) {
    this.circleName = newCircleName;
  }

  changeOwnerId(newOwnerId: UserId) {
    this.ownerId = newOwnerId;
  }

  equals(other: Circle) {
    return (
      this.getCircleId().equals(other.getCircleId()) &&
      this.getCircleName().equals(other.getCircleName()) &&
      this.getOwnerId().equals(other.getOwnerId())
    );
  }
}
