import { UserDeleteService } from '../../../../application/users/delete/userDeleteService';
import { UserDeleteCommand } from '../../../../application/users/delete/userDeleteCommand';
import { APIGatewayProxyResult } from 'aws-lambda';
import { UserNotFoundApplicationError } from '../../../../application/errors/applicationErrors';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../../../utils/httpResponse';
import { UserDeleteServiceInterface } from '../../../../application/users/delete/userDeleteServiceInterface';

type UserDeleteEvent = {
  pathParameters?: { userId?: string };
};

export class UserDeleteController {
  private readonly userDeleteService: UserDeleteServiceInterface;

  constructor(props: { userDeleteService: UserDeleteServiceInterface }) {
    this.userDeleteService = props.userDeleteService;
  }

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
const userDeleteController = new UserDeleteController({ userDeleteService });

export const handle = async (event: UserDeleteEvent) =>
  await userDeleteController.handle(event);
