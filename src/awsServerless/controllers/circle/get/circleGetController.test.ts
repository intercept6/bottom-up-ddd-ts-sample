import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Credentials, DynamoDB } from 'aws-sdk';
import { CircleGetService } from '#/application/circle/get/circleGetService';
import { CircleGetController } from '#/awsServerless/controllers/circle/get/circleGetController';
import { DynamoDBHelper } from '#/lib/tests/dynamoDBHelper';
import { DynamoDBCircleRepository } from '#/repository/circle/dynamoDBCircleRepository';

const region = 'local';
const tableName = 'circle-get-controller-test-table';
const ddb = new DynamoDB({
  apiVersion: '2012-08-10',
  region,
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});
const documentClient = new DocumentClient({
  apiVersion: '2012-08-10',
  region,
  endpoint: 'http://localhost:8000',
  credentials: new Credentials({
    secretAccessKey: 'dummy',
    accessKeyId: 'dummy',
  }),
});

const circleRepository = new DynamoDBCircleRepository({
  documentClient,
  tableName,
  gsi1Name: 'gsi1',
});
const circleGetService = new CircleGetService({
  circleRepository: circleRepository,
});
const circleGetController = new CircleGetController(circleGetService);

let dynamoDBHelper: DynamoDBHelper;

beforeAll(async () => {
  dynamoDBHelper = await DynamoDBHelper.create({
    tableName,
    ddb,
    documentClient,
  });
  const userId = '0defd678-27f2-4def-bf95-a99c709a8d93';
  await dynamoDBHelper.createUser({
    userId,
    userName: 'テストユーザー名',
    mailAddress: 'test@example.com',
  });
  await dynamoDBHelper.createCircle({
    circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29',
    circleName: 'サークル名',
    ownerId: userId,
    memberIds: [],
  });
});

afterAll(async () => {
  await dynamoDBHelper.destructor();
});

describe('サークル取得', () => {
  test('サークルを取得する', async () => {
    const response = await circleGetController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
    });

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        circle_id: 'f16dad24-126d-433b-9a54-2df15e2a4b29',
        circle_name: 'サークル名',
        owner_id: '0defd678-27f2-4def-bf95-a99c709a8d93',
        member_ids: [],
      }),
    });
  });

  test('存在しないサークルを指定した場合はNotFoundを返す', async () => {
    const response = await circleGetController.handle({
      pathParameters: { circleId: 'cd69509f-f4c4-4141-916f-fec53580d699' },
    });

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        name: 'NotFound',
        message: 'circle id: cd69509f-f4c4-4141-916f-fec53580d699 is notfound',
      }),
    });
  });

  test('サークルIDが指定されていない場合はBadRequestを返す', async () => {
    const response = await circleGetController.handle({
      pathParameters: {},
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'circle id type is not string',
      }),
    });
  });

  test('サークルIDがstring型ではない場合はBadRequestを返す', async () => {
    const response = await circleGetController.handle({
      pathParameters: { circleId: 1 } as any,
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'circle id type is not string',
      }),
    });
  });
});
