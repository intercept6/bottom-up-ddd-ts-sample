import { UserData } from '#/application/user/userData';
import { UserGetCommand } from '#/application/user/get/userGetCommand';

export type UserGetServiceInterface = {
  handle: (command: UserGetCommand) => Promise<UserData>;
};
