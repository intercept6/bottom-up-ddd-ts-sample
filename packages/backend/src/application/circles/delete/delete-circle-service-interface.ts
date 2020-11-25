import { DeleteCircleCommand } from './delete-circle-command';

export type DeleteCircleServiceInterface = {
  handle: (command: DeleteCircleCommand) => Promise<void>;
};
