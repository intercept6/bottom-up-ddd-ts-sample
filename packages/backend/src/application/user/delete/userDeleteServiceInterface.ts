import { UserDeleteCommand } from './userDeleteCommand';

export type UserDeleteServiceInterface = {
  handle: (command: UserDeleteCommand) => Promise<void>;
};
