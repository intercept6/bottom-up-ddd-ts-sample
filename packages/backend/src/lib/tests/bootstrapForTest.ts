import { Credentials, DynamoDB } from 'aws-sdk';
import { DynamoDBUserRepository } from '../../repository/user/dynamoDBUserRepository';
import { UserDeleteService } from '../../application/user/delete/userDeleteService';
import { UserDeleteController } from '../../awsServerless/controllers/user/delete/userDeleteController';
import { DynamoDBCircleRepository } from '../../repository/circle/dynamoDBCircleRepository';
import { DynamoDBCircleFactory } from '../../repository/circle/dynamoDBCircleFactory';
import { CircleRegisterController } from '../../awsServerless/controllers/circle/register/circleRegisterController';
import { CircleRegisterService } from '../../application/circle/register/circleRegisterService';
import { CircleGetController } from '../../awsServerless/controllers/circle/get/circleGetController';
import { CircleGetService } from '../../application/circle/get/circleGetService';
import { UserGetService } from '../../application/user/get/userGetService';
import { UserGetController } from '../../awsServerless/controllers/user/get/userGetController';
import { UserRegisterController } from '../../awsServerless/controllers/user/register/userRegisterController';
import { UserRegisterService } from '../../application/user/register/userRegisterService';
import { UserUpdateController } from '../../awsServerless/controllers/user/update/userUpdateController';
import { UserUpdateService } from '../../application/user/update/userUpdateService';
import { CircleUpdateController } from '../../awsServerless/controllers/circle/update/circleUpdateController';
import { CircleUpdateService } from '../../application/circle/update/circleUpdateService';
import { CircleDeleteController } from '../../awsServerless/controllers/circle/delete/circleDeleteController';
import { CircleDeleteService } from '../../application/circle/delete/circleDeleteService';

export class BootstrapForTest {
  private readonly region = 'local';
  private readonly gsi1Name = 'gsi1';
  private readonly gsi2Name = 'gsi2';

  private static _instance: BootstrapForTest;
  private readonly ddb: DynamoDB;
  private readonly documentClient: DynamoDB.DocumentClient;

  static async create() {
    if (this._instance == null) {
      this._instance = new BootstrapForTest();
    }

    return this._instance;
  }

  private constructor() {
    const credentials = new Credentials({
      secretAccessKey: 'dummy',
      accessKeyId: 'dummy',
    });
    const params:
      | DynamoDB.ClientConfiguration
      | DynamoDB.DocumentClient.DocumentClientOptions = {
      apiVersion: '2012-08-10',
      region: this.region,
      endpoint: 'http://localhost:8000',
      credentials,
    };

    this.ddb = new DynamoDB(params);
    this.documentClient = new DynamoDB.DocumentClient(params);
  }

  getDDB() {
    return this.ddb;
  }

  getDocumentClient() {
    return this.documentClient;
  }

  private getUserRepository(tableName: string) {
    return new DynamoDBUserRepository({
      documentClient: this.documentClient,
      tableName,
      gsi1Name: this.gsi1Name,
      gsi2Name: this.gsi2Name,
    });
  }

  private getCircleRepository(tableName: string) {
    return new DynamoDBCircleRepository({
      tableName,
      documentClient: this.documentClient,
      gsi1Name: this.gsi1Name,
    });
  }

  private static getCircleFactory(props: {
    userRepository: DynamoDBUserRepository;
    circleRepository: DynamoDBCircleRepository;
  }) {
    return new DynamoDBCircleFactory({
      userRepository: props.userRepository,
      circleRepository: props.circleRepository,
    });
  }

  getUserRegisterController(tableName: string) {
    const userRepository = this.getUserRepository(tableName);
    const userRegisterService = new UserRegisterService({ userRepository });
    return new UserRegisterController(userRegisterService);
  }

  getUserGetController(tableName: string) {
    const userRepository = this.getUserRepository(tableName);
    const userGetService = new UserGetService({ userRepository });
    return new UserGetController(userGetService);
  }

  getUserUpdateController(tableName: string) {
    const userRepository = this.getUserRepository(tableName);
    const userUpdateService = new UserUpdateService({ userRepository });
    return new UserUpdateController(userUpdateService);
  }

  getUserDeleteController(tableName: string) {
    const userRepository = this.getUserRepository(tableName);
    const userDeleteService = new UserDeleteService({ userRepository });
    return new UserDeleteController(userDeleteService);
  }

  getCircleRegisterController(tableName: string) {
    const userRepository = this.getUserRepository(tableName);
    const circleRepository = this.getCircleRepository(tableName);
    const circleFactory = BootstrapForTest.getCircleFactory({
      userRepository,
      circleRepository,
    });
    const circleRegisterService = new CircleRegisterService({
      userRepository,
      circleRepository,
      circleFactory,
    });
    return new CircleRegisterController({ circleRegisterService });
  }

  getCircleGetController(tableName: string) {
    const circleRepository = this.getCircleRepository(tableName);
    const circleGetService = new CircleGetService({ circleRepository });
    return new CircleGetController(circleGetService);
  }

  getCircleUpdateController(tableName: string) {
    const userRepository = this.getUserRepository(tableName);
    const circleRepository = this.getCircleRepository(tableName);
    const circleUpdateService = new CircleUpdateService({
      userRepository,
      circleRepository,
    });
    return new CircleUpdateController({ circleUpdateService });
  }

  getCircleDeleteController(tableName: string) {
    const circleRepository = this.getCircleRepository(tableName);
    const circleDeleteService = new CircleDeleteService({ circleRepository });
    return new CircleDeleteController({ circleDeleteService });
  }
}
