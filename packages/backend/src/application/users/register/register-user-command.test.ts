import { RegisterUserCommand } from './register-user-command';
import { User } from '../../../domain/models/users/user';
import { UserId } from '../../../domain/models/users/user-id';
import { UserName } from '../../../domain/models/users/user-name';
import { MailAddress } from '../../../domain/models/users/mail-address';
import { RegisterUserService } from './register-user-service';
import {
  ArgumentApplicationError,
  UserDuplicateApplicationError,
} from '../../errors/application-errors';
import { UserRepositoryStub } from '../../../repository/stub/users/user-repository-stub';
import { UserNotFoundRepositoryError } from '../../../repository/errors/repository-errors';

const userRepository = new UserRepositoryStub();
const registerUserService = new RegisterUserService({ userRepository });

describe('ユーザ新規作成', () => {
  test('ユーザを新規作成する', async () => {
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new UserName(userName))
      );
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new MailAddress(mailAddress))
      );
    jest.spyOn(UserRepositoryStub.prototype, 'create').mockResolvedValueOnce();

    const command = new RegisterUserCommand({ userName, mailAddress });
    await registerUserService.handle(command);
  });

  test('ユーザ名が3文字未満', async () => {
    const command = new RegisterUserCommand({
      userName: 'テス',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = registerUserService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError('ユーザ名は3文字以上です')
    );
  });

  test('ユーザ名が20文字超過', async () => {
    const command = new RegisterUserCommand({
      userName: 'テストユーザの名前テストユーザの名前テスト',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = registerUserService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError('ユーザ名は20文字以下です')
    );
  });

  test('ユーザ名に許可されない英語小文字が使われている', async () => {
    const command = new RegisterUserCommand({
      userName: 'test',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = registerUserService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError(
        '許可されていない文字 test が使われています。'
      )
    );
  });

  test('ユーザ名に許可されない英語大文字が使われている', async () => {
    const command = new RegisterUserCommand({
      userName: 'TEST',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = registerUserService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError(
        '許可されていない文字 TEST が使われています。'
      )
    );
  });

  test('ユーザ名に許可されない英語大文字が使われている', async () => {
    const command = new RegisterUserCommand({
      userName: 'TEST',
      mailAddress: 'test@example.com',
    });
    const createUserPromise = registerUserService.handle(command);

    await expect(createUserPromise).rejects.toThrowError(
      new ArgumentApplicationError(
        '許可されていない文字 TEST が使われています。'
      )
    );
  });

  test('ユーザー名は重複できない', async () => {
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId('421ae051-5e0e-4ee7-9c47-763d2913c027'),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );
    const registerUserService = new RegisterUserService({ userRepository });
    const command = new RegisterUserCommand({ userName, mailAddress });
    const registerPromise = registerUserService.handle(command);

    await expect(registerPromise).rejects.toThrowError(
      new UserDuplicateApplicationError(new UserName(userName))
    );
  });

  test('メールアドレスは重複できない', async () => {
    const userName = 'テストユーザー名';
    const mailAddress = 'test@example.com';
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockRejectedValueOnce(
        new UserNotFoundRepositoryError(new UserName(userName))
      );
    jest
      .spyOn(UserRepositoryStub.prototype, 'get')
      .mockResolvedValueOnce(
        new User(
          new UserId('421ae051-5e0e-4ee7-9c47-763d2913c027'),
          new UserName(userName),
          new MailAddress(mailAddress)
        )
      );
    const registerUserService = new RegisterUserService({ userRepository });
    const command = new RegisterUserCommand({ userName, mailAddress });
    const registerPromise = registerUserService.handle(command);

    await expect(registerPromise).rejects.toThrowError(
      new UserDuplicateApplicationError(new MailAddress(mailAddress))
    );
  });
});
