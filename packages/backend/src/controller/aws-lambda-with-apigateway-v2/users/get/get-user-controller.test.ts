/* eslint-disable import/first */
process.env.AWS_REGION = 'ap-northeast-1';
process.env.MAIN_TABLE_NAME = 'test-table';
process.env.MAIN_TABLE_GSI1_NAME = 'gsi1';
process.env.MAIN_TABLE_GSI2_NAME = 'gsi2';
process.env.MAIN_TABLE_GSI3_NAME = 'gsi3';
process.env.ROOT_URI = 'https://api.example.com/';

import { generateAPIGatewayProxyEventV2 } from '../../../../lib/tests/apigateway-event-v2-helper';
import { GetUserController } from './get-user-controller';
import { GetUserServiceStub } from '../../../../application/users/get/get-user-service-stub';
import { User } from '../../../../domain/models/users/user';
import { UserId } from '../../../../domain/models/users/user-id';
import { UserName } from '../../../../domain/models/users/user-name';
import { MailAddress } from '../../../../domain/models/users/mail-address';
import { UserData } from '../../../../application/users/user-data';
import { UserNotFoundApplicationError } from '../../../../application/errors/application-errors';

const getUserService = new GetUserServiceStub();
const getUserController = new GetUserController({ getUserService });

describe('ユーザー取得', () => {
  test('ユーザーを取得する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
    const mailAddress = 'user1@example.com';
    jest
      .spyOn(GetUserServiceStub.prototype, 'handle')
      .mockResolvedValueOnce(
        new UserData(
          new User(
            new UserId(userId),
            new UserName(userName),
            new MailAddress(mailAddress)
          )
        )
      );

    const response = await getUserController.handle({
      pathParameters: { userId },
      ...generateAPIGatewayProxyEventV2(),
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
      .spyOn(GetUserServiceStub.prototype, 'handle')
      .mockRejectedValueOnce(
        new UserNotFoundApplicationError(new UserId(userId))
      );
    const response = await getUserController.handle({
      pathParameters: { userId },
      ...generateAPIGatewayProxyEventV2(),
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
    const response = await getUserController.handle({
      pathParameters: {},
      ...generateAPIGatewayProxyEventV2(),
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
    const response = await getUserController.handle({
      pathParameters: { userId: 1 },
    } as never);

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        name: 'BadRequest',
        message: 'user id type is not string',
      }),
    });
  });
});
