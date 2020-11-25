import { UpdateUserCommand } from './update-user-command';

export type UpdateUserServiceInterface = {
  handle: (command: UpdateUserCommand) => Promise<void>;
};
