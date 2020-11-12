/* eslint-disable import/first */
import { generateAPIGatewayProxyEventV2 } from '../../../../lib/tests/apigateway-event-v2-helper';

process.env.AWS_REGION = 'ap-northeast-1';
process.env.MAIN_TABLE_NAME = 'test-table';
process.env.MAIL_TABLE_GSI1_NAME = 'gsi1';
process.env.MAIL_TABLE_GSI2_NAME = 'gsi2';
process.env.ROOT_URI = 'https://api.example.com/';

import { UserGetController } from './user-get-controller';
import { StubUserGetService } from '../../../../application/users/get/stub-user-get-service';
import { User } from '../../../../domain/models/users/user';
import { UserId } from '../../../../domain/models/users/user-id';
import { UserName } from '../../../../domain/models/users/user-name';
import { MailAddress } from '../../../../domain/models/users/mail-address';
import { UserData } from '../../../../application/users/user-data';
import { UserNotFoundApplicationError } from '../../../../application/errors/application-errors';

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
      .spyOn(StubUserGetService.prototype, 'handle')
      .mockRejectedValueOnce(
        new UserNotFoundApplicationError(new UserId(userId))
      );
    const response = await userGetController.handle({
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
    const response = await userGetController.handle({
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
    const response = await userGetController.handle({
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
