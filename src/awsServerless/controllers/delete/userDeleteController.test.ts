import { Credentials, DynamoDB } from 'aws-sdk';
import { UserDeleteService } from '#/application/user/delete/userDeleteService';
import { UserDeleteController } from '#/awsServerless/controllers/delete/userDeleteController';
import { DynamoDBUserRepository } from '#/repository/user/dynamodb/dynamoDBUserRepository';
import {
  createDynamoDBTable,
  createUser,
  deleteDynamoDBTable,
} from '#/lib/tests/common';

const region = 'local';
const tableName = 'user-delete-controller-test-table';
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

describe('ユーザー削除', () => {
  test('ユーザーを削除する', async () => {
    const pathParameters = {
      userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    };
    const response = await userDeleteController.handle(pathParameters);

    expect(response).toEqual({
      statusCode: 204,
    });
  });

  test('ユーザーが存在しない場合も削除は成功する', async () => {
    const pathParameters = {
      userId: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1',
    };
    const response = await userDeleteController.handle(pathParameters);

    expect(response).toEqual({
      statusCode: 204,
    });
  });
});
