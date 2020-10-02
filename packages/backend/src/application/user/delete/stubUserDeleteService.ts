import { UserDeleteServiceInterface } from './userDeleteServiceInterface';

export class StubUserDeleteService implements UserDeleteServiceInterface {
  async handle() {
    throw new Error('user delete service class method handle is not mocked');
  }
}
