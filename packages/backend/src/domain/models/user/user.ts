import { UserId } from './userId';
import { UserName } from './userName';
import { generateUuid } from '../../../util/uuid';
import { MailAddress } from './mailAddress';
import { ArgumentDomainError } from '../../error/error';

export class User {
  private readonly userId: UserId;
  private userName: UserName;
  private mailAddress: MailAddress;

  constructor(
    arg1: UserId | UserName,
    arg2?: UserName | MailAddress,
    arg3?: MailAddress
  ) {
    if (arg1 instanceof UserName && arg2 instanceof MailAddress) {
      this.userId = new UserId(generateUuid());
      this.userName = arg1;
      this.mailAddress = arg2;
    } else if (
      arg1 instanceof UserId &&
      arg2 instanceof UserName &&
      arg3 instanceof MailAddress
    ) {
      this.userId = arg1;
      this.userName = arg2;
      this.mailAddress = arg3;
    } else {
      throw new ArgumentDomainError(
        'Userのコンストラクタが予期せぬ引数で呼び出されました'
      );
    }
  }

  changeName(name: UserName) {
    this.userName = name;
  }

  changeMailAddress(mailAddress: MailAddress) {
    this.mailAddress = mailAddress;
  }

  getUserId() {
    return this.userId;
  }

  getName() {
    return this.userName;
  }

  getMailAddress() {
    return this.mailAddress;
  }

  equals(other: User) {
    return (
      this.userId.equals(other.userId) &&
      this.userName.equals(other.userName) &&
      this.mailAddress.equals(other.mailAddress)
    );
  }
}
