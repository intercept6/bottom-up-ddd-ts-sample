/* eslint-disable import/first */
const rootUri = 'https://api.example.com';
process.env.ROOT_URI = rootUri;

import { Credentials, DynamoDB } from 'aws-sdk';
import { DynamoDBUserRepository } from '#/repository/user/dynamoDBUserRepository';
import { DynamoDBHelper } from '#/lib/tests/dynamoDBHelper';
import { CircleRegisterService } from '#/application/circle/register/circleRegisterService';
import { DynamoDBCircleRepository } from '#/repository/circle/dynamoDBCircleRepository';
import { DynamoDBCircleFactory } from '#/repository/circle/dynamoDBCircleFactory';
import { CircleRegisterController } from '#/awsServerless/controllers/circle/register/circleRegisterController';

const region = 'local';
const tableName = 'circle-register-controller-test-table';
const gsi1Name = 'gsi1';

const ddb = new DynamoDB({
  apiVersion: '2012-08-10',
  region,
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});
const documentClient = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region,
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});

const userRepository = new DynamoDBUserRepository({
  documentClient,
  tableName,
  gsi1Name: 'gsi1',
  gsi2Name: 'gsi2',
});
const circleRepository = new DynamoDBCircleRepository({
  tableName,
  documentClient,
  gsi1Name,
});
const circleFactory = new DynamoDBCircleFactory({
  userRepository,
  circleRepository,
});
const circleRegisterService = new CircleRegisterService({
  circleRepository,
  userRepository,
  circleFactory,
});
const circleRegisterController = new CircleRegisterController({
  circleRegisterService,
});

let dynamoDBHelper: DynamoDBHelper;

beforeEach(async () => {
  dynamoDBHelper = await DynamoDBHelper.create({
    tableName,
    ddb,
    documentClient,
  });
  await dynamoDBHelper.createUser({
    userId: '206d7414-7072-4a98-9505-c780b5a9bdd1',
    userName: 'テストオーナー',
    mailAddress: 'test@example.com',
  });
});

afterEach(async () => {
  await dynamoDBHelper.destructor();
});

describe('サークル新規登録', () => {
  test('サークルを新規登録する', async () => {
    const response = await circleRegisterController.handle({
      body: JSON.stringify({
        circle_name: 'テストサークル名',
        owner_id: '206d7414-7072-4a98-9505-c780b5a9bdd1',
      }),
    });

    expect(response).toEqual({
      statusCode: 201,
      body: JSON.stringify({}),
      headers: {
        location: expect.stringMatching(
          /^https:\/\/api.example.com\/circles\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
        ),
      },
    });
  });

  test('サークル名が重複するサークルは新規登録できない', async () => {
    await dynamoDBHelper.createCircle({
      circleId: '10c3b5fd-12e4-44cf-985e-785ff0c4ae1c',
      circleName: '重複するサークル名',
      ownerId: '206d7414-7072-4a98-9505-c780b5a9bdd1',
      memberIds: [],
    });

    const response = await circleRegisterController.handle({
      body: JSON.stringify({
        circle_name: '重複するサークル名',
        owner_id: '206d7414-7072-4a98-9505-c780b5a9bdd1',
      }),
    });

    expect(response).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        name: 'Conflict',
        message: 'circle_name 重複するサークル名 is already exist',
      }),
    });
  });
});
