import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { generateUuid } from '#/util/uuid';

export class User {
  private readonly id: UserId;
  private name: UserName;

  constructor(id: UserId, name: UserName);
  constructor(name: UserName);
  constructor(arg1: UserId | UserName, arg2?: UserName) {
    if (arg1 instanceof UserName && arg2 == null) {
      this.id = new UserId(generateUuid());
      this.name = arg1;
    } else if (arg1 instanceof UserId && arg2 instanceof UserName) {
      this.id = arg1;
      this.name = arg2;
    } else {
      throw new Error('Userのコンストラクタが予期せぬ引数で呼び出されました');
    }
  }

  changeName(name: string) {
    if (name.length < 3) {
      throw new Error('ユーザ名は3文字以上です。');
    }
    this.name = new UserName(name);
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  equals(other: User) {
    return this.id.equals(other.id) && this.name.equals(other.name);
  }
}
