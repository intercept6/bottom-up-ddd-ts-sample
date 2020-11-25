import { UserData } from '../user-data';
import { ListUserCommand } from './list-user-command';

export type ListUserServiceInterface = {
  handle: (command: ListUserCommand) => Promise<UserData[]>;
};
