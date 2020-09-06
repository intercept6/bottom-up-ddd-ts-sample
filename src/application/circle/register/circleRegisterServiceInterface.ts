import { CircleRegisterCommand } from '#/application/circle/register/circleRegisterCommand';

export type CircleRegisterServiceInterface = {
  handle: (command: CircleRegisterCommand) => Promise<void>;
};
