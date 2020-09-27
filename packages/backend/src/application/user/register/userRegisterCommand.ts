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

  getName() {
    return this.userName;
  }

  getMailAddress() {
    return this.mailAddress;
  }
}
