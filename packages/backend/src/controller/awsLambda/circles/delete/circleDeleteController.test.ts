import { CircleDeleteController } from './circleDeleteController';
import { StubCircleDeleteService } from '../../../../application/circle/delete/stubCircleDeleteService';

const circleDeleteService = new StubCircleDeleteService();
const circleDeleteController = new CircleDeleteController({
  circleDeleteService,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル削除', () => {
  test('サークルを削除する', async () => {
    jest
      .spyOn(StubCircleDeleteService.prototype, 'handle')
      .mockResolvedValueOnce();
    const response = await circleDeleteController.handle({
      pathParameters: {
        circleId: '4ea20e0e-404e-4dc6-8917-a7bb7bf4ebdd',
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });

  test('サークルが存在しない場合も削除は成功する', async () => {
    jest
      .spyOn(StubCircleDeleteService.prototype, 'handle')
      .mockResolvedValueOnce();
    const response = await circleDeleteController.handle({
      pathParameters: {
        circleId: '70856508-f1c0-481b-a16d-93d91e7128c8',
      },
    });

    expect(response).toEqual({
      statusCode: 204,
      body: JSON.stringify({}),
    });
  });
});
