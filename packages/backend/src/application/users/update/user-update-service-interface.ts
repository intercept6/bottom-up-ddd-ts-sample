import { UserUpdateCommand } from './user-update-command';

export type UserUpdateServiceInterface = {
  handle: (command: UserUpdateCommand) => Promise<void>;
};
