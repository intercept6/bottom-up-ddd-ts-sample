import { CircleRegisterCommand } from './circle-register-command';
import { CircleData } from '../circle-data';

export type CircleRegisterServiceInterface = {
  handle: (command: CircleRegisterCommand) => Promise<CircleData>;
};
