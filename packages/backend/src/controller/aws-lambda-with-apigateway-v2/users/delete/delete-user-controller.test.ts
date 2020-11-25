/* eslint-disable import/first */
process.env.AWS_REGION = 'ap-northeast-1';
process.env.MAIN_TABLE_NAME = 'test-table';
process.env.MAIN_TABLE_GSI1_NAME = 'gsi1';
process.env.MAIN_TABLE_GSI2_NAME = 'gsi2';
process.env.MAIN_TABLE_GSI3_NAME = 'gsi3';
process.env.ROOT_URI = 'https://api.example.com/';

import { generateAPIGatewayProxyEventV2 } from '../../../../lib/tests/apigateway-event-v2-helper';
import { DeleteUserController } from './delete-user-controller';
import { DeleteUserServiceStub } from '../../../../application/users/delete/delete-user-service-stub';

const deleteUserService = new DeleteUserServiceStub();
const deleteUserController = new DeleteUserController({ deleteUserService });

afterEach(() => {
  jest.clearAllMocks();
});

describe('ユーザー削除', () => {
  test('ユーザーを削除する', async () => {
    jest
      .spyOn(DeleteUserServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await deleteUserController.handle({
      pathParameters: {
        userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      },
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('ユーザーが存在しない場合も削除は成功する', async () => {
    jest
      .spyOn(DeleteUserServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();

    const response = await deleteUserController.handle({
      pathParameters: {
        userId: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1',
      },
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });
});
