export class CircleUpdateCommand {
  private readonly circleId: string;
  private readonly ownerId?: string;
  private readonly circleName?: string;

  constructor(props: {
    circleId: string;
    ownerId?: string;
    circleName?: string;
  }) {
    this.circleId = props.circleId;
    this.ownerId = props.ownerId;
    this.circleName = props.circleName;
  }

  getCircleId() {
    return this.circleId;
  }

  getOwnerId() {
    return this.ownerId;
  }

  getCircleName() {
    return this.circleName;
  }
}
