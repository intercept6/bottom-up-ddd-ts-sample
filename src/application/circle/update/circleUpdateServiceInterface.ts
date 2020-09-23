import { CircleUpdateCommand } from '#/application/circle/update/circleUpdateCommand';

export type CircleUpdateServiceInterface = {
  handle: (command: CircleUpdateCommand) => Promise<void>;
};
