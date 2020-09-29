import { UserGetServiceInterface } from '../../../../application/user/get/userGetServiceInterface';
import { UserGetService } from '../../../../application/user/get/userGetService';
import { UserGetCommand } from '../../../../application/user/get/userGetCommand';
import { UserNotFoundApplicationError } from '../../../../application/error/error';
import { catchErrorDecorator } from '../../../decorators/decorator';
import {
  BadRequest,
  InternalServerError,
  NotFound,
} from '../../../errors/error';
import { APIGatewayProxyResult } from 'aws-lambda';
import { Bootstrap } from '../../../utils/bootstrap';

type UserGetEvent = {
  pathParameters?: { userId?: string };
};

export class UserGetController {
  constructor(private readonly userGetService: UserGetServiceInterface) {}

  @catchErrorDecorator
  async handle(event: UserGetEvent): Promise<APIGatewayProxyResult> {
    const userId = event?.pathParameters?.userId;
    if (typeof userId !== 'string') {
      throw new BadRequest('user id type is not string');
    }

    const command = new UserGetCommand({ userId });
    const userData = await this.userGetService
      .handle(command)
      .catch((error: Error) => error);

    if (userData instanceof Error) {
      const error = userData;
      if (error instanceof UserNotFoundApplicationError) {
        throw new NotFound(error.message);
      }
      throw new InternalServerError('user get failed');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        user_id: userData.getId(),
        user_name: userData.getName(),
        mail_address: userData.getMailAddress(),
      }),
    };
  }
}

const bootstrap = new Bootstrap();
const userGetService = new UserGetService({
  userRepository: bootstrap.getUserRepository(),
});
const userGetController = new UserGetController(userGetService);

export const handle = async (event: UserGetEvent) =>
  await userGetController.handle(event);
