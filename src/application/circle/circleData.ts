import { Circle } from '#/domain/models/circle/circle';

export class CircleData {
  private readonly circleId: string;
  private readonly circleName: string;
  private readonly ownerId: string;
  private readonly memberIds: ReadonlyArray<string>;

  constructor(source: Circle) {
    this.circleId = source.getCircleId().getValue();
    this.circleName = source.getCircleName().getValue();
    this.ownerId = source.getOwnerId().getValue();
    this.memberIds = source.getMemberIds().map((value) => value.getValue());
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

  getMemberIds() {
    return this.memberIds;
  }
}
