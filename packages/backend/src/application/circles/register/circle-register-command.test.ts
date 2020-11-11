import { CircleRegisterCommand } from './circle-register-command';
import { CircleRegisterService } from './circle-register-service';
import { ArgumentApplicationError } from '../../errors/application-errors';
import { StubCircleRepository } from '../../../repository/stub/circles/stub-circle-repository';
import { StubUserRepository } from '../../../repository/stub/users/stub-user-repository';
import { StubCircleFactory } from '../../../repository/stub/circles/stub-circle-factory';
import { User } from '../../../domain/models/users/user';
import { UserId } from '../../../domain/models/users/user-id';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { CircleName } from '../../../domain/models/circles/circle-name';
import { CircleId } from '../../../domain/models/circles/circle-id';
import { Circle } from '../../../domain/models/circles/circle';

const userRepository = new StubUserRepository();
const circleFactory = new StubCircleFactory();
const circleRepository = new StubCircleRepository();
const circleRegisterService = new CircleRegisterService({
  circleRepository,
  userRepository,
  circleFactory,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル新規作成', () => {
  test.each`
    circleName
    ${'テスト'}
    ${'テストサークル名テストサークル名テストサ'}
  `('サークルを新規作成する', async ({ circleName }) => {
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
          new UserName('モックユーザー名'),
          new MailAddress('mock@example.com')
        )
      );
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new CircleNotFoundRepositoryError(new CircleName('テストサークル名'))
      );
    jest
      .spyOn(StubCircleRepository.prototype, 'create')
      .mockResolvedValueOnce();
    jest
      .spyOn(StubCircleFactory.prototype, 'create')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId('04c233ed-3d43-41d9-b3a2-2fe77e9e9d66'),
          new CircleName('テストサークル名'),
          new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
          []
        )
      );

    const command = new CircleRegisterCommand({
      ownerId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      circleName,
    });
    await circleRegisterService.handle(command);
  });

  test('サークル名が3文字未満は作成できない', async () => {
    const ownerId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(ownerId),
          new UserName('テストユーザー'),
          new MailAddress('test@example.com')
        )
      );

    const command = new CircleRegisterCommand({
      ownerId,
      circleName: 'テス',
    });
    const registerCirclePromise = circleRegisterService.handle(command);

    await expect(registerCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be at least 3 characters')
    );
  });

  test('サークル名が20文字超過は作成できない', async () => {
    const ownerId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(ownerId),
          new UserName('テストユーザー'),
          new MailAddress('test@example.com')
        )
      );

    const command = new CircleRegisterCommand({
      ownerId,
      circleName: 'テストサークル名テストサークル名テストサー',
    });
    const registerCirclePromise = circleRegisterService.handle(command);

    await expect(registerCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be 20 characters or less')
    );
  });

  test('サークル名は重複できない', async () => {
    const ownerId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(ownerId),
          new UserName('テストユーザー'),
          new MailAddress('test@example.com')
        )
      );
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId('7627d7cd-cf9a-4100-bd49-f2996fd9c403'),
          new CircleName('テストサークル名'),
          new UserId(ownerId),
          []
        )
      );

    const command = new CircleRegisterCommand({
      ownerId,
      circleName: 'テストサークル名',
    });
    const registerCirclePromise = circleRegisterService.handle(command);

    await expect(registerCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError(
        'circle name: テストサークル名 is already exist'
      )
    );
  });
});
