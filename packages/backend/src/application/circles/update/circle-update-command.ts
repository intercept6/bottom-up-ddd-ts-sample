export class CircleUpdateCommand {
  private readonly circleId: string;
  private readonly ownerId?: string;
  private readonly circleName?: string;
  private readonly memberIds?: string[];

  constructor(props: {
    circleId: string;
    ownerId?: string;
    circleName?: string;
    memberIds?: string[];
  }) {
    this.circleId = props.circleId;
    this.ownerId = props.ownerId;
    this.circleName = props.circleName;
    this.memberIds = props.memberIds;
  }

  getCircleId(): string {
    return this.circleId;
  }

  getOwnerId(): string | undefined {
    return this.ownerId;
  }

  getCircleName(): string | undefined {
    return this.circleName;
  }

  getMemberIds(): string[] | undefined {
    return this.memberIds;
  }
}
