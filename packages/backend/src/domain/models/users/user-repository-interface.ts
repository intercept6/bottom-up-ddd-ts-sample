import { User } from './user';
import { UserName } from './user-name';
import { UserId } from './user-id';
import { MailAddress } from './mail-address';

export type UserRepositoryInterface = {
  create: (user: User) => Promise<void>;
  get: (identity: UserId | UserName | MailAddress) => Promise<User>;
  update: (user: User) => Promise<void>;
  delete: (user: User) => Promise<void>;
  batchGet: (userIds: UserId[]) => Promise<User[]>;
};
