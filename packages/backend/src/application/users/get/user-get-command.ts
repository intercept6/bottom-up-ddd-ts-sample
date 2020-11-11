export class UserGetCommand {
  private readonly userId?: string;
  private readonly mailAddress?: string;

  constructor(props: { userId?: string; mailAddress?: string }) {
    this.userId = props.userId;
    this.mailAddress = props.mailAddress;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getMailAddress(): string | undefined {
    return this.mailAddress;
  }
}
