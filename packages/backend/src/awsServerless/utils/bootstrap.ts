import { DynamoDB } from 'aws-sdk';
import { DynamoDBUserRepository } from '../../repository/dynamoDB/users/dynamoDBUserRepository';
import { DynamoDBCircleRepository } from '../../repository/dynamoDB/circles/dynamoDBCircleRepository';
import { DynamoDBCircleFactory } from '../../repository/dynamoDB/circles/dynamoDBCircleFactory';
import { UserRepositoryInterface } from '../../domain/models/user/userRepositoryInterface';
import { CircleRepositoryInterface } from '../../domain/models/circle/circleRepositoryInterface';

export class Bootstrap {
  private readonly tableName: string;
  private readonly gsi1Name: string;
  private readonly gsi2Name: string;
  private readonly rootURI: string;
  private readonly documentClient: DynamoDB.DocumentClient;

  private userRepository?: UserRepositoryInterface;
  private circleRepository?: CircleRepositoryInterface;

  constructor() {
    const region = process.env.AWS_REGION ?? 'ap-northeast-1';

    this.tableName = process.env.MAIN_TABLE_NAME ?? 'bottom-up-ddd';
    this.gsi1Name = process.env.MAIL_TABLE_GSI1_NAME ?? 'gsi1';
    this.gsi2Name = process.env.MAIL_TABLE_GSI2_NAME ?? 'gsi2';
    this.rootURI = process.env.ROOT_URI! ?? '';
    this.documentClient = new DynamoDB.DocumentClient({
      apiVersion: '2012-08-10',
      region,
    });
  }

  getRootURI() {
    return this.rootURI;
  }

  getUserRepository() {
    this.userRepository =
      this.userRepository ??
      new DynamoDBUserRepository({
        documentClient: this.documentClient,
        tableName: this.tableName,
        gsi1Name: this.gsi1Name,
        gsi2Name: this.gsi2Name,
      });

    return this.userRepository;
  }

  getCircleRepository() {
    this.circleRepository =
      this.circleRepository ??
      new DynamoDBCircleRepository({
        documentClient: this.documentClient,
        tableName: this.tableName,
        gsi1Name: this.gsi1Name,
      });

    return this.circleRepository;
  }

  getCircleFactory() {
    return new DynamoDBCircleFactory({
      userRepository: this.getUserRepository(),
      circleRepository: this.getCircleRepository(),
    });
  }
}
