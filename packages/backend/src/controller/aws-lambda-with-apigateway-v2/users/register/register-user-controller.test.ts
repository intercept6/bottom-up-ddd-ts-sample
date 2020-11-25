/* eslint-disable import/first */
const rootUri = 'https://api.example.com/';
process.env.AWS_REGION = 'ap-northeast-1';
process.env.MAIN_TABLE_NAME = 'test-table';
process.env.MAIN_TABLE_GSI1_NAME = 'gsi1';
process.env.MAIN_TABLE_GSI2_NAME = 'gsi2';
process.env.MAIN_TABLE_GSI3_NAME = 'gsi3';
process.env.ROOT_URI = rootUri;

import { generateAPIGatewayProxyEventV2 } from '../../../../lib/tests/apigateway-event-v2-helper';
import { UserDuplicateApplicationError } from '../../../../application/errors/application-errors';
import { MailAddress } from '../../../../domain/models/users/mail-address';
import { User } from '../../../../domain/models/users/user';
import { RegisterUserServiceStub } from '../../../../application/users/register/register-user-service-stub';
import { RegisterUserController } from './register-user-controller';
import { UserName } from '../../../../domain/models/users/user-name';
import { UserId } from '../../../../domain/models/users/user-id';
import { UserData } from '../../../../application/users/user-data';

const registerUserService = new RegisterUserServiceStub();
const registerUserController = new RegisterUserController({
  registerUserService,
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
      .spyOn(RegisterUserServiceStub.prototype, 'handle')
      .mockResolvedValueOnce(
        new UserData(
          new User(
            new UserId(userId),
            new UserName(userName),
            new MailAddress(mailAddress)
          )
        )
      );
    const response = await registerUserController.handle({
      body: JSON.stringify({
        user_name: userName,
        mail_address: mailAddress,
      }),
      ...generateAPIGatewayProxyEventV2(),
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
      .spyOn(RegisterUserServiceStub.prototype, 'handle')
      .mockRejectedValueOnce(
        new UserDuplicateApplicationError(new UserName(userName))
      );

    const response = await registerUserController.handle({
      body: JSON.stringify({
        user_name: userName,
        mail_address: mailAddress,
      }),
      ...generateAPIGatewayProxyEventV2(),
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
      .spyOn(RegisterUserServiceStub.prototype, 'handle')
      .mockRejectedValueOnce(
        new UserDuplicateApplicationError(new MailAddress(mailAddress))
      );

    const response = await registerUserController.handle({
      body: JSON.stringify({
        user_name: userName,
        mail_address: mailAddress,
      }),
      ...generateAPIGatewayProxyEventV2(),
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
