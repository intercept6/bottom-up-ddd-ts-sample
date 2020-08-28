export class UserGetCommand {
  private readonly id?: string;
  private readonly mailAddress?: string;

  constructor(props: { id?: string; mailAddress?: string }) {
    this.id = props.id;
    this.mailAddress = props.mailAddress;
  }

  getId() {
    return this.id;
  }

  getMailAddress() {
    return this.mailAddress;
  }
}
