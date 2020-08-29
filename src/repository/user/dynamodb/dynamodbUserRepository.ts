import type { userRepositoryInterface } from '#/repository/user/userRepositoryInterface';
import type { DynamoDB } from 'aws-sdk';
import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserId } from '#/domain/models/user/userId';
import { systemLog } from '#/util/systemLog';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { TypeException, UserNotFoundException } from '#/util/error';

export class DynamodbUserRepository implements userRepositoryInterface {
  constructor(
    private readonly ddb: DynamoDB,
    private readonly docClient: DynamoDB.DocumentClient,
    private readonly tableName: string,
    private readonly gsi1Name: string,
    private readonly gsi2Name: string
  ) {}

  async find(id: UserId): Promise<User>;
  async find(name: UserName): Promise<User>;
  async find(mailAddress: MailAddress): Promise<User>;
  async find(arg1: UserId | UserName | MailAddress): Promise<User> {
    if (arg1 instanceof UserId) {
      const response = await this.docClient
        .get({
          TableName: this.tableName,
          Key: {
            id: arg1.getValue(),
          },
        })
        .promise()
        .catch((error: Error) => error);
      if (response instanceof Error) {
        throw new UserNotFoundException(arg1, response);
      } else if (response.Item == null) {
        throw new UserNotFoundException(arg1);
      }

      const id = response.Item.id;
      const userName = response.Item.name;
      const mailAddress = response.Item.mailAddress;

      if (id == null) {
        throw new Error(
          'DynamoDBから取得したユーザのレコードに id が存在しませんでした'
        );
      }
      if (userName == null) {
        throw new Error(
          'DynamoDBから取得したユーザのレコードに name が存在しませんでした'
        );
      }
      if (mailAddress == null) {
        throw new Error(
          'DynamoDBから取得したユーザのレコードに mailAddress が存在しませんでした'
        );
      }

      if (typeof id !== 'string') {
        throw new TypeException('userId', 'string', typeof id);
      }
      if (typeof userName !== 'string') {
        throw new TypeException('userName', 'string', typeof userName);
      }
      if (typeof mailAddress !== 'string') {
        throw new TypeException('mailAddress', 'string', typeof mailAddress);
      }

      return new User(
        new UserId(id),
        new UserName(userName),
        new MailAddress(mailAddress)
      );
    } else if (arg1 instanceof UserName) {
      const found = await this.ddb
        .query({
          TableName: this.tableName,
          ExpressionAttributeValues: {
            ':name': {
              S: arg1.getValue(),
            },
          },
          KeyConditionExpression: 'name = :name',
          IndexName: this.gsi1Name,
        })
        .promise();

      if (found.Items?.length !== 1) {
        throw new UserNotFoundException(arg1);
      }

      const id = found.Items[0].id.S;
      const userName = found.Items[0].name.S;
      const mailAddress = found.Items[0].mailAddress.S;

      if (id == null) {
        throw new Error(
          'DynamoDBから取得したユーザのレコードに id が存在しませんでした'
        );
      }
      if (userName == null) {
        throw new Error(
          'DynamoDBから取得したユーザのレコードに name が存在しませんでした'
        );
      }
      if (mailAddress == null) {
        throw new Error(
          'DynamoDBから取得したユーザのレコードに mailAddress が存在しませんでした'
        );
      }

      return new User(
        new UserId(id),
        new UserName(userName),
        new MailAddress(mailAddress)
      );
    } else {
      const found = await this.ddb
        .query({
          TableName: this.tableName,
          ExpressionAttributeValues: {
            ':mailAddress': {
              S: arg1.getValue(),
            },
          },
          KeyConditionExpression: 'mailAddress = :mailAddress',
          IndexName: this.gsi2Name,
        })
        .promise();

      if (found.Items?.length !== 1) {
        throw new UserNotFoundException(arg1);
      }

      const id = found.Items[0].id.S;
      const userName = found.Items[0].name.S;
      const mailAddress = found.Items[0].mailAddress.S;

      if (id == null) {
        throw new Error(
          'DynamoDBから取得したユーザのレコードに id が存在しませんでした'
        );
      }
      if (userName == null) {
        throw new Error(
          'DynamoDBから取得したユーザのレコードに name が存在しませんでした'
        );
      }
      if (mailAddress == null) {
        throw new Error(
          'DynamoDBから取得したユーザのレコードに mailAddress が存在しませんでした'
        );
      }

      return new User(
        new UserId(id),
        new UserName(userName),
        new MailAddress(mailAddress)
      );
    }
  }

  async save(user: User) {
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: {
          id: user.getId(),
          name: user.getName(),
        },
      })
      .promise();
    systemLog(
      'INFO',
      `ユーザ id: ${user.getId()}, name: ${user.getName()} をDynamoDBに保存しました`
    );
  }

  async delete(user: User): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.tableName,
        Key: {
          id: user.getId(),
        },
      })
      .promise();
    systemLog(
      'INFO',
      `ユーザ id: ${user.getId()}, name: ${user.getName()} をDynamoDBから削除しました`
    );
  }
}
