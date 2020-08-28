import { UserDeleteCommand } from '#/application/user/delete/userDeleteCommand';

export type UserDeleteServiceInterface = {
  handle: (command: UserDeleteCommand) => Promise<void>;
};
