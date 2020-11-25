/* eslint-disable import/first */
process.env.AWS_REGION = 'ap-northeast-1';
process.env.MAIN_TABLE_NAME = 'test-table';
process.env.MAIL_TABLE_GSI1_NAME = 'gsi1';
process.env.MAIL_TABLE_GSI2_NAME = 'gsi2';
process.env.ROOT_URI = 'https://api.example.com/';

import { DeleteCircleController } from './delete-circle-controller';
import { DeleteCircleServiceStub } from '../../../../application/circles/delete/delete-circle-service-stub';
import { generateAPIGatewayProxyEventV2 } from '../../../../lib/tests/apigateway-event-v2-helper';

const deleteCircleService = new DeleteCircleServiceStub();
const deleteCircleController = new DeleteCircleController({
  deleteCircleService,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル削除', () => {
  test('サークルを削除する', async () => {
    jest
      .spyOn(DeleteCircleServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();
    const response = await deleteCircleController.handle({
      pathParameters: {
        circleId: '4ea20e0e-404e-4dc6-8917-a7bb7bf4ebdd',
      },
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('サークルが存在しない場合も削除は成功する', async () => {
    jest
      .spyOn(DeleteCircleServiceStub.prototype, 'handle')
      .mockResolvedValueOnce();
    const response = await deleteCircleController.handle({
      pathParameters: {
        circleId: '70856508-f1c0-481b-a16d-93d91e7128c8',
      },
      ...generateAPIGatewayProxyEventV2(),
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });
});
