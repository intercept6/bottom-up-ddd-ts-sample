import { UserGetController } from './userGetController';
import { StubUserGetService } from '../../../../application/user/get/stubUserGetService';
import { User } from '../../../../domain/models/users/user';
import { UserId } from '../../../../domain/models/users/userId';
import { UserName } from '../../../../domain/models/users/userName';
import { MailAddress } from '../../../../domain/models/users/mailAddress';
import { UserData } from '../../../../application/user/userData';
import { UserNotFoundApplicationError } from '../../../../application/error/error';

const userGetService = new StubUserGetService();
const userGetController = new UserGetController({ userGetService });

describe('ユーザー取得', () => {
  test('ユーザーを取得する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
    const mailAddress = 'user1@example.com';
    jest
      .spyOn(StubUserGetService.prototype, 'handle')
      .mockResolvedValueOnce(
        new UserData(
          new User(
            new UserId(userId),
            new UserName(userName),
            new MailAddress(mailAddress)
          )
        )
      );

    const response = await userGetController.handle({
      pathParameters: { userId },
    });

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        user_id: userId,
        user_name: userName,
        mail_address: mailAddress,
      }),
    });
  });

  test('ユーザーが存在しない', async () => {
    const userId = '66d73617-aa4f-46b3-bf7d-9c193f0a08d1';
    jest
      .spyOn(StubUserGetService.prototype, 'handle')
      .mockRejectedValueOnce(
        new UserNotFoundApplicationError(new UserId(userId))
      );
    const response = await userGetController.handle({
      pathParameters: { userId },
    });

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        name: 'NotFound',
        message: `user id: ${userId} is not found`,
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
