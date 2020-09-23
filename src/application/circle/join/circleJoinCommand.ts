export class CircleJoinCommand {
  private readonly memberIds: string[];
  private readonly circleId: string;

  constructor(props: { memberIds: string[]; circleId: string }) {
    this.memberIds = props.memberIds;
    this.circleId = props.circleId;
  }

  getMemberIds() {
    return this.memberIds;
  }

  getCircleId() {
    return this.circleId;
  }
}
