import { UserId } from '#/domain/models/user/userId';
import { User } from '#/domain/models/user/user';
import { userRepositoryInterface } from '#/repository/user/userRepositoryInterface';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { UserNotFoundException } from '#/util/error';

export class InMemoryUserRepository implements userRepositoryInterface {
  // テストケースによってはデータを確認したいことがある
  // 確認のための操作を外部から行えるようにするためpublicにしている
  public readonly store: User[];

  constructor() {
    this.store = [];
  }

  async find(id: UserId): Promise<User>;
  async find(name: UserName): Promise<User>;
  async find(mailAddress: MailAddress): Promise<User>;
  async find(arg1: UserId | UserName | MailAddress): Promise<User> {
    if (arg1 instanceof UserId) {
      const target = this.store.find((value) => value.getId().equals(arg1));

      if (target != null) {
        return this.clone(target);
      }
      throw new UserNotFoundException(arg1);
    } else if (arg1 instanceof UserName) {
      const target = this.store.find((value) => value.getName().equals(arg1));

      if (target != null) {
        return this.clone(target);
      }
      throw new UserNotFoundException(arg1);
    } else {
      const target = this.store.find((value) =>
        value.getMailAddress().equals(arg1)
      );

      if (target != null) {
        return this.clone(target);
      }
      throw new UserNotFoundException(arg1);
    }
  }

  async save(user: User): Promise<void> {
    const index = this.store.findIndex((value) =>
      value.getId().equals(user.getId())
    );

    const exist = index !== -1;
    if (exist) {
      this.store.splice(index, 1, this.clone(user));
    } else {
      this.store.push(this.clone(user));
    }
  }

  async delete(user: User): Promise<void> {
    const index = this.store.findIndex((value) => value.equals(user));
    this.store.splice(index, 1);
  }

  clone(user: User) {
    return new User(
      new UserId(user.getId().getValue()),
      new UserName(user.getName().getValue()),
      new MailAddress(user.getMailAddress().getValue())
    );
  }
}
