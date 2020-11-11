export class CircleRegisterCommand {
  private readonly ownerId: string;
  private readonly circleName: string;

  constructor(props: {
    readonly ownerId: string;
    readonly circleName: string;
  }) {
    this.ownerId = props.ownerId;
    this.circleName = props.circleName;
  }

  getUserId(): string {
    return this.ownerId;
  }

  getCircleName(): string {
    return this.circleName;
  }
}
