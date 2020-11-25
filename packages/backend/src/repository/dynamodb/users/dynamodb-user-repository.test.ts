import { DynamodbLocalHelper } from '../../../lib/tests/dynamodb-local-helper';
import { UserId } from '../../../domain/models/users/user-id';
import { UserNotFoundRepositoryError } from '../../errors/repository-errors';
import { Credentials, DynamoDB } from 'aws-sdk';
import { DynamodbUserRepository } from './dynamodb-user-repository';
import { User } from '../../../domain/models/users/user';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';

/**
 * AWS SDKによるDynamoDBの操作はKeyConditionExpressionなど型の恩恵を受けられない場合が多い
 * なので、DynamoDB Localを使い記述が正しいかテストする。
 */

const tableName = 'test-user-repository';
const gsi1Name = 'gsi1';
const gsi2Name = 'gsi2';
const gsi3Name = 'gsi3';

let dynamoDBLocalHelper: DynamodbLocalHelper;
let dynamoDBUserRepository: DynamodbUserRepository;
const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});

beforeEach(async () => {
  dynamoDBLocalHelper = await DynamodbLocalHelper.create({
    tableName,
    gsi1Name,
    gsi2Name,
    gsi3Name,
  }).catch((error: Error) => {
    throw error;
  });
  dynamoDBUserRepository = new DynamodbUserRepository({
    tableName,
    gsi1Name,
    gsi2Name,
    gsi3Name,
    documentClient: dynamoDBLocalHelper.getDocumentClient(),
  });
});

afterEach(async () => {
  await dynamoDBLocalHelper.destructor();
});

describe('ユーザーリポジトリへのCRUDテスト', () => {
  test('ユーザーを作成する', async () => {
    const userId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    await dynamoDBUserRepository.create(
      new User(
        new UserId(userId),
        new UserName(userName),
        new MailAddress(mailAddress)
      )
    );
  });

  test('ユーザーをユーザーIDで取得する', async () => {
    const userId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: userId,
          gsi1pk: userName,
          gsi2pk: mailAddress,
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    const response = await dynamoDBUserRepository.get(new UserId(userId));

    expect(response.getUserId().getValue()).toEqual(userId);
    expect(response.getName().getValue()).toEqual(userName);
    expect(response.getMailAddress().getValue()).toEqual(mailAddress);
  });

  test('ユーザーをユーザーIDで複数取得する', async () => {
    const users = [
      {
        userId: '8403d7b8-4f7f-413f-b415-77d2b6002575',
        userName: 'テストユーザー名1',
        mailAddress: 'test1@example.com',
      },
      {
        userId: '7bec5dca-3d3d-4c5f-8f5d-2ec1a8c34b17',
        userName: 'テストユーザー名2',
        mailAddress: 'test2@example.com',
      },
    ];

    await Promise.all(
      users.map(async ({ userId, userName, mailAddress }) => {
        await documentClient
          .put({
            TableName: tableName,
            Item: {
              pk: userId,
              gsi1pk: userName,
              gsi2pk: mailAddress,
            },
          })
          .promise()
          .catch((error: Error) => {
            throw error;
          });
      })
    );

    const response = await dynamoDBUserRepository.batchGet(
      users.map(({ userId }) => new UserId(userId))
    );

    expect(response.map((user) => user.getUserId().getValue())).toEqual(
      expect.arrayContaining(users.map(({ userId }) => userId))
    );
    expect(response.map((user) => user.getName().getValue())).toEqual(
      expect.arrayContaining(users.map(({ userName }) => userName))
    );
    expect(response.map((user) => user.getMailAddress().getValue())).toEqual(
      expect.arrayContaining(users.map(({ mailAddress }) => mailAddress))
    );
  });

  test('ユーザーをユーザー名で取得する', async () => {
    const userId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: userId,
          gsi1pk: userName,
          gsi2pk: mailAddress,
          gsi3pk: 'USER',
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    const response = await dynamoDBUserRepository.get(new UserName(userName));

    expect(response.getUserId().getValue()).toEqual(userId);
    expect(response.getName().getValue()).toEqual(userName);
    expect(response.getMailAddress().getValue()).toEqual(mailAddress);
  });

  test('ユーザーをメールアドレスで取得する', async () => {
    const userId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: userId,
          gsi1pk: userName,
          gsi2pk: mailAddress,
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    const response = await dynamoDBUserRepository.get(
      new MailAddress(mailAddress)
    );

    expect(response.getUserId().getValue()).toEqual(userId);
    expect(response.getName().getValue()).toEqual(userName);
    expect(response.getMailAddress().getValue()).toEqual(mailAddress);
  });

  test('ユーザー名を更新する', async () => {
    const userId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    const updateUserName = '更新されたユーザー名';
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: userId,
          gsi1pk: userName,
          gsi2pk: mailAddress,
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    await dynamoDBUserRepository.update(
      new User(
        new UserId(userId),
        new UserName(updateUserName),
        new MailAddress(mailAddress)
      )
    );
  });

  test('メールアドレスを更新する', async () => {
    const userId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    const updateMailAddress = 'updated@example.com';
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: userId,
          gsi1pk: userName,
          gsi2pk: mailAddress,
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    await dynamoDBUserRepository.update(
      new User(
        new UserId(userId),
        new UserName(userName),
        new MailAddress(updateMailAddress)
      )
    );
  });

  test('ユーザー名とメールアドレスを更新する', async () => {
    const userId = '8403d7b8-4f7f-413f-b415-77d2b6002575';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    const updateUserName = '更新されたユーザー名';
    const updateMailAddress = 'updated@example.com';
    await documentClient
      .put({
        TableName: tableName,
        Item: {
          pk: userId,
          gsi1pk: userName,
          gsi2pk: mailAddress,
        },
      })
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    await dynamoDBUserRepository.update(
      new User(
        new UserId(userId),
        new UserName(updateUserName),
        new MailAddress(updateMailAddress)
      )
    );
  });

  test('存在しないユーザーは取得できない', async () => {
    const userId = 'f1ee26d0-77bd-46f2-8c7f-60c9d617fded';
    const getUserPromise = dynamoDBUserRepository.get(new UserId(userId));

    await expect(getUserPromise).rejects.toThrowError(
      new UserNotFoundRepositoryError(new UserId(userId))
    );
  });

  test('存在しない複数のユーザーは取得できない', async () => {
    const users = [
      {
        userId: '8403d7b8-4f7f-413f-b415-77d2b6002575',
        userName: 'テストユーザー名1',
        mailAddress: 'test1@example.com',
      },
      {
        userId: '7bec5dca-3d3d-4c5f-8f5d-2ec1a8c34b17',
        userName: 'テストユーザー名2',
        mailAddress: 'test2@example.com',
      },
    ];

    const batchGetPromise = dynamoDBUserRepository.batchGet(
      users.map(({ userId }) => new UserId(userId))
    );

    await expect(batchGetPromise).rejects.toThrowError(
      new UserNotFoundRepositoryError(
        users.map(({ userId }) => new UserId(userId))
      )
    );
  });

  test('存在しないユーザーを削除できる', async () => {
    const userId = '5666d306-0942-4a82-b059-a5fa4f1439b5';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    await dynamoDBUserRepository.delete(
      new User(
        new UserId(userId),
        new UserName(userName),
        new MailAddress(mailAddress)
      )
    );
  });

  test('limitで指定した件数のユーザーを取得する', async () => {
    const users = [
      {
        userId: '8403d7b8-4f7f-413f-b415-77d2b6002575',
        userName: 'テストユーザー名1',
        mailAddress: 'test1@example.com',
      },
      {
        userId: '7bec5dca-3d3d-4c5f-8f5d-2ec1a8c34b17',
        userName: 'テストユーザー名2',
        mailAddress: 'test2@example.com',
      },
      {
        userId: '66391b02-d24c-4358-956a-80da4ef55701',
        userName: 'テストユーザー名3',
        mailAddress: 'test3@example.com',
      },
      {
        userId: '5bd9ba83-507d-4251-90d3-8e2854ad93f7',
        userName: 'テストユーザー名4',
        mailAddress: 'test4@example.com',
      },
      {
        userId: 'f52b1b39-d090-4f1d-8598-437a4db47ae3',
        userName: 'テストユーザー名5',
        mailAddress: 'test5@example.com',
      },
      {
        userId: 'd03f6406-666f-453c-b29a-db6c71bae94f',
        userName: 'テストユーザー名6',
        mailAddress: 'test6@example.com',
      },
      {
        userId: '8d8a202e-0259-40f0-b11f-c270e6c84458',
        userName: 'テストユーザー名7',
        mailAddress: 'test7@example.com',
      },
      {
        userId: 'edcb9d14-5a3b-4eff-ae1c-b0b6afdf71e6',
        userName: 'テストユーザー名8',
        mailAddress: 'test8@example.com',
      },
      {
        userId: '9c22f8b8-d725-4326-88f8-dc01379a601f',
        userName: 'テストユーザー名9',
        mailAddress: 'test9@example.com',
      },
      {
        userId: '9eb1ddf5-1a7c-44a1-b7f8-5da17bf82f04',
        userName: 'テストユーザー名10',
        mailAddress: 'test10@example.com',
      },
      {
        userId: 'cb0424e7-28b8-46cc-9c4c-649c496db87c',
        userName: 'テストユーザー名11',
        mailAddress: 'test11@example.com',
      },
    ];

    await Promise.all(
      users.map(async ({ userId, userName, mailAddress }) => {
        await documentClient
          .put({
            TableName: tableName,
            Item: {
              pk: userId,
              gsi1pk: userName,
              gsi2pk: mailAddress,
              gsi3pk: 'USER',
            },
          })
          .promise()
          .catch((error: Error) => {
            throw error;
          });
      })
    );

    const response = await dynamoDBUserRepository
      .list({ limit: 5 })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    expect(response).toHaveLength(5);
  });
});
