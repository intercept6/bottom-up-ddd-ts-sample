import { InMemoryUserRepository } from '#/repository/user/inMemory/inMemoryUserRepository';
import { InMemoryCircleRepository } from '#/repository/circle/inMemoryCircleRepository';
import { User } from '#/domain/models/user/user';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { Circle } from '#/domain/circle/circle';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { CircleUpdateCommand } from '#/application/circle/update/circleUpdateCommand';
import { CircleUpdateService } from '#/application/circle/update/circleUpdateService';
import { ArgumentApplicationError } from '#/application/error/error';

const userRepository = new InMemoryUserRepository();
const circleRepository = new InMemoryCircleRepository();
const circleUpdateService = new CircleUpdateService({
  circleRepository,
  userRepository,
});

beforeEach(() => {
  const ownerId = new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92');
  userRepository.store.push(
    new User(
      ownerId,
      new UserName('テストユーザーの名前'),
      new MailAddress('test@example.com')
    )
  );
  circleRepository.store.push(
    Circle.create(
      new CircleId('03674c29-2bcc-45f8-ba63-58d1459da863'),
      new CircleName('テストサークル名'),
      ownerId,
      []
    )
  );
});
afterEach(() => {
  circleRepository.clear();
});

describe('サークル更新', () => {
  test.each`
    circleName
    ${'テスト'}
    ${'テストサークル名テストサークル名テストサ'}
  `('サークル名を更新する', async ({ circleName }) => {
    const command = new CircleUpdateCommand({
      circleId: '03674c29-2bcc-45f8-ba63-58d1459da863',
      circleName,
    });
    await circleUpdateService.handle(command);

    const head = circleRepository.store[0];
    expect(head.getCircleName().getValue()).toEqual(circleName);
  });

  test('サークルオーナーを更新する', async () => {
    const newOwnerId = 'a046ac45-2788-491c-aa72-80e7e114a369';
    userRepository.store.push(
      new User(
        new UserId(newOwnerId),
        new UserName('新オーナー'),
        new MailAddress('new-owner@example.com')
      )
    );

    const command = new CircleUpdateCommand({
      circleId: '03674c29-2bcc-45f8-ba63-58d1459da863',
      ownerId: newOwnerId,
    });
    await circleUpdateService.handle(command);

    const head = circleRepository.store[0];
    expect(head.getOwner().getValue()).toEqual(
      'a046ac45-2788-491c-aa72-80e7e114a369'
    );
  });

  test('サークル名を3文字未満には変更できない', async () => {
    const command = new CircleUpdateCommand({
      circleId: '03674c29-2bcc-45f8-ba63-58d1459da863',
      circleName: 'テス',
    });

    const updateCirclePromise = circleUpdateService.handle(command);
    await expect(updateCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be at least 3 characters')
    );
  });

  test('サークル名を20文字超過には変更できない', async () => {
    const command = new CircleUpdateCommand({
      circleId: '03674c29-2bcc-45f8-ba63-58d1459da863',
      circleName: 'テストサークル名テストサークル名テストサー',
    });

    const updateCirclePromise = circleUpdateService.handle(command);
    await expect(updateCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be 20 characters or less')
    );
  });

  test('サークル名を重複する名前には変更できない', async () => {
    circleRepository.store.push(
      Circle.create(
        new CircleId('66d73617-aa4f-46b3-bf7d-9c193f0a08d1'),
        new CircleName('重複するサークル名'),
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        []
      )
    );

    const command = new CircleUpdateCommand({
      circleId: '03674c29-2bcc-45f8-ba63-58d1459da863',
      circleName: '重複するサークル名',
    });

    const updateCirclePromise = circleUpdateService.handle(command);
    await expect(updateCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError(
        'circle name: 重複するサークル名 is already exist'
      )
    );
  });
});
