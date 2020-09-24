import { CircleDeleteCommand } from '#/application/circle/delete/circleDeleteCommand';

export type CircleDeleteServiceInterface = {
  handle: (command: CircleDeleteCommand) => Promise<void>;
};
