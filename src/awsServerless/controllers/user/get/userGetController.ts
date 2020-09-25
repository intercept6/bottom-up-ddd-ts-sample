import { UserGetServiceInterface } from '#/application/user/get/userGetServiceInterface';
import { UserGetService } from '#/application/user/get/userGetService';
import { UserGetCommand } from '#/application/user/get/userGetCommand';
import { UserNotFoundApplicationError } from '#/application/error/error';
import { catchErrorDecorator } from '#/awsServerless/decorators/decorator';
import {
  BadRequest,
  InternalServerError,
  NotFound,
} from '#/awsServerless/errors/error';
import { APIGatewayProxyResult } from 'aws-lambda';
import { bootstrap } from '#/awsServerless/utils/bootstrap';

type UserGetEvent = {
  pathParameters?: { userId?: string };
};

export class UserGetController {
  constructor(private readonly userGetService: UserGetServiceInterface) {}

  @catchErrorDecorator
  async handle(event: UserGetEvent): Promise<APIGatewayProxyResult> {
    const id = event?.pathParameters?.userId;
    if (id == null) {
      throw new BadRequest('user id is undefined');
    } else if (typeof id !== 'string') {
      throw new BadRequest('user id type is not string');
    }

    const command = new UserGetCommand({ id });
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

const { userRepository } = bootstrap();
const userGetService = new UserGetService(userRepository);
const userGetController = new UserGetController(userGetService);

export const handle = async (event: UserGetEvent) =>
  await userGetController.handle(event);
