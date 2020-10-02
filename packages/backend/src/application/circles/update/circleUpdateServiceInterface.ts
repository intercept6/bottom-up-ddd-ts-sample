import { CircleUpdateCommand } from './circleUpdateCommand';

export type CircleUpdateServiceInterface = {
  handle: (command: CircleUpdateCommand) => Promise<void>;
};
