export class UserDeleteCommand {
  constructor(private readonly userId: string) {}

  getUserId(): string {
    return this.userId;
  }
}
