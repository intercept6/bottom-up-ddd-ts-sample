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
import { CircleFullApplicationError } from '#/application/error/error';

const userRepository = new InMemoryUserRepository();
const circleRepository = new InMemoryCircleRepository();
const circleJoinService = new CircleJoinService({
  circleRepository,
  userRepository,
});

afterEach(() => {
  userRepository.clear();
  circleRepository.clear();
});

describe('サークルメンバー追加', () => {
  test.each`
    memberIds
    ${['c53f525a-2109-47b7-b468-7fff07012cce']}
    ${['c53f525a-2109-47b7-b468-7fff07012cce', 'c9639e72-6a3b-4717-97cc-07c3e1ae129b', '3cfbbacb-92e4-4bf1-a328-475ab7291fc9', '5b5d9eb5-23ee-4437-8076-e0c86bee030d', '94b78af6-58c4-4a75-a5ea-5b607f312e68', '95e86abf-83de-4a65-a817-5c080f2b1388', '59aabc51-b1ca-40bb-b874-b8bedd225bd4', 'a4c9d1f7-d7a5-4d78-a69f-a1a53a7c67e1', 'ed521bc9-b0cd-496b-8607-4e7c4ca8693e', 'a1a282b1-b11c-46a0-aef7-c8f2fb94bd50', '017602a9-5985-4e38-a20c-af670f7a6edf', 'e6488fc7-02df-4703-91a9-61951a1c1b3f', '3b3cd77a-ccce-482f-b898-444cd18fbec6', 'e00fc73c-240d-487c-b076-2c92f3ae83a8', '2cb9ee5f-6247-408c-badf-336c308f6acd', '44ce3048-735c-42dc-b2ea-b5a9355f97e8', 'ff96f709-0674-4d20-90e8-0fd9a355a9bb', '874cbd85-a66d-4907-b3f3-7b7ea4e309c1', 'b41e3ad2-5b95-47a8-86b2-36cc23538e1c', '57eb3faa-7fbd-4d31-a0a7-d4b4d1e0a191', '79b20678-3d9b-48d3-bdd9-f79eb43653ee', 'a356dfb5-e9bc-4cd1-9f79-1ba99aaf16fc', '4b0d950b-6bf9-47b2-a656-e00c338ae94f', 'b361eda4-fc5d-4aeb-af5f-79a5d8464e4d', '6764e825-8c64-4f88-95fa-9b4fe50453e6', 'b8d172b2-be3d-4d30-9027-084ffaad1fae', '9adb41e5-8f49-499f-82c5-472e884f7c9a', '0d4541b1-5a5c-4417-afa2-22786ddfe9cc']}
  `(
    'サークルメンバーを追加する',
    async ({ memberIds }: { memberIds: string[] }) => {
      memberIds.map((value, index) =>
        userRepository.store.push(
          new User(
            new UserId(value),
            new UserName(`ユーザー${index + 1}`),
            new MailAddress(`user${index + 1}@example.com`)
          )
        )
      );

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
        memberIds,
      });
      await circleJoinService.handle(command);

      const head = circleRepository.store[0];
      expect(head.getMembers().map((value) => value.getValue())).toEqual(
        expect.arrayContaining(memberIds)
      );
    }
  );

  test('サークルメンバー人数が元々最大で追加できない', async () => {
    userRepository.store.push(
      new User(
        new UserId('c53f525a-2109-47b7-b468-7fff07012cce'),
        new UserName('サークルに参加するユーザー'),
        new MailAddress('join-user@example.com')
      )
    );
    circleRepository.store.push(
      Circle.create(
        new CircleId('238517cb-65ba-4744-bd19-0e2e94875344'),
        new CircleName('テストサークル名'),
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        [
          'c53f525a-2109-47b7-b468-7fff07012cce',
          'c9639e72-6a3b-4717-97cc-07c3e1ae129b',
          '3cfbbacb-92e4-4bf1-a328-475ab7291fc9',
          '5b5d9eb5-23ee-4437-8076-e0c86bee030d',
          '94b78af6-58c4-4a75-a5ea-5b607f312e68',
          '95e86abf-83de-4a65-a817-5c080f2b1388',
          '59aabc51-b1ca-40bb-b874-b8bedd225bd4',
          'a4c9d1f7-d7a5-4d78-a69f-a1a53a7c67e1',
          'ed521bc9-b0cd-496b-8607-4e7c4ca8693e',
          'a1a282b1-b11c-46a0-aef7-c8f2fb94bd50',
          '017602a9-5985-4e38-a20c-af670f7a6edf',
          'e6488fc7-02df-4703-91a9-61951a1c1b3f',
          '3b3cd77a-ccce-482f-b898-444cd18fbec6',
          'e00fc73c-240d-487c-b076-2c92f3ae83a8',
          '2cb9ee5f-6247-408c-badf-336c308f6acd',
          '44ce3048-735c-42dc-b2ea-b5a9355f97e8',
          'ff96f709-0674-4d20-90e8-0fd9a355a9bb',
          '874cbd85-a66d-4907-b3f3-7b7ea4e309c1',
          'b41e3ad2-5b95-47a8-86b2-36cc23538e1c',
          '57eb3faa-7fbd-4d31-a0a7-d4b4d1e0a191',
          '79b20678-3d9b-48d3-bdd9-f79eb43653ee',
          'a356dfb5-e9bc-4cd1-9f79-1ba99aaf16fc',
          '4b0d950b-6bf9-47b2-a656-e00c338ae94f',
          'b361eda4-fc5d-4aeb-af5f-79a5d8464e4d',
          '6764e825-8c64-4f88-95fa-9b4fe50453e6',
          'b8d172b2-be3d-4d30-9027-084ffaad1fae',
          '9adb41e5-8f49-499f-82c5-472e884f7c9a',
          '0d4541b1-5a5c-4417-afa2-22786ddfe9cc',
          'd5d8a20b-06c8-4dee-89cc-f9e492cd8242',
        ].map((value) => new UserId(value))
      )
    );

    const command = new CircleJoinCommand({
      circleId: '238517cb-65ba-4744-bd19-0e2e94875344',
      memberIds: ['c53f525a-2109-47b7-b468-7fff07012cce'],
    });
    const circleJoinPromise = circleJoinService.handle(command);

    await expect(circleJoinPromise).rejects.toThrowError(
      new CircleFullApplicationError(
        new CircleId('238517cb-65ba-4744-bd19-0e2e94875344')
      )
    );
  });

  test('サークルメンバー人数が超過するので追加できない', async () => {
    const memberIds = [
      'c53f525a-2109-47b7-b468-7fff07012cce',
      'd5d8a20b-06c8-4dee-89cc-f9e492cd8242',
    ];
    memberIds.map((value, index) =>
      userRepository.store.push(
        new User(
          new UserId(value),
          new UserName(`テストユーザー${index + 1}`),
          new MailAddress(`test${index + 1}@example.com`)
        )
      )
    );

    circleRepository.store.push(
      Circle.create(
        new CircleId('238517cb-65ba-4744-bd19-0e2e94875344'),
        new CircleName('テストサークル名'),
        new UserId('203881e1-99f2-4ce6-ab6b-785fcd793c92'),
        [
          'c53f525a-2109-47b7-b468-7fff07012cce',
          'c9639e72-6a3b-4717-97cc-07c3e1ae129b',
          '3cfbbacb-92e4-4bf1-a328-475ab7291fc9',
          '5b5d9eb5-23ee-4437-8076-e0c86bee030d',
          '94b78af6-58c4-4a75-a5ea-5b607f312e68',
          '95e86abf-83de-4a65-a817-5c080f2b1388',
          '59aabc51-b1ca-40bb-b874-b8bedd225bd4',
          'a4c9d1f7-d7a5-4d78-a69f-a1a53a7c67e1',
          'ed521bc9-b0cd-496b-8607-4e7c4ca8693e',
          'a1a282b1-b11c-46a0-aef7-c8f2fb94bd50',
          '017602a9-5985-4e38-a20c-af670f7a6edf',
          'e6488fc7-02df-4703-91a9-61951a1c1b3f',
          '3b3cd77a-ccce-482f-b898-444cd18fbec6',
          'e00fc73c-240d-487c-b076-2c92f3ae83a8',
          '2cb9ee5f-6247-408c-badf-336c308f6acd',
          '44ce3048-735c-42dc-b2ea-b5a9355f97e8',
          'ff96f709-0674-4d20-90e8-0fd9a355a9bb',
          '874cbd85-a66d-4907-b3f3-7b7ea4e309c1',
          'b41e3ad2-5b95-47a8-86b2-36cc23538e1c',
          '57eb3faa-7fbd-4d31-a0a7-d4b4d1e0a191',
          '79b20678-3d9b-48d3-bdd9-f79eb43653ee',
          'a356dfb5-e9bc-4cd1-9f79-1ba99aaf16fc',
          '4b0d950b-6bf9-47b2-a656-e00c338ae94f',
          'b361eda4-fc5d-4aeb-af5f-79a5d8464e4d',
          '6764e825-8c64-4f88-95fa-9b4fe50453e6',
          'b8d172b2-be3d-4d30-9027-084ffaad1fae',
          '9adb41e5-8f49-499f-82c5-472e884f7c9a',
          '0d4541b1-5a5c-4417-afa2-22786ddfe9cc',
        ].map((value) => new UserId(value))
      )
    );

    const command = new CircleJoinCommand({
      circleId: '238517cb-65ba-4744-bd19-0e2e94875344',
      memberIds,
    });
    const circleJoinPromise = circleJoinService.handle(command);

    await expect(circleJoinPromise).rejects.toThrowError(
      new CircleFullApplicationError(
        new CircleId('238517cb-65ba-4744-bd19-0e2e94875344')
      )
    );
  });
});
