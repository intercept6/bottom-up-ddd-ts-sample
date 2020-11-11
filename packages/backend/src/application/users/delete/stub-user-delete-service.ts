import { UserDeleteServiceInterface } from './user-delete-service-interface';

export class StubUserDeleteService implements UserDeleteServiceInterface {
  async handle(): Promise<void> {
    throw new Error('user delete service class method handle is not mocked');
  }
}
