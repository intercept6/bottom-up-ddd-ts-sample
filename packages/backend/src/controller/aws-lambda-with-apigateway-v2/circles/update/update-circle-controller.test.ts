/* eslint-disable import/first */
process.env.AWS_REGION = 'ap-northeast-1';
process.env.MAIN_TABLE_NAME = 'test-table';
process.env.MAIN_TABLE_GSI1_NAME = 'gsi1';
process.env.MAIN_TABLE_GSI2_NAME = 'gsi2';
process.env.MAIN_TABLE_GSI3_NAME = 'gsi3';
process.env.ROOT_URI = 'https://api.example.com/';

import { generateAPIGatewayProxyEventV2 } from '../../../../lib/tests/apigateway-event-v2-helper';
import { UpdateCircleController } from './update-circle-controller';
import { UpdateCircleServiceStub } from '../../../../application/circles/update/update-circle-service-stub';
import {
  MembersNotFoundApplicationError,
  OwnerNotFoundApplicationError,
} from '../../../../application/errors/application-errors';
import { UserId } from '../../../../domain/models/users/user-id';

const updateCircleService = new UpdateCircleServiceStub();
const updateCircleController = new UpdateCircleController({
  updateCircleService,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル更新', () => {
  test('サークル名を更新する', async () => {
    jest
      .spyOn(UpdateCircleServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await updateCircleController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        circle_name: '更新されたサークル名',
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('サークルオーナーを更新する', async () => {
    jest
      .spyOn(UpdateCircleServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await updateCircleController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        owner_id: 'fdc536b3-d792-431f-9ede-0b5973759785',
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('メンバーを追加する', async () => {
    jest
      .spyOn(UpdateCircleServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await updateCircleController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        member_ids: ['00fe320d-eb24-4283-ad1b-db7ee3954a7b'],
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('変更対象をしていしないとBadRequestを返す', async () => {
    const response = await updateCircleController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({}),
      ...generateAPIGatewayProxyEventV2(),
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
    const ownerId = 'fdc536b3-d792-431f-9ede-0b5973759785';
    jest
      .spyOn(UpdateCircleServiceStub.prototype, 'handle')
      .mockRejectedValueOnce(
        new OwnerNotFoundApplicationError(new UserId(ownerId))
      );

    const response = await updateCircleController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        owner_id: ownerId,
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: `owner id: ${ownerId} is not found`,
      }),
    });
  });

  test('追加メンバーに存在しないユーザーを指定するとBadRequestを返す', async () => {
    const memberIds = [
      'fdc536b3-d792-431f-9ede-0b5973759785',
      'cc97e903-996a-4f98-99b0-514091f2e676',
    ];
    jest
      .spyOn(UpdateCircleServiceStub.prototype, 'handle')
      .mockRejectedValueOnce(
        new MembersNotFoundApplicationError(
          memberIds.map((value) => new UserId(value))
        )
      );

    const response = await updateCircleController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        member_ids: memberIds,
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: `member ids: ${memberIds.join(',')} is not found`,
      }),
    });
  });
});
