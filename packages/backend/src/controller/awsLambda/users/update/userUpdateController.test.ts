import { UserUpdateController } from './userUpdateController';
import { StubUserUpdateService } from '../../../../application/user/update/stubUserUpdateService';
import { UserNotFoundApplicationError } from '../../../../application/error/error';
import { UserId } from '../../../../domain/models/users/userId';

const userUpdateService = new StubUserUpdateService();
const userUpdateController = new UserUpdateController({ userUpdateService });

afterEach(() => {
  jest.clearAllMocks();
});

describe('ユーザー更新', () => {
  test('ユーザー名を更新する', async () => {
    jest
      .spyOn(StubUserUpdateService.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({
        user_name: '更新されたユーザー名',
      }),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('メールアドレスを更新する', async () => {
    jest
      .spyOn(StubUserUpdateService.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({
        mail_address: 'updated@example.com',
      }),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('ユーザー名とメールアドレスを更新する', async () => {
    jest
      .spyOn(StubUserUpdateService.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({
        user_name: '更新されたユーザー名',
        mail_address: 'updated@example.com',
      }),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('ユーザーが存在しない場合は更新に失敗する', async () => {
    const userId = 'ca00d9c4-eecf-47f4-9e89-be7f9836053f';
    jest
      .spyOn(StubUserUpdateService.prototype, 'handle')
      .mockRejectedValueOnce(
        new UserNotFoundApplicationError(new UserId(userId))
      );

    const response = await userUpdateController.handle({
      pathParameters: { userId },
      body: JSON.stringify({
        user_name: '更新されたユーザー名',
        mail_address: 'updated@example.com',
      }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: `user id: ${userId} is not found`,
      }),
    });
  });

  test('ユーザー名もメールアドレスも指定されない', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({}),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user_name type and mail_address are undefined',
      }),
    });
  });

  test('ユーザー名がstring型ではない', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({ user_name: 1 }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user_name type is not string',
      }),
    });
  });

  test('メールアドレスがstring型ではない', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({ mail_address: 1 }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'mail_address type is not string',
      }),
    });
  });

  test('ユーザー名もメールアドレスもstring型ではない', async () => {
    const response = await userUpdateController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({ user_name: 1, mail_address: 1 }),
    });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user_name type is not string',
      }),
    });
  });
});
