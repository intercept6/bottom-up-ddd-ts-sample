import { DeleteUserCommand } from './delete-user-command';

export type DeleteUserServiceInterface = {
  handle: (command: DeleteUserCommand) => Promise<void>;
};
