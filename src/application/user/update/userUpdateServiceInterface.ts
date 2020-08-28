import { UserUpdateCommand } from '#/application/user/update/userUpdateCommand';

export type UserUpdateServiceInterface = {
  handle: (command: UserUpdateCommand) => Promise<void>;
};
