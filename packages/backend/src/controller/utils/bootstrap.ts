import { DynamoDB } from 'aws-sdk';
import { DynamodbUserRepository } from '../../repository/dynamodb/users/dynamodb-user-repository';
import { DynamodbCircleRepository } from '../../repository/dynamodb/circles/dynamodb-circle-repository';
import { DynamodbCircleFactory } from '../../repository/dynamodb/circles/dynamodb-circle-factory';
import { UserRepositoryInterface } from '../../domain/models/users/user-repository-interface';
import { CircleRepositoryInterface } from '../../domain/models/circles/circle-repository-interface';
import { getEnvironmentVariable } from '../../util/get-environment';
import { CircleFactoryInterface } from '../../domain/models/circles/circle-factory-interface';

export class Bootstrap {
  private readonly tableName: string;
  private readonly gsi1Name: string;
  private readonly gsi2Name: string;
  private readonly gsi3Name: string;
  private readonly rootURI: string;
  private readonly documentClient: DynamoDB.DocumentClient;

  private userRepository?: UserRepositoryInterface;
  private circleRepository?: CircleRepositoryInterface;

  constructor() {
    const region = getEnvironmentVariable('AWS_REGION');

    this.tableName = getEnvironmentVariable('MAIN_TABLE_NAME');
    this.gsi1Name = getEnvironmentVariable('MAIN_TABLE_GSI1_NAME');
    this.gsi2Name = getEnvironmentVariable('MAIN_TABLE_GSI2_NAME');
    this.gsi3Name = getEnvironmentVariable('MAIN_TABLE_GSI3_NAME');
    this.rootURI = getEnvironmentVariable('ROOT_URI');
    this.documentClient = new DynamoDB.DocumentClient({
      apiVersion: '2012-08-10',
      region,
    });
  }

  getRootURI(): string {
    return this.rootURI;
  }

  getUserRepository(): UserRepositoryInterface {
    this.userRepository =
      this.userRepository ??
      new DynamodbUserRepository({
        documentClient: this.documentClient,
        tableName: this.tableName,
        gsi1Name: this.gsi1Name,
        gsi2Name: this.gsi2Name,
        gsi3Name: this.gsi3Name,
      });

    return this.userRepository;
  }

  getCircleRepository(): CircleRepositoryInterface {
    this.circleRepository =
      this.circleRepository ??
      new DynamodbCircleRepository({
        documentClient: this.documentClient,
        tableName: this.tableName,
        gsi1Name: this.gsi1Name,
      });

    return this.circleRepository;
  }

  getCircleFactory(): CircleFactoryInterface {
    return new DynamodbCircleFactory({
      userRepository: this.getUserRepository(),
      circleRepository: this.getCircleRepository(),
    });
  }
}
