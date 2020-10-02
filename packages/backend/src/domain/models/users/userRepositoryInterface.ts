import { User } from './user';
import { UserName } from './userName';
import { UserId } from './userId';
import { MailAddress } from './mailAddress';

export type UserRepositoryInterface = {
  create: (user: User) => Promise<void>;
  get: (identity: UserId | UserName | MailAddress) => Promise<User>;
  update: (user: User) => Promise<void>;
  delete: (user: User) => Promise<void>;
  batchGet: (userIds: UserId[]) => Promise<User[]>;
};
