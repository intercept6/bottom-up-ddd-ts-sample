import { CircleJoinCommand } from '#/application/circle/join/circleJoinCommand';

export type CircleJoinServiceInterface = {
  handle: (command: CircleJoinCommand) => Promise<void>;
};
