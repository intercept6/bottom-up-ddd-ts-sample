import { RegisterUserCommand } from './register-user-command';
import { UserData } from '../user-data';

export type RegisterUserServiceInterface = {
  handle: (command: RegisterUserCommand) => Promise<UserData>;
};
