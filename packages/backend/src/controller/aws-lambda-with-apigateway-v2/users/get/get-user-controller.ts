import { GetUserServiceInterface } from '../../../../application/users/get/get-user-service-interface';
import { GetUserService } from '../../../../application/users/get/get-user-service';
import { GetUserCommand } from '../../../../application/users/get/get-user-command';
import { UserNotFoundApplicationError } from '../../../../application/errors/application-errors';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../../../utils/http-response';

export class GetUserController {
  private readonly getUserService: GetUserServiceInterface;
  constructor(props: { getUserService: GetUserServiceInterface }) {
    this.getUserService = props.getUserService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const userId = event?.pathParameters?.userId;
    if (typeof userId !== 'string') {
      return badRequest('user id type is not string');
    }

    const command = new GetUserCommand({ userId });
    const userData = await this.getUserService
      .handle(command)
      .catch((error: Error) => error);

    if (userData instanceof Error) {
      const error = userData;
      if (error instanceof UserNotFoundApplicationError) {
        return notFound(error.message);
      }
      return internalServerError({ message: 'user get failed', error });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        user_id: userData.getUserId(),
        user_name: userData.getUserName(),
        mail_address: userData.getMailAddress(),
      }),
    };
  }
}

const bootstrap = new Bootstrap();
const getUserService = new GetUserService({
  userRepository: bootstrap.getUserRepository(),
});
const getUserController = new GetUserController({ getUserService });

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => await getUserController.handle(event);
