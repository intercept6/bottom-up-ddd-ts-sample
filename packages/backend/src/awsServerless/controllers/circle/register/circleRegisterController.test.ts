/* eslint-disable import/first */
const rootUri = 'https://api.example.com';
process.env.ROOT_URI = rootUri;

import { BootstrapForTest } from '../../../../lib/tests/bootstrapForTest';
import { DynamoDBHelper } from '../../../../lib/tests/dynamoDBHelper';
import { CircleRegisterController } from './circleRegisterController';

const tableName = 'circle-register-controller-test-table';

let circleRegisterController: CircleRegisterController;
let bootstrap: BootstrapForTest;
let dynamoDBHelper: DynamoDBHelper;

beforeEach(async () => {
  bootstrap = await BootstrapForTest.create();
  circleRegisterController = bootstrap.getCircleRegisterController(tableName);
  dynamoDBHelper = await DynamoDBHelper.create({
    tableName,
    ddb: bootstrap.getDDB(),
    documentClient: bootstrap.getDocumentClient(),
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
