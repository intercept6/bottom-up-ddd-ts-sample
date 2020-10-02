import { CircleGetController } from './circleGetController';
import { StubCircleGetService } from '../../../../application/circles/get/stubCircleGetService';
import { CircleData } from '../../../../application/circles/circleData';
import { Circle } from '../../../../domain/models/circles/circle';
import { CircleName } from '../../../../domain/models/circles/circleName';
import { UserId } from '../../../../domain/models/users/userId';
import { CircleId } from '../../../../domain/models/circles/circleId';
import { CircleNotFoundApplicationError } from '../../../../application/errors/applicationErrors';

const circleGetService = new StubCircleGetService();
const circleGetController = new CircleGetController(circleGetService);

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
      .spyOn(StubCircleGetService.prototype, 'handle')
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
    const response = await circleGetController.handle({
      pathParameters: { circleId },
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
      .spyOn(StubCircleGetService.prototype, 'handle')
      .mockRejectedValueOnce(
        new CircleNotFoundApplicationError(new CircleId(circleId))
      );

    const response = await circleGetController.handle({
      pathParameters: { circleId },
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
