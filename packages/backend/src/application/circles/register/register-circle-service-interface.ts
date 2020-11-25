import { RegisterCircleCommand } from './register-circle-command';
import { CircleData } from '../circle-data';

export type RegisterCircleServiceInterface = {
  handle: (command: RegisterCircleCommand) => Promise<CircleData>;
};
