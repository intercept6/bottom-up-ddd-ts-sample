import { range } from '../../../util/range';
import { UserId } from '../../../domain/models/users/userId';
import { CircleId } from '../../../domain/models/circles/circleId';
import { CircleUpdateCommand } from './circleUpdateCommand';
import { CircleUpdateService } from './circleUpdateService';
import {
  ArgumentApplicationError,
  CircleMembersAreExceedApplicationError,
} from '../../errors/applicationErrors';
import { StubUserRepository } from '../../../repository/stub/users/stubUserRepository';
import { StubCircleRepository } from '../../../repository/stub/circles/stubCircleRepository';
import { CircleNotFoundRepositoryError } from '../../../repository/errors/repositoryErrors';
import { CircleName } from '../../../domain/models/circles/circleName';
import { Circle } from '../../../domain/models/circles/circle';
import { User } from '../../../domain/models/users/user';
import { UserName } from '../../../domain/models/users/userName';
import { MailAddress } from '../../../domain/models/users/mailAddress';

const userRepository = new StubUserRepository();
const circleRepository = new StubCircleRepository();
const circleUpdateService = new CircleUpdateService({
  circleRepository,
  userRepository,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('サークル更新', () => {
  test.each`
    circleName
    ${'テスト'}
    ${'テストサークル名テストサークル名テストサ'}
  `('サークル名を更新する', async ({ circleName }) => {
    const circleId = '03674c29-2bcc-45f8-ba63-58d1459da863';
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId(circleId),
          new CircleName('テストサークル名'),
          new UserId('baaead8d-0e74-40ba-a48c-22ae93669120'),
          []
        )
      );
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new CircleNotFoundRepositoryError(new CircleName(circleName))
      );

    const command = new CircleUpdateCommand({
      circleId,
      circleName,
    });
    await circleUpdateService.handle(command);
  });

  test('サークルオーナーを更新する', async () => {
    const circleId = '0e1e48a0-ec1c-431a-86ab-30a297689a04';
    const newOwnerId = '1948f6ee-fabb-42f6-af96-77e2bc475772';
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId(circleId),
          new CircleName('テストサークル名'),
          new UserId('baaead8d-0e74-40ba-a48c-22ae93669120'),
          []
        )
      );
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(newOwnerId),
          new UserName('テストユーザー名'),
          new MailAddress('test@example.com')
        )
      );

    const command = new CircleUpdateCommand({
      circleId,
      ownerId: newOwnerId,
    });
    await circleUpdateService.handle(command);
  });

  test('サークル名を3文字未満には変更できない', async () => {
    const circleId = '939ce578-e3d2-4b45-8fe4-39f837ee99aa';
    const newOwnerId = '484196cc-fe38-4e7b-b4f5-79f0ccb269d8';
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId(circleId),
          new CircleName('テストサークル名'),
          new UserId('baaead8d-0e74-40ba-a48c-22ae93669120'),
          []
        )
      );
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(newOwnerId),
          new UserName('テストユーザー名'),
          new MailAddress('test@example.com')
        )
      );

    const command = new CircleUpdateCommand({
      circleId,
      circleName: 'テス',
    });

    const updateCirclePromise = circleUpdateService.handle(command);
    await expect(updateCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be at least 3 characters')
    );
  });

  test('サークル名を20文字超過には変更できない', async () => {
    const circleId = 'd161fc1e-aef2-451d-a8ae-712609dcdebc';
    const newOwnerId = 'aaa0b0b4-9cb7-4da9-9f84-8c288e0bcb4b';
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId(circleId),
          new CircleName('テストサークル名'),
          new UserId('baaead8d-0e74-40ba-a48c-22ae93669120'),
          []
        )
      );
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(newOwnerId),
          new UserName('テストユーザー名'),
          new MailAddress('test@example.com')
        )
      );

    const command = new CircleUpdateCommand({
      circleId,
      circleName: 'テストサークル名テストサークル名テストサー',
    });

    const updateCirclePromise = circleUpdateService.handle(command);
    await expect(updateCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError('Circle name must be 20 characters or less')
    );
  });

  test('サークル名を重複する名前には変更できない', async () => {
    const circleId = '03674c29-2bcc-45f8-ba63-58d1459da863';
    const newOwnerId = 'a046ac45-2788-491c-aa72-80e7e114a369';
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId(circleId),
          new CircleName('テストサークル名'),
          new UserId('baaead8d-0e74-40ba-a48c-22ae93669120'),
          []
        )
      );
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(newOwnerId),
          new UserName('テストユーザー名'),
          new MailAddress('test@example.com')
        )
      );
    jest
      .spyOn(StubCircleRepository.prototype, 'get')
      .mockResolvedValueOnce(
        Circle.create(
          new CircleId('ce8dcdda-3633-461e-9b72-1e6900386553'),
          new CircleName('重複するサークル名'),
          new UserId('baaead8d-0e74-40ba-a48c-22ae93669120'),
          []
        )
      );

    const command = new CircleUpdateCommand({
      circleId,
      circleName: '重複するサークル名',
    });

    const updateCirclePromise = circleUpdateService.handle(command);
    await expect(updateCirclePromise).rejects.toThrowError(
      new ArgumentApplicationError(
        'circle name: 重複するサークル名 is already exist'
      )
    );
  });

  test.each`
    memberIds
    ${['c53f525a-2109-47b7-b468-7fff07012cce']}
    ${['c53f525a-2109-47b7-b468-7fff07012cce', 'c9639e72-6a3b-4717-97cc-07c3e1ae129b', '3cfbbacb-92e4-4bf1-a328-475ab7291fc9', '5b5d9eb5-23ee-4437-8076-e0c86bee030d', '94b78af6-58c4-4a75-a5ea-5b607f312e68', '95e86abf-83de-4a65-a817-5c080f2b1388', '59aabc51-b1ca-40bb-b874-b8bedd225bd4', 'a4c9d1f7-d7a5-4d78-a69f-a1a53a7c67e1', 'ed521bc9-b0cd-496b-8607-4e7c4ca8693e', 'a1a282b1-b11c-46a0-aef7-c8f2fb94bd50', '017602a9-5985-4e38-a20c-af670f7a6edf', 'e6488fc7-02df-4703-91a9-61951a1c1b3f', '3b3cd77a-ccce-482f-b898-444cd18fbec6', 'e00fc73c-240d-487c-b076-2c92f3ae83a8', '2cb9ee5f-6247-408c-badf-336c308f6acd', '44ce3048-735c-42dc-b2ea-b5a9355f97e8', 'ff96f709-0674-4d20-90e8-0fd9a355a9bb', '874cbd85-a66d-4907-b3f3-7b7ea4e309c1', 'b41e3ad2-5b95-47a8-86b2-36cc23538e1c', '57eb3faa-7fbd-4d31-a0a7-d4b4d1e0a191', '79b20678-3d9b-48d3-bdd9-f79eb43653ee', 'a356dfb5-e9bc-4cd1-9f79-1ba99aaf16fc', '4b0d950b-6bf9-47b2-a656-e00c338ae94f', 'b361eda4-fc5d-4aeb-af5f-79a5d8464e4d', '6764e825-8c64-4f88-95fa-9b4fe50453e6', 'b8d172b2-be3d-4d30-9027-084ffaad1fae', '9adb41e5-8f49-499f-82c5-472e884f7c9a', '0d4541b1-5a5c-4417-afa2-22786ddfe9cc']}
  `(
    'サークルメンバーを追加する',
    async ({ memberIds }: { memberIds: string[] }) => {
      const circleId = '66d73617-aa4f-46b3-bf7d-9c193f0a08d1';
      jest
        .spyOn(StubCircleRepository.prototype, 'get')
        .mockResolvedValueOnce(
          Circle.create(
            new CircleId(circleId),
            new CircleName('テストサークル名'),
            new UserId('baaead8d-0e74-40ba-a48c-22ae93669120'),
            []
          )
        );
      jest
        .spyOn(StubUserRepository.prototype, 'batchGet')
        .mockResolvedValueOnce(
          memberIds.map(
            (value, index) =>
              new User(
                new UserId(value),
                new UserName(`テストユーザー${index + 1}`),
                new MailAddress(`test${index + 1}@example.com`)
              )
          )
        );

      const command = new CircleUpdateCommand({
        circleId,
        memberIds,
      });
      await circleUpdateService.handle(command);
    }
  );

  test('サークルメンバー人数が元々最大で追加できない', async () => {
    const circleId = '66d73617-aa4f-46b3-bf7d-9c193f0a08d1';
    jest.spyOn(StubCircleRepository.prototype, 'get').mockResolvedValueOnce(
      Circle.create(
        new CircleId(circleId),
        new CircleName('テストサークル名'),
        new UserId('baaead8d-0e74-40ba-a48c-22ae93669120'),
        [...range(1, 30)].map(
          (value) =>
            new UserId(
              `e802054f-ebad-44bc-9709-7621e682c3${('00' + value).slice(-2)}`
            )
        )
      )
    );
    jest
      .spyOn(StubUserRepository.prototype, 'batchGet')
      .mockResolvedValueOnce(
        [...range(1, 30)].map(
          (value, index) =>
            new User(
              new UserId(
                `e802054f-ebad-44bc-9709-7621e682c3${('00' + value).slice(-2)}`
              ),
              new UserName(`テストユーザー${index + 1}`),
              new MailAddress(`test${index + 1}@example.com`)
            )
        )
      );

    const command = new CircleUpdateCommand({
      circleId,
      memberIds: ['c53f525a-2109-47b7-b468-7fff07012cce'],
    });
    const circleUpdatePromise = circleUpdateService.handle(command);

    await expect(circleUpdatePromise).rejects.toThrowError(
      new CircleMembersAreExceedApplicationError(new CircleId(circleId))
    );
  });

  test('サークルメンバー人数が超過するので追加できない', async () => {
    const circleId = '66d73617-aa4f-46b3-bf7d-9c193f0a08d1';
    jest.spyOn(StubCircleRepository.prototype, 'get').mockResolvedValueOnce(
      Circle.create(
        new CircleId(circleId),
        new CircleName('テストサークル名'),
        new UserId('baaead8d-0e74-40ba-a48c-22ae93669120'),
        [...range(1, 29)].map(
          (value) =>
            new UserId(
              `e802054f-ebad-44bc-9709-7621e682c3${('00' + value).slice(-2)}`
            )
        )
      )
    );
    jest
      .spyOn(StubUserRepository.prototype, 'batchGet')
      .mockResolvedValueOnce(
        [...range(1, 29)].map(
          (value, index) =>
            new User(
              new UserId(
                `e802054f-ebad-44bc-9709-7621e682c3${('00' + value).slice(-2)}`
              ),
              new UserName(`テストユーザー${index + 1}`),
              new MailAddress(`test${index + 1}@example.com`)
            )
        )
      );

    const command = new CircleUpdateCommand({
      circleId,
      memberIds: [
        'c53f525a-2109-47b7-b468-7fff07012cce',
        'd5d8a20b-06c8-4dee-89cc-f9e492cd8242',
      ],
    });
    const circleUpdatePromise = circleUpdateService.handle(command);

    await expect(circleUpdatePromise).rejects.toThrowError(
      new CircleMembersAreExceedApplicationError(new CircleId(circleId))
    );
  });
});
