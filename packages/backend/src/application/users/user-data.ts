import { User } from '../../domain/models/users/user';

export class UserData {
  private readonly userId: string;
  private readonly userName: string;
  private readonly mailAddress: string;

  constructor(source: User) {
    this.userId = source.getUserId().getValue();
    this.userName = source.getName().getValue();
    this.mailAddress = source.getMailAddress().getValue();
  }

  getUserId(): string {
    return this.userId;
  }

  getUserName(): string {
    return this.userName;
  }

  getMailAddress(): string {
    return this.mailAddress;
  }
}
