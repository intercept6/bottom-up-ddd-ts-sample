export class UserUpdateCommand {
  private readonly id: string;
  private readonly name?: string;
  private readonly mailAddress?: string;

  constructor(props: { id: string; name?: string; mailAddress?: string }) {
    this.id = props.id;
    this.name = props.name;
    this.mailAddress = props.mailAddress;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getMailAddress() {
    return this.mailAddress;
  }
}
