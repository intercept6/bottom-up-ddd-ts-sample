import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';

export type UserRepository = {
  save: (user: User) => Promise<void>;
  find: (name: UserName) => Promise<User | null>;
};
