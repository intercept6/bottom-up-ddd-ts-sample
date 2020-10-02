export class UserUpdateCommand {
  private readonly userId: string;
  private readonly userName?: string;
  private readonly mailAddress?: string;

  constructor(props: {
    userId: string;
    userName?: string;
    mailAddress?: string;
  }) {
    this.userId = props.userId;
    this.userName = props.userName;
    this.mailAddress = props.mailAddress;
  }

  getId() {
    return this.userId;
  }

  getName() {
    return this.userName;
  }

  getMailAddress() {
    return this.mailAddress;
  }
}
