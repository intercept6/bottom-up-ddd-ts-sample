export class UserRegisterCommand {
  private readonly userName: string;
  private readonly mailAddress: string;

  constructor(props: {
    readonly userName: string;
    readonly mailAddress: string;
  }) {
    this.userName = props.userName;
    this.mailAddress = props.mailAddress;
  }

  getName(): string {
    return this.userName;
  }

  getMailAddress(): string {
    return this.mailAddress;
  }
}
