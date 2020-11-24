import { UserData } from '../user-data';
import { UserListCommand } from './user-list-command';

export type UserListServiceInterface = {
  handle: (command: UserListCommand) => Promise<UserData[]>;
};
