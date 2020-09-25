import { Credentials, DynamoDB } from 'aws-sdk';
import { UserUpdateService } from '#/application/user/update/userUpdateService';
import { UserUpdateController } from '#/awsServerless/controllers/user/update/userUpdateController';
import { DynamoDBUserRepository } from '#/repository/user/dynamoDBUserRepository';
import {
  createDynamoDBTable,
  createUser,
  deleteDynamoDBTable,
} from '#/lib/tests/common';

const region = 'local';
const tableName = 'user-update-controller-test-table';
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
const userUpdateService = new UserUpdateService(userRepository);
const userUpdateController = new UserUpdateController(userUpdateService);

beforeEach(async () => {
  await createDynamoDBTable(tableName);
  await createUser(tableName, {
    userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    userName: 'ユーザー1',
    mailAddress: 'user1@example.com',
  });
});
afterEach(async () => {
  await deleteDynamoDBTable(tableName);
});

describe('ユーザー更新', () => {
  test('ユーザー名を更新する', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({
        user_name: '更新されたユーザー名',
      }),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('メールアドレスを更新する', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({
        mail_address: 'updated@example.com',
      }),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('ユーザー名とメールアドレスを更新する', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({
        user_name: '更新されたユーザー名',
        mail_address: 'updated@example.com',
      }),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('ユーザーが存在しない場合は更新に失敗する', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: 'ca00d9c4-eecf-47f4-9e89-be7f9836053f' },
      body: JSON.stringify({
        user_name: '更新されたユーザー名',
        mail_address: 'updated@example.com',
      }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user id: ca00d9c4-eecf-47f4-9e89-be7f9836053f is not found',
      }),
    });
  });

  test('ユーザー名もメールアドレスも指定されない', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({}),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user_name type and mail_address are undefined',
      }),
    });
  });

  test('ユーザー名がstring型ではない', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({ user_name: 1 }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user_name type is not string',
      }),
    });
  });

  test('メールアドレスがstring型ではない', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({ mail_address: 1 }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'mail_address type is not string',
      }),
    });
  });

  test('ユーザー名もメールアドレスもstring型ではない', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({ user_name: 1, mail_address: 1 }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user_name type is not string',
      }),
    });
  });
});
