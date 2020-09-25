import { DynamoDB } from 'aws-sdk';
import { UserRegisterService } from '#/application/user/register/userRegisterService';
import { UserRegisterCommand } from '#/application/user/register/userRegisterCommand';
import { DynamoDBUserRepository } from '#/repository/user/dynamoDBUserRepository';
import { APIGatewayProxyResult } from 'aws-lambda';
import {
  BadRequest,
  Conflict,
  InternalServerError,
} from '#/awsServerless/errors/error';
import { catchErrorDecorator } from '#/awsServerless/decorators/decorator';
import { UserDuplicateApplicationError } from '#/application/error/error';

const region = process.env.AWS_REGION ?? 'ap-northeast-1';

const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
});
const tableName = process.env.MAIN_TABLE_NAME ?? 'bottom-up-ddd';
const rootURI = process.env.ROOT_URI! ?? '';

type UserRegisterEvent = {
  body: string;
};

export class UserRegisterController {
  constructor(private readonly userRegisterService: UserRegisterService) {}

  @catchErrorDecorator
  async handle(event: UserRegisterEvent): Promise<APIGatewayProxyResult> {
    if (event.body == null) {
      throw new BadRequest('request body is null');
    }

    const body = JSON.parse(event.body);
    const userName = body.user_name;
    const mailAddress = body.mail_address;

    if (typeof userName === 'string' && typeof mailAddress === 'string') {
      const command = new UserRegisterCommand({ userName, mailAddress });
      const userData = await this.userRegisterService
        .handle(command)
        .catch((error: Error) => error);

      if (userData instanceof Error) {
        const error = userData;
        if (error instanceof UserDuplicateApplicationError) {
          throw new Conflict(error.message);
        }
        throw new InternalServerError('user register failed');
      }
      return {
        statusCode: 201,
        body: JSON.stringify({}),
        headers: { location: `${rootURI}/users/${userData.getId()}` },
      };
    }
    throw new BadRequest('user_name or mail_address is not string');
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

export const handle = async (event: UserRegisterEvent) =>
  await userRegisterController.handle(event);
