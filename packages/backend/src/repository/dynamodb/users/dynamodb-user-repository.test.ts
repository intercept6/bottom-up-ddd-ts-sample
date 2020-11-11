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
  }).catch((error: Error) => {
    throw error;
  });
  dynamoDBUserRepository = new DynamodbUserRepository({
    tableName,
    gsi1Name,
    gsi2Name,
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
    const userGetPromise = dynamoDBUserRepository.get(new UserId(userId));

    await expect(userGetPromise).rejects.toThrowError(
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
});
