export class UpdateUserCommand {
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

  getId(): string {
    return this.userId;
  }

  getName(): string | undefined {
    return this.userName;
  }

  getMailAddress(): string | undefined {
    return this.mailAddress;
  }
}
