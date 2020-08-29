import { Credentials, DynamoDB } from 'aws-sdk';
import { DynamodbUserRepository } from '#/repository/user/dynamodb/dynamodbUserRepository';
import { UserGetService } from '#/application/user/get/userGetService';
import { UserGetController } from '#/awsServerless/controllers/userGetController';

const region = 'local';

const ddb = new DynamoDB({
  apiVersion: '2012-08-10',
  region,
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});
const docClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});
const tableName = 'bottom-up-ddd';

const userRepository = new DynamodbUserRepository(
  ddb,
  docClient,
  tableName,
  'gsi1',
  'gsi2'
);
const userGetService = new UserGetService(userRepository);
const userGetController = new UserGetController(userGetService);

describe('ユーザー取得', () => {
  test('ユーザーを取得する', async () => {
    const body = JSON.stringify({
      user_id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    });
    await userGetController.handle(body);
  });

  test('ユーザーがぞんざいしない', async () => {
    const body = JSON.stringify({
      user_id: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1',
    });
    await userGetController.handle(body);
  });
});
