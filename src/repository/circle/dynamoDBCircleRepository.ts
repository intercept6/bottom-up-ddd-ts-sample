import { CircleRepositoryInterface } from '#/domain/circle/circleRepositoryInterface';
import { Circle } from '#/domain/circle/circle';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { systemLog } from '#/util/systemLog';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import {
  CircleNotFoundException,
  TypeException,
} from '#/repository/error/error';
import { isStringArray } from '#/util/typeGuard';
import { UserId } from '#/domain/models/user/userId';

export class DynamoDBCircleRepository implements CircleRepositoryInterface {
  private readonly documentClient: DocumentClient;
  private readonly tableName: string;
  private readonly gsi1Name: string;

  constructor(props: {
    documentClient: DocumentClient;
    tableName: string;
    gsi1Name: string;
  }) {
    this.documentClient = props.documentClient;
    this.tableName = props.tableName;
    this.gsi1Name = props.gsi1Name;
  }

  async create(circle: Circle): Promise<void> {
    await this.documentClient
      .transactWrite({
        TransactItems: [
          {
            Put: {
              TableName: this.tableName,
              Item: {
                pk: circle.getCircleId().getValue(),
                gsi1pk: circle.getCircleName().getValue(),
                ownerId: circle.getOwnerId().getValue(),
                memberIds: circle
                  .getMemberIds()
                  .map((value) => value.getValue()),
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
                pk: `circleName#${circle.getCircleName().getValue()}`,
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

    systemLog(
      'INFO',
      `サークル ${circle.getCircleName().getValue()} をDynamoDBに保存しました`
    );
  }

  async update(circle: Circle): Promise<void> {
    const response = await this.documentClient
      .get({
        TableName: this.tableName,
        Key: { pk: circle.getCircleId().getValue() },
      })
      .promise();

    const oldCircleName = response.Item?.gsi1pk;

    if (circle.getCircleName().getValue() !== oldCircleName) {
      await this.documentClient
        .transactWrite({
          TransactItems: [
            {
              Update: {
                TableName: this.tableName,
                Key: { pk: circle.getCircleId().getValue() },
                ExpressionAttributeNames: {
                  '#pk': 'pk',
                  '#gsi1pk': 'gsi1pk',
                  '#ownerId': 'ownerId',
                  '#memberIds': 'memberIds',
                },
                ExpressionAttributeValues: {
                  ':gsi1pk': circle.getCircleName().getValue(),
                  ':ownerId': circle.getOwnerId().getValue(),
                  ':memberIds': circle
                    .getMemberIds()
                    .map((value) => value.getValue()),
                },
                UpdateExpression:
                  'SET #gsi1pk = :gsi1pk, #ownerId = :ownerId, #membersIds = :membersIds',
                ConditionExpression: 'attribute_exists(#pk)',
              },
            },
            {
              Delete: {
                TableName: this.tableName,
                Key: { pk: `circleName#${oldCircleName}` },
              },
            },
            {
              Put: {
                TableName: this.tableName,
                Item: { pk: `circleName#${circle.getCircleName().getValue()}` },
                ExpressionAttributeNames: {
                  '#pk': 'pk',
                },
                ConditionExpression: 'attribute_not_exists(#pk)',
              },
            },
          ],
        })
        .promise();
    } else {
      await this.documentClient
        .transactWrite({
          TransactItems: [
            {
              Update: {
                TableName: this.tableName,
                Key: { pk: circle.getCircleId().getValue() },
                ExpressionAttributeNames: {
                  '#pk': 'pk',
                  '#ownerId': 'ownerId',
                  '#memberIds': 'memberIds',
                },
                ExpressionAttributeValues: {
                  ':ownerId': circle.getOwnerId().getValue(),
                  ':memberIds': circle
                    .getMemberIds()
                    .map((value) => value.getValue()),
                },
                UpdateExpression:
                  'SET #ownerId = :ownerId, #membersIds = :membersIds',
                ConditionExpression: 'attribute_exists(#pk)',
              },
            },
          ],
        })
        .promise();
    }
  }

  async get(identifier: CircleId | CircleName): Promise<Circle> {
    if (identifier instanceof CircleId) {
      const response = await this.documentClient
        .get({ TableName: this.tableName, Key: { pk: identifier.getValue() } })
        .promise()
        .catch((error: Error) => error);

      if (response instanceof Error) {
        throw new CircleNotFoundException(identifier, response);
      } else if (response.Item == null) {
        throw new CircleNotFoundException(identifier);
      }

      const circleId = response.Item.pk;
      const circleName = response.Item.gsi1pk;
      const ownerId = response.Item.ownerId;
      const memberIds = response.Item.memberIds;

      if (typeof circleId !== 'string') {
        throw new TypeException({
          variableName: 'circleId',
          expected: 'string',
          got: typeof circleId,
        });
      }

      if (typeof circleName !== 'string') {
        throw new TypeException({
          variableName: 'circleName',
          expected: 'string',
          got: typeof circleName,
        });
      }

      if (typeof ownerId !== 'string') {
        throw new TypeException({
          variableName: 'ownerId',
          expected: 'string',
          got: typeof ownerId,
        });
      }

      if (!isStringArray(memberIds)) {
        throw new TypeException({
          variableName: 'memberIds',
          expected: 'string[]',
          got: 'unknown',
        });
      }

      systemLog('INFO', `サークル ${circleName} を更新しました`);

      return Circle.create(
        new CircleId(circleId),
        new CircleName(circleName),
        new UserId(ownerId),
        memberIds.map((value) => new UserId(value))
      );
    } else {
      const found = await this.documentClient
        .query({
          TableName: this.tableName,
          IndexName: this.gsi1Name,

          ExpressionAttributeNames: {
            '#gsi1pk': 'gsi1pk',
          },
          ExpressionAttributeValues: {
            ':gsi1pk': identifier.getValue(),
          },
          KeyConditionExpression: '#gsi1pk = :gsi1pk',
        })
        .promise();

      if (found.Items?.length !== 1) {
        throw new CircleNotFoundException(identifier);
      }

      const circleId = found.Items[0].pk;
      const circleName = found.Items[0].gsi1pk;
      const ownerId = found.Items[0].ownerId;
      const memberIds = found.Items[0].memberIds;

      if (typeof circleId !== 'string') {
        throw new TypeException({
          variableName: 'circleId',
          expected: 'string',
          got: typeof circleId,
        });
      }

      if (typeof circleName !== 'string') {
        throw new TypeException({
          variableName: 'circleName',
          expected: 'string',
          got: typeof circleName,
        });
      }

      if (typeof ownerId !== 'string') {
        throw new TypeException({
          variableName: 'ownerId',
          expected: 'string',
          got: typeof ownerId,
        });
      }

      if (!isStringArray(memberIds)) {
        throw new TypeException({
          variableName: 'memberIds',
          expected: 'string[]',
          got: 'unknown',
        });
      }

      systemLog('INFO', `サークル ${circleName} を更新しました`);

      return Circle.create(
        new CircleId(circleId),
        new CircleName(circleName),
        new UserId(ownerId),
        memberIds.map((value) => new UserId(value))
      );
    }
  }

  async delete(circle: Circle): Promise<void> {
    await this.documentClient
      .transactWrite({
        TransactItems: [
          {
            Delete: {
              TableName: this.tableName,
              Key: { pk: circle.getCircleId().getValue() },
            },
          },
          {
            Delete: {
              TableName: this.tableName,
              Key: { pk: `circleName#${circle.getCircleName().getValue()}` },
            },
          },
        ],
      })
      .promise();

    systemLog(
      'INFO',
      `サークル ${circle.getCircleName().getValue()} を削除しました`
    );
  }
}
