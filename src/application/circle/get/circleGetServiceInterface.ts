import { CircleGetCommand } from '#/application/circle/get/circleGetCommand';
import { CircleData } from '#/application/circle/circleData';

export type CircleGetServiceInterface = {
  handle(command: CircleGetCommand): Promise<CircleData>;
};
