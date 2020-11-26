import { UserRepositoryInterface } from '../../../domain/models/users/user-repository-interface';
import { User } from '../../../domain/models/users/user';
import { UserName } from '../../../domain/models/users/user-name';
import { UserId } from '../../../domain/models/users/user-id';
import { Logger } from '../../../util/logger';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { DynamoDB } from 'aws-sdk';
import {
  TypeRepositoryError,
  TypeRepositoryError2,
  UserNotFoundRepositoryError,
} from '../../errors/repository-errors';

type StoredUser = {
  pk: string;
  gsi1pk: string;
  gsi2pk: string;
  gsi3pk: 'USER'; // objectType
};

const isStoredUser = (
  item: DynamoDB.DocumentClient.AttributeMap
): item is StoredUser =>
  typeof item.pk === 'string' &&
  typeof item.gsi1pk === 'string' &&
  typeof item.gsi2pk === 'string' &&
  item.gsi3pk === 'USER';

export class DynamodbUserRepository implements UserRepositoryInterface {
  private readonly documentClient: DynamoDB.DocumentClient;
  private readonly tableName: string;
  private readonly gsi1Name: string;
  private readonly gsi2Name: string;
  private readonly gsi3Name: string;

  constructor(props: {
    documentClient: DynamoDB.DocumentClient;
    tableName: string;
    gsi1Name: string;
    gsi2Name: string;
    gsi3Name: string;
  }) {
    this.documentClient = props.documentClient;
    this.tableName = props.tableName;
    this.gsi1Name = props.gsi1Name;
    this.gsi2Name = props.gsi2Name;
    this.gsi3Name = props.gsi3Name;
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

      const user = found.Items[0];
      if (!isStoredUser(user)) {
        throw new TypeRepositoryError2(
          `Stored users data is invalid. ${JSON.stringify(user)}`
        );
      }

      return new User(
        new UserId(user.pk),
        new UserName(user.gsi1pk),
        new MailAddress(user.gsi2pk)
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

  async list({
    limit,
    nextToken,
  }: {
    limit: number;
    nextToken?: string;
  }): Promise<User[]> {
    const users = await this.documentClient
      .query({
        TableName: this.tableName,
        IndexName: this.gsi3Name,
        ExpressionAttributeNames: {
          '#gsi3pk': 'gsi3pk',
        },
        ExpressionAttributeValues: {
          ':gsi3pk': 'USER',
        },
        KeyConditionExpression: '#gsi3pk = :gsi3pk',
        Limit: limit,
        ExclusiveStartKey: nextToken
          ? {
              pk: {
                S: nextToken,
              },
            }
          : undefined,
      })
      .promise();

    if (users.Items == null) {
      return [];
    }

    return users.Items.map((value) => {
      if (!isStoredUser(value)) {
        throw new TypeRepositoryError2(
          `Stored users data is invalid. ${JSON.stringify(value)}`
        );
      }
      return new User(
        new UserId(value.pk),
        new UserName(value.gsi1pk),
        new MailAddress(value.gsi2pk)
      );
    });
  }

  async register(user: User): Promise<void> {
    await this.documentClient
      .transactWrite({
        TransactItems: [
          {
            Put: {
              TableName: this.tableName,
              Item: {
                pk: user.getUserId().getValue(),
                gsi1pk: user.getName().getValue(),
                gsi2pk: user.getMailAddress().getValue(),
                gsi3pk: 'USER',
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

    Logger.info(`saved user ${user.getUserId().getValue()}`);
  }

  async update(user: User): Promise<void> {
    const response = await this.documentClient
      .get({
        TableName: this.tableName,
        Key: { pk: user.getUserId().getValue() },
      })
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
                Key: { pk: user.getUserId().getValue() },
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
                Key: { pk: user.getUserId().getValue() },
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
                Key: { pk: user.getUserId().getValue() },
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

    Logger.info(`updated user ${user.getUserId().getValue()}`);
  }

  async delete(user: User): Promise<void> {
    await this.documentClient
      .transactWrite({
        TransactItems: [
          {
            Delete: {
              TableName: this.tableName,
              Key: {
                pk: user.getUserId().getValue(),
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

    Logger.info(`deleted user ${user.getUserId().getValue()}`);
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
      .promise()
      .catch((error: Error) => {
        throw error;
      });

    if (responses == null) {
      throw new UserNotFoundRepositoryError(userIds);
    }

    if (
      responses[this.tableName] != null &&
      responses[this.tableName].length !== userIds.length
    ) {
      throw new UserNotFoundRepositoryError(
        userIds.filter(
          (userId) =>
            responses[this.tableName]
              .map((value) => value.pk)
              .indexOf(userId.getValue()) === -1
        )
      );
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
