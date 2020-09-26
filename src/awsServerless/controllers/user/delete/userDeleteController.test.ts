import { UserDeleteController } from '#/awsServerless/controllers/user/delete/userDeleteController';
import { DynamoDBHelper } from '#/lib/tests/dynamoDBHelper';
import { BootstrapForTest } from '#/lib/tests/bootstrapForTest';

const tableName = 'user-delete-controller-test-table';

let userDeleteController: UserDeleteController;
let bootstrap: BootstrapForTest;
let dynamoDBHelper: DynamoDBHelper;

beforeAll(async () => {
  bootstrap = await BootstrapForTest.create();
  userDeleteController = bootstrap.getUserDeleteController(tableName);
  dynamoDBHelper = await DynamoDBHelper.create({
    tableName,
    ddb: bootstrap.getDDB(),
    documentClient: bootstrap.getDocumentClient(),
  });
  await dynamoDBHelper.createUser({
    userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
    userName: 'ユーザー１',
    mailAddress: 'user1@example.com',
  });
});

afterAll(async () => {
  await dynamoDBHelper.destructor();
});

describe('ユーザー削除', () => {
  test('ユーザーを削除する', async () => {
    const response = await userDeleteController.handle({
      pathParameters: {
        userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('ユーザーが存在しない場合も削除は成功する', async () => {
    const response = await userDeleteController.handle({
      pathParameters: {
        userId: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1',
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });
});
