import { UserGetServiceInterface } from '#/application/user/get/userGetServiceInterface';
import { UserGetService } from '#/application/user/get/userGetService';
import { DynamoDB } from 'aws-sdk';
import { UserGetCommand } from '#/application/user/get/userGetCommand';
import { DynamoDBUserRepository } from '#/repository/user/dynamodb/dynamoDBUserRepository';
import { UserNotFoundException } from '#/util/error';
import { catchErrorDecorator } from '#/awsServerless/decorators/decorator';
import {
  BadRequest,
  InternalServerError,
  NotFound,
} from '#/awsServerless/errors/error';
import { APIGatewayProxyResult } from 'aws-lambda';

const region = process.env.AWS_REGION ?? 'ap-northeast-1';

const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
});
const tableName = 'bottom-up-ddd';

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
      if (error instanceof UserNotFoundException) {
        throw new NotFound(`user id=${id} is not found.`);
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

const userRepository = new DynamoDBUserRepository({
  documentClient,
  tableName,
  gsi1Name: 'gsi1',
  gsi2Name: 'gsi2',
});
const userGetService = new UserGetService(userRepository);
const userGetController = new UserGetController(userGetService);

export const handle = async (event: UserGetEvent) =>
  await userGetController.handle(event);
