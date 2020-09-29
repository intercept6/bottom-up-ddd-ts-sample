import { UserDeleteService } from '../../../../application/user/delete/userDeleteService';
import { UserDeleteCommand } from '../../../../application/user/delete/userDeleteCommand';
import { APIGatewayProxyResult } from 'aws-lambda';
import { UserNotFoundApplicationError } from '../../../../application/error/error';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../../../utils/httpResponse';

type UserDeleteEvent = {
  pathParameters?: { userId?: string };
};

export class UserDeleteController {
  constructor(private readonly userDeleteService: UserDeleteService) {}

  async handle(event: UserDeleteEvent): Promise<APIGatewayProxyResult> {
    const userId = event?.pathParameters?.userId;
    if (userId == null) {
      return badRequest('user id type is not string');
    }

    const command = new UserDeleteCommand(userId);
    const error = await this.userDeleteService
      .handle(command)
      .catch((error: Error) => error);

    if (error instanceof Error) {
      if (error instanceof UserNotFoundApplicationError) {
        return notFound(`user id: ${userId} is not found`);
      }
      return internalServerError({ message: 'user gets failed', error });
    }

    return { statusCode: 204, body: JSON.stringify({}) };
  }
}

const bootstrap = new Bootstrap();
const userDeleteService = new UserDeleteService({
  userRepository: bootstrap.getUserRepository(),
});
const userDeleteController = new UserDeleteController(userDeleteService);

export const handle = async (event: UserDeleteEvent) =>
  await userDeleteController.handle(event);
