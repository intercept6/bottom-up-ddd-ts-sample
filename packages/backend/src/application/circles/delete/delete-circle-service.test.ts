import { CircleId } from '../../../domain/models/circles/circle-id';
import { DeleteCircleCommand } from './delete-circle-command';
import { DeleteCircleService } from './delete-circle-service';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { CircleRepositoryStub } from '../../../repository/stub/circles/circle-repository-stub';
import { Circle } from '../../../domain/models/circles/circle';
import { CircleName } from '../../../domain/models/circles/circle-name';
import { UserId } from '../../../domain/models/users/user-id';

const circleRepository = new CircleRepositoryStub();
const deleteCircleService = new DeleteCircleService({ circleRepository });

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル削除', () => {
  test('サークルを削除する', async () => {
    const circleId = '5cb03388-c6e3-45fb-84a1-3ded1b93c738';
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
    jest
      .spyOn(CircleRepositoryStub.prototype, 'delete')
      .mockResolvedValueOnce();

    const command = new DeleteCircleCommand(circleId);
    await deleteCircleService.handle(command);
  });

  test('存在しないサークルを削除できる', async () => {
    const circleId = '5cb03388-c6e3-45fb-84a1-3ded1b93c738';
    jest
      .spyOn(CircleRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new CircleNotFoundRepositoryError(new CircleId(circleId))
      );

    const command = new DeleteCircleCommand(circleId);
    await deleteCircleService.handle(command);
  });
});
