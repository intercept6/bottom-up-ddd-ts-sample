import { UserDeleteService } from '../../../../application/user/delete/userDeleteService';
import { UserDeleteCommand } from '../../../../application/user/delete/userDeleteCommand';
import { catchErrorDecorator } from '../../../decorators/decorator';
import {
  BadRequest,
  InternalServerError,
  NotFound,
} from '../../../errors/error';
import { APIGatewayProxyResult } from 'aws-lambda';
import { UserNotFoundApplicationError } from '../../../../application/error/error';
import { bootstrap } from '../../../utils/bootstrap';

type UserDeleteEvent = {
  pathParameters?: { userId?: string };
};

export class UserDeleteController {
  constructor(private readonly userDeleteService: UserDeleteService) {}

  @catchErrorDecorator
  async handle(event: UserDeleteEvent): Promise<APIGatewayProxyResult> {
    const userId = event?.pathParameters?.userId;
    if (userId == null) {
      throw new BadRequest('user id type is not string');
    }

    const command = new UserDeleteCommand(userId);
    const error = await this.userDeleteService
      .handle(command)
      .catch((error: Error) => error);

    if (error instanceof Error) {
      if (error instanceof UserNotFoundApplicationError) {
        throw new NotFound(`user id: ${userId} is not found`);
      }
      throw new InternalServerError('user gets failed');
    }

    return { statusCode: 204, body: JSON.stringify({}) };
  }
}

const { userRepository } = bootstrap();
const userDeleteService = new UserDeleteService(userRepository);
const userDeleteController = new UserDeleteController(userDeleteService);

export const handle = async (event: UserDeleteEvent) =>
  await userDeleteController.handle(event);
