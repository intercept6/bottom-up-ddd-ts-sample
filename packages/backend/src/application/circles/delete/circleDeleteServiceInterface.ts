import { CircleDeleteCommand } from './circle-delete-command';

export type CircleDeleteServiceInterface = {
  handle: (command: CircleDeleteCommand) => Promise<void>;
};
