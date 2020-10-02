import { UserDeleteController } from './userDeleteController';
import { StubUserDeleteService } from '../../../../application/users/delete/stubUserDeleteService';

const userDeleteService = new StubUserDeleteService();
const userDeleteController = new UserDeleteController({ userDeleteService });

afterEach(() => {
  jest.clearAllMocks();
});

describe('ユーザー削除', () => {
  test('ユーザーを削除する', async () => {
    jest
      .spyOn(StubUserDeleteService.prototype, 'handle')
      .mockResolvedValueOnce();

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
    jest
      .spyOn(StubUserDeleteService.prototype, 'handle')
      .mockResolvedValueOnce();

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
