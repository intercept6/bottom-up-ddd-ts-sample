import { User } from '../../domain/models/user/user';

export class UserData {
  private readonly userId: string;
  private readonly userName: string;
  private readonly mailAddress: string;

  constructor(source: User) {
    this.userId = source.getUserId().getValue();
    this.userName = source.getName().getValue();
    this.mailAddress = source.getMailAddress().getValue();
  }

  getUserId() {
    return this.userId;
  }

  getUserName() {
    return this.userName;
  }

  getMailAddress() {
    return this.mailAddress;
  }
}
