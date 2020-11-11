import { UserDeleteCommand } from './user-delete-command';

export type UserDeleteServiceInterface = {
  handle: (command: UserDeleteCommand) => Promise<void>;
};
