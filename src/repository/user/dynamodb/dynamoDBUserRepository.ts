import type { userRepositoryInterface } from '#/repository/user/userRepositoryInterface';
import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserId } from '#/domain/models/user/userId';
import { systemLog } from '#/util/systemLog';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { TypeException, UserNotFoundException } from '#/util/error';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export class DynamoDBUserRepository implements userRepositoryInterface {
  private readonly documentClient: DocumentClient;
  private readonly tableName: string;
  private readonly gsi1Name: string;
  private readonly gsi2Name: string;

  constructor(props: {
    documentClient: DocumentClient;
    tableName: string;
    gsi1Name: string;
    gsi2Name: string;
  }) {
    this.documentClient = props.documentClient;
    this.tableName = props.tableName;
    this.gsi1Name = props.gsi1Name;
    this.gsi2Name = props.gsi2Name;
  }

  async find(identity: UserId | UserName | MailAddress): Promise<User> {
    if (identity instanceof UserId) {
      const response = await this.documentClient
        .get({
          TableName: this.tableName,
          Key: {
            pk: identity.getValue(),
          },
        })
        .promise()
        .catch((error: Error) => error);
      if (response instanceof Error) {
        throw new UserNotFoundException(identity, response);
      } else if (response.Item == null) {
        throw new UserNotFoundException(identity);
      }

      const id = response.Item.pk;
      const userName = response.Item.gsi1pk;
      const mailAddress = response.Item.gsi2pk;

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
    } else if (identity instanceof UserName) {
      const found = await this.documentClient
        .query({
          TableName: this.tableName,
          IndexName: this.gsi1Name,
          ExpressionAttributeNames: {
            '#gsi1pk': 'gsi1pk',
          },
          ExpressionAttributeValues: {
            ':gsi1pk': identity.getValue(),
          },
          KeyConditionExpression: '#gsi1pk = :gsi1pk',
        })
        .promise();

      if (found.Items?.length !== 1) {
        throw new UserNotFoundException(identity);
      }

      const id = found.Items[0].pk;
      const userName = found.Items[0].gsi1pk;
      const mailAddress = found.Items[0].gsi2pk;

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
    } else {
      const found = await this.documentClient
        .query({
          TableName: this.tableName,
          IndexName: this.gsi2Name,
          ExpressionAttributeNames: {
            '#gsi2pk': 'gsi2pk',
          },
          ExpressionAttributeValues: {
            ':gsi2pk': identity.getValue(),
          },
          KeyConditionExpression: '#gsi2pk = :gsi2pk',
        })
        .promise();

      if (found.Items?.length !== 1) {
        throw new UserNotFoundException(identity);
      }

      const id = found.Items[0].pk;
      const userName = found.Items[0].gsi1pk;
      const mailAddress = found.Items[0].gsi2pk;

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
    }
  }

  async create(user: User) {
    await this.documentClient
      .transactWrite({
        TransactItems: [
          {
            Put: {
              TableName: this.tableName,
              Item: {
                pk: user.getId().getValue(),
                gsi1pk: user.getName().getValue(),
                gsi2pk: user.getMailAddress().getValue(),
              },
              ExpressionAttributeNames: {
                '#pk': 'pk',
              },
              ConditionExpression: 'attribute_not_exists(#pk)',
            },
          },
          {
            Put: {
              TableName: this.tableName,
              Item: {
                pk: `userName#${user.getName().getValue()}`,
              },
              ExpressionAttributeNames: {
                '#pk': 'pk',
              },
              ConditionExpression: 'attribute_not_exists(#pk)',
            },
          },
          {
            Put: {
              TableName: this.tableName,
              Item: {
                pk: `mailAddress#${user.getMailAddress().getValue()}`,
              },
              ExpressionAttributeNames: {
                '#pk': 'pk',
              },
              ConditionExpression: 'attribute_not_exists(#pk)',
            },
          },
        ],
      })
      .promise();

    systemLog('INFO', `ユーザー${user.getId()}をDynamoDBに保存しました`);
  }

  async update(user: User) {
    await this.documentClient
      .transactWrite({
        TransactItems: [
          {
            Update: {
              TableName: this.tableName,
              Key: { pk: user.getId().getValue() },
              ExpressionAttributeNames: {
                '#pk': 'pk',
                '#gsi1pk': 'gsi1pk',
                '#gsi2pk': 'gsi2pk',
              },
              ExpressionAttributeValues: {
                ':gsi1pk': user.getName().getValue(),
                ';gsi2pk': user.getMailAddress().getValue(),
              },
              UpdateExpression: [
                'set #gsi1pk = :gsi1pk',
                'set #gsi2pk = :gsi2pk',
              ].join(','),
              ConditionExpression: 'attribute_exists(#pk)',
            },
          },
          {
            Delete: {
              TableName: this.tableName,
              Key: { pk: `userName#${user.getName().getValue()}` },
            },
          },
          {
            Delete: {
              TableName: this.tableName,
              Key: { pk: `mailAddress#${user.getMailAddress().getValue()}` },
            },
          },
          {
            Put: {
              TableName: this.tableName,
              Item: {
                pk: `userName#${user.getName().getValue()}`,
              },
              ExpressionAttributeNames: {
                '#pk': 'pk',
              },
              ConditionExpression: 'attribute_not_exists(#pk)',
            },
          },
          {
            Put: {
              TableName: this.tableName,
              Item: {
                pk: `mailAddress#${user.getMailAddress().getValue()}`,
              },
              ExpressionAttributeNames: {
                '#pk': 'pk',
              },
              ConditionExpression: 'attribute_not_exists(#pk)',
            },
          },
        ],
      })
      .promise();

    systemLog('INFO', `ユーザー${user.getId()}をDynamoDBに更新しました`);
  }

  async delete(user: User): Promise<void> {
    await this.documentClient
      .transactWrite({
        TransactItems: [
          {
            Delete: {
              TableName: this.tableName,
              Key: {
                pk: user.getId().getValue(),
              },
            },
          },
          {
            Delete: {
              TableName: this.tableName,
              Key: {
                pk: `userName#${user.getName().getValue()}`,
              },
            },
          },
          {
            Delete: {
              TableName: this.tableName,
              Key: {
                pk: `mailAddress#${user.getMailAddress().getValue()}`,
              },
            },
          },
        ],
      })
      .promise();

    systemLog('INFO', `ユーザー:${user.getId()}をDynamoDBから削除しました`);
  }
}
