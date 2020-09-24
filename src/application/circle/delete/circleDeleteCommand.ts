export class CircleDeleteCommand {
  constructor(private readonly circleId: string) {}

  getCircleId() {
    return this.circleId;
  }
}
