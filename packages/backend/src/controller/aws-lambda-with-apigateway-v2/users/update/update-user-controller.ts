import { UpdateUserService } from '../../../../application/users/update/update-user-service';
import { UpdateUserCommand } from '../../../../application/users/update/update-user-command';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserNotFoundApplicationError } from '../../../../application/errors/application-errors';
import { Bootstrap } from '../../../utils/bootstrap';
import { badRequest, internalServerError } from '../../../utils/http-response';
import { UpdateUserServiceInterface } from '../../../../application/users/update/update-user-service-interface';

export class UpdateUserController {
  private readonly updateUserService: UpdateUserServiceInterface;
  constructor(props: { updateUserService: UpdateUserServiceInterface }) {
    this.updateUserService = props.updateUserService;
  }

  async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyResultV2> {
    const userId = event.pathParameters?.userId;
    if (typeof userId !== 'string') {
      return badRequest('userId type is not string');
    }

    if (event.body == null) {
      return badRequest('request body is null');
    }

    const body = JSON.parse(event.body);
    const mailAddress = body.mail_address;
    const userName = body.user_name;
    if (userName == null && mailAddress == null) {
      return badRequest('user_name type and mail_address are undefined');
    } else if (userName != null && typeof userName !== 'string') {
      return badRequest('user_name type is not string');
    } else if (mailAddress != null && typeof mailAddress !== 'string') {
      return badRequest('mail_address type is not string');
    }

    const command = new UpdateUserCommand({ userId, userName, mailAddress });
    const error = await this.updateUserService
      .handle(command)
      .catch((error: Error) => error);

    if (error instanceof Error) {
      if (error instanceof UserNotFoundApplicationError) {
        return badRequest(`user id: ${userId} is not found`);
      }
      return internalServerError({
        message: 'user update is failed',
        error,
      });
    }
    return {
      statusCode: 204,
      body: JSON.stringify({}),
    };
  }
}

const bootstrap = new Bootstrap();
const updateUserService = new UpdateUserService({
  userRepository: bootstrap.getUserRepository(),
});
const updateUserController = new UpdateUserController({
  updateUserService,
});

export const handle = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => await updateUserController.handle(event);
