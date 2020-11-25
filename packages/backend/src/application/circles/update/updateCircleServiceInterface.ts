import { UpdateCircleCommand } from './update-circle-command';

export type UpdateCircleServiceInterface = {
  handle: (command: UpdateCircleCommand) => Promise<void>;
};
