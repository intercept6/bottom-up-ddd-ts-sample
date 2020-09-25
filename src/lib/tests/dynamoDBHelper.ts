import { DynamoDB } from 'aws-sdk';

type Props = {
  readonly tableName: string;
  readonly ddb: DynamoDB;
  readonly documentClient: DynamoDB.DocumentClient;
};

export class DynamoDBHelper {
  private readonly tableName: string;
  private readonly ddb: DynamoDB;
  private readonly documentClient: DynamoDB.DocumentClient;

  private constructor(props: Props) {
    this.tableName = props.tableName;
    this.ddb = props.ddb;
    this.documentClient = props.documentClient;
  }

  private static async createTable(props: {
    readonly tableName: string;
    readonly ddb: DynamoDB;
  }) {
    await props.ddb
      .createTable({
        TableName: props.tableName,
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          { AttributeName: 'pk', AttributeType: 'S' },
          { AttributeName: 'gsi1pk', AttributeType: 'S' },
          { AttributeName: 'gsi2pk', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'gsi1',
            KeySchema: [{ AttributeName: 'gsi1pk', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
          },
          {
            IndexName: 'gsi2',
            KeySchema: [{ AttributeName: 'gsi2pk', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
          },
        ],
      })
      .promise();
  }

  private async deleteTable() {
    await this.ddb.deleteTable({ TableName: this.tableName }).promise();
  }

  async destructor() {
    await this.deleteTable();
  }

  async createUser({
    userId,
    userName,
    mailAddress,
  }: {
    readonly userId: string;
    readonly userName: string;
    readonly mailAddress: string;
  }) {
    await this.documentClient
      .put({
        TableName: this.tableName,
        Item: {
          pk: userId,
          gsi1pk: userName,
          gsi2pk: mailAddress,
        },
      })
      .promise();
  }

  async createCircle({
    circleId,
    circleName,
    ownerId,
    memberIds,
  }: {
    readonly circleId: string;
    readonly circleName: string;
    readonly ownerId: string;
    readonly memberIds: string[];
  }) {
    await this.documentClient
      .put({
        TableName: this.tableName,
        Item: {
          pk: circleId,
          gsi1pk: circleName,
          ownerId,
          memberIds,
        },
      })
      .promise();
  }

  static async create(props: Props) {
    await this.createTable({ tableName: props.tableName, ddb: props.ddb });

    return new DynamoDBHelper(props);
  }
}
