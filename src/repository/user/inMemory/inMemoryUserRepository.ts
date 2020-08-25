import { UserId } from '#/domain/models/user/userId';
import { User } from '#/domain/models/user/user';
import { UserRepository } from '#/repository/user/userRepositoryInterface';
import { UserName } from '#/domain/models/user/userName';

export class InMemoryUserRepository implements UserRepository {
  // テストケースによってはデータを確認したいことがある
  // 確認のための操作を外部から行えるようにするためpublicにしている
  public readonly store: User[];

  constructor() {
    this.store = [];
  }

  async find(name: UserName): Promise<User | null> {
    const target = this.store.find((value) => value.getName().equals(name));

    if (target != null) {
      return this.clone(target);
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.store.push(this.clone(user));
  }

  clone(user: User) {
    return new User(
      new UserId(user.getId().getValue()),
      new UserName(user.getName().getValue())
    );
  }
}
