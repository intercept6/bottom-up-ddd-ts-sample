import { CircleRegisterCommand } from '#/application/circle/register/circleRegisterCommand';
import { CircleData } from '#/application/circle/circleData';

export type CircleRegisterServiceInterface = {
  handle: (command: CircleRegisterCommand) => Promise<CircleData>;
};
