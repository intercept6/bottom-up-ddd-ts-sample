export class CircleGetCommand {
  constructor(private readonly circleId: string) {}

  getCircleId() {
    return this.circleId;
  }
}
