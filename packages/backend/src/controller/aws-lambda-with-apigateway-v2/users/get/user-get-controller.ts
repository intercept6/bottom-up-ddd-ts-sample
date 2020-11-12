import { UserGetServiceInterface } from '../../../../application/users/get/user-get-service-interface';
import { UserGetService } from '../../../../application/users/get/user-get-service';
import { UserGetCommand } from '../../../../application/users/get/user-get-command';
import { UserNotFoundApplicationError } from '../../../../application/errors/application-errors';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Bootstrap } from '../../../utils/bootstrap';
import {
  badRequest,
  internalServerError,
  notFound,
} from '../../../utils/http-response';

export class UserGetController {
  private readonly userGetService: UserGetServiceInterface;
  constructor(props: { userGetService: UserGetServiceInterface }) {
    this.userGetService = props.userGetService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const userId = event?.pathParameters?.userId;
    if (typeof userId !== 'string') {
      return badRequest('user id type is not string');
    }

    const command = new UserGetCommand({ userId });
    const userData = await this.userGetService
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
const userGetService = new UserGetService({
  userRepository: bootstrap.getUserRepository(),
});
const userGetController = new UserGetController({ userGetService });

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => await userGetController.handle(event);
