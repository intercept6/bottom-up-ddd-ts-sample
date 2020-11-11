import { UserRegisterCommand } from './user-register-command';
import { UserData } from '../user-data';

export type UserRegisterServiceInterface = {
  handle: (command: UserRegisterCommand) => Promise<UserData>;
};
