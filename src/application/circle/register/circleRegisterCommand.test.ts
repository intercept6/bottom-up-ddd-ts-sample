import { InMemoryUserRepository } from '#/repository/user/inMemory/inMemoryUserRepository';
import { CircleRegisterCommand } from '#/application/circle/register/circleRegisterCommand';
import { User } from '#/domain/models/user/user';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { CircleRegisterService } from '#/application/circle/register/circleRegisterService';
import {
  InMemoryCircleFactory,
  InMemoryCircleRepository,
} from '#/repository/circle/inMemoryCircleRepository';
import { ArgumentApplicationError } from '#/application/error/error';
import { Circle } from '#/domain/circle/circle';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';

const userRepository = new InMemoryUserRepository();
const circleFactory = new InMemoryCircleFactory();
const circleRepository = new InMemoryCircleRepository();
const circleRegisterService = new CircleRegisterService({
  circleRepository,
  userRepository,
  circleFactory,
});

beforeAll(() => {
  userRepository.store.push(
    new User(
      new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
      new UserName('テストユーザーの名前'),
      new MailAddress('test@example.com')
    )
  );
});
afterEach(() => {
  circleRepository.clear();
});

describe('サークル新規作成', () => {
  test.each`
    circleName
    ${'テスト'}
    ${'テストサークル名テストサークル名テストサ'}
  `('サークルを新規作成する', async ({ circleName }) => {
    const command = new CircleRegisterCommand({
      userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      circleName,
    });
    await circleRegisterService.handle(command);

    const head = circleRepository.store[0];
    expect(head.getCircleName().getValue()).toEqual(circleName);
    expect(head.getOwnerId().getValue()).toEqual(
      '203881e1-99f2-4ce6-ab6b-785fcd793c92'
    );
  });

  test('サークル名が3文字未満は作成できない', async () => {
    const command = new CircleRegisterCommand({
      userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      circleName: 'テス',
    });
    const registerCirclePromise = circleRegisterService.handle(command);

    await expect(registerCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be at least 3 characters')
    );
  });

  test('サークル名が20文字超過は作成できない', async () => {
    const command = new CircleRegisterCommand({
      userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
      circleName: 'テストサークル名テストサークル名テストサー',
    });
    const registerCirclePromise = circleRegisterService.handle(command);

    await expect(registerCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be 20 characters or less')
    );
  });

  test('サークル名は重複できない', async () => {
    circleRepository.store.push(
      Circle.create(
        new CircleId('66d73617-aa4f-46b3-bf7d-9c193f0a08d1'),
        new CircleName('テストサークル名'),
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        []
      )
    );

    const command = new CircleRegisterCommand({
      userId: '203881e1-99f2-4ce6-ab6b-785fcd793c92',
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
