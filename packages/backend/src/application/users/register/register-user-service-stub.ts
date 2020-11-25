import { RegisterUserServiceInterface } from './register-user-service-interface';
import { UserData } from '../user-data';

export class RegisterUserServiceStub implements RegisterUserServiceInterface {
  async handle(): Promise<UserData> {
    throw new Error(
      "Register user service class's handle method is not mocked"
    );
  }
}
