import { DynamoDB } from 'aws-sdk';
import { UserRegisterService } from '#/application/user/register/userRegisterService';
import {
  apiGWResponse,
  LambdaHandler,
} from '#/awsServerless/models/lambdaIntegration';
import { isUserRegisterRequest } from '#/awsServerless/models/userResponse';
import { UserRegisterCommand } from '#/application/user/register/userRegisterCommand';
import { UserDuplicateException } from '#/util/error';
import { DynamoDBUserRepository } from '#/repository/user/dynamodb/dynamoDBUserRepository';

const region = process.env.AWS_REGION ?? 'ap-northeast-1';

const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
});
const tableName = 'bottom-up-ddd';
const rootURI = process.env.ROOT_URI! ?? '';

export class UserRegisterController {
  constructor(private readonly userRegisterService: UserRegisterService) {}

  async handle(body: string): Promise<apiGWResponse> {
    const reqBody = JSON.parse(body);
    if (!isUserRegisterRequest(reqBody)) {
      throw new Error('[BadRequestException] TODO: リクエストエラー');
    }
    const { user_name: userName, mail_address: mailAddress } = reqBody;
    const command = new UserRegisterCommand({ userName, mailAddress });
    const userData = await this.userRegisterService
      .handle(command)
      .catch((error: Error) => error);

    if (userData instanceof Error) {
      const error = userData;
      if (error instanceof UserDuplicateException) {
        return {
          statusCode: 409,
          body: JSON.stringify({ message: error.message }),
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
    return {
      statusCode: 201,
      headers: { location: `${rootURI}/users/${userData.getId()}` },
    };
  }
}

const userRepository = new DynamoDBUserRepository({
  documentClient,
  tableName,
  gsi1Name: 'gsi1',
  gsi2Name: 'gsi2',
});
const userRegisterService = new UserRegisterService(userRepository);
const userRegisterController = new UserRegisterController(userRegisterService);

export const handle: LambdaHandler = async (event) =>
  await userRegisterController.handle(event.body);
