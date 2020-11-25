import { DeleteUserService } from '../../../../application/users/delete/delete-user-service';
import { DeleteUserCommand } from '../../../../application/users/delete/delete-user-command';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserNotFoundApplicationError } from '../../../../application/errors/application-errors';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../../../utils/http-response';
import { DeleteUserServiceInterface } from '../../../../application/users/delete/delete-user-service-interface';

export class DeleteUserController {
  private readonly deleteUserService: DeleteUserServiceInterface;

  constructor(props: { deleteUserService: DeleteUserServiceInterface }) {
    this.deleteUserService = props.deleteUserService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const userId = event?.pathParameters?.userId;
    if (userId == null) {
      return badRequest('user id type is not string');
    }

    const command = new DeleteUserCommand(userId);
    const error = await this.deleteUserService
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
const deleteUserService = new DeleteUserService({
  userRepository: bootstrap.getUserRepository(),
});
const deleteUserController = new DeleteUserController({
  deleteUserService,
});

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => await deleteUserController.handle(event);
