import { DynamoDB } from 'aws-sdk';
import { UserDeleteService } from '#/application/user/delete/userDeleteService';
import {
  apiGWResponse,
  LambdaHandler,
} from '#/awsServerless/models/lambdaIntegration';
import { UserDeleteCommand } from '#/application/user/delete/userDeleteCommand';
import { UserNotFoundException } from '#/util/error';
import { DynamoDBUserRepository } from '#/repository/user/dynamodb/dynamoDBUserRepository';

const region = process.env.AWS_REGION ?? 'ap-northeast-1';
const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
});
const tableName = process.env.MAIN_TABLE_NAME ?? 'bottom-up-ddd';

export class UserDeleteController {
  constructor(private readonly userDeleteService: UserDeleteService) {}

  async handle(pathParameters: {
    [key: string]: string | undefined;
  }): Promise<apiGWResponse> {
    const userId = pathParameters.userId;
    if (userId == null) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Bad Request' }),
      };
    }

    const command = new UserDeleteCommand(userId);
    const error = await this.userDeleteService
      .handle(command)
      .catch((error: Error) => error);

    if (error instanceof Error) {
      if (error instanceof UserNotFoundException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: `user id=${userId} is not found.`,
          }),
        };
      }

      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal Server Error.',
        }),
      };
    }

    return { statusCode: 204 };
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

export const handle: LambdaHandler = async (event) =>
  await userDeleteController.handle(event.pathParameters);
