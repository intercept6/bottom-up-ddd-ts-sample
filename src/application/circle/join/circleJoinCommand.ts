export class CircleJoinCommand {
  private readonly userId: string;
  private readonly circleId: string;

  constructor(props: { userId: string; circleId: string }) {
    this.userId = props.userId;
    this.circleId = props.circleId;
  }

  getUserId() {
    return this.userId;
  }

  getCircleId() {
    return this.circleId;
  }
}
