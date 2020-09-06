export class CircleRegisterCommand {
  private readonly userId: string;
  private readonly circleName: string;

  constructor(props: { userId: string; circleName: string }) {
    this.userId = props.userId;
    this.circleName = props.circleName;
  }

  getUserId() {
    return this.userId;
  }

  getCircleName() {
    return this.circleName;
  }
}
