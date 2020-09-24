import { InMemoryCircleRepository } from '#/repository/circle/inMemoryCircleRepository';
import { CircleGetService } from '#/application/circle/get/circleGetService';
import { CircleGetCommand } from '#/application/circle/get/circleGetCommand';
import { Circle } from '#/domain/circle/circle';
import { CircleId } from '#/domain/circle/circleId';
import { InMemoryUserRepository } from '#/repository/user/inMemory/inMemoryUserRepository';
import { User } from '#/domain/models/user/user';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { CircleName } from '#/domain/circle/circleName';
import { CircleNotFoundError } from '#/repository/error/error';

const userRepository = new InMemoryUserRepository();
const circleRepository = new InMemoryCircleRepository();
const circleGetService = new CircleGetService({ circleRepository });

describe('サークル取得', () => {
  test('サークルを取得する', async () => {
    const ownerId = '827d2339-a84e-4e2a-95eb-7d74b7351633';
    const circleId = 'da0279b7-bf0f-4234-ad70-961cbd844e53';

    userRepository.store.push(
      new User(
        new UserId(ownerId),
        new UserName('テストユーザー名'),
        new MailAddress('test@example.com')
      )
    );
    circleRepository.store.push(
      Circle.create(
        new CircleId(circleId),
        new CircleName('テストサークル名'),
        new UserId(ownerId),
        []
      )
    );

    const command = new CircleGetCommand(circleId);
    const userData = await circleGetService.handle(command);

    expect(userData.getCircleId()).toEqual(circleId);
  });

  test('存在しないサークルは所得できない', async () => {
    const ownerId = '827d2339-a84e-4e2a-95eb-7d74b7351633';
    const circleId = 'da0279b7-bf0f-4234-ad70-961cbd844e53';
    const notExistCircleId = '29a84dd4-9879-4625-bfbf-15b6d37e82f6';

    userRepository.store.push(
      new User(
        new UserId(ownerId),
        new UserName('テストユーザー名'),
        new MailAddress('test@example.com')
      )
    );
    circleRepository.store.push(
      Circle.create(
        new CircleId(circleId),
        new CircleName('テストサークル名'),
        new UserId(ownerId),
        []
      )
    );

    const command = new CircleGetCommand(notExistCircleId);
    const circleGetPromise = circleGetService.handle(command);

    await expect(circleGetPromise).rejects.toThrowError(
      new CircleNotFoundError(new CircleId(notExistCircleId))
    );
  });
});
