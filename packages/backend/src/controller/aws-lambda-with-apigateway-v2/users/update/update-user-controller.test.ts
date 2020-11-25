/* eslint-disable import/first */
process.env.AWS_REGION = 'ap-northeast-1';
process.env.MAIN_TABLE_NAME = 'test-table';
process.env.MAIL_TABLE_GSI1_NAME = 'gsi1';
process.env.MAIL_TABLE_GSI2_NAME = 'gsi2';
process.env.ROOT_URI = 'https://api.example.com/';

import { generateAPIGatewayProxyEventV2 } from '../../../../lib/tests/apigateway-event-v2-helper';
import { UpdateUserController } from './update-user-controller';
import { UpdateUserServiceStub } from '../../../../application/users/update/update-user-service-stub';
import { UserNotFoundApplicationError } from '../../../../application/errors/application-errors';
import { UserId } from '../../../../domain/models/users/user-id';

const updateUserService = new UpdateUserServiceStub();
const updateUserController = new UpdateUserController({ updateUserService });

afterEach(() => {
  jest.clearAllMocks();
});

describe('ユーザー更新', () => {
  test('ユーザー名を更新する', async () => {
    jest
      .spyOn(UpdateUserServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await updateUserController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({
        user_name: '更新されたユーザー名',
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('メールアドレスを更新する', async () => {
    jest
      .spyOn(UpdateUserServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await updateUserController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({
        mail_address: 'updated@example.com',
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('ユーザー名とメールアドレスを更新する', async () => {
    jest
      .spyOn(UpdateUserServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await updateUserController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({
        user_name: '更新されたユーザー名',
        mail_address: 'updated@example.com',
      }),
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('ユーザーが存在しない場合は更新に失敗する', async () => {
    const userId = 'ca00d9c4-eecf-47f4-9e89-be7f9836053f';
    jest
      .spyOn(UpdateUserServiceStub.prototype, 'handle')
      .mockRejectedValueOnce(
        new UserNotFoundApplicationError(new UserId(userId))
      );

    const response = await updateUserController.handle({
      pathParameters: { userId },
      body: JSON.stringify({
        user_name: '更新されたユーザー名',
        mail_address: 'updated@example.com',
      }),
      ...generateAPIGatewayProxyEventV2(),
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
    const response = await updateUserController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({}),
      ...generateAPIGatewayProxyEventV2(),
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
    const response = await updateUserController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({ user_name: 1 }),
      ...generateAPIGatewayProxyEventV2(),
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
    const response = await updateUserController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({ mail_address: 1 }),
      ...generateAPIGatewayProxyEventV2(),
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
    const response = await updateUserController.handle({
      pathParameters: { userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92' },
      body: JSON.stringify({ user_name: 1, mail_address: 1 }),
      ...generateAPIGatewayProxyEventV2(),
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
