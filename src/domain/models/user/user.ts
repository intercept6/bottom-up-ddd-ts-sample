import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { generateUuid } from '#/util/uuid';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { ArgumentDomainError } from '#/domain/error/error';

export class User {
  private readonly id: UserId;
  private name: UserName;
  private mailAddress: MailAddress;

  constructor(id: UserId, name: UserName, mailAddress: MailAddress);
  constructor(name: UserName, mailAddress: MailAddress);
  constructor(
    arg1: UserId | UserName,
    arg2?: UserName | MailAddress,
    arg3?: MailAddress
  ) {
    if (arg1 instanceof UserName && arg2 instanceof MailAddress) {
      this.id = new UserId(generateUuid());
      this.name = arg1;
      this.mailAddress = arg2;
    } else if (
      arg1 instanceof UserId &&
      arg2 instanceof UserName &&
      arg3 instanceof MailAddress
    ) {
      this.id = arg1;
      this.name = arg2;
      this.mailAddress = arg3;
    } else {
      throw new ArgumentDomainError(
        'Userのコンストラクタが予期せぬ引数で呼び出されました'
      );
    }
  }

  changeName(name: UserName) {
    this.name = name;
  }

  changeMailAddress(mailAddress: MailAddress) {
    this.mailAddress = mailAddress;
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

  equals(other: User) {
    return (
      this.id.equals(other.id) &&
      this.name.equals(other.name) &&
      this.mailAddress.equals(other.mailAddress)
    );
  }
}
