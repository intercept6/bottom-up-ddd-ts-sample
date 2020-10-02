/* eslint-disable import/first */
const rootUri = 'https://api.example.com/';
process.env.ROOT_URI = rootUri;

import { UserDuplicateApplicationError } from '../../../../application/errors/applicationErrors';
import { MailAddress } from '../../../../domain/models/users/mailAddress';
import { User } from '../../../../domain/models/users/user';
import { StubUserRegisterService } from '../../../../application/users/register/stubUserRegisterService';
import { UserRegisterController } from './userRegisterController';
import { UserName } from '../../../../domain/models/users/userName';
import { UserId } from '../../../../domain/models/users/userId';
import { UserData } from '../../../../application/users/userData';

const userRegisterService = new StubUserRegisterService();
const userRegisterController = new UserRegisterController({
  userRegisterService,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ユーザー新規登録', () => {
  test('ユーザーを作成する', async () => {
    const userId = '83bc2e01-5550-4507-b657-e28a351125df';
    const userName = 'テストユーザー名';
    const mailAddress = 'user1@example.com';
    jest
      .spyOn(StubUserRegisterService.prototype, 'handle')
      .mockResolvedValueOnce(
        new UserData(
          new User(
            new UserId(userId),
            new UserName(userName),
            new MailAddress(mailAddress)
          )
        )
      );
    const response = await userRegisterController.handle({
      body: JSON.stringify({
        user_name: userName,
        mail_address: mailAddress,
      }),
    });

    expect(response).toEqual({
      statusCode: 201,
      body: JSON.stringify({}),
      headers: {
        location: `${rootUri}users/${userId}`,
      },
    });
  });

  test('ユーザー名が重複するユーザーは作成できない', async () => {
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(StubUserRegisterService.prototype, 'handle')
      .mockRejectedValueOnce(
        new UserDuplicateApplicationError(new UserName(userName))
      );

    const response = await userRegisterController.handle({
      body: JSON.stringify({
        user_name: userName,
        mail_address: mailAddress,
      }),
    });

    expect(response).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        name: 'Conflict',
        message: `user name: ${userName} is already exist`,
      }),
    });
  });

  test('メールアドレスが重複するユーザーは作成できない', async () => {
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(StubUserRegisterService.prototype, 'handle')
      .mockRejectedValueOnce(
        new UserDuplicateApplicationError(new MailAddress(mailAddress))
      );

    const response = await userRegisterController.handle({
      body: JSON.stringify({
        user_name: userName,
        mail_address: mailAddress,
      }),
    });

    expect(response).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        name: 'Conflict',
        message: `user mailAddress: ${mailAddress} is already exist`,
      }),
    });
  });
});
