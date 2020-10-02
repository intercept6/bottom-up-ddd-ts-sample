import { CircleGetService } from './circleGetService';
import { CircleGetCommand } from './circleGetCommand';
import { CircleId } from '../../../domain/models/circles/circleId';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repositoryErrors';
import { StubCircleRepository } from '../../../repository/stub/circles/stubCircleRepository';
import { Circle } from '../../../domain/models/circles/circle';
import { CircleName } from '../../../domain/models/circles/circleName';
import { UserId } from '../../../domain/models/users/userId';
import { CircleNotFoundApplicationError } from '../../error/error';

const circleRepository = new StubCircleRepository();
const circleGetService = new CircleGetService({ circleRepository });

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル取得', () => {
  test('サークルを取得する', async () => {
    const circleId = 'e010ef3b-1b2f-4637-b96e-960751a4f64c';
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId(circleId),
          new CircleName('テストサークル名'),
          new UserId('569725f1-f175-4fb9-8c55-058bdfa97bc5'),
          []
        )
      );

    const command = new CircleGetCommand(circleId);
    const userData = await circleGetService.handle(command);

    expect(userData.getCircleId()).toEqual(circleId);
  });

  test('存在しないサークルは所得できない', async () => {
    const circleId = '5cb03388-c6e3-45fb-84a1-3ded1b93c738';
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new CircleNotFoundRepositoryError(new CircleId(circleId))
      );

    const command = new CircleGetCommand(circleId);
    const circleGetPromise = circleGetService.handle(command);

    await expect(circleGetPromise).rejects.toThrowError(
      new CircleNotFoundApplicationError(new CircleId(circleId))
    );
  });
});
