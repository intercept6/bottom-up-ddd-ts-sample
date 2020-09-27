import { CircleGetCommand } from './circleGetCommand';
import { CircleData } from '../circleData';

export type CircleGetServiceInterface = {
  handle(command: CircleGetCommand): Promise<CircleData>;
};
