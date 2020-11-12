import { UserDeleteService } from '../../../../application/users/delete/user-delete-service';
import { UserDeleteCommand } from '../../../../application/users/delete/user-delete-command';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserNotFoundApplicationError } from '../../../../application/errors/application-errors';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../../../utils/http-response';
import { UserDeleteServiceInterface } from '../../../../application/users/delete/user-delete-service-interface';

export class UserDeleteController {
  private readonly userDeleteService: UserDeleteServiceInterface;

  constructor(props: { userDeleteService: UserDeleteServiceInterface }) {
    this.userDeleteService = props.userDeleteService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
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

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => await userDeleteController.handle(event);
