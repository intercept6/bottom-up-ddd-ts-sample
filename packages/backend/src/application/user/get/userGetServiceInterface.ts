import { UserData } from '../userData';
import { UserGetCommand } from './userGetCommand';

export type UserGetServiceInterface = {
  handle: (command: UserGetCommand) => Promise<UserData>;
};
