/* eslint-disable import/first */
import { generateAPIGatewayProxyEventV2 } from '../../../../lib/tests/apigateway-event-v2-helper';

const rootUri = 'https://api.example.com/';
process.env.AWS_REGION = 'ap-northeast-1';
process.env.MAIN_TABLE_NAME = 'test-table';
process.env.MAIL_TABLE_GSI1_NAME = 'gsi1';
process.env.MAIL_TABLE_GSI2_NAME = 'gsi2';
process.env.ROOT_URI = rootUri;

import { CircleDuplicateApplicationError } from '../../../../application/errors/application-errors';
import { CircleData } from '../../../../application/circles/circle-data';
import { StubCircleRegisterService } from '../../../../application/circles/register/stub-circle-register-service';
import { CircleRegisterController } from './circle-register-controller';
import { Circle } from '../../../../domain/models/circles/circle';
import { UserId } from '../../../../domain/models/users/user-id';
import { CircleName } from '../../../../domain/models/circles/circle-name';
import { CircleId } from '../../../../domain/models/circles/circle-id';

const circleRegisterService = new StubCircleRegisterService();
const circleRegisterController = new CircleRegisterController({
  circleRegisterService,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル新規登録', () => {
  test('サークルを新規登録する', async () => {
    const circleId = '6aa5da8c-e9a3-4289-ae1a-1f6e6c14f175';
    const circleName = 'テストサークル名';
    const ownerId = '206d7414-7072-4a98-9505-c780b5a9bdd1';
    const memberIds: UserId[] = [];
    jest
      .spyOn(StubCircleRegisterService.prototype, 'handle')
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

    const response = await circleRegisterController.handle({
      body: JSON.stringify({
        circle_name: circleName,
        owner_id: ownerId,
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 201,
      body: JSON.stringify({}),
      headers: {
        location: `${rootUri}circles/${circleId}`,
      },
    });
  });

  test('サークル名が重複するサークルは新規登録できない', async () => {
    const circleName = '重複するサークル名';
    jest
      .spyOn(StubCircleRegisterService.prototype, 'handle')
      .mockRejectedValueOnce(
        new CircleDuplicateApplicationError(new CircleName(circleName))
      );
    const response = await circleRegisterController.handle({
      body: JSON.stringify({
        circle_name: circleName,
        owner_id: '206d7414-7072-4a98-9505-c780b5a9bdd1',
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        name: 'Conflict',
        message: `circle_name ${circleName} is already exist`,
      }),
    });
  });
});
