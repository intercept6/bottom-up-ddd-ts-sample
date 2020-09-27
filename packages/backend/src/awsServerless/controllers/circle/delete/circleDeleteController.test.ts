import { CircleDeleteController } from './circleDeleteController';
import { BootstrapForTest } from '../../../../lib/tests/bootstrapForTest';
import { DynamoDBHelper } from '../../../../lib/tests/dynamoDBHelper';

const tableName = 'circle-delete-controller-test-table';

let circleDeleteController: CircleDeleteController;
let bootstrap: BootstrapForTest;
let dynamoDBHelper: DynamoDBHelper;

beforeAll(async () => {
  bootstrap = await BootstrapForTest.create();
  circleDeleteController = bootstrap.getCircleDeleteController(tableName);
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
    circleId: '4ea20e0e-404e-4dc6-8917-a7bb7bf4ebdd',
    circleName: 'テストサークル名',
    ownerId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    memberIds: [],
  });
});

afterAll(async () => {
  await dynamoDBHelper.destructor();
});

describe('サークル削除', () => {
  test('サークルを削除する', async () => {
    const response = await circleDeleteController.handle({
      pathParameters: {
        circleId: '4ea20e0e-404e-4dc6-8917-a7bb7bf4ebdd',
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('サークルが存在しない場合も削除は成功する', async () => {
    const response = await circleDeleteController.handle({
      pathParameters: {
        circleId: '70856508-f1c0-481b-a16d-93d91e7128c8',
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });
});
