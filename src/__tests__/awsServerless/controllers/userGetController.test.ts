import { Credentials, DynamoDB } from 'aws-sdk';
import { UserGetService } from '#/application/user/get/userGetService';
import { UserGetController } from '#/awsServerless/controllers/userGetController';
import { DynamoDBUserRepository } from '#/repository/user/dynamodb/dynamoDBUserRepository';

const region = 'local';

const tableName = 'bottom-up-ddd';
const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});

const userRepository = new DynamoDBUserRepository({
  documentClient,
  tableName,
  gsi1Name: 'gsi1',
  gsi2Name: 'gsi2',
});
const userGetService = new UserGetService(userRepository);
const userGetController = new UserGetController(userGetService);

describe('ユーザー取得', () => {
  test('ユーザーを取得する', async () => {
    const body = JSON.stringify({
      user_id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    });
    const response = await userGetController.handle(body);

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        user_id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
        user_name: 'ユーザー１',
        mail_address: 'user1@example.com',
      }),
    });
  });

  test('ユーザーが存在しない', async () => {
    const body = JSON.stringify({
      user_id: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1',
    });
    const response = await userGetController.handle(body);

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        message: 'user id=66d73617-aa4f-46b3-bf7d-9c193f0a08d1 is not found.',
      }),
    });
  });
});
