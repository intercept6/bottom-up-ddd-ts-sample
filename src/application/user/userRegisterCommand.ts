export class UserRegisterCommand {
  constructor(
    private readonly name: string,
    private readonly mailAddress: string
  ) {}

  getName() {
    return this.name;
  }

  getMailAddress() {
    return this.mailAddress;
  }
}
