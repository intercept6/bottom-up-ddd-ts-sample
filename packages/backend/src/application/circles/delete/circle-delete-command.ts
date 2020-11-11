export class CircleDeleteCommand {
  constructor(private readonly circleId: string) {}

  getCircleId(): string {
    return this.circleId;
  }
}
