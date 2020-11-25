export class DeleteUserCommand {
  constructor(private readonly userId: string) {}

  getUserId(): string {
    return this.userId;
  }
}
