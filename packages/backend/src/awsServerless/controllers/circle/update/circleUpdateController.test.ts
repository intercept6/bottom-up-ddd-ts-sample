import { CircleUpdateController } from './circleUpdateController';
import { BootstrapForTest } from '../../../../lib/tests/bootstrapForTest';
import { DynamoDBHelper } from '../../../../lib/tests/dynamoDBHelper';

const tableName = 'circle-update-controller-test-table';

let circleUpdateController: CircleUpdateController;
let bootstrap: BootstrapForTest;
let dynamoDBHelper: DynamoDBHelper;

beforeEach(async () => {
  bootstrap = await BootstrapForTest.create();
  circleUpdateController = bootstrap.getCircleUpdateController(tableName);
  dynamoDBHelper = await DynamoDBHelper.create({
    tableName,
    ddb: bootstrap.getDDB(),
    documentClient: bootstrap.getDocumentClient(),
  });
  await dynamoDBHelper.createUser({
    userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    userName: 'ユーザー1',
    mailAddress: 'user1@example.com',
  });
  await dynamoDBHelper.createCircle({
    circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29',
    circleName: 'サークル名',
    ownerId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    memberIds: [],
  });
});

afterEach(async () => {
  await dynamoDBHelper.destructor();
});

describe('サークル更新', () => {
  test('サークル名を更新する', async () => {
    const response = await circleUpdateController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        circle_name: '更新されたサークル名',
      }),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
    const dbResponse = await dynamoDBHelper.getCircle({
      circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29',
    });
    expect(dbResponse).toEqual({
      circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29',
      circleName: '更新されたサークル名',
      ownerId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      memberIds: [],
    });
  });

  test('サークルオーナーを更新する', async () => {
    await dynamoDBHelper.createUser({
      userId: 'fdc536b3-d792-431f-9ede-0b5973759785',
      userName: '新オーナー',
      mailAddress: 'new-owner@example.com',
    });

    const response = await circleUpdateController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        owner_id: 'fdc536b3-d792-431f-9ede-0b5973759785',
      }),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });

    const dbResponse = await dynamoDBHelper.getCircle({
      circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29',
    });
    expect(dbResponse).toEqual({
      circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29',
      circleName: 'サークル名',
      ownerId: 'fdc536b3-d792-431f-9ede-0b5973759785',
      memberIds: [],
    });
  });

  test('メンバーを追加する', async () => {
    await dynamoDBHelper.createUser({
      userId: '00fe320d-eb24-4283-ad1b-db7ee3954a7b',
      userName: '新メンバー',
      mailAddress: 'new-owner@example.com',
    });

    const response = await circleUpdateController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        member_ids: ['00fe320d-eb24-4283-ad1b-db7ee3954a7b'],
      }),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });

    const dbResponse = await dynamoDBHelper.getCircle({
      circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29',
    });
    expect(dbResponse).toEqual({
      circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29',
      circleName: 'サークル名',
      ownerId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      memberIds: ['00fe320d-eb24-4283-ad1b-db7ee3954a7b'],
    });
  });

  test('変更対象をしていしないとBadRequestを返す', async () => {
    const response = await circleUpdateController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({}),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'circle_name, owner_id or member_ids are undefined',
      }),
    });
  });

  test('サークルオーナーに存在しないユーザーを指定するとBadRequestを返す', async () => {
    const response = await circleUpdateController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        owner_id: 'fdc536b3-d792-431f-9ede-0b5973759785',
      }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'owner id: fdc536b3-d792-431f-9ede-0b5973759785 is not found',
      }),
    });
  });

  test('追加メンバーに存在しないユーザーを指定するとBadRequestを返す', async () => {
    const response = await circleUpdateController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        member_ids: ['fdc536b3-d792-431f-9ede-0b5973759785'],
      }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message:
          'member ids: fdc536b3-d792-431f-9ede-0b5973759785 is not found',
      }),
    });
  });
});
