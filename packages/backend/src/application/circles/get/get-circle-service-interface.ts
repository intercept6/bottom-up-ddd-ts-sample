import { GetCircleCommand } from './get-circle-command';
import { CircleData } from '../circle-data';

export type GetCircleServiceInterface = {
  handle(command: GetCircleCommand): Promise<CircleData>;
};
