import { CircleRegisterCommand } from './circleRegisterCommand';
import { CircleData } from '../circleData';

export type CircleRegisterServiceInterface = {
  handle: (command: CircleRegisterCommand) => Promise<CircleData>;
};
