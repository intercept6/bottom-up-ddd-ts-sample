import { CircleDeleteCommand } from './circleDeleteCommand';

export type CircleDeleteServiceInterface = {
  handle: (command: CircleDeleteCommand) => Promise<void>;
};
