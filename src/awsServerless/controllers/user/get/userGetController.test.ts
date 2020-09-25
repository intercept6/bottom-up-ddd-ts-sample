import { Credentials, DynamoDB } from 'aws-sdk';
import { UserGetService } from '#/application/user/get/userGetService';
import { UserGetController } from '#/awsServerless/controllers/user/get/userGetController';
import { DynamoDBUserRepository } from '#/repository/user/dynamoDBUserRepository';
import {
  createDynamoDBTable,
  createUser,
  deleteDynamoDBTable,
} from '#/lib/tests/common';

const region = 'local';
const tableName = 'user-get-controller-test-table';
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

beforeAll(async () => {
  await createDynamoDBTable(tableName);
  await createUser(tableName, {
    userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    userName: 'ユーザー１',
    mailAddress: 'user1@example.com',
  });
});
afterAll(async () => {
  await deleteDynamoDBTable(tableName);
});

describe('ユーザー取得', () => {
  test('ユーザーを取得する', async () => {
    const response = await userGetController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
    });

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
    const response = await userGetController.handle({
      pathParameters: { userId: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1' },
    });

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        name: 'NotFound',
        message: 'user id: 66d73617-aa4f-46b3-bf7d-9c193f0a08d1 is not found',
      }),
    });
  });

  test('ユーザーIDが指定されていない', async () => {
    const response = await userGetController.handle({
      pathParameters: {},
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user id is undefined',
      }),
    });
  });

  test('ユーザーIDがstring型ではない', async () => {
    const response = await userGetController.handle({
      pathParameters: { userId: 1 },
    } as any);

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user id type is not string',
      }),
    });
  });
});
