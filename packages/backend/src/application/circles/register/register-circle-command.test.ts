import { RegisterCircleCommand } from './register-circle-command';
import { RegisterCircleService } from './register-circle-service';
import { ArgumentApplicationError } from '../../errors/application-errors';
import { CircleRepositoryStub } from '../../../repository/stub/circles/circle-repository-stub';
import { UserRepositoryStub } from '../../../repository/stub/users/user-repository-stub';
import { CircleFactoryStub } from '../../../repository/stub/circles/circle-factory-stub';
import { User } from '../../../domain/models/users/user';
import { UserId } from '../../../domain/models/users/user-id';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repository-errors';
import { CircleName } from '../../../domain/models/circles/circle-name';
import { CircleId } from '../../../domain/models/circles/circle-id';
import { Circle } from '../../../domain/models/circles/circle';

const userRepository = new UserRepositoryStub();
const circleFactory = new CircleFactoryStub();
const circleRepository = new CircleRepositoryStub();
const registerCircleService = new RegisterCircleService({
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
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
          new UserName('モックユーザー名'),
          new MailAddress('mock@example.com')
        )
      );
    jest
      .spyOn(CircleRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new CircleNotFoundRepositoryError(new CircleName('テストサークル名'))
      );
    jest
      .spyOn(CircleRepositoryStub.prototype, 'create')
      .mockResolvedValueOnce();
    jest
      .spyOn(CircleFactoryStub.prototype, 'create')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId('04c233ed-3d43-41d9-b3a2-2fe77e9e9d66'),
          new CircleName('テストサークル名'),
          new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
          []
        )
      );

    const command = new RegisterCircleCommand({
      ownerId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      circleName,
    });
    await registerCircleService.handle(command);
  });

  test('サークル名が3文字未満は作成できない', async () => {
    const ownerId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(ownerId),
          new UserName('テストユーザー'),
          new MailAddress('test@example.com')
        )
      );

    const command = new RegisterCircleCommand({
      ownerId,
      circleName: 'テス',
    });
    const registerCirclePromise = registerCircleService.handle(command);

    await expect(registerCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be at least 3 characters')
    );
  });

  test('サークル名が20文字超過は作成できない', async () => {
    const ownerId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(ownerId),
          new UserName('テストユーザー'),
          new MailAddress('test@example.com')
        )
      );

    const command = new RegisterCircleCommand({
      ownerId,
      circleName: 'テストサークル名テストサークル名テストサー',
    });
    const registerCirclePromise = registerCircleService.handle(command);

    await expect(registerCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be 20 characters or less')
    );
  });

  test('サークル名は重複できない', async () => {
    const ownerId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(ownerId),
          new UserName('テストユーザー'),
          new MailAddress('test@example.com')
        )
      );
    jest
      .spyOn(CircleRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId('7627d7cd-cf9a-4100-bd49-f2996fd9c403'),
          new CircleName('テストサークル名'),
          new UserId(ownerId),
          []
        )
      );

    const command = new RegisterCircleCommand({
      ownerId,
      circleName: 'テストサークル名',
    });
    const registerCirclePromise = registerCircleService.handle(command);

    await expect(registerCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError(
        'circle name: テストサークル名 is already exist'
      )
    );
  });
});
