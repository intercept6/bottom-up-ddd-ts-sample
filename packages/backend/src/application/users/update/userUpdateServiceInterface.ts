import { UserUpdateCommand } from './userUpdateCommand';

export type UserUpdateServiceInterface = {
  handle: (command: UserUpdateCommand) => Promise<void>;
};
