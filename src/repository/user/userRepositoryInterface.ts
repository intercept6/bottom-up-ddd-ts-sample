import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserId } from '#/domain/models/user/userId';
import { MailAddress } from '#/domain/models/user/mailAddress';

export type userRepositoryInterface = {
  create: (user: User) => Promise<void>;
  update: (user: User) => Promise<void>;
  find: {
    (id: UserId): Promise<User>;
    (name: UserName): Promise<User>;
    (mailAddress: MailAddress): Promise<User>;
  };
  delete: (user: User) => Promise<void>;
};
