import { Circle } from '../../domain/models/circles/circle';

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

  getCircleId(): string {
    return this.circleId;
  }

  getCircleName(): string {
    return this.circleName;
  }

  getOwnerId(): string {
    return this.ownerId;
  }

  getMemberIds(): readonly string[] {
    return this.memberIds;
  }
}
