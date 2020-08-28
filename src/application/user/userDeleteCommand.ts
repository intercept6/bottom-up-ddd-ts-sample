export class UserDeleteCommand {
  constructor(private readonly id: string) {}

  getId() {
    return this.id;
  }
}
