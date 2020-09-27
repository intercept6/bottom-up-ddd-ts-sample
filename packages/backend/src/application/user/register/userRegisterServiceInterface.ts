import { UserRegisterCommand } from './userRegisterCommand';
import { UserData } from '../userData';

export type UserRegisterServiceInterface = {
  handle: (command: UserRegisterCommand) => Promise<UserData>;
};
