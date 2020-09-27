import { UserId } from '../../domain/models/user/userId';
import { User } from '../../domain/models/user/user';
import { UserRepositoryInterface } from '../../domain/models/user/userRepositoryInterface';
import { UserName } from '../../domain/models/user/userName';
import { MailAddress } from '../../domain/models/user/mailAddress';
import { UserNotFoundRepositoryError } from '../error/error';

export class InMemoryUserRepository implements UserRepositoryInterface {
  // テストケースによってはデータを確認したいことがある
  // 確認のための操作を外部から行えるようにするためpublicにしている
  public store: User[];

  constructor() {
    this.store = [];
  }

  async get(identity: UserId | UserName | MailAddress): Promise<User> {
    if (identity instanceof UserId) {
      const target = this.store.find((value) => value.getId().equals(identity));

      if (target != null) {
        return this.clone(target);
      }
      throw new UserNotFoundRepositoryError(identity);
    } else if (identity instanceof UserName) {
      const target = this.store.find((value) =>
        value.getName().equals(identity)
      );

      if (target != null) {
        return this.clone(target);
      }
      throw new UserNotFoundRepositoryError(identity);
    } else {
      const target = this.store.find((value) =>
        value.getMailAddress().equals(identity)
      );

      if (target != null) {
        return this.clone(target);
      }
      throw new UserNotFoundRepositoryError(identity);
    }
  }

  async create(user: User): Promise<void> {
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

  async update(user: User): Promise<void> {
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

  async batchGet(userIds: UserId[]): Promise<User[]> {
    const found = userIds.filter((userId) =>
      this.store.some((existUser) => existUser.getId().equals(userId))
    );

    if (found.length !== userIds.length) {
      const notFound = userIds.filter(
        (userId) =>
          !this.store.some((existUser) => existUser.getId().equals(userId))
      );
      throw new UserNotFoundRepositoryError(notFound);
    }

    return this.store.filter((user) =>
      userIds.some((userId) => userId.equals(user.getId()))
    );
  }

  clone(user: User) {
    return new User(
      new UserId(user.getId().getValue()),
      new UserName(user.getName().getValue()),
      new MailAddress(user.getMailAddress().getValue())
    );
  }

  clear() {
    this.store = [];
  }
}
