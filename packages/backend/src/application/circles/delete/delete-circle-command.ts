export class DeleteCircleCommand {
  constructor(private readonly circleId: string) {}

  getCircleId(): string {
    return this.circleId;
  }
}
