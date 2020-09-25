import { DynamoDB } from 'aws-sdk';
import { UserDeleteService } from '#/application/user/delete/userDeleteService';
import { UserDeleteCommand } from '#/application/user/delete/userDeleteCommand';
import { DynamoDBUserRepository } from '#/repository/user/dynamoDBUserRepository';
import { catchErrorDecorator } from '#/awsServerless/decorators/decorator';
import {
  BadRequest,
  InternalServerError,
  NotFound,
} from '#/awsServerless/errors/error';
import { APIGatewayProxyResult } from 'aws-lambda';
import { UserNotFoundApplicationError } from '#/application/error/error';

const region = process.env.AWS_REGION ?? 'ap-northeast-1';
const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
});
const tableName = process.env.MAIN_TABLE_NAME ?? 'bottom-up-ddd';

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

const userRepository = new DynamoDBUserRepository({
  documentClient,
  tableName,
  gsi1Name: 'gsi1',
  gsi2Name: 'gsi2',
});
const userDeleteService = new UserDeleteService(userRepository);
const userDeleteController = new UserDeleteController(userDeleteService);

export const handle = async (event: UserDeleteEvent) =>
  await userDeleteController.handle(event);
