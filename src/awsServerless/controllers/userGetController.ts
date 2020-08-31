import { UserGetServiceInterface } from '#/application/user/get/userGetServiceInterface';
import { UserGetService } from '#/application/user/get/userGetService';
import { DynamoDB } from 'aws-sdk';
import {
  apiGWResponse,
  LambdaHandler,
} from '#/awsServerless/models/lambdaIntegration';
import { UserGetCommand } from '#/application/user/get/userGetCommand';
import { DynamoDBUserRepository } from '#/repository/user/dynamodb/dynamoDBUserRepository';
import { isUserGetRequest } from '#/awsServerless/models/userResponse';
import { UserNotFoundException } from '#/util/error';

const region = process.env.AWS_REGION ?? 'ap-northeast-1';

const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
});
const tableName = 'bottom-up-ddd';

export class UserGetController {
  constructor(private readonly userGetService: UserGetServiceInterface) {}

  async handle(body: string): Promise<apiGWResponse> {
    const reqBody = JSON.parse(body);
    if (!isUserGetRequest(reqBody)) {
      throw new Error('[BadRequestException] TODO: リクエストエラー');
    }
    const { user_id: id } = reqBody;
    const command = new UserGetCommand({ id });
    const userData = await this.userGetService
      .handle(command)
      .catch((error: Error) => error);

    if (userData instanceof Error) {
      const error = userData;
      if (error instanceof UserNotFoundException) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: `user id=${id} is not found.`,
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

    const resBody = JSON.stringify({
      user_id: userData.getId(),
      user_name: userData.getName(),
      mail_address: userData.getMailAddress(),
    });
    return {
      statusCode: 200,
      body: resBody,
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

export const handle: LambdaHandler = async (event) =>
  await userGetController.handle(event.body);
