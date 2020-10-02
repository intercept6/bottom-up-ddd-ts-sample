import { CircleUpdateController } from './circleUpdateController';
import { StubCircleUpdateService } from '../../../../application/circle/update/stubCircleUpdateService';
import {
  MembersNotFoundApplicationError,
  OwnerNotFoundApplicationError,
} from '../../../../application/error/error';
import { UserId } from '../../../../domain/models/user/userId';

const circleUpdateService = new StubCircleUpdateService();
const circleUpdateController = new CircleUpdateController({
  circleUpdateService,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル更新', () => {
  test('サークル名を更新する', async () => {
    jest
      .spyOn(StubCircleUpdateService.prototype, 'handle')
      .mockResolvedValueOnce();

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
  });

  test('サークルオーナーを更新する', async () => {
    jest
      .spyOn(StubCircleUpdateService.prototype, 'handle')
      .mockResolvedValueOnce();

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
  });

  test('メンバーを追加する', async () => {
    jest
      .spyOn(StubCircleUpdateService.prototype, 'handle')
      .mockResolvedValueOnce();

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
    const ownerId = 'fdc536b3-d792-431f-9ede-0b5973759785';
    jest
      .spyOn(StubCircleUpdateService.prototype, 'handle')
      .mockRejectedValueOnce(
        new OwnerNotFoundApplicationError(new UserId(ownerId))
      );

    const response = await circleUpdateController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        owner_id: ownerId,
      }),
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
      .spyOn(StubCircleUpdateService.prototype, 'handle')
      .mockRejectedValueOnce(
        new MembersNotFoundApplicationError(
          memberIds.map((value) => new UserId(value))
        )
      );

    const response = await circleUpdateController.handle({
      pathParameters: { circleId: 'f16dad24-126d-433b-9a54-2df15e2a4b29' },
      body: JSON.stringify({
        member_ids: memberIds,
      }),
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
