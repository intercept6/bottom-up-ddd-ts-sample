export class UserDeleteCommand {
  constructor(private readonly userId: string) {}

  getUserId() {
    return this.userId;
  }
}
