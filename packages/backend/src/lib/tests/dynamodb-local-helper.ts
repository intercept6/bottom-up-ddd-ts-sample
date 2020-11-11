import { Credentials, DynamoDB } from 'aws-sdk';

export class DynamodbLocalHelper {
  private readonly tableName: string;
  private readonly ddb: DynamoDB;
  private readonly documentClient: DynamoDB.DocumentClient;
  private readonly gsi1Name: string;
  private readonly gsi2Name: string;

  private constructor(props: {
    readonly tableName: string;
    readonly ddb: DynamoDB;
    readonly documentClient: DynamoDB.DocumentClient;
    readonly gsi1Name: string;
    readonly gsi2Name: string;
  }) {
    this.tableName = props.tableName;
    this.ddb = props.ddb;
    this.documentClient = props.documentClient;
    this.gsi1Name = props.gsi1Name;
    this.gsi2Name = props.gsi2Name;
  }

  private static createDDB(params: DynamoDB.ClientConfiguration) {
    return new DynamoDB(params);
  }

  private static createDocumentClient(
    params: DynamoDB.DocumentClient.DocumentClientOptions
  ) {
    return new DynamoDB.DocumentClient(params);
  }

  getDDB() {
    return this.ddb;
  }

  getDocumentClient() {
    return this.documentClient;
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
      .promise()
      .catch((error: Error) => {
        throw error;
      });
  }

  private async deleteTable() {
    await this.ddb.deleteTable({ TableName: this.tableName }).promise();
  }

  async destructor() {
    await this.deleteTable();
  }

  static async create({
    tableName,
    gsi1Name,
    gsi2Name,
  }: {
    readonly tableName: string;
    readonly gsi1Name: string;
    readonly gsi2Name: string;
  }) {
    const credentials = new Credentials({
      secretAccessKey: 'dummy',
      accessKeyId: 'dummy',
    });
    const params:
      | DynamoDB.ClientConfiguration
      | DynamoDB.DocumentClient.DocumentClientOptions = {
      apiVersion: '2012-08-10',
      region: 'local',
      endpoint: 'http://localhost:8000',
      credentials,
    };
    const ddb = this.createDDB(params);
    const documentClient = this.createDocumentClient(params);

    await this.createTable({ tableName, ddb }).catch((error: Error) => {
      throw error;
    });

    return new DynamodbLocalHelper({
      tableName,
      ddb,
      documentClient,
      gsi1Name,
      gsi2Name,
    });
  }
}
