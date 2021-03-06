import { UpdateUserService } from './update-user-service';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { UpdateUserCommand } from './update-user-command';
import {
  ArgumentApplicationError,
  UserDuplicateApplicationError,
} from '../../errors/application-errors';
import { UserRepositoryStub } from '../../../repository/stub/users/user-repository-stub';
import { User } from '../../../domain/models/users/user';
import { UserId } from '../../../domain/models/users/user-id';
import { UserName } from '../../../domain/models/users/user-name';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';

const userRepository = new UserRepositoryStub();

afterEach(() => {
  jest.clearAllMocks();
});

describe('ユーザ更新', () => {
  test('ユーザ名を更新する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    const updatedUserName = '更新されたテストユーザー名';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );
    jest.spyOn(UserRepositoryStub.prototype, 'update').mockResolvedValueOnce();
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new UserName(updatedUserName))
      );
    const userApplicationService = new UpdateUserService({ userRepository });
    const command = new UpdateUserCommand({
      userId,
      userName: updatedUserName,
    });
    await userApplicationService.handle(command);
  });

  test('メールアドレスを更新する', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    const updatedMailAddress = 'updated@example.com';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );
    jest.spyOn(UserRepositoryStub.prototype, 'update').mockResolvedValueOnce();
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new MailAddress(updatedMailAddress))
      );
    const userApplicationService = new UpdateUserService({ userRepository });
    const command = new UpdateUserCommand({
      userId,
      mailAddress: updatedMailAddress,
    });
    await userApplicationService.handle(command);
  });

  test('ユーザ名が3文字未満', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
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
    const userApplicationService = new UpdateUserService({ userRepository });
    const command = new UpdateUserCommand({
      userId,
      userName: 'テス',
    });
    const updateUserPromise = userApplicationService.handle(command);

    await expect(updateUserPromise).rejects.toThrowError(
      new ArgumentApplicationError('ユーザ名は3文字以上です')
    );
  });

  test('ユーザ名が20文字超過', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
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
    const userApplicationService = new UpdateUserService({ userRepository });
    const command = new UpdateUserCommand({
      userId,
      userName: 'テストユーザの名前テストユーザの名前テスト',
    });
    const updateUserPromise = userApplicationService.handle(command);

    await expect(updateUserPromise).rejects.toThrowError(
      new ArgumentApplicationError('ユーザ名は20文字以下です')
    );
  });

  test('ユーザ名に許可されない英語小文字が使われている', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
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
    const userApplicationService = new UpdateUserService({ userRepository });
    const command = new UpdateUserCommand({
      userId,
      userName: 'test',
    });
    const updateUserPromise = userApplicationService.handle(command);

    await expect(updateUserPromise).rejects.toThrowError(
      new ArgumentApplicationError(
        '許可されていない文字 test が使われています。'
      )
    );
  });

  test('ユーザ名に許可されない英語大文字が使われている', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
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
    const userApplicationService = new UpdateUserService({ userRepository });
    const command = new UpdateUserCommand({
      userId,
      userName: 'TEST',
    });
    const updateUserPromise = userApplicationService.handle(command);

    await expect(updateUserPromise).rejects.toThrowError(
      new ArgumentApplicationError(
        '許可されていない文字 TEST が使われています。'
      )
    );
  });

  test('ユーザー名は重複できない', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    const updatedUserName = '更新されたユーザー名';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );
    jest.spyOn(UserRepositoryStub.prototype, 'update').mockResolvedValueOnce();
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId('2ca1bf61-6855-4c89-9ed7-198324e83cc6'),
          new UserName(updatedUserName),
          new MailAddress('other@example.com')
        )
      );
    const userApplicationService = new UpdateUserService({ userRepository });
    const command = new UpdateUserCommand({
      userId,
      userName: updatedUserName,
    });
    const updatePromise = userApplicationService.handle(command);

    await expect(updatePromise).rejects.toThrowError(
      new UserDuplicateApplicationError(new UserName(updatedUserName))
    );
  });

  test('メールアドレスは重複できない', async () => {
    const userId = '203881e1-99f2-4ce6-ab6b-785fcd793c92';
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    const updatedMailAddress = 'updated@example.com';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId(userId),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );
    jest.spyOn(UserRepositoryStub.prototype, 'update').mockResolvedValueOnce();
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId('2ca1bf61-6855-4c89-9ed7-198324e83cc6'),
          new UserName('既存のユーザー名'),
          new MailAddress(updatedMailAddress)
        )
      );
    const userApplicationService = new UpdateUserService({ userRepository });
    const command = new UpdateUserCommand({
      userId,
      mailAddress: updatedMailAddress,
    });
    const updatePromise = userApplicationService.handle(command);

    await expect(updatePromise).rejects.toThrowError(
      new UserDuplicateApplicationError(new MailAddress(updatedMailAddress))
    );
  });
});
