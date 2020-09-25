import { Credentials, DynamoDB } from 'aws-sdk';
import { UserDeleteService } from '#/application/user/delete/userDeleteService';
import { UserDeleteController } from '#/awsServerless/controllers/user/delete/userDeleteController';
import { DynamoDBUserRepository } from '#/repository/user/dynamoDBUserRepository';
import { DynamoDBHelper } from '#/lib/tests/dynamoDBHelper';

const region = 'local';
const tableName = 'user-delete-controller-test-table';
const ddb = new DynamoDB({
  apiVersion: '2012-08-10',
  region,
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});

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
const userDeleteService = new UserDeleteService(userRepository);
const userDeleteController = new UserDeleteController(userDeleteService);

let dynamoDBHelper: DynamoDBHelper;

beforeAll(async () => {
  dynamoDBHelper = await DynamoDBHelper.create({
    tableName,
    ddb,
    documentClient,
  });
  await dynamoDBHelper.createUser({
    userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    userName: 'ユーザー１',
    mailAddress: 'user1@example.com',
  });
});

afterAll(async () => {
  await dynamoDBHelper.destructor();
});

describe('ユーザー削除', () => {
  test('ユーザーを削除する', async () => {
    const response = await userDeleteController.handle({
      pathParameters: {
        userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('ユーザーが存在しない場合も削除は成功する', async () => {
    const response = await userDeleteController.handle({
      pathParameters: {
        userId: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1',
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });
});
