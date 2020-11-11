import { CircleGetCommand } from './circle-get-command';
import { CircleData } from '../circle-data';

export type CircleGetServiceInterface = {
  handle(command: CircleGetCommand): Promise<CircleData>;
};
