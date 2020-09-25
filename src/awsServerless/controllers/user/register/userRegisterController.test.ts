/* eslint-disable import/first */
import { DynamoDBHelper } from '#/lib/tests/dynamoDBHelper';

const rootUri = 'https://api.example.com';
process.env.ROOT_URI = rootUri;

import { Credentials, DynamoDB } from 'aws-sdk';
import { DynamoDBUserRepository } from '#/repository/user/dynamoDBUserRepository';
import { UserRegisterService } from '#/application/user/register/userRegisterService';
import { UserRegisterController } from '#/awsServerless/controllers/user/register/userRegisterController';

const region = 'local';
const tableName = 'user-register-controller-test-table';
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
const userRegisterService = new UserRegisterService(userRepository);
const userRegisterController = new UserRegisterController(userRegisterService);

let dynamoDBHelper: DynamoDBHelper;

beforeEach(async () => {
  dynamoDBHelper = await DynamoDBHelper.create({
    tableName,
    ddb,
    documentClient,
  });
  await dynamoDBHelper.createUser({
    userId: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1',
    userName: 'ユーザー2',
    mailAddress: 'user2@example.com',
  });
});
afterEach(async () => {
  await dynamoDBHelper.destructor();
});

describe('ユーザー新規登録', () => {
  test('ユーザーを作成する', async () => {
    const response = await userRegisterController.handle({
      body: JSON.stringify({
        user_name: 'ユーザー1',
        mail_address: 'user1@example.com',
      }),
    });

    expect(response).toEqual({
      statusCode: 201,
      body: JSON.stringify({}),
      headers: {
        location: expect.stringMatching(
          /^https:\/\/api.example.com\/users\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
        ),
      },
    });
  });

  test('ユーザー名が重複するユーザーは作成できない', async () => {
    const response = await userRegisterController.handle({
      body: JSON.stringify({
        user_name: 'ユーザー2',
        mail_address: 'user1@example.com',
      }),
    });

    expect(response).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        name: 'Conflict',
        message: 'user name: ユーザー2 is already exist',
      }),
    });
  });

  test('メールアドレスが重複するユーザーは作成できない', async () => {
    const response = await userRegisterController.handle({
      body: JSON.stringify({
        user_name: 'ユーザー1',
        mail_address: 'user2@example.com',
      }),
    });

    expect(response).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        name: 'Conflict',
        message: 'user mailAddress: user2@example.com is already exist',
      }),
    });
  });
});
