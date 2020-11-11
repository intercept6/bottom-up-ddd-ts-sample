import { UserData } from '../user-data';
import { UserGetCommand } from './user-get-command';

export type UserGetServiceInterface = {
  handle: (command: UserGetCommand) => Promise<UserData>;
};
