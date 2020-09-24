import { InMemoryCircleRepository } from '#/repository/circle/inMemoryCircleRepository';
import { Circle } from '#/domain/circle/circle';
import { CircleId } from '#/domain/circle/circleId';
import { User } from '#/domain/models/user/user';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { CircleName } from '#/domain/circle/circleName';
import { InMemoryUserRepository } from '#/repository/user/inMemoryUserRepository';
import { CircleDeleteCommand } from '#/application/circle/delete/circleDeleteCommand';
import { CircleDeleteService } from '#/application/circle/delete/circleDeleteService';

const circleRepository = new InMemoryCircleRepository();
const userRepository = new InMemoryUserRepository();
const circleDeleteService = new CircleDeleteService({ circleRepository });

describe('サークル削除', () => {
  test('サークルを削除する', async () => {
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

    const command = new CircleDeleteCommand(circleId);
    await circleDeleteService.handle(command);
  });

  test('存在しないサークルを削除できる', async () => {
    const command = new CircleDeleteCommand(
      'da0279b7-bf0f-4234-ad70-961cbd844e53'
    );
    await circleDeleteService.handle(command);
  });
});
