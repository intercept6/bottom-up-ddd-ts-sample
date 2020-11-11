import { CircleUpdateCommand } from './circle-update-command';

export type CircleUpdateServiceInterface = {
  handle: (command: CircleUpdateCommand) => Promise<void>;
};
