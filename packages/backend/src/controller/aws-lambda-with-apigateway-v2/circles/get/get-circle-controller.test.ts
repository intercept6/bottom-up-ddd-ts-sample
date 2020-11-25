/* eslint-disable import/first */
process.env.AWS_REGION = 'ap-northeast-1';
process.env.MAIN_TABLE_NAME = 'test-table';
process.env.MAIL_TABLE_GSI1_NAME = 'gsi1';
process.env.MAIL_TABLE_GSI2_NAME = 'gsi2';
process.env.ROOT_URI = 'https://api.example.com/';

import { generateAPIGatewayProxyEventV2 } from '../../../../lib/tests/apigateway-event-v2-helper';
import { GetCircleController } from './get-circle-controller';
import { GetCircleServiceStub } from '../../../../application/circles/get/get-circle-service-stub';
import { CircleData } from '../../../../application/circles/circle-data';
import { Circle } from '../../../../domain/models/circles/circle';
import { CircleName } from '../../../../domain/models/circles/circle-name';
import { UserId } from '../../../../domain/models/users/user-id';
import { CircleId } from '../../../../domain/models/circles/circle-id';
import { CircleNotFoundApplicationError } from '../../../../application/errors/application-errors';

const getCircleServiceStub = new GetCircleServiceStub();
const getCircleController = new GetCircleController(getCircleServiceStub);

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル取得', () => {
  test('サークルを取得する', async () => {
    const circleId = 'f16dad24-126d-433b-9a54-2df15e2a4b29';
    const circleName = 'サークル名';
    const ownerId = '0defd678-27f2-4def-bf95-a99c709a8d93';
    const memberIds: UserId[] = [];
    jest
      .spyOn(GetCircleServiceStub.prototype, 'handle')
      .mockResolvedValueOnce(
        new CircleData(
          Circle.create(
            new CircleId(circleId),
            new CircleName(circleName),
            new UserId(ownerId),
            memberIds
          )
        )
      );
    const response = await getCircleController.handle({
      pathParameters: { circleId },
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        circle_id: circleId,
        circle_name: circleName,
        owner_id: ownerId,
        member_ids: memberIds,
      }),
    });
  });

  test('存在しないサークルを指定した場合はNotFoundを返す', async () => {
    const circleId = 'cd69509f-f4c4-4141-916f-fec53580d699';
    jest
      .spyOn(GetCircleServiceStub.prototype, 'handle')
      .mockRejectedValueOnce(
        new CircleNotFoundApplicationError(new CircleId(circleId))
      );

    const response = await getCircleController.handle({
      pathParameters: { circleId },
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        name: 'NotFound',
        message: `circle id: ${circleId} is notfound`,
      }),
    });
  });

  test('サークルIDが指定されていない場合はBadRequestを返す', async () => {
    const response = await getCircleController.handle({
      pathParameters: {},
      ...generateAPIGatewayProxyEventV2(),
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
