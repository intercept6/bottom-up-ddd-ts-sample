import { UserGetController } from './userGetController';
import { DynamoDBHelper } from '../../../../lib/tests/dynamoDBHelper';
import { BootstrapForTest } from '../../../../lib/tests/bootstrapForTest';

const tableName = 'user-get-controller-test-table';

let userGetController: UserGetController;
let bootstrap: BootstrapForTest;
let dynamoDBHelper: DynamoDBHelper;

beforeAll(async () => {
  bootstrap = await BootstrapForTest.create();
  userGetController = bootstrap.getUserGetController(tableName);
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

describe('ユーザー取得', () => {
  test('ユーザーを取得する', async () => {
    const response = await userGetController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
    });

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        user_id: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
        user_name: 'ユーザー１',
        mail_address: 'user1@example.com',
      }),
    });
  });

  test('ユーザーが存在しない', async () => {
    const response = await userGetController.handle({
      pathParameters: { userId: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1' },
    });

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        name: 'NotFound',
        message: 'user id: 66d73617-aa4f-46b3-bf7d-9c193f0a08d1 is not found',
      }),
    });
  });

  test('ユーザーIDが指定されていない', async () => {
    const response = await userGetController.handle({
      pathParameters: {},
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user id type is not string',
      }),
    });
  });

  test('ユーザーIDがstring型ではない', async () => {
    const response = await userGetController.handle({
      pathParameters: { userId: 1 },
    } as any);

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user id type is not string',
      }),
    });
  });
});
