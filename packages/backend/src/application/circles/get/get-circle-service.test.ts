import { GetCircleService } from './get-circle-service';
import { GetCircleCommand } from './get-circle-command';
import { CircleId } from '../../../domain/models/circles/circle-id';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { CircleRepositoryStub } from '../../../repository/stub/circles/circle-repository-stub';
import { Circle } from '../../../domain/models/circles/circle';
import { CircleName } from '../../../domain/models/circles/circle-name';
import { UserId } from '../../../domain/models/users/user-id';
import { CircleNotFoundApplicationError } from '../../errors/application-errors';

const circleRepository = new CircleRepositoryStub();
const getCircleService = new GetCircleService({ circleRepository });

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル取得', () => {
  test('サークルを取得する', async () => {
    const circleId = 'e010ef3b-1b2f-4637-b96e-960751a4f64c';
    jest
      .spyOn(CircleRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId(circleId),
          new CircleName('テストサークル名'),
          new UserId('569725f1-f175-4fb9-8c55-058bdfa97bc5'),
          []
        )
      );

    const command = new GetCircleCommand(circleId);
    const userData = await getCircleService.handle(command);

    expect(userData.getCircleId()).toEqual(circleId);
  });

  test('存在しないサークルは所得できない', async () => {
    const circleId = '5cb03388-c6e3-45fb-84a1-3ded1b93c738';
    jest
      .spyOn(CircleRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new CircleNotFoundRepositoryError(new CircleId(circleId))
      );

    const command = new GetCircleCommand(circleId);
    const getCirclePromise = getCircleService.handle(command);

    await expect(getCirclePromise).rejects.toThrowError(
      new CircleNotFoundApplicationError(new CircleId(circleId))
    );
  });
});
