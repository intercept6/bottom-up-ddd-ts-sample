import { User } from '../../../domain/models/users/user';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { UserGetCommand } from './user-get-command';
import { UserId } from '../../../domain/models/users/user-id';
import { UserGetService } from './user-get-service';
import { UserNotFoundApplicationError } from '../../errors/application-errors';
import { StubUserRepository } from '../../../repository/stub/users/stub-user-repository';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';

const userRepository = new StubUserRepository();
const userGetService = new UserGetService({ userRepository });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ユーザー取得', () => {
  test('ユーザーIDでユーザーを取得する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザーの名前';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );

    const command = new UserGetCommand({
      userId,
    });
    const response = await userGetService.handle(command);

    expect(response.getUserId()).toEqual(userId);
    expect(response.getUserName()).toEqual(userName);
    expect(response.getMailAddress()).toEqual(mailAddress);
  });

  test('メールアドレスでユーザーを取得する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザーの名前';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );

    const command = new UserGetCommand({ mailAddress });
    const response = await userGetService.handle(command);

    expect(response.getUserId()).toEqual(userId);
    expect(response.getUserName()).toEqual(userName);
    expect(response.getMailAddress()).toEqual(mailAddress);
  });

  test('存在しないユーザーIDではユーザーの取得に失敗する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new UserId(userId))
      );

    const command = new UserGetCommand({ userId });
    const getPromise = userGetService.handle(command);

    await expect(getPromise).rejects.toThrowError(
      new UserNotFoundApplicationError(new UserId(userId))
    );
  });

  test('存在しないメールアドレスではユーザーの取得に失敗する', async () => {
    const mailAddress = 'test@example.com';
    jest
      .spyOn(StubUserRepository.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new MailAddress(mailAddress))
      );

    const command = new UserGetCommand({ mailAddress });
    const getPromise = userGetService.handle(command);

    await expect(getPromise).rejects.toThrowError(
      new UserNotFoundApplicationError(new MailAddress(mailAddress))
    );
  });
});