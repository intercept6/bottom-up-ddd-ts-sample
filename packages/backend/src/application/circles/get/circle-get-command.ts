export class CircleGetCommand {
  constructor(private readonly circleId: string) {}

  getCircleId(): string {
    return this.circleId;
  }
}
