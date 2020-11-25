import { User } from '../../../domain/models/users/user';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { GetUserCommand } from './get-user-command';
import { UserId } from '../../../domain/models/users/user-id';
import { GetUserService } from './get-user-service';
import { UserNotFoundApplicationError } from '../../errors/application-errors';
import { UserRepositoryStub } from '../../../repository/stub/users/user-repository-stub';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';

const userRepository = new UserRepositoryStub();
const getUserService = new GetUserService({ userRepository });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ユーザー取得', () => {
  test('ユーザーIDでユーザーを取得する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザーの名前';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );

    const command = new GetUserCommand({
      userId,
    });
    const response = await getUserService.handle(command);

    expect(response.getUserId()).toEqual(userId);
    expect(response.getUserName()).toEqual(userName);
    expect(response.getMailAddress()).toEqual(mailAddress);
  });

  test('メールアドレスでユーザーを取得する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザーの名前';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );

    const command = new GetUserCommand({ mailAddress });
    const response = await getUserService.handle(command);

    expect(response.getUserId()).toEqual(userId);
    expect(response.getUserName()).toEqual(userName);
    expect(response.getMailAddress()).toEqual(mailAddress);
  });

  test('存在しないユーザーIDではユーザーの取得に失敗する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new UserId(userId))
      );

    const command = new GetUserCommand({ userId });
    const getPromise = getUserService.handle(command);

    await expect(getPromise).rejects.toThrowError(
      new UserNotFoundApplicationError(new UserId(userId))
    );
  });

  test('存在しないメールアドレスではユーザーの取得に失敗する', async () => {
    const mailAddress = 'test@example.com';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new MailAddress(mailAddress))
      );

    const command = new GetUserCommand({ mailAddress });
    const getPromise = getUserService.handle(command);

    await expect(getPromise).rejects.toThrowError(
      new UserNotFoundApplicationError(new MailAddress(mailAddress))
    );
  });
});
