export class GetCircleCommand {
  constructor(private readonly circleId: string) {}

  getCircleId(): string {
    return this.circleId;
  }
}
