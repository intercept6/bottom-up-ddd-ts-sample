import { User } from '../../domain/models/user/user';

export class UserData {
  private readonly id: string;
  private readonly name: string;
  private readonly mailAddress: string;

  constructor(source: User) {
    this.id = source.getId().getValue();
    this.name = source.getName().getValue();
    this.mailAddress = source.getMailAddress().getValue();
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
