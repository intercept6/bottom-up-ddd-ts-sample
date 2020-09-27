import { CircleGetController } from './circleGetController';
import { DynamoDBHelper } from '../../../../lib/tests/dynamoDBHelper';
import { BootstrapForTest } from '../../../../lib/tests/bootstrapForTest';

const tableName = 'circle-get-controller-test-table';

let circleGetController: CircleGetController;
let bootstrap: BootstrapForTest;
let dynamoDBHelper: DynamoDBHelper;

beforeAll(async () => {
  bootstrap = await BootstrapForTest.create();
  circleGetController = bootstrap.getCircleGetController(tableName);
  dynamoDBHelper = await DynamoDBHelper.create({
    tableName,
    ddb: bootstrap.getDDB(),
    documentClient: bootstrap.getDocumentClient(),
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
