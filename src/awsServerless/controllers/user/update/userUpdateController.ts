import { UserUpdateService } from '#/application/user/update/userUpdateService';
import { UserUpdateCommand } from '#/application/user/update/userUpdateCommand';
import type { APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, InternalServerError } from '#/awsServerless/errors/error';
import { catchErrorDecorator } from '#/awsServerless/decorators/decorator';
import { UserNotFoundApplicationError } from '#/application/error/error';
import { bootstrap } from '#/awsServerless/utils/bootstrap';

type UserUpdateEvent = {
  pathParameters: { userId: string };
  body: string;
};

export class UserUpdateController {
  constructor(private readonly userUpdateService: UserUpdateService) {}

  @catchErrorDecorator
  async handle(event: UserUpdateEvent): Promise<APIGatewayProxyResult> {
    const id = event.pathParameters?.userId;
    if (typeof id !== 'string') {
      throw new BadRequest('userId type is not string');
    }

    if (event.body == null) {
      throw new BadRequest('request body is null');
    }

    const body = JSON.parse(event.body);
    const mailAddress = body.mail_address;
    const name = body.user_name;
    if (name == null && mailAddress == null) {
      throw new BadRequest('user_name type and mail_address are undefined');
    } else if (name != null && typeof name !== 'string') {
      throw new BadRequest('user_name type is not string');
    } else if (mailAddress != null && typeof mailAddress !== 'string') {
      throw new BadRequest('mail_address type is not string');
    }

    const command = new UserUpdateCommand({
      id,
      name,
      mailAddress,
    });
    const error = await this.userUpdateService
      .handle(command)
      .catch((error: Error) => error);

    if (error instanceof Error) {
      if (error instanceof UserNotFoundApplicationError) {
        throw new BadRequest(`user id: ${id} is not found`, error);
      }
      throw new InternalServerError('user update is failed', error);
    }
    return {
      statusCode: 204,
      body: JSON.stringify({}),
    };
  }
}

const { userRepository } = bootstrap();
const userUpdateService = new UserUpdateService(userRepository);
const userUpdateController = new UserUpdateController(userUpdateService);

export const handle = async (
  event: UserUpdateEvent
): Promise<APIGatewayProxyResult> => await userUpdateController.handle(event);
