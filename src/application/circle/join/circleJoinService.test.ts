import { InMemoryUserRepository } from '#/repository/user/inMemory/inMemoryUserRepository';
import { User } from '#/domain/models/user/user';
import { UserId } from '#/domain/models/user/userId';
import { UserName } from '#/domain/models/user/userName';
import { MailAddress } from '#/domain/models/user/mailAddress';
import { InMemoryCircleRepository } from '#/repository/circle/inMemoryCircleRepository';
import { Circle } from '#/domain/circle/circle';
import { CircleId } from '#/domain/circle/circleId';
import { CircleName } from '#/domain/circle/circleName';
import { CircleJoinCommand } from '#/application/circle/join/circleJoinCommand';
import { CircleJoinService } from '#/application/circle/join/circleJoinService';
import { generateUuid } from '#/util/uuid';
import { CircleFullApplicationError } from '#/application/error/error';

const userRepository = new InMemoryUserRepository();
const circleRepository = new InMemoryCircleRepository();
const circleJoinService = new CircleJoinService({
  circleRepository,
  userRepository,
});

beforeAll(() => {
  userRepository.store.push(
    new User(
      new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
      new UserName('テストユーザーの名前'),
      new MailAddress('test@example.com')
    )
  );
  userRepository.store.push(
    new User(
      new UserId('c53f525a-2109-47b7-b468-7fff07012cce'),
      new UserName('サークルに参加するユーザー'),
      new MailAddress('join-user@example.com')
    )
  );
});

const createMembers = (number: number): UserId[] => {
  const users: UserId[] = [];
  for (let i = 0; i < number; i++) {
    users.push(new UserId(generateUuid()));
  }
  return users;
};

describe('サークルメンバー追加', () => {
  test('サークルメンバーを追加する', async () => {
    circleRepository.store.push(
      Circle.create(
        new CircleId('66d73617-aa4f-46b3-bf7d-9c193f0a08d1'),
        new CircleName('テストサークル名'),
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),

        []
      )
    );

    const command = new CircleJoinCommand({
      circleId: '66d73617-aa4f-46b3-bf7d-9c193f0a08d1',
      userId: 'c53f525a-2109-47b7-b468-7fff07012cce',
    });
    await circleJoinService.handle(command);

    const head = circleRepository.store[0];
    expect(head.getMembers()[0].getValue()).toEqual(
      'c53f525a-2109-47b7-b468-7fff07012cce'
    );
  });

  test('サークルメンバー人数が超過していて追加できない', async () => {
    circleRepository.store.push(
      Circle.create(
        new CircleId('238517cb-65ba-4744-bd19-0e2e94875344'),
        new CircleName('テストサークル名'),
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        createMembers(29)
      )
    );

    const command = new CircleJoinCommand({
      circleId: '238517cb-65ba-4744-bd19-0e2e94875344',
      userId: 'c53f525a-2109-47b7-b468-7fff07012cce',
    });
    const circleJoinPromise = circleJoinService.handle(command);

    await expect(circleJoinPromise).rejects.toThrowError(
      new CircleFullApplicationError(
        new CircleId('238517cb-65ba-4744-bd19-0e2e94875344')
      )
    );
  });
});
