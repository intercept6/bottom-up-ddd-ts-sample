import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserId } from '#/domain/models/user/userId';
import { MailAddress } from '#/domain/models/user/mailAddress';

export type UserRepositoryInterface = {
  create: (user: User) => Promise<void>;
  get: (identity: UserId | UserName | MailAddress) => Promise<User>;
  update: (user: User) => Promise<void>;
  delete: (user: User) => Promise<void>;
  batchGet: (userIds: UserId[]) => Promise<User[]>;
};
