import { UserRepositoryInterface } from '#/domain/models/user/userRepositoryInterface';
import { User } from '#/domain/models/user/user';
import { UserName } from '#/domain/models/user/userName';
import { UserId } from '#/domain/models/user/userId';
import { Logger } from '#/util/logger';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import {
  TypeRepositoryError,
  UserNotFoundRepositoryError,
} from '#/repository/error/error';

export class DynamoDBUserRepository implements UserRepositoryInterface {
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

  /**
   * ユーザー識別子を用いてユーザーを検索する
   * @param  {UserId | UserName | MailAddress} identity ユーザー識別子
   * @throws {UserNotFoundRepositoryError} ユーザーが存在しない
   */
  async get(identity: UserId | UserName | MailAddress): Promise<User> {
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
        throw new UserNotFoundRepositoryError(identity, response);
      } else if (response.Item == null) {
        throw new UserNotFoundRepositoryError(identity);
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
        throw new TypeRepositoryError({
          variableName: 'userId',
          expected: 'string',
          got: typeof id,
        });
      }
      if (typeof userName !== 'string') {
        throw new TypeRepositoryError({
          variableName: 'userName',
          expected: 'string',
          got: typeof userName,
        });
      }
      if (typeof mailAddress !== 'string') {
        throw new TypeRepositoryError({
          variableName: 'mailAddress',
          expected: 'string',
          got: typeof mailAddress,
        });
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
        throw new UserNotFoundRepositoryError(identity);
      }

      const id = found.Items[0].pk;
      const userName = found.Items[0].gsi1pk;
      const mailAddress = found.Items[0].gsi2pk;

      if (typeof id !== 'string') {
        throw new TypeRepositoryError({
          variableName: 'userId',
          expected: 'string',
          got: typeof id,
        });
      }
      if (typeof userName !== 'string') {
        throw new TypeRepositoryError({
          variableName: 'userName',
          expected: 'string',
          got: typeof userName,
        });
      }
      if (typeof mailAddress !== 'string') {
        throw new TypeRepositoryError({
          variableName: 'mailAddress',
          expected: 'string',
          got: typeof mailAddress,
        });
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
        throw new UserNotFoundRepositoryError(identity);
      }

      const id = found.Items[0].pk;
      const userName = found.Items[0].gsi1pk;
      const mailAddress = found.Items[0].gsi2pk;

      if (typeof id !== 'string') {
        throw new TypeRepositoryError({
          variableName: 'userId',
          expected: 'string',
          got: typeof id,
        });
      }
      if (typeof userName !== 'string') {
        throw new TypeRepositoryError({
          variableName: 'userName',
          expected: 'string',
          got: typeof userName,
        });
      }
      if (typeof mailAddress !== 'string') {
        throw new TypeRepositoryError({
          variableName: 'mailAddress',
          expected: 'string',
          got: typeof mailAddress,
        });
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

    Logger.info(`saved user ${user.getId().getValue()}`);
  }

  async update(user: User) {
    const response = await this.documentClient
      .get({ TableName: this.tableName, Key: { pk: user.getId().getValue() } })
      .promise();

    const oldName = response.Item?.gsi1pk;
    const oldMailAddress = response.Item?.gsi2pk;

    if (
      user.getName().getValue() !== oldName &&
      user.getMailAddress().getValue() !== oldMailAddress
    ) {
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
                  ':gsi2pk': user.getMailAddress().getValue(),
                },
                UpdateExpression: 'SET #gsi1pk = :gsi1pk, #gsi2pk = :gsi2pk',
                ConditionExpression: 'attribute_exists(#pk)',
              },
            },
            {
              Delete: {
                TableName: this.tableName,
                Key: { pk: `userName#${oldName}` },
              },
            },
            {
              Delete: {
                TableName: this.tableName,
                Key: { pk: `mailAddress#${oldMailAddress}` },
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
    } else if (user.getName().getValue() !== oldName) {
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
                  ':gsi2pk': user.getMailAddress().getValue(),
                },
                UpdateExpression: 'SET #gsi1pk = :gsi1pk, #gsi2pk = :gsi2pk',
                ConditionExpression: 'attribute_exists(#pk)',
              },
            },
            {
              Delete: {
                TableName: this.tableName,
                Key: { pk: `userName#${oldName}` },
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
          ],
        })
        .promise();
    } else if (user.getMailAddress().getValue() !== oldMailAddress) {
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
                  ':gsi2pk': user.getMailAddress().getValue(),
                },
                UpdateExpression: 'SET #gsi1pk = :gsi1pk, #gsi2pk = :gsi2pk',
                ConditionExpression: 'attribute_exists(#pk)',
              },
            },
            {
              Delete: {
                TableName: this.tableName,
                Key: { pk: `mailAddress#${oldMailAddress}` },
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
    }

    Logger.info(`updated user ${user.getId().getValue()}`);
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

    Logger.info(`deleted user ${user.getId().getValue()}`);
  }

  /**
   * 複数のユーザーIDからユーザーを取得する
   * @param userIds
   * @throws {UserNotFoundRepositoryError} 1つでも指定されたユーザーが存在しない
   */
  async batchGet(userIds: UserId[]): Promise<User[]> {
    const { Responses: responses } = await this.documentClient
      .batchGet({
        RequestItems: {
          [this.tableName]: {
            Keys: userIds.map((value) => ({ pk: value.getValue() })),
          },
        },
      })
      .promise();

    if (
      !responses ||
      !responses[this.tableName] ||
      responses[this.tableName].length !== userIds.length
    ) {
      throw new UserNotFoundRepositoryError(userIds);
    }

    return responses[this.tableName].map(
      (value) =>
        new User(
          new UserId(value.pk),
          new UserName(value.gsi1pk),
          new MailAddress(value.gsi2pk)
        )
    );
  }
}
