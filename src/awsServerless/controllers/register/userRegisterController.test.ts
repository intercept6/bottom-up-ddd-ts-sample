/* eslint-disable import/first */
const rootUri = 'https://api.example.com';
process.env.ROOT_URI = rootUri;

import { Credentials, DynamoDB } from 'aws-sdk';
import { DynamoDBUserRepository } from '#/repository/user/dynamodb/dynamoDBUserRepository';
import { UserRegisterService } from '#/application/user/register/userRegisterService';
import { UserRegisterController } from '#/awsServerless/controllers/register/userRegisterController';
import {
  createDynamoDBTable,
  createUser,
  deleteDynamoDBTable,
} from '#/lib/tests/common';

const region = 'local';
const tableName = 'user-register-controller-test-table';
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

beforeEach(async () => {
  await createDynamoDBTable(tableName);
  await createUser(tableName, {
    userId: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1',
    userName: 'ユーザー2',
    mailAddress: 'user2@example.com',
  });
});
afterEach(async () => {
  await deleteDynamoDBTable(tableName);
});

describe('ユーザー新規登録', () => {
  test('ユーザーを作成する', async () => {
    const body = JSON.stringify({
      user_name: 'ユーザー1',
      mail_address: 'user1@example.com',
    });
    const response = await userRegisterController.handle(body);

    expect(response).toEqual({
      statusCode: 201,
      headers: {
        location: expect.stringMatching(
          /^https:\/\/api.example.com\/users\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
        ),
      },
    });
  });

  test('ユーザー名が重複するユーザーは作成できない', async () => {
    const body = JSON.stringify({
      user_name: 'ユーザー2',
      mail_address: 'user1@example.com',
    });

    const response = await userRegisterController.handle(body);

    expect(response).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        message:
          '[UserDuplicateException] user name=ユーザー2 is already exist',
      }),
    });
  });

  test('メールアドレスが重複するユーザーは作成できない', async () => {
    const body = JSON.stringify({
      user_name: 'ユーザー1',
      mail_address: 'user2@example.com',
    });

    const response = await userRegisterController.handle(body);

    expect(response).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        message:
          '[UserDuplicateException] user mailAddress=user2@example.com is already exist',
      }),
    });
  });
});
