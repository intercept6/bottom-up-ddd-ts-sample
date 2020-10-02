import { CircleId } from '../../../domain/models/circles/circleId';
import { CircleDeleteCommand } from './circleDeleteCommand';
import { CircleDeleteService } from './circleDeleteService';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repositoryErrors';
import { StubCircleRepository } from '../../../repository/stub/circles/stubCircleRepository';
import { Circle } from '../../../domain/models/circles/circle';
import { CircleName } from '../../../domain/models/circles/circleName';
import { UserId } from '../../../domain/models/users/userId';

const circleRepository = new StubCircleRepository();
const circleDeleteService = new CircleDeleteService({ circleRepository });

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル削除', () => {
  test('サークルを削除する', async () => {
    const circleId = '5cb03388-c6e3-45fb-84a1-3ded1b93c738';
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
    jest
      .spyOn(StubCircleRepository.prototype, 'delete')
      .mockResolvedValueOnce();

    const command = new CircleDeleteCommand(circleId);
    await circleDeleteService.handle(command);
  });

  test('存在しないサークルを削除できる', async () => {
    const circleId = '5cb03388-c6e3-45fb-84a1-3ded1b93c738';
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new CircleNotFoundRepositoryError(new CircleId(circleId))
      );

    const command = new CircleDeleteCommand(circleId);
    await circleDeleteService.handle(command);
  });
});
