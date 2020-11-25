import { UserData } from '../user-data';
import { GetUserCommand } from './get-user-command';

export type GetUserServiceInterface = {
  handle: (command: GetUserCommand) => Promise<UserData>;
};
