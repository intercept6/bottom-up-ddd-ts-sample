export class UserGetCommand {
  private readonly userId?: string;
  private readonly mailAddress?: string;

  constructor(props: { userId?: string; mailAddress?: string }) {
    this.userId = props.userId;
    this.mailAddress = props.mailAddress;
  }

  getUserId() {
    return this.userId;
  }

  getMailAddress() {
    return this.mailAddress;
  }
}
