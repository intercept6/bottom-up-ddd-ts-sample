/* eslint-disable import/first */
const rootUri = 'https://api.example.com/';
process.env.ROOT_URI = rootUri;

import { CircleDuplicateApplicationError } from '../../../../application/error/error';
import { CircleData } from '../../../../application/circle/circleData';
import { StubCircleRegisterService } from '../../../../application/circle/register/stubCircleRegisterService';
import { CircleRegisterController } from './circleRegisterController';
import { Circle } from '../../../../domain/models/circles/circle';
import { UserId } from '../../../../domain/models/users/userId';
import { CircleName } from '../../../../domain/models/circles/circleName';
import { CircleId } from '../../../../domain/models/circles/circleId';

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
