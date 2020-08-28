import { UserRegisterCommand } from '#/application/user/register/userRegisterCommand';

export type UserRegisterServiceInterface = {
  handle: (command: UserRegisterCommand) => Promise<void>;
};
