import { UserRegisterCommand } from '#/application/user/register/userRegisterCommand';
import { UserData } from '#/application/user/userData';

export type UserRegisterServiceInterface = {
  handle: (command: UserRegisterCommand) => Promise<UserData>;
};
