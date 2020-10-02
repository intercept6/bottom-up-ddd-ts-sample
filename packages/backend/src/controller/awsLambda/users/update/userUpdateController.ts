import { UserUpdateService } from '../../../../application/users/update/userUpdateService';
import { UserUpdateCommand } from '../../../../application/users/update/userUpdateCommand';
import type { APIGatewayProxyResult } from 'aws-lambda';
import { UserNotFoundApplicationError } from '../../../../application/errors/applicationErrors';
import { Bootstrap } from '../../../utils/bootstrap';
import { badRequest, internalServerError } from '../../../utils/httpResponse';
import { UserUpdateServiceInterface } from '../../../../application/users/update/userUpdateServiceInterface';

type UserUpdateEvent = {
  pathParameters: { userId: string };
  body: string;
};

export class UserUpdateController {
  private readonly userUpdateService: UserUpdateServiceInterface;
  constructor(props: { userUpdateService: UserUpdateServiceInterface }) {
    this.userUpdateService = props.userUpdateService;
  }

  async handle(event: UserUpdateEvent): Promise<APIGatewayProxyResult> {
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

    const command = new UserUpdateCommand({ userId, userName, mailAddress });
    const error = await this.userUpdateService
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
const userUpdateService = new UserUpdateService({
  userRepository: bootstrap.getUserRepository(),
});
const userUpdateController = new UserUpdateController({ userUpdateService });

export const handle = async (
  event: UserUpdateEvent
): Promise<APIGatewayProxyResult> => await userUpdateController.handle(event);
