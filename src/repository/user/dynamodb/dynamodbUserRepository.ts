import type { UserRepository } from '#/repository/user/userRepositoryInterface';
import type { DynamoDB } from 'aws-sdk';
import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserId } from '#/domain/models/user/userId';
import { systemLog } from '#/util/systemLog';

export class DynamodbUserRepository implements UserRepository {
  constructor(
    private readonly ddb: DynamoDB,
    private readonly docClient: DynamoDB.DocumentClient,
    private readonly tableName: string,
    private readonly gsi1Name: string
  ) {}

  async find(name: UserName): Promise<User | null> {
    try {
      const found = await this.ddb
        .query({
          TableName: this.tableName,
          ExpressionAttributeValues: {
            ':name': {
              S: name.getValue(),
            },
          },
          KeyConditionExpression: 'name = :name',
          IndexName: this.gsi1Name,
        })
        .promise();

      if (found.Items?.length !== 1) {
        systemLog(
          'DEBUG',
          `ユーザ名: ${name.getValue()} が検索されましたが、存在しませんでした`
        );
        return null;
      }

      const id = found.Items[0].id.S;
      const userName = found.Items[0].name.S;

      if (id == null) {
        systemLog(
          'WARN',
          'DynamoDBから取得したユーザのレコードに id が存在しませんでした'
        );
        return null;
      }
      if (userName == null) {
        systemLog(
          'WARN',
          'DynamoDBから取得したユーザのレコードに name が存在しませんでした'
        );
        return null;
      }

      return new User(new UserId(id), new UserName(userName));
    } catch (error) {
      systemLog('ERROR', error.message);
      return null;
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
}
